import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  X,
  Home,
  Users,
  Tag,
  Layers,
  Image,
  MapPin,
  CreditCard,
  LogOut,
} from "lucide-react";
import { API_CONFIG } from "../../api/config";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_USER}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apiKey: API_CONFIG.API_KEY,
            },
          }
        );

        if (response.data && response.data.data) {
          if (response.data.data.role === "admin") {
            setAdminProfile(response.data.data);
          } else {
            setError("Access denied. Admin privileges required.");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 2000);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        if (err.response && err.response.status === 401) {
          setError("Your session has expired. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        } else {
          setError("Failed to load admin profile. Please try again.");
        }
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  useEffect(() => {
    if (adminProfile) {
      const adminProfilePicture = adminProfile.profilePictureUrl?.trim();
      const defaultAvatar = "https://picsum.photos/200";
      setProfileImage(
        adminProfilePicture ? adminProfilePicture : defaultAvatar
      );
    }
  }, [adminProfile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    setLogoutMessage("You have successfully logged out.");
    setIsUserMenuOpen(false);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLogoutMessage(null);
      navigate("/login", { replace: true });
    }, 2000);
  };

  const menuItems = [
    {
      name: "Main Dashboard",
      path: "/admin/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
  ];

  const adminItems = [
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Promos",
      path: "/admin/promos",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      name: "Banners",
      path: "/admin/banners",
      icon: <Image className="h-5 w-5" />,
    },
    {
      name: "Activities",
      path: "/admin/activities",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      path: "/admin/transactions",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-700">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p className="text-yellow-700">
              Unable to load admin profile. Please login again.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-20 ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarExpanded && (
            <span className="font-bold text-lg text-indigo-900">
              ADMIN PANEL
            </span>
          )}
          <div className="flex items-center space-x-2">
            <button className="md:hidden text-gray-600" onClick={toggleSidebar}>
              <X className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hidden md:block"
              onClick={toggleSidebarExpand}
            >
              {isSidebarExpanded ? (
                <Menu className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        <nav className="mt-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 hover:bg-indigo-50 ${
                    location.pathname === item.path
                      ? "text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50 font-medium"
                      : "text-gray-600"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                  title={!isSidebarExpanded ? item.name : undefined}
                >
                  <span className="text-gray-500 flex-shrink-0">
                    {item.icon}
                  </span>
                  {isSidebarExpanded && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}

            {adminItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 hover:bg-indigo-50 ${
                    location.pathname === item.path
                      ? "text-indigo-600 border-l-4 border-indigo-600 bg-indigo-50 font-medium"
                      : "text-gray-600"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                  title={!isSidebarExpanded ? item.name : undefined}
                >
                  <span className="text-gray-500 flex-shrink-0">
                    {item.icon}
                  </span>
                  {isSidebarExpanded && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarExpanded ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-2">
              <button
                className="md:hidden text-gray-600"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="text-sm text-gray-500">Pages / </span>
              <span className="text-sm font-medium">Admin Panel</span>
            </div>

            <div className="relative flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {adminProfile && adminProfile.name
                  ? adminProfile.name
                  : "Admin"}
              </span>
              <button
                onClick={toggleUserMenu}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-600 hover:border-indigo-700 focus:outline-none transition-colors"
              >
                <img
                  src={profileImage}
                  alt={`${adminProfile?.name || "Admin"}'s profile`}
                  className="w-full h-full object-cover"
                />
                <span className="sr-only">Toggle user menu</span>
              </button>
              {isUserMenuOpen && (
                <div
                  className={`absolute right-0 top-12 w-52 bg-white rounded-lg shadow-xl py-2 z-50 transform transition-all duration-200 ease-in-out ${
                    isUserMenuOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6 relative">
          {logoutMessage && (
            <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md z-50 animate-slide-in">
              <p className="text-sm">{logoutMessage}</p>
            </div>
          )}
          <Outlet context={{ adminProfile, API_CONFIG, getAuthToken }} />
        </main>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
