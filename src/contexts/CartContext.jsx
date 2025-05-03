import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "../api/config";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let isFetching = false;

  // Fungsi untuk mengambil data keranjang dari API
  const fetchCartItems = useCallback(async () => {
    if (isFetching) return;
    isFetching = true;
    try {
      setIsLoading(true);
      console.log(
        "Fetching cart items:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARTS}`
      );
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARTS}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Raw fetch cart response:", response);

      if (!response.data || String(response.data.code) !== "200") {
        const errorMessage =
          response.data?.message || "Gagal mengambil data keranjang";
        console.error("Invalid fetch cart response:", response.data);
        throw new Error(
          errorMessage === "Success"
            ? "Gagal mengambil data keranjang"
            : errorMessage
        );
      }

      const cartData = response.data.data || [];
      console.log("Fetched cart items:", cartData);
      setCartItems(cartData);
      return cartData;
    } catch (error) {
      console.error("Error fetching cart items:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        axiosError: error.isAxiosError ? error.toJSON() : null,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        throw new Error("Session expired. Please log in again.");
      }

      toast.error(error.message || "Gagal mengambil data keranjang", {
        position: "top-right",
      });
      setCartItems([]);
      return [];
    } finally {
      setIsLoading(false);
      isFetching = false;
    }
  }, []);

  // Memuat data keranjang saat aplikasi dimuat
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = async (payload) => {
    try {
      setIsLoading(true);
      console.log("addToCart payload:", payload);

      // Langkah 1: Validasi payload
      if (!payload.activityId || !payload.quantity) {
        throw new Error("Payload tidak valid: activityId atau quantity hilang");
      }

      // Langkah 2: Ambil detail aktivitas untuk validasi
      const activityEndpoint = API_CONFIG.ENDPOINTS.ACTIVITY_DETAIL(
        payload.activityId
      );
      console.log(
        "Fetching activity:",
        `${API_CONFIG.BASE_URL}${activityEndpoint}`
      );
      const activityResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${activityEndpoint}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Raw activity response:", activityResponse);

      // Periksa respons aktivitas
      if (
        !activityResponse.data ||
        String(activityResponse.data.code) !== "200"
      ) {
        const errorMessage =
          activityResponse.data?.message || "Gagal mengambil detail aktivitas";
        console.error("Invalid activity response:", activityResponse.data);
        throw new Error(
          errorMessage === "Success"
            ? "Gagal mengambil detail aktivitas"
            : errorMessage
        );
      }

      // Langkah 3: Tambah ke keranjang
      const validatedPayload = {
        activityId: payload.activityId,
        quantity: payload.quantity,
      };
      console.log(
        "Calling add-cart:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_TO_CART}`
      );
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_TO_CART}`,
        validatedPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Raw add-cart response:", response);

      // Periksa respons add-cart
      if (!response.data || String(response.data.code) !== "200") {
        const errorMessage =
          response.data?.message || "Gagal menambahkan ke keranjang";
        console.error("Invalid add-cart response:", response.data);
        throw new Error(
          errorMessage === "Success"
            ? "Gagal menambahkan ke keranjang"
            : errorMessage
        );
      }

      // Langkah 4: Ambil data keranjang terbaru dari server
      console.log("Fetching updated cart items after addToCart");
      await fetchCartItems();

      return response.data;
    } catch (error) {
      console.error("Error menambahkan ke keranjang:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        axiosError: error.isAxiosError ? error.toJSON() : null,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        throw new Error("Session expired. Please log in again.");
      }

      const errorMessage =
        error.message === "Success"
          ? "Terjadi kesalahan saat menambahkan ke keranjang"
          : error.message || "Terjadi kesalahan saat menambahkan ke keranjang";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setIsLoading(true);

      // Langkah 1: Validasi itemId
      const item = cartItems.find((i) => i.id === itemId);
      if (!item) {
        console.warn(`Item dengan ID ${itemId} tidak ditemukan di cartItems`);
        // Hapus item dari state lokal jika tidak ditemukan
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        await fetchCartItems(); // Segarkan data
        return { code: "200", message: "Item dihapus dari state lokal" };
      }

      // Langkah 2: Sinkronkan dengan server
      await fetchCartItems();

      // Langkah 3: Gunakan ID keranjang yang benar
      const cartItemId = item.id;
      const endpoint = API_CONFIG.ENDPOINTS.DELETE_CART(cartItemId);
      console.log(
        "Calling removeFromCart:",
        `${API_CONFIG.BASE_URL}${endpoint}`
      );
      const response = await axios.delete(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          apiKey: API_CONFIG.API_KEY,
          "Content-Type": "application/json",
        },
      });
      console.log("Raw removeFromCart response:", response);

      if (!response.data || String(response.data.code) !== "200") {
        const errorMessage =
          response.data?.message || "Gagal menghapus dari keranjang";
        throw new Error(
          errorMessage === "Success"
            ? "Gagal menghapus dari keranjang"
            : errorMessage
        );
      }

      // Langkah 4: Sinkronkan kembali dengan server
      await fetchCartItems();
      return response.data;
    } catch (error) {
      console.error("Error menghapus dari keranjang:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        axiosError: error.isAxiosError ? error.toJSON() : null,
      });

      if (error.response?.status === 404) {
        // Jika item tidak ditemukan di server, hapus dari state lokal
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.info("Item sudah tidak ada di keranjang server", {
          position: "top-right",
        });
        await fetchCartItems(); // Segarkan data
        return { code: "200", message: "Item dihapus dari state lokal" };
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        throw new Error("Session expired. Please log in again.");
      }

      throw new Error(
        error.message || "Terjadi kesalahan saat menghapus dari keranjang"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateCart = async (itemId, payload) => {
    try {
      setIsLoading(true);

      // Langkah 1: Sinkronkan dengan server
      await fetchCartItems();

      // Langkah 2: Validasi itemId
      const item = cartItems.find((i) => i.id === itemId);
      if (!item) {
        console.warn(
          `Item dengan cartId ${itemId} tidak ditemukan di cartItems`
        );
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        await fetchCartItems(); // Segarkan data
        throw new Error("Item keranjang tidak ditemukan");
      }

      // Langkah 3: Kirim permintaan pembaruan
      const endpoint = API_CONFIG.ENDPOINTS.UPDATE_CART(itemId);
      console.log("Calling updateCart:", `${API_CONFIG.BASE_URL}${endpoint}`);
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Raw updateCart response:", response);

      if (!response.data || String(response.data.code) !== "200") {
        const errorMessage =
          response.data?.message || "Gagal memperbarui keranjang";
        throw new Error(
          errorMessage === "Success"
            ? "Gagal memperbarui keranjang"
            : errorMessage
        );
      }

      // Langkah 4: Sinkronkan kembali dengan server
      await fetchCartItems();
      return response.data;
    } catch (error) {
      console.error("Error memperbarui keranjang:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        axiosError: error.isAxiosError ? error.toJSON() : null,
      });

      if (error.response?.status === 404) {
        // Jika item tidak ditemukan di server, hapus dari state lokal
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.info("Item sudah tidak ada di keranjang server", {
          position: "top-right",
        });
        await fetchCartItems(); // Segarkan data
        return { code: "200", message: "Item dihapus dari state lokal" };
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        throw new Error("Session expired. Please log in again.");
      }

      throw new Error(
        error.message || "Terjadi kesalahan saat memperbarui keranjang"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const increaseItem = async (itemId) => {
    try {
      setIsLoading(true);
      await fetchCartItems(); // Sinkronkan data
      const item = cartItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Item tidak ditemukan di keranjang");
      const newQuantity = item.quantity + 1;
      const payload = {
        quantity: newQuantity,
      };
      await updateCart(itemId, payload);
    } catch (error) {
      console.error("Error meningkatkan kuantitas:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const decreaseItem = async (itemId) => {
    try {
      setIsLoading(true);
      await fetchCartItems(); // Sinkronkan data
      const item = cartItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Item tidak ditemukan di keranjang");
      if (item.quantity <= 1) {
        await removeFromCart(itemId);
      } else {
        const newQuantity = item.quantity - 1;
        const payload = {
          quantity: newQuantity,
        };
        await updateCart(itemId, payload);
      }
    } catch (error) {
      console.error("Error mengurangi kuantitas:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total +
        (item.activity.price_discount || item.activity.price) * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCart,
        increaseItem,
        decreaseItem,
        getCartTotal,
        clearCart,
        isLoading,
        fetchCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
