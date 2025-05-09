import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const MainDashboard = () => {
  const [totals, setTotals] = useState({
    users: 0,
    promos: 0,
    categories: 0,
    banners: 0,
    activities: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { adminProfile, API_CONFIG, getAuthToken } = useOutletContext();

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const endpoints = {
          users: API_CONFIG.ENDPOINTS.ALL_USERS || "/api/v1/all-users", // Pastikan endpoint benar
          promos: API_CONFIG.ENDPOINTS.PROMOS,
          categories: API_CONFIG.ENDPOINTS.CATEGORIES,
          banners: API_CONFIG.ENDPOINTS.BANNERS,
          activities: API_CONFIG.ENDPOINTS.ACTIVITIES,
          transactions: API_CONFIG.ENDPOINTS.ALL_TRANSACTIONS,
        };

        const requests = Object.keys(endpoints).map(async (key) => {
          try {
            const response = await axios.get(
              `${API_CONFIG.BASE_URL}${endpoints[key]}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  apiKey: API_CONFIG.API_KEY,
                },
              }
            );

            if (response.data && response.data.code === "200") {
              return {
                key,
                count: Array.isArray(response.data.data)
                  ? response.data.data.length
                  : 0,
              };
            } else {
              throw new Error(
                response.data?.message || `Failed to fetch ${key} data.`
              );
            }
          } catch (err) {
            console.error(`Error fetching ${key}:`, {
              status: err.response?.status,
              message: err.response?.data?.message || err.message,
              endpoint: endpoints[key],
            });
            return { key, count: 0 }; // Kembalikan 0 jika endpoint gagal
          }
        });

        const results = await Promise.all(requests);
        const newTotals = results.reduce((acc, { key, count }) => {
          acc[key] = count;
          return acc;
        }, {});

        setTotals(newTotals);
      } catch (err) {
        console.error("Error fetching dashboard totals:", {
          message: err.message,
          details: err.response?.data,
        });
        setError("Failed to load some dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, [API_CONFIG, getAuthToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Main Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">Total Users</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.users}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">Total Promos</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.promos}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">
            Total Categories
          </h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.categories}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">Total Banners</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.banners}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">
            Total Activities
          </h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.activities}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">
            Total Transactions
          </h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {totals.transactions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
