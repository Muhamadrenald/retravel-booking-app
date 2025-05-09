import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import { API_CONFIG } from "../api/config";

const useAuthAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Daftar rute publik yang tidak memerlukan redirect
  const publicRoutes = [
    "/",
    "/services",
    "/categories",
    "/activities",
    "/promo",
    "/about",
    "/cart",
    "/carts",
    "/transaction",
    "/bus-tickets",
    "/train-tickets",
    "/plane-tickets",
    "/login",
    "/register",
    "/checkout",
  ];

  // Function to redirect based on user role
  const redirectBasedOnRole = (userData) => {
    if (!userData) return;

    // Jangan redirect jika di rute publik
    if (publicRoutes.includes(location.pathname)) {
      console.log(
        "Skipping redirect: Current path is public",
        location.pathname
      );
      return;
    }

    console.log("Redirecting based on role:", userData.role);
    if (userData.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/"); // Default to homepage for non-admin users
    }
  };

  // Function to get user data from API
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }

    setIsLoading(true);
    try {
      console.log(
        "Fetching user profile from:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_USER}`
      );
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CURRENT_USER, {
        headers: {
          Authorization: `Bearer ${token}`,
          apiKey: API_CONFIG.API_KEY,
          "Content-Type": "application/json",
        },
      });

      console.log("User profile response:", response.data);

      if (response.data.code === "200") {
        const userData = response.data.data;
        setUser(userData);

        // Update localStorage with fresh user data including role
        localStorage.setItem(
          "userData",
          JSON.stringify({
            name: userData.name,
            email: userData.email,
            role: userData.role,
          })
        );

        return userData;
      } else {
        console.error("Failed to fetch user data:", response.data.message);
        toast.error(response.data.message || "Failed to fetch user data", {
          position: "top-right",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        axiosError: error.isAxiosError ? error.toJSON() : null,
      });

      // If 401 unauthorized, remove token
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (error.response?.status === 404) {
        toast.error("User profile endpoint not found. Contact support.", {
          position: "top-right",
        });
      } else {
        toast.error("Failed to fetch user data. Please try again.", {
          position: "top-right",
        });
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Check authentication status and fetch user on mount, but only redirect after login
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentUser(); // Fetch user tanpa redirect otomatis
    }
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log("Logging in with:", { email });
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        password,
      });

      console.log("Login response:", response.data);

      if (response.data.code === "200") {
        const token = response.data.token;
        let userData = null;

        if (response.data.data) {
          userData = response.data.data;
          setUser(userData);

          localStorage.setItem(
            "userData",
            JSON.stringify({
              name: userData.name,
              email: userData.email,
              role: userData.role,
            })
          );
        }

        localStorage.setItem("token", token);

        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: {
              username: userData?.name || email,
              role: userData?.role || "user",
            },
          })
        );

        toast.success("Login successful! Redirecting...", {
          position: "top-right",
        });

        if (!userData) {
          userData = await fetchCurrentUser();
        }

        // Hanya redirect setelah login
        redirectBasedOnRole(userData);

        return true;
      } else {
        toast.error(response.data.message || "Login failed!", {
          position: "top-right",
        });
        return false;
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log(
        "Calling logout:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`
      );
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.LOGOUT);

      console.log("Logout response:", response.data);

      if (response.data.code === "200") {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setUser(null);

        window.dispatchEvent(new Event("storage"));

        toast.success("Logout successful!", { position: "top-right" });
        navigate("/login");
        return true;
      } else {
        toast.error(response.data.message || "Logout failed!", {
          position: "top-right",
        });
        return false;
      }
    } catch (error) {
      console.error("Error logging out:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      setUser(null);

      window.dispatchEvent(new Event("storage"));

      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during logout. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
      });
      navigate("/login");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    if (!userData.email || !userData.password || !userData.passwordRepeat) {
      toast.error("Email, password and password confirmation are required", {
        position: "top-right",
      });
      return false;
    }

    if (userData.password !== userData.passwordRepeat) {
      toast.error("Password and confirmation password don't match", {
        position: "top-right",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log("Registering with:", userData);
      const registrationData = {
        ...userData,
        role: userData.role || "user",
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.REGISTER,
        registrationData
      );

      console.log("Register response:", response.data);

      if (response.data.code === "200") {
        toast.success("Registration successful! Please login.", {
          position: "top-right",
        });
        navigate("/login");
        return true;
      } else {
        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`, {
              position: "top-right",
            });
          });
        } else {
          toast.error(response.data.message || "Registration failed", {
            position: "top-right",
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error registering:", error);

      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`, {
            position: "top-right",
          });
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred. Please try again.",
          {
            position: "top-right",
          }
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const getUserInfo = () => {
    if (user) return user;

    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }

    return null;
  };

  const isAdmin = () => {
    const currentUser = user || getUserInfo();
    return currentUser?.role === "admin";
  };

  return {
    login,
    logout,
    register,
    isAuthenticated,
    isLoading,
    user: user || getUserInfo(),
    fetchCurrentUser,
    isAdmin,
    redirectBasedOnRole,
  };
};

export default useAuthAPI;
