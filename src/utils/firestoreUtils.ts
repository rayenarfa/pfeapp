import { db } from "../config/firebase/firebaseConfig";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GiftCardProps } from "../types/types";
import { getDoc } from "firebase/firestore";

/**
 * Adds a new product to the Firestore database
 * Creates a document with product details and timestamps
 *
 * @param product - Product object containing all required fields
 */
export const addProduct = async (product: GiftCardProps) => {
  try {
    await addDoc(collection(db, "products"), {
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      category: product.category,
      region: product.region,
      currency: product.currency,
      stock: product.stock,
      discount: product.discount !== undefined ? product.discount : null,
      description: product.description || "", // Add this field
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding product: ", error);
  }
};

/**
 * Updates an existing product in the Firestore database
 * Automatically updates the updatedAt timestamp
 *
 * @param id - Product ID to update
 * @param updatedData - Partial product object with fields to update
 */
export const updateProduct = async (
  id: string,
  updatedData: Partial<GiftCardProps>
) => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      ...updatedData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating product: ", error);
  }
};

/**
 * Deletes a product from the Firestore database
 *
 * @param id - Product ID to delete
 */
export const deleteProduct = async (id: string) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product: ", error);
  }
};

/**
 * Fetches all products from the Firestore database
 * Maps document data to GiftCardProps objects
 *
 * @returns Array of product objects
 */
export const fetchProducts = async (): Promise<GiftCardProps[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      price: doc.data().price || 0,
      imageUrl: doc.data().imageUrl || "",
      brand: doc.data().brand || "",
      category: doc.data().category || "",
      region: doc.data().region || "",
      currency: doc.data().currency || "USD",
      stock: doc.data().stock || 0,
      discount: doc.data().discount,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error fetching products: ", error);
    return [];
  }
};

/**
 * Fetches products filtered by category
 * Returns all products if category is "all"
 *
 * @param category - Category name to filter by
 * @returns Array of product objects matching the category
 */
export const fetchProductsByCategory = async (
  category: string
): Promise<GiftCardProps[]> => {
  try {
    // If category is "all", fetch all products
    if (category === "all") {
      return await fetchProducts();
    }

    // Otherwise, query for products matching the category
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", category));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      price: doc.data().price || 0,
      imageUrl: doc.data().imageUrl || "",
      brand: doc.data().brand || "",
      category: doc.data().category || "",
      region: doc.data().region || "",
      currency: doc.data().currency || "USD",
      stock: doc.data().stock || 0,
      discount: doc.data().discount,
      description: doc.data().description || "",
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error fetching products by category: ", error);
    return [];
  }
};

/**
 * Fetches a single product by its ID
 *
 * @param id - Product ID to fetch
 * @returns Product object or null if not found
 */
export const fetchProductById = async (
  id: string
): Promise<GiftCardProps | null> => {
  try {
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        name: productSnap.data().name || "",
        price: productSnap.data().price || 0,
        imageUrl: productSnap.data().imageUrl || "",
        brand: productSnap.data().brand || "",
        category: productSnap.data().category || "",
        region: productSnap.data().region || "",
        currency: productSnap.data().currency || "USD",
        stock: productSnap.data().stock || 0,
        discount: productSnap.data().discount,
        description:
          productSnap.data().description || "No description available.",
        createdAt: productSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: productSnap.data().updatedAt?.toDate() || new Date(),
      };
    } else {
      console.log("No such product exists!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching product: ", error);
    return null;
  }
};
