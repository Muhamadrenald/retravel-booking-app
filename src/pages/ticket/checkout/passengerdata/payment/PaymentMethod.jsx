import React, { useState, useEffect } from "react";
import PaymentCard from "../../../../../components/payment/PaymentCard";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { API_CONFIG } from "../../../../../api/config";

const PaymentMethod = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_METHODS}`,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
            },
          }
        );

        if (response.data && response.data.data) {
          setPaymentMethods(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError("Failed to load payment methods");
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  if (loading) {
    return (
      <div className="w-full text-center py-4">Loading payment methods...</div>
    );
  }

  if (error) {
    return <div className="w-full text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full space-y-3">
      <h6 className="text-sm text-neutral-600 font-medium">
        Select Payment Method
      </h6>

      {paymentMethods.length > 0 ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
          {paymentMethods.map((method) => (
            <PaymentCard
              key={method.id}
              selectedPayment={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
              cardholderName={method.name || "Card User"}
              cardNumber={method.accountNumber || "0000000000000000"}
              cardImage={method.imageUrl || "https://via.placeholder.com/100"}
              value={method.id.toString()}
            />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-4">
          No payment methods available
        </div>
      )}

      <div className="w-full flex justify-end">
        <div className="w-fit flex items-center justify-center gap-x-2 cursor-pointer text-base font-normal text-primary">
          <FaPlus />
          <p className="capitalize">Add new card</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
