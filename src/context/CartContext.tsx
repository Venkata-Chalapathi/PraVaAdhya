"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: number; image: string }, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  gstRate: number; // Configurable percentage
  deliveryFee: number; // Configurable flat fee
  gstAmount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gstRate, setGstRate] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Load cart from localStorage and config values from backend on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }

    // Fetch dynamic GST & Delivery configs
    const fetchConfigs = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setGstRate(Number(data.gst_percentage || 0));
          setDeliveryFee(Number(data.delivery_fee || 0));
        }
      } catch (error) {
        console.warn("Failed to fetch settings from API, using default values (GST 0%, Delivery ₹0)");
      }
    };

    fetchConfigs();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const addToCart = (item: { id: string; name: string; price: number; image: string }, quantity = 1) => {
    const existingIndex = cart.findIndex((i) => i.menuItemId === item.id);
    const updated = [...cart];

    if (existingIndex > -1) {
      updated[existingIndex].quantity += quantity;
    } else {
      updated.push({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        image: item.image,
      });
    }
    saveCart(updated);
  };

  const removeFromCart = (menuItemId: string) => {
    const updated = cart.filter((i) => i.menuItemId !== menuItemId);
    saveCart(updated);
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    const updated = cart.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const totalAmount = subtotal + gstAmount + (cart.length > 0 ? deliveryFee : 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        gstRate,
        deliveryFee,
        gstAmount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
