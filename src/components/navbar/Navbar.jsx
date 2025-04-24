import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";

const Navbar = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ticketDropdown, setTicketDropdown] = useState(false);
  const navigate = useNavigate();

  // Navbar items
  const navItems = [
    {
      label: "Home",
      link: "/",
    },
    {
      label: "Sevices",
      link: "/services",
    },
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
    {
      label: "About",
      link: "/about",
    },
  ];

  // Handle click open
  const handleOpen = () => {
    setOpen(!open);
  };

  // Handle click close
  const handleClose = () => {
    setOpen(false);
    setTicketDropdown(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setTicketDropdown(!ticketDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);

    // Tambahkan notifikasi logout berhasil
    toast.success("Logout berhasil!", {
      position: "top-right",
      autoClose: 3000,
    });

    navigate("/");
  };

  // To check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    // Periksa status login saat komponen di-mount
    checkLoginStatus();

    // Tambahkan event listener untuk memperbarui status login ketika storage berubah
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  // To make the navbar sticky and hide when scrolling up and showing when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollState = window.scrollY;
      // Determine visibility of the navbar based on scroll position
      if (currentScrollState > scrollPosition && currentScrollState > 50) {
        setIsVisible(false); // Hide the navbar when scrolling up
      } else {
        setIsVisible(true); // Show the navbar when scrolling down
      }
      setScrollPosition(currentScrollState);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ticketDropdown && !event.target.closest(".ticket-dropdown")) {
        setTicketDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ticketDropdown]);

  return (
    <nav
      className={`w-full h-[8ch] fixed top-0 left-0 lg:px-24 md:px-16 sm:px-7 px-4 backdrop-blur-lg transition-transform duration-500 z-50 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
        // } ${scrollPosition > 50 ? "bg-violet-200" : "bg-neutral-100/10"}`}
      } ${scrollPosition > 50 ? "bg-slate-100 " : "bg-neutral-100/10"}`}
    >
      <div className="w-full h-full flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="text-4xl text-primary font-bold">
          ReTravel
        </Link>
        {/* Hamburger Menu */}
        <div
          className="w-fit md:hidden flex items-center justify-center cursor-pointer flex-col gap-1 text-neutral-700"
          onClick={handleOpen}
        >
          {open ? <FaX className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </div>
        {/* Nav links and button */}
        <div
          className={`${
            open
              ? "flex absolute top-20 left-0 w-full h-auto md:relative"
              : "hidden"
          } flex-1 md:flex flex-col md:flex-row md:gap-14 gap-8 md:items-center items-start md:p-0 sm:p-4 p-4 justify-end md:bg-transparent bg-neutral-50 border md:border-transparent border-neutral-200 md:shadow-none sm:shadow-md shadow-md rounded-xl`}
        >
          {/* Nav links */}
          <ul className="list-none flex md:items-center items-start flex-wrap md:flex-row flex-col md:gap-8 gap-4 text-lg text-neutral-500 font-normal">
            {navItems.map((item, index) => (
              <li
                key={index}
                className={item.hasDropdown ? "relative ticket-dropdown" : ""}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={toggleDropdown}
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
                    {/* Dropdown Menu */}
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
                    className="hover:text-primary ease-in-out duration-300"
                    onClick={handleClose}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {/* Button */}
          <div className="flex items-center justify-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="md:w-fit w-full md:px-4 px-6 md:py-1 py-2.5 bg-red-500 border border-red-500 hover:bg-transparent hover:border-red-500 md:rounded-full rounded-xl font-normal text-neutral-50 hover:text-red-500 ease-in-out duration-300 cursor-pointer"
              >
                Logout
              </button>
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
