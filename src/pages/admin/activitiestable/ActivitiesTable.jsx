import React, { useEffect, useState } from "react";
import apiClient from "../../../api/axiosInstance";
import { API_CONFIG } from "../../../api/config";
import Header from "../../../components/header/Header";
import Alert from "../../../components/alert/Alert";
import Table from "../../../components/table/Table";
import Pagination from "../../../components/pagination/Pagination";
import Modal from "../../../components/modal/Modal";
import DeleteConfirmationModal from "../../../components/deleteconfirmationmodal/DeleteConfirmationModal";
import Spinner from "../../../components/spinner/Spinner";

const ActivitiesTable = () => {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrls: [],
    price: "",
    price_discount: "",
    rating: "",
    total_reviews: "",
    facilities: "",
    address: "",
    province: "",
    city: "",
    location_maps: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadError, setUploadError] = useState(null); // New state for upload-specific errors

  const activitiesPerPage = 10;

  // Fetch activities and categories on component mount
  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to access this page.");
      }
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ACTIVITIES, {
        headers: {
          apiKey: API_CONFIG.API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.code === "200") {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        const normalizedActivities = rawData
          .filter(
            (activity) =>
              activity && typeof activity === "object" && activity.id
          )
          .map((activity) => ({
            id: activity.id,
            title: typeof activity.title === "string" ? activity.title : "",
            description:
              typeof activity.description === "string"
                ? activity.description
                : "",
            imageUrls: Array.isArray(activity.imageUrls)
              ? activity.imageUrls
              : [],
            price: activity.price || 0,
            price_discount: activity.price_discount || 0,
            rating: activity.rating || 0,
            total_reviews: activity.total_reviews || 0,
            facilities:
              typeof activity.facilities === "string"
                ? activity.facilities
                : "",
            address:
              typeof activity.address === "string" ? activity.address : "",
            province:
              typeof activity.province === "string" ? activity.province : "",
            city: typeof activity.city === "string" ? activity.city : "",
            location_maps:
              typeof activity.location_maps === "string"
                ? activity.location_maps
                : "",
            categoryId: activity.categoryId || "",
          }));
        setActivities(normalizedActivities);
      } else {
        throw new Error(res.data?.message || "Failed to load activities.");
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load activities. Please try again."
      );
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to access this page.");
      }
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES, {
        headers: {
          apiKey: API_CONFIG.API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.code === "200") {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        setCategories(rawData);
      } else {
        throw new Error(res.data?.message || "Failed to load categories.");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load categories. Please try again."
      );
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, JPG)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      setLoading(true);
      setUploadError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const res = await apiClient.post(
        API_CONFIG.ENDPOINTS.UPLOAD_IMAGE,
        uploadFormData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data && res.data.code === "200" && res.data.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, res.data.url],
        }));
      } else {
        throw new Error(
          res.data?.message || "Failed to upload image: Invalid server response"
        );
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setUploadError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create new activity
  const createActivity = async () => {
    if (!formData.title.trim() || !formData.categoryId) {
      setError("Title and category are required");
      return;
    }

    const categoryExists = categories.find(
      (cat) => cat.id === formData.categoryId
    );
    if (!categoryExists) {
      setError("Selected category is invalid or does not exist");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const apiFormData = {
        categoryId: formData.categoryId,
        title: formData.title,
        description: formData.description || "",
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : [],
        price: parseFloat(formData.price) || 0,
        price_discount: parseFloat(formData.price_discount) || 0,
        rating: parseFloat(formData.rating) || 0,
        total_reviews: parseInt(formData.total_reviews) || 0,
        facilities: formData.facilities || "",
        address: formData.address || "",
        province: formData.province || "",
        city: formData.city || "",
        location_maps: formData.location_maps || "",
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CREATE_ACTIVITY,
        apiFormData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.code === "200") {
        setSuccessMessage(
          response.data.message || "Activity created successfully!"
        );
        fetchActivities();
        closeModal();
      } else {
        throw new Error(response.data?.message || "Failed to create activity.");
      }
    } catch (err) {
      console.error("Failed to create activity:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create activity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update existing activity
  const updateActivity = async () => {
    if (!formData.title.trim() || !formData.categoryId || !currentActivity) {
      setError("Title and category are required");
      return;
    }

    const categoryExists = categories.find(
      (cat) => cat.id === formData.categoryId
    );
    if (!categoryExists) {
      setError("Selected category is invalid or does not exist");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const apiFormData = {
        categoryId: formData.categoryId,
        title: formData.title,
        description: formData.description || "",
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : [],
        price: parseFloat(formData.price) || 0,
        price_discount: parseFloat(formData.price_discount) || 0,
        rating: parseFloat(formData.rating) || 0,
        total_reviews: parseInt(formData.total_reviews) || 0,
        facilities: formData.facilities || "",
        address: formData.address || "",
        province: formData.province || "",
        city: formData.city || "",
        location_maps: formData.location_maps || "",
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.UPDATE_ACTIVITY(currentActivity.id),
        apiFormData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.code === "200") {
        setSuccessMessage(
          response.data.message || "Activity updated successfully!"
        );
        fetchActivities();
        closeModal();
      } else {
        throw new Error(response.data?.message || "Failed to update activity.");
      }
    } catch (err) {
      console.error("Failed to update activity:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update activity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete activity
  const deleteActivity = async () => {
    if (!deleteConfirmId) {
      setError("Invalid activity ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.DELETE_ACTIVITY(deleteConfirmId),
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.code === "200") {
        setSuccessMessage(
          response.data.message || "Activity deleted successfully!"
        );
        fetchActivities();
        setDeleteConfirmId(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete activity.");
      }
    } catch (err) {
      console.error("Failed to delete activity:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.status === 500
            ? "Server error: Unable to delete activity. It may be in use or there was an internal issue."
            : err.message || "Failed to delete activity. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating new activity
  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentActivity(null);
    setFormData({
      title: "",
      description: "",
      imageUrls: [],
      price: "",
      price_discount: "",
      rating: "",
      total_reviews: "",
      facilities: "",
      address: "",
      province: "",
      city: "",
      location_maps: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
    });
    setIsModalOpen(true);
    setError(null);
    setUploadError(null);
  };

  // Open modal for editing existing activity
  const openEditModal = (activity) => {
    if (!activity || !activity.id) {
      setError("Cannot edit invalid activity");
      return;
    }
    setIsEditMode(true);
    setCurrentActivity(activity);
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      imageUrls: Array.isArray(activity.imageUrls) ? activity.imageUrls : [],
      price: activity.price || "",
      price_discount: activity.price_discount || "",
      rating: activity.rating || "",
      total_reviews: activity.total_reviews || "",
      facilities: activity.facilities || "",
      address: activity.address || "",
      province: activity.province || "",
      city: activity.city || "",
      location_maps: activity.location_maps || "",
      categoryId: activity.categoryId || "",
    });
    setIsModalOpen(true);
    setError(null);
    setUploadError(null);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      imageUrls: [],
      price: "",
      price_discount: "",
      rating: "",
      total_reviews: "",
      facilities: "",
      address: "",
      province: "",
      city: "",
      location_maps: "",
      categoryId: "",
    });
    setCurrentActivity(null);
    setIsEditMode(false);
    setError(null);
    setUploadError(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateActivity();
    } else {
      createActivity();
    }
  };

  // Filter activities based on search term and category
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.price?.toString().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? activity.categoryId === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Table columns
  const columns = [
    { key: "index", label: "#", className: "p-3 sm:p-4" },
    { key: "image", label: "Image", className: "p-3 sm:p-4" },
    { key: "title", label: "Title", className: "p-3 sm:p-4" },
    {
      key: "category",
      label: "Category",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "price",
      label: "Price",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "rating",
      label: "Rating",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    { key: "actions", label: "Actions", className: "p-3 sm:p-4" },
  ];

  // Render table row
  const renderRow = (activity, index) => (
    <tr
      key={activity.id}
      className="border-t hover:bg-gray-50 transition-colors duration-100"
    >
      <td className="p-3 sm:p-4 text-gray-700 text-xs sm:text-sm">
        {indexOfFirstActivity + index + 1}
      </td>
      <td className="p-3 sm:p-4">
        <img
          src={
            Array.isArray(activity.imageUrls) && activity.imageUrls.length > 0
              ? `${activity.imageUrls[0]}?t=${Date.now()}`
              : "https://picsum.photos/200"
          }
          alt={activity.title || "Activity"}
          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md shadow-sm"
          onError={(e) => {
            e.target.src = "https://picsum.photos/200";
          }}
        />
      </td>
      <td className="p-3 sm:p-4">
        <div className="font-medium text-gray-800 text-xs sm:text-sm">
          {activity.title}
        </div>
        <div className="text-xs text-gray-500">
          {activity.description?.length > 50
            ? `${activity.description.substring(0, 50)}...`
            : activity.description || "-"}
        </div>
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm">
        {getCategoryName(activity.categoryId)}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-800 text-xs sm:text-sm">
        {formatPrice(activity.price || 0)}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4">
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1 text-xs sm:text-sm">★</span>
          <span className="text-gray-600 text-xs sm:text-sm">
            {activity.rating || 0}
          </span>
        </div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(activity)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1.5 rounded-md shadow-sm transition-all duration-200 text-xs sm:text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteConfirmId(activity.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-md shadow-sm transition-all duration-200 text-xs sm:text-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          title="Activities Management"
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={openCreateModal}
          addButtonText="Add Activity"
        />
        <div className="mb-4 sm:mb-6">
          <select
            className="w-full sm:w-64 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
        <Alert type="error" message={error} onClose={() => setError(null)} />
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={currentActivities}
              renderRow={renderRow}
              emptyMessage="No activities found. Create a new activity using the button above."
              searchTerm={searchTerm || selectedCategory}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
        <Modal
          isOpen={isModalOpen}
          title={isEditMode ? "Edit Activity" : "Add Activity"}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitText={isEditMode ? "Update" : "Create"}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter activity title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                required
              >
                <option value="">Select a Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price (IDR)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter price"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price Discount (IDR)
              </label>
              <input
                type="number"
                name="price_discount"
                value={formData.price_discount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter discount price"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter rating"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Reviews
              </label>
              <input
                type="number"
                name="total_reviews"
                value={formData.total_reviews}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter total reviews"
                min="0"
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                rows="4"
                placeholder="Enter activity description"
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Facilities
              </label>
              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter facilities (e.g., WiFi, Parking)"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter province"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Location Maps URL
              </label>
              <input
                type="text"
                name="location_maps"
                value={formData.location_maps}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter Google Maps URL"
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-sm transition-all duration-200"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-red-500 text-xs mt-1">{uploadError}</p>
              )}
              {formData.imageUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Image Previews:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {formData.imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                          onError={(e) => {
                            e.target.src = "https://picsum.photos/200";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          disabled={loading}
                        >
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}
        </Modal>
        <DeleteConfirmationModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={deleteActivity}
          isLoading={loading}
          itemName="activity"
        />
      </div>
    </div>
  );
};

export default ActivitiesTable;
