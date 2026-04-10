import { toast } from 'react-hot-toast';
import { useAddSale } from './useSales';
import { useUpdateInventoryItem } from './useInventory';
import { formatPrice } from '../utils/formatPrice';
import type { CartItem } from '../types/cart';
import type { InventoryItem } from '../types/inventory';

export const useCheckout = () => {
  const updateItemMutation = useUpdateInventoryItem();
  const addSaleMutation = useAddSale();

  const handleCheckout = async (
    cart: CartItem[],
    products: InventoryItem[],
    clearCart: () => void
  ) => {
    if (cart.length === 0) return;

    try {
      await addSaleMutation.mutateAsync(cart);

      // Process each item in the cart
      const updatePromises = cart.map(cartItem => {
        // Find the original product to get current stock
        const product = products.find(p => p.id === cartItem.id);
        if (!product) return Promise.resolve();

        // Calculate new stock
        const newStock = (product.stock || 0) - cartItem.quantity;
        
        // Update the item with new stock
        return updateItemMutation.mutateAsync({
          id: cartItem.id,
          data: {
            ...product,
            stock: Math.max(0, newStock)
          }
        });
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Show success message
      toast.success(`Successfully processed order for ₱${formatPrice(totalPrice)}`);
      
      // Clear the cart
      clearCart();
      
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to process order. Please try again.');
    }
  };

  return { handleCheckout };
};
