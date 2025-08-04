'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Producto } from '@/types/producto';

// Define la interfaz para un item en el carrito, que extiende Producto y añade la cantidad
interface CartItem extends Producto {
  quantity: number;
}

// Define la interfaz para el valor del contexto del carrito
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Producto, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

// Crea el contexto con un valor inicial de undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// Define el proveedor del contexto del carrito
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Intenta cargar el carrito desde localStorage al iniciar
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Guarda el carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Función para agregar un producto al carrito
  const addToCart = (product: Producto, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Si el producto ya existe, actualiza la cantidad
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Si es un producto nuevo, lo añade al carrito
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Función para eliminar un producto del carrito
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Función para vaciar el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Calcula el número total de items en el carrito
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
