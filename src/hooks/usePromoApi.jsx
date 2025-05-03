// hooks/usePromoApi.js
import { useState, useCallback } from "react";
import { API_CONFIG } from "../api/config";
// import { API_CONFIG } from "../config/apiConfig";

/**
 * Custom hook untuk menangani permintaan API
 * @param {string} endpoint - Endpoint relatif API (tanpa BASE_URL)
 * @param {Object} initialOptions - Opsi fetch awal
 * @returns {Object} - States dan fungsi untuk penanganan API
 */
const usePromoApi = (endpoint = "", initialOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default headers dengan API Key
  const defaultHeaders = {
    "Content-Type": "application/json",
    apiKey: API_CONFIG.API_KEY,
  };

  /**
   * Menjalankan request API
   * @param {string} customEndpoint - Endpoint kustom (opsional)
   * @param {Object} customOptions - Opsi fetch kustom (opsional)
   * @returns {Promise} - Promise dengan data hasil
   */
  const fetchData = useCallback(
    async (customEndpoint, customOptions) => {
      const targetEndpoint = customEndpoint || endpoint;
      const url = `${API_CONFIG.BASE_URL}${targetEndpoint}`;

      // Gabungkan header default dengan custom options
      const options = {
        ...initialOptions,
        ...customOptions,
        headers: {
          ...defaultHeaders,
          ...(customOptions?.headers || initialOptions?.headers || {}),
        },
      };

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(result.message || "API returned an error");
        }

        setData(result);
        return result;
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data");
        console.error("API request failed:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, initialOptions]
  );

  /**
   * Reset state hook
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    reset,
  };
};

export default usePromoApi;
