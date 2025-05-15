import { Timestamp } from "firebase/firestore";

// Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: string;
  category: string;
  region: string;
  currency: string;
  stock: number;
  discount?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Filter state interface
export interface FilterState {
  brands: string[];
  regions: string[];
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  hasDiscount: boolean;
  searchQuery: string;
}

export interface GiftCard {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: string;
  category: string;
  region: string;
  currency: string;
  stock: number;
  discount?: number | null;
  description?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Base form values for new gift cards
export const initialGiftCardValues: Omit<
  GiftCard,
  "id" | "createdAt" | "updatedAt"
> = {
  name: "",
  price: 0,
  imageUrl: "",
  brand: "",
  category: "",
  region: "",
  currency: "TND",
  stock: 0,
  discount: undefined,
  description: "",
};
