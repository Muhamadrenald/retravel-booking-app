import { useState } from "react";
import apiClient from "../api/axiosInstance";
import { API_CONFIG } from "../api/config";
import { toast } from "react-toastify";
import { validateImageUrl, processImageArray } from "../utils/imageUtils";

const useActivitiesAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Transformasi data aktivitas dari API ke format yang dibutuhkan aplikasi
   * @param {Object} item - Data mentah dari API
   * @returns {Object} - Data yang sudah ditransformasi
   */
  const transformActivity = (item) => ({
    id: item.id,
    location: item.category?.name || "Tidak diketahui",
    categoryId: item.category?.id || null,
    categoryImage: validateImageUrl(item.category?.imageUrl),
    name: item.title || "Tanpa judul",
    price: item.price,
    priceDiscount: item.price_discount,
    originalPrice: item.price_discount ? item.price : null,
    rating: item.rating || 0,
    totalReviews: item.total_reviews || 0,
    // Gunakan fungsi validasi untuk semua URL gambar
    image: validateImageUrl(item.imageUrls?.[0]),
    images: processImageArray(item.imageUrls),
    description: item.description || "",
    facilities: item.facilities || [],
    address: item.address || "",
    province: item.province || "",
    city: item.city || "",
    location_maps: item.location_maps || "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });

  /**
   * Mengambil semua aktivitas dari API
   * @returns {Promise<Array>} - Array aktivitas yang sudah ditransformasi
   */
  const getAllActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTIVITIES);
      setIsLoading(false);

      if (response.data.code === "200") {
        // Pastikan data ada dan berbentuk array
        if (Array.isArray(response.data.data)) {
          return response.data.data.map(transformActivity);
        } else {
          console.warn(
            "Format data aktivitas tidak sesuai harapan:",
            response.data
          );
          return [];
        }
      } else {
        const errorMsg = response.data.message || "Gagal memuat aktivitas";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.message || "Gagal memuat aktivitas";
      setError(errorMsg);
      console.error("Error saat mengambil aktivitas:", error);
      toast.error("Gagal memuat aktivitas. Silakan coba lagi nanti.");
      return [];
    }
  };

  /**
   * Mengambil detail aktivitas berdasarkan ID
   * @param {string} id - ID aktivitas
   * @returns {Promise<Object>} - Detail aktivitas yang sudah ditransformasi
   */
  const getActivityById = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL(id)
      );
      setIsLoading(false);

      if (response.data.code === "200") {
        if (response.data.data) {
          return transformActivity(response.data.data);
        } else {
          const errorMsg = "Detail aktivitas tidak ditemukan";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } else {
        const errorMsg =
          response.data.message || "Gagal memuat detail aktivitas";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.message || "Gagal memuat detail aktivitas";
      setError(errorMsg);
      console.error("Error saat mengambil detail aktivitas:", error);
      toast.error("Gagal memuat detail aktivitas. Silakan coba lagi nanti.");
      return null;
    }
  };

  /**
   * Mengambil aktivitas berdasarkan kategori
   * @param {string} categoryId - ID kategori
   * @returns {Promise<Array>} - Array aktivitas yang sudah ditransformasi
   */
  const getActivitiesByCategory = async (categoryId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ACTIVITIES_BY_CATEGORY(categoryId)
      );
      setIsLoading(false);

      if (response.data.code === "200") {
        // Pastikan data ada dan berbentuk array
        if (Array.isArray(response.data.data)) {
          return response.data.data.map(transformActivity);
        } else {
          console.warn(
            "Format data aktivitas kategori tidak sesuai harapan:",
            response.data
          );
          return [];
        }
      } else {
        const errorMsg =
          response.data.message || "Gagal memuat aktivitas untuk kategori ini";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.message || "Gagal memuat aktivitas kategori";
      setError(errorMsg);
      console.error(
        "Error saat mengambil aktivitas berdasarkan kategori:",
        error
      );
      toast.error(
        "Gagal memuat aktivitas untuk kategori ini. Silakan coba lagi nanti."
      );
      return [];
    }
  };

  return {
    getAllActivities,
    getActivityById,
    getActivitiesByCategory,
    isLoading,
    error,
  };
};

export default useActivitiesAPI;
