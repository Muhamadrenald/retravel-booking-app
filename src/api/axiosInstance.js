import axios from "axios";
import { API_CONFIG } from "./config";
import { toast } from "react-toastify";

// Buat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    apiKey: API_CONFIG.API_KEY,
  },
});

// Interceptor untuk request
apiClient.interceptors.request.use(
  (config) => {
    // Tambahkan token ke header jika tersedia
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expired (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
