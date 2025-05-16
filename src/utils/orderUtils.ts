import { db, auth } from "../config/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  limit,
  runTransaction,
} from "firebase/firestore";
import { CartItem } from "../context/CartContext";
import { Order, OrderItem } from "../types/OrderTypes";
import { sendOrderConfirmationEmail } from "./emailService";
import { confirmPayment } from "./stripeService";

// Re-export the Order type
export type { Order, OrderItem } from "../types/OrderTypes";

// Function to generate a random gift card key
const generateGiftCardKey = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar looking characters
  let result = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) result += "-"; // Add hyphen between groups
  }
  return result;
};

// Function to update product stock
const updateProductStock = async (items: CartItem[]): Promise<boolean> => {
  try {
    // First, filter out any potentially invalid items and log warnings
    const validItems: CartItem[] = [];
    const invalidItems: CartItem[] = [];

    // Check each product exists before attempting transaction
    for (const item of items) {
      const productRef = doc(db, "products", item.id);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        validItems.push(item);
      } else {
        console.warn(
          `Product ${item.id} (${item.name}) not found in database. Skipping stock update for this item.`
        );
        invalidItems.push(item);
      }
    }

    // If we have no valid items, return failure
    if (validItems.length === 0) {
      console.error(
        "No valid products found in cart. Cannot proceed with order."
      );
      return false;
    }

    // If we filtered out any items, log a warning
    if (invalidItems.length > 0) {
      console.warn(
        `Filtered out ${invalidItems.length} invalid products from cart.`
      );
    }

    // Use a transaction to ensure all stock updates succeed or none do
    await runTransaction(db, async (transaction) => {
      // First, get all product documents in a single phase
      const productRefs = validItems.map((item) =>
        doc(db, "products", item.id)
      );
      const productDocs = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      // Build a map of product data
      const productDataMap = new Map();
      productDocs.forEach((doc, index) => {
        if (doc.exists()) {
          productDataMap.set(validItems[index].id, doc);
        }
      });

      // Verify stock availability for all products
      for (const item of validItems) {
        const productDoc = productDataMap.get(item.id);
        const currentStock = productDoc.data().stock;

        if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for product ${item.name}`);
        }
      }

      // Then update all products in a second phase
      for (const item of validItems) {
        const productRef = doc(db, "products", item.id);
        const productDoc = productDataMap.get(item.id);
        const currentStock = productDoc.data().stock;

        // Update the stock
        transaction.update(productRef, {
          stock: currentStock - item.quantity,
          updatedAt: new Date(),
        });
      }
    });

    console.log("Stock updated successfully for all valid products");
    return true;
  } catch (error) {
    console.error("Error updating product stock:", error);
    return false;
  }
};

// Expand cart items to create separate items for each quantity
// This fixes the issue of multiple gift cards
const expandCartItems = (items: CartItem[]): CartItem[] => {
  const expandedItems: CartItem[] = [];

  items.forEach((item) => {
    // For each item in the cart, create 'quantity' number of individual items
    for (let i = 0; i < item.quantity; i++) {
      expandedItems.push({
        ...item,
        quantity: 1, // Each expanded item has quantity 1
      });
    }
  });

  return expandedItems;
};

// Create a new order
export const createOrder = async (
  items: CartItem[],
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  },
  paymentMethod: {
    cardType: string;
    lastFour: string;
  },
  total: number,
  stripePaymentInfo?: {
    clientSecret: string;
    paymentMethodId: string;
  }
): Promise<string | null> => {
  console.log("Creating order for user:", auth.currentUser?.uid);

  // Check if user is logged in
  if (!auth.currentUser) {
    console.error("User must be logged in to create an order");
    return null;
  }

  try {
    // Check if user is blocked
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().isBlocked) {
      console.error("User is blocked and cannot create orders");
      return null;
    }

    // First update product stock
    const stockUpdateSuccess = await updateProductStock(items);

    if (!stockUpdateSuccess) {
      console.error("Failed to update product stock, cancelling order");
      return null;
    }

    // If stripe payment info is provided, confirm the payment after stock is updated
    if (stripePaymentInfo) {
      const paymentResult = await confirmPayment(
        stripePaymentInfo.clientSecret,
        stripePaymentInfo.paymentMethodId,
        shippingAddress
      );

      if (!paymentResult.success) {
        console.error("Payment failed:", paymentResult.error);
        return null;
      }

      console.log("Payment confirmed successfully");
    }

    // Expand cart items to create separate items for each quantity
    // This fixes the issue of multiple gift cards
    const expandedItems = expandCartItems(items);

    // Generate gift card keys for each expanded item
    const itemsWithKeys: OrderItem[] = expandedItems.map((item) => ({
      ...item,
      giftCardKey: generateGiftCardKey(),
    }));

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order object
    const order = {
      userId: auth.currentUser.uid,
      orderNumber,
      items: itemsWithKeys,
      total,
      status: "completed" as const,
      date: Timestamp.now(),
      shippingAddress,
      paymentMethod,
      customerEmail: shippingAddress.email,
    };

    console.log("Saving order to Firestore");

    // Save to Firestore
    const docRef = await addDoc(collection(db, "orders"), order);

    console.log("Order created successfully with ID:", docRef.id);

    // Send confirmation email with gift card keys
    try {
      const orderWithId = {
        ...order,
        id: docRef.id,
      };

      await sendOrderConfirmationEmail(orderWithId as Order);
      console.log("Order confirmation with invoice sent to:", order.customerEmail);
    } catch (emailError) {
      // Don't fail the order creation if email sending fails
      console.error("Error sending email:", emailError);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

// Get all orders for the current user
export const getUserOrders = async (): Promise<Order[]> => {
  console.log("Fetching orders for user:", auth.currentUser?.uid);
  console.log("Is user logged in:", !!auth.currentUser);

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("User must be logged in to view orders");
      return [];
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    console.log("Executing Firestore query");
    const querySnapshot = await getDocs(q);
    console.log("Query complete, docs found:", querySnapshot.docs.length);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      orderNumber: doc.data().orderNumber,
      items: doc.data().items,
      total: doc.data().total,
      status: doc.data().status,
      shippingAddress: doc.data().shippingAddress,
      paymentMethod: doc.data().paymentMethod,
      date: doc.data().date,
      customerEmail: doc.data().customerEmail,
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderDoc = await getDoc(orderRef);

    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        userId: data.userId,
        orderNumber: data.orderNumber,
        items: data.items,
        total: data.total,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        date: data.date,
        customerEmail: data.customerEmail,
      };
    } else {
      console.log("No such order exists!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

// Admin Functions

// Get all orders for admin
export const getAllOrders = async (limitCount = 100): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("date", "desc"), limit(limitCount));

    const querySnapshot = await getDocs(q);
    console.log("Admin: All orders fetched, count:", querySnapshot.docs.length);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      orderNumber: doc.data().orderNumber,
      items: doc.data().items,
      total: doc.data().total,
      status: doc.data().status,
      shippingAddress: doc.data().shippingAddress,
      paymentMethod: doc.data().paymentMethod,
      date: doc.data().date,
      customerEmail: doc.data().customerEmail,
    }));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

// Get orders for a specific user (for admin)
export const getUserOrdersById = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    console.log(
      `Admin: Orders for user ${userId} fetched, count:`,
      querySnapshot.docs.length
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      orderNumber: doc.data().orderNumber,
      items: doc.data().items,
      total: doc.data().total,
      status: doc.data().status,
      shippingAddress: doc.data().shippingAddress,
      paymentMethod: doc.data().paymentMethod,
      date: doc.data().date,
      customerEmail: doc.data().customerEmail,
    }));
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return [];
  }
};

// Update order status (for admin)
export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "completed" | "failed"
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status,
    });
    console.log(`Admin: Order ${orderId} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    return false;
  }
};

// Helper functions for order management
export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "pending":
      return "text-amber-600";
    case "failed":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getOrderStatusText = (status: string): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return status;
  }
};

export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};
