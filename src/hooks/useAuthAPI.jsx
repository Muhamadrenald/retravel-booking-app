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
    if (!userData) {
      console.log("No user data, redirecting to /login");
      navigate("/login");
      return;
    }

    const role = userData.role?.toLowerCase() || "user";
    console.log(
      "Redirecting based on role:",
      role,
      "Current path:",
      location.pathname
    );

    // Jangan redirect jika di rute publik dan bukan /login
    if (
      publicRoutes.includes(location.pathname) &&
      location.pathname !== "/login"
    ) {
      console.log(
        "Skipping redirect: Current path is public",
        location.pathname
      );
      return;
    }

    // Redirect berdasarkan role
    if (role === "admin") {
      console.log("Redirecting admin to /admin");
      navigate("/admin");
    } else {
      console.log("Redirecting user to /");
      navigate("/");
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
      const endpoint = API_CONFIG.ENDPOINTS.CURRENT_USER;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log("Fetching user profile from:", fullUrl);

      const response = await apiClient.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          apiKey: API_CONFIG.API_KEY,
          "Content-Type": "application/json",
        },
      });

      console.log("User profile response:", response.data);

      if (response.data.code === "200" && response.data.data) {
        const userData = response.data.data;
        setUser(userData);

        localStorage.setItem(
          "userData",
          JSON.stringify({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "user",
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
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        navigate("/login");
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

  // Check authentication status on mount
  useEffect(() => {
    console.log("Checking authentication, isAuthenticated:", isAuthenticated());
    if (isAuthenticated() && !user) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const endpoint = API_CONFIG.ENDPOINTS.LOGIN;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log("Attempting login at:", fullUrl, { email });

      const response = await apiClient.post(
        endpoint,
        { email, password },
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login response:", response.data);

      if (response.data.code === "200") {
        const token = response.data.token;
        if (!token) {
          throw new Error("No token received from login response");
        }

        let userData = null;
        if (response.data.data) {
          userData = response.data.data;
          setUser(userData);

          localStorage.setItem(
            "userData",
            JSON.stringify({
              name: userData.name || "",
              email: userData.email || "",
              role: userData.role || "user",
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

        if (userData) {
          redirectBasedOnRole(userData);
        } else {
          toast.error("Failed to fetch user data after login.", {
            position: "top-right",
          });
          navigate("/login");
        }

        return true;
      } else {
        toast.error(response.data.message || "Login failed!", {
          position: "top-right",
        });
        return false;
      }
    } catch (error) {
      console.error("Error logging in:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.status === 404) {
        errorMessage =
          // "Login endpoint not found. Please check API configuration or contact support.";
          "User not found.";
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

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
      const endpoint = API_CONFIG.ENDPOINTS.LOGOUT;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log("Calling logout:", fullUrl);

      const response = await apiClient.get(endpoint, {
        headers: {
          apiKey: API_CONFIG.API_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

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
      console.error("Error logging out:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      setUser(null);

      window.dispatchEvent(new Event("storage"));

      toast.error(
        error.response?.data?.message ||
          "An error occurred during logout. Please try again.",
        {
          position: "top-right",
        }
      );
      navigate("/login");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    if (!userData.email || !userData.password || !userData.passwordRepeat) {
      toast.error("Email, password, and password confirmation are required", {
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
      const endpoint = API_CONFIG.ENDPOINTS.REGISTER;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log("Registering at:", fullUrl, userData);

      const registrationData = {
        ...userData,
        role: userData.role || "user",
      };

      const response = await apiClient.post(endpoint, registrationData, {
        headers: {
          apiKey: API_CONFIG.API_KEY,
          "Content-Type": "application/json",
        },
      });

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
      console.error("Error registering:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

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
    return currentUser?.role?.toLowerCase() === "admin";
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
