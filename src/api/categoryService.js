import axios from "axios";
import { API_CONFIG } from "./config";

// Buat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    apiKey: API_CONFIG.API_KEY,
  },
});

// Function untuk mendapatkan semua kategori
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Function untuk mendapatkan detail kategori berdasarkan ID
export const getCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.CATEGORY_DETAIL(categoryId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${categoryId}:`, error);
    throw error;
  }
};

// Function untuk mendapatkan aktivitas berdasarkan kategori
export const getActivitiesByCategory = async (categoryId) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ACTIVITIES_BY_CATEGORY(categoryId)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching activities for category ID ${categoryId}:`,
      error
    );
    throw error;
  }
};
