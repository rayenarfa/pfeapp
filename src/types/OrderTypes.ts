import { Timestamp } from "firebase/firestore";

// Interface for order items with gift card key
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  brand: string;
  category: string;
  region: string;
  currency: string;
  stock: number;
  discount?: number;
  giftCardKey: string;
}

// Interface for shipping address
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

// Interface for payment method
export interface PaymentMethod {
  cardType: string;
  lastFour: string;
}

// Interface for order
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "failed";
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  date: Timestamp;
  customerEmail: string;
}
