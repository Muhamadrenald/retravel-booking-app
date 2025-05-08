import axios from "axios";
import { API_CONFIG } from "../api/config";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": API_CONFIG.API_KEY,
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CARTS);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (payload) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CARTS,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (itemId, payload) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.CARTS}/${itemId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.CARTS}/${itemId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CARTS);
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },
};

export default cartService;
