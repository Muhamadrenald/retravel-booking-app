import { useState } from "react";
import { toast } from "react-toastify";

const useAuthAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
        });
        localStorage.setItem("token", data.token);
        console.log("Token saved:", data.token);
        return true; // Berhasil login
      } else {
        toast.error(data.message || "Login failed!", { position: "top-right" });
        return false; // Gagal login
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
      return false; // Gagal login
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No active session found", { position: "top-right" });
        return false;
      }

      console.log("Logging out with token:", token);

      const response = await fetch(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/logout",
        {
          method: "GET",
          headers: {
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Hapus token dari localStorage
        localStorage.removeItem("token");
        toast.success("Logout successful!", { position: "top-right" });
        return true; // Berhasil logout
      } else {
        toast.error(data.message || "Logout failed!", {
          position: "top-right",
        });
        return false; // Gagal logout
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("An error occurred during logout. Please try again.", {
        position: "top-right",
      });
      return false; // Gagal logout
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      // Memastikan semua field yang diperlukan tersedia
      if (!userData.email || !userData.password || !userData.passwordRepeat) {
        toast.error("Email, password and password confirmation are required", {
          position: "top-right",
        });
        return false;
      }
      // Jika password dan konfirmasi password tidak sama
      if (userData.password !== userData.passwordRepeat) {
        toast.error("Password and confirmation password don't match", {
          position: "top-right",
        });
        return false;
      }
      // Tambahkan role jika belum ada
      const registrationData = {
        ...userData,
        role: userData.role || "user", // Tambahkan default role "user" jika tidak ada
      };
      console.log("Registering with data:", registrationData);
      const response = await fetch(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
          body: JSON.stringify(registrationData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Registration successful! Redirecting...", {
          position: "top-right",
        });
        return true; // Berhasil register
      } else {
        console.error("Registration error:", data);
        // Menampilkan pesan error spesifik jika ada
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`, {
              position: "top-right",
            });
          });
        } else {
          toast.error(data.message || "Registration failed", {
            position: "top-right",
          });
        }
        return false; // Gagal register
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
      return false; // Gagal register
    } finally {
      setIsLoading(false);
    }
  };

  return { login, logout, register, isLoading };
};

export default useAuthAPI;
