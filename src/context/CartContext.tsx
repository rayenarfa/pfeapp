// src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase/firebaseConfig";

export interface CartItem {
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
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: string) => boolean;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Set up auth listener to get userId for cart persistence
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Calculate total items and price
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Load cart from localStorage based on user ID
  useEffect(() => {
    const loadCart = () => {
      const cartKey = userId ? `cart_${userId}` : "cart_guest";
      const storedCart = localStorage.getItem(cartKey);

      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          localStorage.removeItem(cartKey);
        }
      } else {
        // If no cart exists for this user, reset to empty
        setCartItems([]);
      }
      setIsInitialized(true);
    };

    loadCart();
  }, [userId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const cartKey = userId ? `cart_${userId}` : "cart_guest";
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, userId]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Item exists, update quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isItemInCart = (id: string) => {
    return cartItems.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isItemInCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
