import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";

export const useCartAPI = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartAPI must be used within a CartProvider");
  }

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCart,
    getCartTotal,
    clearCart,
    isLoading,
    fetchCartItems,
  } = context;

  const increaseItem = async (itemId) => {
    try {
      console.log(`Increasing quantity for cartId: ${itemId}`);
      const item = cartItems.find((item) => item.id === itemId);
      if (!item) {
        console.warn(`Item with cartId ${itemId} not found in cartItems`);
        throw new Error("Item not found in cart");
      }
      return updateCart(item.id, {
        quantity: (item.quantity || 1) + 1,
      });
    } catch (error) {
      console.error("Error increasing quantity:", error);
      throw error;
    }
  };

  const decreaseItem = async (itemId) => {
    try {
      console.log(`Decreasing quantity for cartId: ${itemId}`);
      const item = cartItems.find((item) => item.id === itemId);
      if (!item) {
        console.warn(`Item with cartId ${itemId} not found in cartItems`);
        throw new Error("Item not found in cart");
      }
      if (item.quantity <= 1) {
        return removeFromCart(item.id);
      }
      return updateCart(item.id, {
        quantity: item.quantity - 1,
      });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      throw error;
    }
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCart,
    increaseItem,
    decreaseItem,
    getCartTotal,
    clearCart,
    isLoading,
    fetchCartItems,
  };
};
