import React, { forwardRef } from "react";
import { Download } from "lucide-react";

const Invoice = forwardRef(({ transaction }, ref) => {
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
      return "Date unavailable";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans text-gray-800">
      {transaction && (
        <div>
          <h2 className="text-xl font-bold mb-4">Invoice</h2>
          <div ref={ref} className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-medium">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">
                  {transaction.payment_method?.name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">
                  {formatCurrency(transaction.totalAmount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Invoice;
