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

const PromosTable = () => {
  const [promos, setPromos] = useState([]);
  const [filteredPromos, setFilteredPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    promo_code: "",
    promo_discount_price: "",
    minimum_claim_price: "",
    imageUrl: "",
    terms_condition: "",
  });
  const [formMode, setFormMode] = useState("add");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const promosPerPage = 10;

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOS}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let promoData;
      if (Array.isArray(res.data)) {
        promoData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        promoData = res.data.data;
      } else if (res.data && Array.isArray(res.data.promos)) {
        promoData = res.data.promos;
      } else {
        console.error("Unexpected API response structure:", res.data);
        setPromos([]);
        setFilteredPromos([]);
        setError("Unexpected data format received from API");
        return;
      }

      const normalizedPromos = promoData
        .filter((promo) => promo && typeof promo === "object" && promo.id)
        .map((promo) => ({
          id: promo.id,
          title: typeof promo.title === "string" ? promo.title : "",
          description:
            typeof promo.description === "string" ? promo.description : "",
          promo_code:
            typeof promo.promo_code === "string" ? promo.promo_code : "",
          promo_discount_price: promo.promo_discount_price || 0,
          minimum_claim_price: promo.minimum_claim_price || 0,
          imageUrl: typeof promo.imageUrl === "string" ? promo.imageUrl : "",
          terms_condition:
            typeof promo.terms_condition === "string"
              ? promo.terms_condition
              : "",
          createdAt: promo.createdAt || "",
        }));

      setPromos(normalizedPromos);
      setFilteredPromos(normalizedPromos);
    } catch (err) {
      console.error("Failed to fetch promos:", err);
      setError("Failed to load promotions. Please try again later.");
      setPromos([]);
      setFilteredPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPromos(promos);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = promos.filter(
      (promo) =>
        promo.title?.toLowerCase().includes(lowerSearchTerm) ||
        promo.promo_code?.toLowerCase().includes(lowerSearchTerm) ||
        promo.description?.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredPromos(filtered);
    setCurrentPage(1);
  }, [searchTerm, promos]);

  const handleOpenModal = (mode, promo = null) => {
    setFormMode(mode);
    if (mode === "edit" && promo) {
      setCurrentPromo(promo);
      setFormData({
        title: promo.title || "",
        description: promo.description || "",
        promo_code: promo.promo_code || "",
        promo_discount_price: promo.promo_discount_price || "",
        minimum_claim_price: promo.minimum_claim_price || "",
        imageUrl: promo.imageUrl || "",
        terms_condition: promo.terms_condition || "",
      });
      setPreviewImage(promo.imageUrl || "");
    } else {
      setCurrentPromo(null);
      setFormData({
        title: "",
        description: "",
        promo_code: "",
        promo_discount_price: "",
        minimum_claim_price: "",
        imageUrl: "",
        terms_condition: "",
      });
      setPreviewImage("");
    }
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPromo(null);
    setPreviewImage("");
    setUploadError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      setLoading(true);
      setUploadError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`,
        formDataUpload,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.data.url || response.data.imageUrl;
      if (!imageUrl) {
        throw new Error("Image URL not returned from API");
      }

      setFormData((prev) => ({ ...prev, imageUrl }));
      setPreviewImage(imageUrl);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setUploadError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.promo_code.trim()) {
      setError("Title and promo code are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const dataToSubmit = {
        ...formData,
        promo_discount_price: parseFloat(formData.promo_discount_price) || 0,
        minimum_claim_price: parseFloat(formData.minimum_claim_price) || 0,
      };

      if (formMode === "add") {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_PROMO}`,
          dataToSubmit,
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
            response.data.message || "Promo added successfully!"
          );
          fetchPromos();
          handleCloseModal();
        } else {
          setError(response.data?.message || "Failed to add promo");
        }
      } else if (formMode === "edit" && currentPromo) {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROMO(
            currentPromo.id
          )}`,
          dataToSubmit,
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
            response.data.message || "Promo updated successfully!"
          );
          fetchPromos();
          handleCloseModal();
        } else {
          setError(response.data?.message || "Failed to update promo");
        }
      }
    } catch (err) {
      console.error("Failed to save promo:", err);
      setError(
        err.response?.data?.message ||
          (formMode === "add"
            ? "Failed to add promo"
            : "Failed to update promo")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_PROMO(
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
          response.data.message || "Promo deleted successfully!"
        );
        fetchPromos();
        setDeleteConfirmId(null);
      } else {
        setError(response.data?.message || "Failed to delete promo");
      }
    } catch (err) {
      console.error("Failed to delete promo:", err);
      setError("Failed to delete promo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const indexOfLastPromo = currentPage * promosPerPage;
  const indexOfFirstPromo = indexOfLastPromo - promosPerPage;
  const currentPromos = filteredPromos.slice(
    indexOfFirstPromo,
    indexOfLastPromo
  );
  const totalPages = Math.ceil(filteredPromos.length / promosPerPage);

  const columns = [
    { key: "index", label: "#", className: "p-3 sm:p-4" },
    { key: "image", label: "Image", className: "p-3 sm:p-4" },
    { key: "title", label: "Title", className: "p-3 sm:p-4" },
    {
      key: "promo_code",
      label: "Promo Code",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "discount",
      label: "Discount",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "min_price",
      label: "Min. Price",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "created_at",
      label: "Created At",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    { key: "actions", label: "Actions", className: "p-3 sm:p-4" },
  ];

  const renderRow = (promo, index) => (
    <tr
      key={promo.id}
      className="border-t hover:bg-gray-50 transition-colors duration-100"
    >
      <td className="p-3 sm:p-4 text-gray-700 text-xs sm:text-sm">
        {indexOfFirstPromo + index + 1}
      </td>
      <td className="p-3 sm:p-4">
        <img
          src={
            promo.imageUrl && promo.imageUrl.trim()
              ? `${promo.imageUrl}?t=${Date.now()}`
              : "https://picsum.photos/200"
          }
          alt={promo.title || "Promo"}
          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md shadow-sm"
          onError={(e) => {
            e.target.src = "https://picsum.photos/200";
          }}
        />
      </td>
      <td className="p-3 sm:p-4">
        <div className="font-medium text-gray-800 text-xs sm:text-sm">
          {promo.title}
        </div>
        <div className="text-xs text-gray-500">
          {promo.description?.length > 50
            ? `${promo.description.substring(0, 50)}...`
            : promo.description || "-"}
        </div>
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4">
        <span className="bg-gray-200 px-2 py-1 rounded-md font-mono text-xs sm:text-sm text-gray-700">
          {promo.promo_code || "-"}
        </span>
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm">
        {formatCurrency(promo.promo_discount_price)}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm">
        {formatCurrency(promo.minimum_claim_price)}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm">
        {formatDate(promo.createdAt)}
      </td>
      <td className="p-3 sm:p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal("edit", promo)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1.5 rounded-md shadow-sm transition-all duration-200 text-xs sm:text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteConfirmId(promo.id)}
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
          title="Promo Management"
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={() => handleOpenModal("add")}
          addButtonText="Add Promo"
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
              data={currentPromos}
              renderRow={renderRow}
              emptyMessage="No promotions found. Create a new promotion using the button above."
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
          title={formMode === "add" ? "Add Promo" : "Edit Promo"}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitText={formMode === "add" ? "Create" : "Update"}
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
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Promo Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="promo_code"
                value={formData.promo_code}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Discount Amount (IDR)
              </label>
              <input
                type="number"
                name="promo_discount_price"
                value={formData.promo_discount_price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Minimum Claim Price (IDR)
              </label>
              <input
                type="number"
                name="minimum_claim_price"
                value={formData.minimum_claim_price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                min="0"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 resize-none"
                rows="4"
              ></textarea>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                name="terms_condition"
                value={formData.terms_condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 resize-none"
                rows="4"
              ></textarea>
            </div>
            <div className="space-y-2 sm:col-span-2">
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
              {previewImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Image Preview:
                  </p>
                  <div className="relative group rounded-lg shadow-sm">
                    <img
                      src={previewImage}
                      alt="Promo preview"
                      className="w-full max-h-64 object-contain aspect-auto"
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
          onConfirm={handleDeletePromo}
          isLoading={loading}
          itemName="promo"
        />
      </div>
    </div>
  );
};

export default PromosTable;
