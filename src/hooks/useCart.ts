import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { CartItem } from '../types/cart';
import type { InventoryItem } from '../types/inventory';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: InventoryItem, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price || 0,
            quantity: Math.min(quantity, product.stock),
            image: product.image || '📦',
            stock: product.stock || 0
          }
        ];
      }
    });
    
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Memoize expensive calculations
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
  };
};
