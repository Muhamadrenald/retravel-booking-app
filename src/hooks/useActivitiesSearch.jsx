import { useState, useEffect } from "react";

/**
 * Custom hook for searching through activities data
 * @param {Array} initialData - Array of activity objects to search through
 * @returns {Object} - Search state and filtered data
 */
const useActivitiesSearch = (initialData = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    // Return all data if search is empty
    if (!searchTerm.trim()) {
      setFilteredData(initialData);
      return;
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();

    // Filter activities based on name, description, city, or province
    const filtered = initialData.filter(
      (activity) =>
        (activity.name &&
          activity.name.toLowerCase().includes(normalizedSearch)) ||
        (activity.description &&
          activity.description.toLowerCase().includes(normalizedSearch)) ||
        (activity.city &&
          activity.city.toLowerCase().includes(normalizedSearch)) ||
        (activity.province &&
          activity.province.toLowerCase().includes(normalizedSearch))
    );

    setFilteredData(filtered);
  }, [searchTerm, initialData]);

  // Reset search term
  const resetSearch = () => setSearchTerm("");

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    resetSearch,
    isSearching: searchTerm.trim() !== "",
  };
};

export default useActivitiesSearch;
