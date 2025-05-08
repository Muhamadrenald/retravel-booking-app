import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaUser, FaShoppingCart } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import useAuthAPI from "../../hooks/useAuthAPI";
import { useCartAPI } from "../../hooks/useCartAPI";

const Navbar = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [ticketDropdown, setTicketDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuthAPI();
  const { cartItems } = useCartAPI();

  const navItems = [
    { label: "Home", link: "/" },
    { label: "Categories", link: "/categories" },
    { label: "Activities", link: "/activities" },
    { label: "Promo", link: "/promo" },
    { label: "Transaction", link: "/transaction" },
  ];

  const handleOpen = () => {
    setOpen(!open);
    setTicketDropdown(false);
    setUserDropdown(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTicketDropdown(false);
    setUserDropdown(false);
  };

  const toggleTicketDropdown = (e) => {
    e.stopPropagation();
    setTicketDropdown(!ticketDropdown);
    setUserDropdown(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setUserDropdown(!userDropdown);
    setTicketDropdown(false);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/");
    }
    handleClose();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > scrollPosition && currentScrollPos > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setScrollPosition(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ticketDropdown && !event.target.closest(".ticket-dropdown")) {
        setTicketDropdown(false);
      }
      if (userDropdown && !event.target.closest(".user-dropdown")) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ticketDropdown, userDropdown]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDisplayName = () => {
    if (!user) return "User";
    return user.name || user.email || "User";
  };

  return (
    <nav
      className={`w-full h-16 fixed top-0 left-0 z-50 transition-transform duration-500 backdrop-blur-lg
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${scrollPosition > 50 ? "bg-slate-100" : "bg-neutral-100/10"}`}
    >
      <div className="w-full h-full flex items-center justify-between px-4 sm:px-7 md:px-16 lg:px-24">
        <Link
          to="/"
          className="text-2xl sm:text-3xl lg:text-4xl text-red-500 font-bold"
        >
          ReTravel
        </Link>

        {/* Mobile Menu Button */}
        <div
          className="md:hidden flex items-center cursor-pointer text-neutral-700"
          onClick={handleOpen}
        >
          {open ? <FaX className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </div>

        {/* Navigation Items */}
        <div
          className={`${
            open ? "flex absolute top-16 left-0 w-full h-auto" : "hidden"
          } md:flex flex-1 flex-col md:flex-row md:items-center md:gap-8 gap-4 justify-end bg-neutral-50 md:bg-transparent border md:border-none border-neutral-200 rounded-b-xl md:rounded-none shadow-md md:shadow-none p-4 md:p-0 z-40 transition-all duration-300`}
        >
          <ul className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-lg text-neutral-500 font-normal">
            {navItems.map((item, index) => (
              <li
                key={index}
                className={item.hasDropdown ? "relative ticket-dropdown" : ""}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={toggleTicketDropdown}
                      className="hover:text-red-500 transition duration-300 flex items-center gap-1"
                    >
                      {item.label}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${
                          ticketDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {ticketDropdown && (
                      <div className="md:absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {item.dropdownItems.map(
                            (dropdownItem, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                to={dropdownItem.link}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                                onClick={handleClose}
                              >
                                {dropdownItem.label}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.link}
                    onClick={handleClose}
                    className="relative group hover:text-red-500 transition duration-300"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Cart Icon */}
          <div className="relative mt-4 md:mt-0">
            <button
              onClick={() => {
                navigate("/carts");
                handleClose();
              }}
              className="flex items-center justify-center hover:text-red-500 transition duration-300 relative cursor-pointer"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="text-xl md:text-2xl" />
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* User Auth Section */}
          <div className="mt-4 md:mt-0">
            {isAuthenticated() ? (
              <div className="relative user-dropdown">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-normal transition duration-300"
                >
                  <FaUser className="text-sm" />
                  <span className="max-w-24 truncate">{getDisplayName()}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${
                      userDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {userDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Hi, {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500">Welcome back!</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                        onClick={handleClose}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/transactions"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                        onClick={handleClose}
                      >
                        My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-normal transition duration-300">
                <Link to="/login" onClick={handleClose}>
                  Login
                </Link>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
