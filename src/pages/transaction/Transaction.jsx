import { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../../api/config";
import { toPng } from "html-to-image";
import Invoice from "../../components/invoice/Invoice";

export default function Transaction({ transactionId }) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [singleTransaction, setSingleTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const fileInputRef = useRef(null);
  const voucherRefs = useRef({});
  const invoiceRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view transactions.");

        if (transactionId) {
          // Fetch single transaction using TRANSACTION endpoint
          const response = await axios.get(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION(
              transactionId
            )}`,
            {
              headers: {
                apiKey: API_CONFIG.API_KEY,
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data?.code === "200") {
            const transaction = response.data.data;
            let calculatedTotal = 0;
            if (transaction.transaction_items?.length > 0) {
              calculatedTotal = transaction.transaction_items.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                0
              );
            }
            setSingleTransaction({
              ...transaction,
              totalAmount: transaction.totalAmount || calculatedTotal,
            });
            setAllTransactions([
              {
                ...transaction,
                totalAmount: transaction.totalAmount || calculatedTotal,
              },
            ]);
            setTotalPages(1);
          } else {
            throw new Error(
              response.data.message || "Failed to fetch transaction."
            );
          }
        } else {
          // Fetch all transactions
          const response = await axios.get(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_TRANSACTIONS}`,
            {
              headers: {
                apiKey: API_CONFIG.API_KEY,
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data?.code === "200") {
            const transactionList = Array.isArray(response.data.data)
              ? response.data.data
              : [];
            const detailedTransactions = transactionList.map((transaction) => {
              let calculatedTotal = 0;
              if (transaction.transaction_items?.length > 0) {
                calculatedTotal = transaction.transaction_items.reduce(
                  (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                  0
                );
              }
              return {
                ...transaction,
                totalAmount: transaction.totalAmount || calculatedTotal,
              };
            });
            setAllTransactions(detailedTransactions);
            setTotalPages(
              Math.ceil(detailedTransactions.length / itemsPerPage) || 1
            );
          } else {
            throw new Error(
              response.data.message || "Failed to fetch transactions."
            );
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        let errorMessage = transactionId
          ? "Failed to load transaction."
          : "Failed to load transactions.";
        if (err.response) {
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            errorMessage = "Session expired. Please log in again.";
          } else if (err.response.status === 404) {
            errorMessage = transactionId
              ? "Transaction not found."
              : "Transactions endpoint not found.";
          } else {
            errorMessage =
              err.response.data.message || "Unknown error occurred.";
          }
        } else {
          errorMessage = err.message || "Network error.";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transactionId]);

  useEffect(() => {
    if (!transactionId) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setTransactions(allTransactions.slice(startIndex, endIndex));
    } else {
      setTransactions(singleTransaction ? [singleTransaction] : []);
    }
  }, [currentPage, allTransactions, singleTransaction, transactionId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (uploadError) {
      const timer = setTimeout(() => {
        setUploadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, uploadError]);

  const formatDateRange = (bookingDate) => {
    if (bookingDate?.checkIn && bookingDate?.checkOut) {
      try {
        const options = { day: "numeric", month: "long", year: "numeric" };
        const checkIn = new Date(bookingDate.checkIn).toLocaleDateString(
          "en-US",
          options
        );
        const checkOut = new Date(bookingDate.checkOut).toLocaleDateString(
          "en-US",
          options
        );
        return `${checkIn} - ${checkOut}`;
      } catch (error) {
        console.error("Error formatting bookingDate:", { bookingDate, error });
        return "Date unavailable";
      }
    }
    return "Date unavailable";
  };

  const formatCurrency = (amount) => {
    return `IDR ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file (e.g., JPG, PNG).");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadProof = async (transactionId) => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploadingId(transactionId);
      setUploadProgress(0);
      setUploadError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to upload proof.");

      const uploadResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`,
        formData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (uploadResponse.data?.code === "200") {
        const imageUrl =
          uploadResponse.data.data?.url ||
          uploadResponse.data.url ||
          uploadResponse.data.data?.imageUrl;
        if (!imageUrl) throw new Error("Image URL not found in response.");

        const proofEndpoint =
          API_CONFIG.ENDPOINTS.UPDATE_TRANSACTION_PROOF(transactionId);
        const proofResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${proofEndpoint}`,
          { proofPaymentUrl: imageUrl },
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (proofResponse.data.code === "200") {
          setAllTransactions((prevTransactions) =>
            prevTransactions.map((transaction) =>
              transaction.id === transactionId
                ? {
                    ...transaction,
                    proofPaymentUrl: imageUrl,
                    status: "waiting",
                  }
                : transaction
            )
          );
          setSingleTransaction((prev) =>
            prev && prev.id === transactionId
              ? { ...prev, proofPaymentUrl: imageUrl, status: "waiting" }
              : prev
          );
          setSuccessMessage("Proof of payment uploaded successfully!");
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          throw new Error(
            proofResponse.data.message || "Failed to update proof."
          );
        }
      } else {
        throw new Error(
          uploadResponse.data.message || "Failed to upload image."
        );
      }
    } catch (err) {
      console.error("Error uploading proof of payment:", err);
      let errorMessage = "Failed to upload proof of payment.";
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          errorMessage = "Session expired. Please log in again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid upload data.";
        } else if (err.response.status === 404) {
          errorMessage = "Upload endpoint not found.";
        } else {
          errorMessage = err.response.data.message || "Unknown error occurred.";
        }
      } else {
        errorMessage = err.message || "Network error.";
      }
      setUploadError(errorMessage);
    } finally {
      setUploadingId(null);
      setUploadProgress(0);
    }
  };

  const cancelTransaction = async (transactionId) => {
    try {
      setCancellingId(transactionId);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to cancel transaction.");

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANCEL_TRANSACTION(
          transactionId
        )}`,
        {},
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === "200") {
        setAllTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, status: "cancelled" }
              : transaction
          )
        );
        setSingleTransaction((prev) =>
          prev && prev.id === transactionId
            ? { ...prev, status: "cancelled" }
            : prev
        );
        setSuccessMessage("Transaction cancelled successfully!");
        setDeleteConfirmId(null);
      } else {
        throw new Error(
          response.data.message || "Failed to cancel transaction."
        );
      }
    } catch (err) {
      console.error("Error cancelling transaction:", err);
      let errorMessage = "Failed to cancel transaction.";
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          errorMessage = "Session expired. Please log in again.";
        } else if (err.response.status === 404) {
          errorMessage = "Cancel transaction endpoint not found.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid request.";
        } else {
          errorMessage = err.response.data.message || "Unknown error occurred.";
        }
      } else {
        errorMessage = err.message || "Network error.";
      }
      setError(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const waitForImagesToLoad = (element) => {
    return new Promise((resolve) => {
      const images = element.querySelectorAll("img");
      let loadedCount = 0;
      if (images.length === 0) {
        resolve();
        return;
      }
      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === images.length) resolve();
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length) resolve();
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === images.length) resolve();
          };
        }
      });
    });
  };

  const downloadVoucher = async (transactionId) => {
    const transaction = allTransactions.find((t) => t.id === transactionId);
    const voucherRef = voucherRefs.current[transactionId];
    if (!voucherRef || !transaction) {
      console.error("Voucher ref or transaction not found");
      setError(
        "Failed to generate ticket. Please ensure details are available."
      );
      return;
    }

    try {
      if (expandedTransaction !== transactionId) {
        setExpandedTransaction(transactionId);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const originalStyle = {
        position: voucherRef.style.position,
        left: voucherRef.style.left,
        opacity: voucherRef.style.opacity,
        width: voucherRef.style.width,
        padding: voucherRef.style.padding,
        backgroundColor: voucherRef.style.backgroundColor,
      };

      voucherRef.style.position = "static";
      voucherRef.style.left = "auto";
      voucherRef.style.opacity = "1";
      voucherRef.style.width = "600px";
      voucherRef.style.padding = "20px";
      voucherRef.style.backgroundColor = "white";

      await waitForImagesToLoad(voucherRef);

      const dataUrl = await toPng(voucherRef, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });

      Object.assign(voucherRef.style, originalStyle);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ticket-${transactionId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(dataUrl);
    } catch (err) {
      console.error("Error generating ticket:", err);
      setError("Failed to generate ticket. Please try again.");
    }
  };

  const downloadInvoice = async (transactionId) => {
    const transaction = allTransactions.find((t) => t.id === transactionId);
    const invoiceRef = invoiceRefs.current[transactionId];
    if (!transaction || !invoiceRef) {
      console.error("Invoice ref or transaction not found");
      setError(
        "Failed to generate invoice. Please expand the transaction details."
      );
      return;
    }

    try {
      if (expandedTransaction !== transactionId) {
        setExpandedTransaction(transactionId);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const originalStyle = {
        position: invoiceRef.style.position,
        left: invoiceRef.style.left,
        opacity: invoiceRef.style.opacity,
        width: invoiceRef.style.width,
        padding: invoiceRef.style.padding,
        backgroundColor: invoiceRef.style.backgroundColor,
      };

      invoiceRef.style.position = "static";
      invoiceRef.style.left = "auto";
      invoiceRef.style.opacity = "1";
      invoiceRef.style.width = "500px";
      invoiceRef.style.padding = "15px";
      invoiceRef.style.backgroundColor = "white";

      await waitForImagesToLoad(invoiceRef);

      const dataUrl = await toPng(invoiceRef, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });

      Object.assign(invoiceRef.style, originalStyle);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `invoice-${transactionId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(dataUrl);
    } catch (err) {
      console.error("Error generating invoice:", err);
      setError("Failed to generate invoice. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case "pending":
      case "waiting":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "failed":
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const toggleExpand = (id) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !transactionId) {
      setCurrentPage(page);
      setExpandedTransaction(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          {transactionId ? "Transaction Details" : "My Transactions"}
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {transactionId
            ? "View details of your selected transaction"
            : "View and manage your bookings and reservations"}
        </p>

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-sm text-sm sm:text-base">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm text-sm sm:text-base">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : allTransactions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              No transactions found
            </h2>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              {transactionId
                ? "The selected transaction was not found."
                : "You haven't made any bookings yet"}
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm"
            >
              Browse Activities
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 border-b border-gray-100">
                    <div className="mb-3 md:mb-0">
                      <span className="text-xs text-gray-500 font-medium">
                        Transaction ID:
                      </span>
                      <p className="font-mono text-sm text-gray-900">
                        {transaction.id}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="text-sm">
                        <span className="text-gray-500 mr-2 font-medium">
                          Status:
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <button
                        onClick={() => toggleExpand(transaction.id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                        aria-expanded={expandedTransaction === transaction.id}
                        aria-controls={`transaction-details-${transaction.id}`}
                      >
                        {expandedTransaction === transaction.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            View Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={
                            transaction.transaction_items?.[0]
                              ?.imageUrls?.[0] || "https://picsum.photos/200"
                          }
                          alt={
                            transaction.transaction_items?.[0]?.title ||
                            "Activity"
                          }
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://picsum.photos/200";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transaction.transaction_items?.[0]?.title ||
                            "Booking"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Booked on {formatDate(transaction.createdAt)}
                        </p>
                        <p className="text-sm font-medium text-blue-600 mt-2">
                          {formatCurrency(transaction.totalAmount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {transaction.status?.toLowerCase() === "success" && (
                        <div>
                          <div
                            ref={(el) =>
                              (voucherRefs.current[transaction.id] = el)
                            }
                            style={{ position: "absolute", left: "-9999px" }}
                            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                          >
                            <div className="mb-4">
                              <h5 className="text-xl font-bold text-gray-900 mb-2">
                                Ticket Details
                              </h5>
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-32 h-32 shrink-0">
                                  <img
                                    src={
                                      transaction.transaction_items?.[0]
                                        ?.imageUrls?.[0] ||
                                      "https://picsum.photos/200"
                                    }
                                    alt={
                                      transaction.transaction_items?.[0]
                                        ?.title || "Activity"
                                    }
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://picsum.photos/200";
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h6 className="text-lg font-semibold text-gray-900">
                                    {transaction.transaction_items?.[0]
                                      ?.title || "Activity"}
                                  </h6>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {transaction.transaction_items?.[0]
                                      ?.description || "No description"}
                                  </p>
                                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {formatDateRange({
                                        checkIn: transaction.orderDate,
                                        checkOut: transaction.expiredDate,
                                      })}
                                    </div>
                                    <div className="flex items-center">
                                      <Users className="w-4 h-4 mr-1" />
                                      {transaction.transaction_items?.[0]
                                        ?.quantity || 1}{" "}
                                      ticket(s)
                                    </div>
                                  </div>
                                  <div className="mt-2 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                      {formatCurrency(
                                        transaction.transaction_items?.[0]
                                          ?.price || 0
                                      )}{" "}
                                      x{" "}
                                      {transaction.transaction_items?.[0]
                                        ?.quantity || 1}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(
                                        transaction.totalAmount || 0
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <h6 className="text-lg font-semibold text-gray-900 mb-2">
                                Transaction Information
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">
                                    Transaction ID
                                  </p>
                                  <p className="font-medium">
                                    {transaction.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Date</p>
                                  <p className="font-medium">
                                    {formatDate(transaction.createdAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">
                                    Payment Method
                                  </p>
                                  <p className="font-medium">
                                    {transaction.payment_method?.name ||
                                      "Not specified"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Total Amount</p>
                                  <p className="font-medium">
                                    {formatCurrency(
                                      transaction.totalAmount || 0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Status</p>
                                  <p className="font-medium">
                                    {transaction.status
                                      ? transaction.status
                                          .charAt(0)
                                          .toUpperCase() +
                                        transaction.status.slice(1)
                                      : "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ position: "absolute", left: "-9999px" }}
                          >
                            <Invoice
                              ref={(el) =>
                                (invoiceRefs.current[transaction.id] = el)
                              }
                              transaction={transaction}
                            />
                          </div>
                          <button
                            onClick={() => downloadVoucher(transaction.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Ticket
                          </button>
                          <button
                            onClick={() => downloadInvoice(transaction.id)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </button>
                        </div>
                      )}
                      {(transaction.status?.toLowerCase() === "pending" ||
                        transaction.status?.toLowerCase() === "waiting") && (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() =>
                              setExpandedTransaction(transaction.id)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Payment Proof
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(transaction.id)}
                            disabled={cancellingId === transaction.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Transaction
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedTransaction === transaction.id && (
                    <div
                      id={`transaction-details-${transaction.id}`}
                      className="border-t border-gray-100 p-5 bg-gray-50"
                    >
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Invoice Details
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <Invoice transaction={transaction} />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Booked Items
                        </h4>
                        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                          <div className="flex flex-col md:flex-row gap-5">
                            <div className="w-full md:w-40 h-40 mb-3 md:mb-0 md:mr-5">
                              <img
                                src={
                                  transaction.transaction_items?.[0]
                                    ?.imageUrls?.[0] ||
                                  "https://picsum.photos/200"
                                }
                                alt={
                                  transaction.transaction_items?.[0]?.title ||
                                  "Activity"
                                }
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = "https://picsum.photos/200";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-medium text-gray-900">
                                {transaction.transaction_items?.[0]?.title ||
                                  "Activity"}
                              </h5>
                              <p className="text-sm text-gray-600 mt-2">
                                {transaction.transaction_items?.[0]
                                  ?.description || "No description"}
                              </p>
                              <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDateRange({
                                    checkIn: transaction.orderDate,
                                    checkOut: transaction.expiredDate,
                                  })}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-1" />
                                  {transaction.transaction_items?.[0]
                                    ?.quantity || 1}{" "}
                                  ticket(s)
                                </div>
                              </div>
                              <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  {formatCurrency(
                                    transaction.transaction_items?.[0]?.price ||
                                      0
                                  )}{" "}
                                  x{" "}
                                  {transaction.transaction_items?.[0]
                                    ?.quantity || 1}
                                </span>
                                <span className="font-medium text-gray-900 text-lg">
                                  {formatCurrency(transaction.totalAmount || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {transaction.status?.toLowerCase() === "pending" && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Upload Payment Proof
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-3">
                                Please upload a screenshot or photo of your
                                payment confirmation to complete your booking.
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg p-2"
                              />
                              {selectedFile && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Selected file: {selectedFile.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleUploadProof(transaction.id)}
                              disabled={
                                !selectedFile || uploadingId === transaction.id
                              }
                              className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium flex items-center justify-center transition-all duration-200 shadow-sm ${
                                !selectedFile
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                              }`}
                            >
                              {uploadingId === transaction.id ? (
                                <>
                                  <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  Uploading... {uploadProgress}%
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Proof of Payment
                                </>
                              )}
                            </button>
                            {uploadError && (
                              <div className="mt-3 text-sm text-red-600">
                                {uploadError}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {transaction.proofPaymentUrl && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Payment Proof
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="flex justify-center">
                              <img
                                src={transaction.proofPaymentUrl}
                                alt="Proof of Payment"
                                className="max-h-64 object-contain rounded-lg"
                                onError={(e) => {
                                  e.target.src = "https://picsum.photos/200";
                                  e.target.alt = "Image not available";
                                }}
                              />
                            </div>
                            <p className="text-sm text-center text-gray-600 mt-3">
                              Uploaded on {formatDate(transaction.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!transactionId && totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-all duration-200 ${
                      currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages).keys()].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-all duration-200 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, allTransactions.length)}{" "}
                  of {allTransactions.length} transactions
                </p>
              </div>
            )}
          </>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Confirm Cancel
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Are you sure you want to cancel this transaction? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 sm:px-5 py-2 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 shadow-sm transition-all duration-200 text-sm sm:text-base"
                  disabled={cancellingId === deleteConfirmId}
                >
                  Cancel
                </button>
                <button
                  onClick={() => cancelTransaction(deleteConfirmId)}
                  className="px-4 sm:px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all duration-200 flex items-center text-sm sm:text-base"
                  disabled={cancellingId === deleteConfirmId}
                >
                  {cancellingId === deleteConfirmId ? (
                    <>
                      <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Transaction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
