import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../../../api/config";

const Search = () => {
  const navigate = useNavigate();
  const [today, setToday] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  const fallbackCategories = [
    { id: "1", name: "Japan" },
    { id: "2", name: "Indonesia" },
    { id: "3", name: "Thailand" },
    { id: "4", name: "Italy" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setCategories(data.data || fallbackCategories);
        setError(null);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
        setError("Failed to load categories. Using backup data.");
        setCategories(fallbackCategories);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    setToday(formattedDate);
    setDepartureDate(formattedDate);
    setReturnDate(formattedDate);
  }, []);

  const handleDepartureChange = (e) => {
    setDepartureDate(e.target.value);
    if (returnDate < e.target.value) {
      setReturnDate(e.target.value);
    }
  };

  const handleSearch = () => {
    // Clear previous error message
    setCategoryError("");

    // Check if category is selected
    if (!selectedCategory) {
      setCategoryError("Please select a category to continue");
      return;
    }

    const queryParams = new URLSearchParams();
    if (selectedCategory) queryParams.set("category", selectedCategory);
    if (departureDate) queryParams.set("departure", departureDate);
    if (returnDate) queryParams.set("return", returnDate);
    navigate(`/activities?${queryParams.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-4 md:p-6"
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Category Selection */}
        <div className="w-full md:w-1/2 lg:w-2/5">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCategoryError("");
              }}
              className={`w-full h-12 md:h-14 pl-3 pr-8 border ${
                categoryError ? "border-red-500" : "border-neutral-300"
              } bg-white/70 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            >
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {categoryError && (
            <p className="text-red-500 text-xs mt-1">{categoryError}</p>
          )}
        </div>

        {/* Date Selection - Mobile (stacked) */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="w-full">
            <label
              htmlFor="departure"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Departure
            </label>
            <div className="relative">
              <input
                type="date"
                id="departure"
                min={today}
                value={departureDate}
                onChange={handleDepartureChange}
                className="w-full h-12 pl-3 pr-10 border border-neutral-300 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FaCalendarAlt className="absolute right-3 top-3.5 text-neutral-400" />
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor="return"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Return
            </label>
            <div className="relative">
              <input
                type="date"
                id="return"
                min={departureDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-12 pl-3 pr-10 border border-neutral-300 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FaCalendarAlt className="absolute right-3 top-3.5 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Date Selection - Desktop (inline) */}
        <div className="hidden md:flex flex-1 gap-4">
          <div className="flex-1">
            <label
              htmlFor="departure"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Departure
            </label>
            <div className="relative">
              <input
                type="date"
                id="departure"
                min={today}
                value={departureDate}
                onChange={handleDepartureChange}
                className="w-full h-14 pl-5 pr-5 border border-neutral-300 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {/* <FaCalendarAlt className="absolute right-3 top-4 text-neutral-400" /> */}
            </div>
          </div>

          <div className="flex-1">
            <label
              htmlFor="return"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Return
            </label>
            <div className="relative">
              <input
                type="date"
                id="return"
                min={departureDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-14 pl-5 pr-5 border border-neutral-300 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {/* <FaCalendarAlt className="absolute right-3 top-4 text-neutral-400" /> */}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="w-full md:w-auto flex flex-col">
          <label className="block text-sm font-medium text-transparent mb-1">
            &nbsp;
          </label>
          <button
            onClick={handleSearch}
            className="w-full md:w-32 h-12 md:h-14 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
          >
            <FaSearch />
            <span>Search</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Search;
