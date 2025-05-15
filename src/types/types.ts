// src/types.ts
export interface GiftCardProps {
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