import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaUser, FaShoppingCart } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import useAuthAPI from "../../hooks/useAuthAPI";
import { useCartAPI } from "../../hooks/useCartAPI"; // Diperbaiki: Named import

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
    { label: "Services", link: "/services" },
    {
      label: "Tickets",
      link: "#",
      hasDropdown: true,
      dropdownItems: [
        { label: "Plane", link: "/plane-tickets" },
        { label: "Train", link: "/train-tickets" },
        { label: "Bus", link: "/bus-tickets" },
      ],
    },
    { label: "About", link: "/about" },
    { label: "Categories", link: "/categories" },
    { label: "Activities", link: "/activities" },
    { label: "Promo", link: "/promo" },
  ];

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
    setTicketDropdown(false);
    setUserDropdown(false);
  };

  const toggleTicketDropdown = () => {
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
      const currentScrollState = window.scrollY;
      if (currentScrollState > scrollPosition && currentScrollState > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setScrollPosition(currentScrollState);
    };
    window.addEventListener("scroll", handleScroll);
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

  const getDisplayName = () => {
    if (!user) return "User";
    return user.name || user.email || "User";
  };

  return (
    <nav
      className={`w-full h-[8ch] fixed top-0 left-0 lg:px-24 md:px-16 sm:px-7 px-4 backdrop-blur-lg transition-transform duration-500 z-50 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${scrollPosition > 50 ? "bg-slate-100 " : "bg-neutral-100/10"}`}
    >
      <div className="w-full h-full flex items-center justify-between">
        <Link to="/" className="text-4xl text-primary font-bold">
          ReTravel
        </Link>

        <div
          className="w-fit md:hidden flex items-center justify-center cursor-pointer flex-col gap-1 text-neutral-700"
          onClick={handleOpen}
        >
          {open ? <FaX className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </div>

        <div
          className={`${
            open
              ? "flex absolute top-20 left-0 w-full h-auto md:relative"
              : "hidden"
          } flex-1 md:flex flex-col md:flex-row md:gap-14 gap-8 md:items-center items-start md:p-0 sm:p-4 p-4 justify-end md:bg-transparent bg-neutral-50 border md:border-transparent border-neutral-200 md:shadow-none sm:shadow-md shadow-md rounded-xl`}
        >
          <ul className="list-none flex md:items-center items-start flex-wrap md:flex-row flex-col md:gap-8 gap-4 text-lg text-neutral-500 font-normal">
            {navItems.map((item, index) => (
              <li
                key={index}
                className={item.hasDropdown ? "relative ticket-dropdown" : ""}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={toggleTicketDropdown}
                      className="hover:text-primary ease-in-out duration-300 flex items-center gap-1 cursor-pointer"
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
                      <div className="md:absolute relative top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          {item.dropdownItems.map(
                            (dropdownItem, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                to={dropdownItem.link}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
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
                    className="relative group hover:text-primary transition duration-300"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Cart Icon */}
          <div className="relative">
            <button
              onClick={() => {
                navigate("/carts");
                handleClose();
              }}
              className="flex items-center justify-center cursor-pointer hover:text-primary ease-in-out duration-300 relative"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="text-2xl" />
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* User Auth Section */}
          <div className="flex items-center justify-center">
            {isAuthenticated() ? (
              <div className="relative user-dropdown">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 md:px-4 px-6 md:py-1.5 py-2.5 bg-primary border border-primary hover:bg-primary/90 md:rounded-full rounded-xl font-normal text-neutral-50 ease-in-out duration-300 cursor-pointer"
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                        onClick={handleClose}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
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
              <button className="md:w-fit w-full md:px-4 px-6 md:py-1 py-2.5 bg-primary border border-primary hover:bg-transparent hover:border-primary md:rounded-full rounded-xl font-normal text-neutral-50 hover:text-primary ease-in-out duration-300 cursor-pointer">
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
