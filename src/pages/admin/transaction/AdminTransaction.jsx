import { useState, useEffect } from "react";
import { Search, ChevronDown, Eye, CheckCircle, Clock, X } from "lucide-react";
import { API_CONFIG } from "../../../api/config";
import Alert from "../../../components/alert/Alert";
import Table from "../../../components/table/Table";
import Pagination from "../../../components/pagination/Pagination";
import Modal from "../../../components/modal/Modal";
import Spinner from "../../../components/spinner/Spinner";

// Status badge component
const StatusBadge = ({ status }) => {
  const badgeStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    success: "bg-teal-100 text-teal-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const badgeIcons = {
    pending: <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />,
    success: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />,
    cancelled: <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
        badgeStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {badgeIcons[status] || (
        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main component
export default function AdminTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isStatusUpdateModal, setIsStatusUpdateModal] = useState(false);

  // Pagination settings
  const itemsPerPage = 10;

  // Fetch transactions and map userId to customer name
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Step 1: Fetch all transactions
        const transactionResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_TRANSACTIONS}`,
          {
            headers: {
              "Content-Type": "application/json",
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!transactionResponse.ok) {
          throw new Error(`HTTP error! Status: ${transactionResponse.status}`);
        }

        const transactionData = await transactionResponse.json();
        let transactionList = [];
        if (
          transactionData.code === "200" &&
          Array.isArray(transactionData.data)
        ) {
          transactionList = transactionData.data;
        } else if (Array.isArray(transactionData)) {
          transactionList = transactionData;
        } else {
          throw new Error("Invalid transaction API response format");
        }

        // Step 2: Fetch all users to map userId to name
        const userResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_USERS}`,
          {
            headers: {
              "Content-Type": "application/json",
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(
            `Failed to fetch users! Status: ${userResponse.status}`
          );
        }

        const userData = await userResponse.json();
        let userList = [];
        if (userData.code === "200" && Array.isArray(userData.data)) {
          userList = userData.data;
        } else if (Array.isArray(userData)) {
          userList = userData;
        } else {
          throw new Error("Invalid user API response format");
        }

        // Step 3: Create a map of userId to name
        const userMap = {};
        userList.forEach((user) => {
          userMap[user.id] = user.name || user.username || "Unknown User";
        });

        // Step 4: Map transactions with customer names
        const mappedTransactions = transactionList.map((t) => {
          const id = t.id || t.transactionId || `TRX-${Date.now()}`;
          const customer = userMap[t.userId] || "Unknown User";
          const amount = t.totalAmount || t.amount || 0;
          const date = t.orderDate || t.createdAt || t.date;
          const status = t.status || "pending";
          const paymentProof = t.proofPaymentUrl || t.paymentProof || null;

          let formattedDate = "N/A";
          try {
            formattedDate = new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } catch (e) {
            console.warn(`Invalid date format for transaction ${id}: ${date}`);
          }

          return {
            id,
            customer,
            amount,
            date: formattedDate,
            status,
            paymentProof,
          };
        });

        setTransactions(mappedTransactions);
      } catch (err) {
        console.error("Failed to fetch transactions or users:", err);
        setError(
          err.message ||
            "Failed to fetch transactions or users. Check token permissions or API configuration."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle view proof
  const handleViewProof = (transaction) => {
    setSelectedTransaction(transaction);
    setIsProofModalOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = (transaction) => {
    if (transaction.status !== "pending") {
      setError("Only 'pending' transactions can be updated");
      return;
    }
    if (!transaction.paymentProof) {
      setError("Payment proof has not been uploaded");
      return;
    }
    setSelectedTransaction(transaction);
    setIsStatusUpdateModal(true);
  };

  // Save status update
  const saveStatusUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_TRANSACTION_STATUS(
          selectedTransaction.id
        )}`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "success" }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data.code === "200" && data.status === "OK") {
        setTransactions(
          transactions.map((t) =>
            t.id === selectedTransaction.id ? { ...t, status: "success" } : t
          )
        );
        setIsStatusUpdateModal(false);
        setError(null);
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(
        err.message ||
          "Failed to update status. Ensure transaction is 'pending', proof is uploaded, and token has permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      transaction.id.toLowerCase().includes(searchLower) ||
      transaction.customer.toLowerCase().includes(searchLower);
    const matchesFilter =
      filter === "all" ||
      transaction.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Table columns
  const columns = [
    { key: "index", label: "#", className: "px-4 py-3 sm:px-6 w-16" },
    {
      key: "id",
      label: "Transaction ID",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "customer",
      label: "Customer",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "amount",
      label: "Amount",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "date",
      label: "Date",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "status",
      label: "Status",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "paymentProof",
      label: "Payment Proof",
      className: "px-4 py-3 sm:px-6",
    },
    {
      key: "actions",
      label: "Actions",
      className: "px-4 py-3 sm:px-6",
    },
  ];

  // Render table row
  const renderRow = (transaction, index) => (
    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
        {transaction.id}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm text-gray-600">
        {transaction.customer}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm text-gray-600">
        {formatCurrency(transaction.amount)}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm text-gray-600">
        {transaction.date}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
        <StatusBadge status={transaction.status} />
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm">
        {transaction.paymentProof ? (
          <button
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            onClick={() => handleViewProof(transaction)}
            disabled={loading}
            aria-label={`View payment proof for transaction ${transaction.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Proof
          </button>
        ) : (
          <span className="text-gray-400 text-sm">Not Uploaded</span>
        )}
      </td>
      <td className="px-4 py-3 sm:px-6 whitespace-nowrap text-sm">
        {transaction.status === "pending" && transaction.paymentProof && (
          <button
            className="text-indigo-600 hover:text-indigo-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            onClick={() => handleStatusUpdate(transaction)}
            disabled={loading}
            aria-label={`Verify and approve transaction ${transaction.id}`}
          >
            Verify & Approve
          </button>
        )}
      </td>
    </tr>
  );

  // Render card for mobile
  const renderCard = (transaction, index) => (
    <div key={transaction.id} className="p-4 border-b border-gray-200">
      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-500">#</span>
          <p className="text-sm font-medium text-gray-900">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">ID:</span>
          <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Customer:</span>
          <p className="text-sm text-gray-600">{transaction.customer}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Amount:</span>
          <p className="text-sm text-gray-600">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Date:</span>
          <p className="text-sm text-gray-600">{transaction.date}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Status:</span>
          <div className="mt-1">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">
            Payment Proof:
          </span>
          <div className="mt-1">
            {transaction.paymentProof ? (
              <button
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                onClick={() => handleViewProof(transaction)}
                disabled={loading}
                aria-label={`View payment proof for transaction ${transaction.id}`}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Proof
              </button>
            ) : (
              <span className="text-gray-400 text-sm">Not Uploaded</span>
            )}
          </div>
        </div>
        {transaction.status === "pending" && transaction.paymentProof && (
          <div>
            <span className="text-xs font-medium text-gray-500">Actions:</span>
            <div className="mt-1">
              <button
                className="text-indigo-600 hover:text-indigo-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                onClick={() => handleStatusUpdate(transaction)}
                disabled={loading}
                aria-label={`Verify and approve transaction ${transaction.id}`}
              >
                Verify & Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Transaction Management
          </h1>
        </header>
        <Alert type="error" message={error} onClose={() => setError(null)} />
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="w-full sm:w-44">
              <label
                htmlFor="status-filter"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <div className="relative">
                <select
                  id="status-filter"
                  className="block w-full px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  disabled={loading}
                  aria-label="Filter by transaction status"
                >
                  <option value="all">All Transactions</option>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2 sm:top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="w-full sm:w-56">
              <label
                htmlFor="search"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 sm:top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by Customer..."
                  className="block w-full pl-8 pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                  aria-label="Search transactions"
                />
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={currentTransactions}
              renderRow={renderRow}
              renderCard={renderCard}
              emptyMessage="No transactions found. Adjust filters or check API data."
              searchTerm={search || filter !== "all"}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
        <Modal
          isOpen={isProofModalOpen}
          title="Payment Proof"
          onClose={() => setIsProofModalOpen(false)}
          isLoading={loading}
          submitText="Close"
          onSubmit={() => setIsProofModalOpen(false)}
        >
          {selectedTransaction?.paymentProof ? (
            <img
              src={selectedTransaction.paymentProof}
              alt="Payment Proof"
              className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain rounded-md"
              onError={(e) => {
                e.target.src = "https://picsum.photos/200";
              }}
            />
          ) : (
            <p className="text-gray-500 text-center text-sm">
              No proof available
            </p>
          )}
        </Modal>
        <Modal
          isOpen={isStatusUpdateModal}
          title="Verify Payment"
          onClose={() => setIsStatusUpdateModal(false)}
          onSubmit={saveStatusUpdate}
          isLoading={loading}
          submitText="Approve"
          cancelText="Cancel"
        >
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Are you sure you want to approve transaction{" "}
            <span className="font-medium">{selectedTransaction?.id}</span>?
            Status will be changed to "Success".
          </p>
          {selectedTransaction?.paymentProof && (
            <img
              src={selectedTransaction.paymentProof}
              alt="Payment Proof"
              className="w-full h-auto max-h-[30vh] sm:max-h-[40vh] object-contain rounded-md mb-3 sm:mb-4"
              onError={(e) => {
                e.target.src = "https://picsum.photos/200";
              }}
            />
          )}
          {error && (
            <div className="mb-3 sm:mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
              {error}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
