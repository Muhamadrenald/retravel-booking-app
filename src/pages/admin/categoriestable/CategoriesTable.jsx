import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_CONFIG } from "../../../api/config";
import Header from "../../../components/header/Header";
import Alert from "../../../components/alert/Alert";
import Table from "../../../components/table/Table";
import Pagination from "../../../components/pagination/Pagination";
import Modal from "../../../components/modal/Modal";
import DeleteConfirmationModal from "../../../components/deleteconfirmationmodal/DeleteConfirmationModal";
import Spinner from "../../../components/spinner/Spinner";

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadError, setUploadError] = useState(null); // New state for upload-specific errors

  const categoriesPerPage = 10;

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to access this page.");
      }
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.code === "200") {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        const normalizedCategories = rawData
          .filter(
            (category) =>
              category &&
              typeof category === "object" &&
              category.id &&
              typeof category.name === "string"
          )
          .map((category) => ({
            id: category.id,
            name: category.name,
            imageUrl:
              typeof category.imageUrl === "string" ? category.imageUrl : "",
          }));
        setCategories(normalizedCategories);
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
      setCategories([]);
    } finally {
      setLoading(false);
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
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`,
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
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create new category
  const createCategory = async () => {
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_CATEGORY}`,
        formData,
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
          response.data.message || "Category created successfully!"
        );
        fetchCategories();
        closeModal();
      } else {
        throw new Error(response.data?.message || "Failed to create category.");
      }
    } catch (err) {
      console.error("Failed to create category:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update existing category
  const updateCategory = async () => {
    if (!formData.name.trim() || !currentCategory) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_CATEGORY(
          currentCategory.id
        )}`,
        formData,
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
          response.data.message || "Category updated successfully!"
        );
        fetchCategories();
        closeModal();
      } else {
        throw new Error(response.data?.message || "Failed to update category.");
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async () => {
    if (!deleteConfirmId) {
      setError("Invalid category ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to perform this action.");
      }
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_CATEGORY(
          deleteConfirmId
        )}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.code === "200") {
        setSuccessMessage(
          response.data.message || "Category deleted successfully!"
        );
        fetchCategories();
        setDeleteConfirmId(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.status === 500
            ? "Server error: Unable to delete category. It may be in use or there was an internal issue."
            : err.message || "Failed to delete category. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating new category
  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentCategory(null);
    setFormData({ name: "", imageUrl: "" });
    setIsModalOpen(true);
    setError(null);
    setUploadError(null);
  };

  // Open modal for editing existing category
  const openEditModal = (category) => {
    if (!category || !category.id || !category.name) {
      setError("Cannot edit invalid category");
      return;
    }
    setIsEditMode(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      imageUrl: category.imageUrl || "",
    });
    setIsModalOpen(true);
    setError(null);
    setUploadError(null);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", imageUrl: "" });
    setCurrentCategory(null);
    setIsEditMode(false);
    setError(null);
    setUploadError(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateCategory();
    } else {
      createCategory();
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category &&
      typeof category === "object" &&
      category.id &&
      typeof category.name === "string" &&
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // Table columns
  const columns = [
    { key: "index", label: "#", className: "p-3 sm:p-4" },
    {
      key: "image",
      label: "Image",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    { key: "name", label: "Name", className: "p-3 sm:p-4" },
    { key: "actions", label: "Actions", className: "p-3 sm:p-4" },
  ];

  // Render table row
  const renderRow = (category, index) => (
    <tr
      key={category.id}
      className="border-t hover:bg-gray-50 transition-colors duration-100"
    >
      <td className="p-3 sm:p-4 text-gray-700 text-xs sm:text-sm">
        {indexOfFirstCategory + index + 1}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4">
        <img
          src={
            category.imageUrl && category.imageUrl.trim()
              ? `${category.imageUrl}?t=${Date.now()}`
              : "https://picsum.photos/200"
          }
          alt={category.name || "Category"}
          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md shadow-sm"
          onError={(e) => {
            e.target.src = "https://picsum.photos/200";
          }}
        />
      </td>
      <td className="p-3 sm:p-4 text-gray-800 text-xs sm:text-sm font-medium">
        {category.name}
      </td>
      <td className="p-3 sm:p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(category)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1.5 rounded-md shadow-sm transition-all duration-200 text-xs sm:text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteConfirmId(category.id)}
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
          title="Categories Management"
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={openCreateModal}
          addButtonText="Add Category"
        />
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
              data={currentCategories}
              renderRow={renderRow}
              emptyMessage="No categories found. Create a new category using the button above."
              searchTerm={searchTerm}
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
          title={isEditMode ? "Edit Category" : "Add Category"}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitText={isEditMode ? "Update" : "Create"}
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image
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
              {formData.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Image Preview:
                  </p>
                  <div className="relative group rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={formData.imageUrl}
                      alt="Category preview"
                      className="w-full h-20 sm:h-24 object-cover"
                      onError={(e) => {
                        e.target.src = "https://picsum.photos/200";
                      }}
                    />
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
          onConfirm={deleteCategory}
          isLoading={loading}
          itemName="category"
        />
      </div>
    </div>
  );
};

export default CategoriesTable;
