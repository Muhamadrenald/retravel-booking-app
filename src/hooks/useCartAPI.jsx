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
        console.warn(
          `Item dengan cartId ${itemId} tidak ditemukan di cartItems`
        );
        throw new Error("Item tidak ditemukan di keranjang");
      }
      return updateCart(item.id, {
        quantity: (item.quantity || 1) + 1,
      });
    } catch (error) {
      console.error("Error meningkatkan kuantitas:", error);
      throw error;
    }
  };

  const decreaseItem = async (itemId) => {
    try {
      console.log(`Decreasing quantity for cartId: ${itemId}`);
      const item = cartItems.find((item) => item.id === itemId);
      if (!item) {
        console.warn(
          `Item dengan cartId ${itemId} tidak ditemukan di cartItems`
        );
        throw new Error("Item tidak ditemukan di keranjang");
      }
      if (item.quantity <= 1) {
        return removeFromCart(item.id);
      }
      return updateCart(item.id, {
        quantity: item.quantity - 1,
      });
    } catch (error) {
      console.error("Error mengurangi kuantitas:", error);
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
