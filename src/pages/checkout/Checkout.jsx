import { useState, useEffect } from "react";
import { ChevronDown, Calendar, Users, CreditCard } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../../api/config";

export default function Checkout() {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+62");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [promos, setPromos] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [promoSuccess, setPromoSuccess] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  // Handle phone number input with validation
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    // Check if input contains only digits
    if (value === "" || /^\d*$/.test(value)) {
      setPhoneNumber(value);
      setPhoneNumberError("");
    } else {
      // Show error without changing the value
      setPhoneNumberError("Phone number must contain numbers only");
    }
  };

  // Validate contact information (promo code is optional)
  const isContactInfoValid = () => {
    const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
    const phoneRegex = /^\d{8,}$/; // Minimum 8 digits

    return (
      fullName &&
      nameRegex.test(fullName) &&
      email &&
      emailRegex.test(email) &&
      phoneNumber &&
      phoneRegex.test(phoneNumber) &&
      !phoneNumberError // No validation errors
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Please log in to continue.");
        }

        // Call GENERATE_PAYMENT_METHODS to ensure payment methods are generated
        await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_PAYMENT_METHODS}`,
          {},
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch payment methods
        const paymentResponse = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_METHODS}`,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPaymentMethods(paymentResponse.data.data || []);

        // Fetch promos
        const promoResponse = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOS}`,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPromos(promoResponse.data.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadCheckoutItems = () => {
      try {
        const items = localStorage.getItem("checkoutItems");
        if (items) {
          const parsedItems = JSON.parse(items);
          setCheckoutItems(parsedItems);
          console.log("Loaded checkout items:", parsedItems);
        } else {
          console.warn("No checkoutItems found in localStorage");
        }
      } catch (error) {
        console.error("Error parsing checkout items:", error);
        setCheckoutItems([]);
      }
    };

    fetchData();
    loadCheckoutItems();

    // Remove checkoutItems when user leaves the page
    const handleUnload = () => {
      localStorage.removeItem("checkoutItems");
      setCheckoutItems([]);
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const formatDateRange = (bookingDate) => {
    if (bookingDate && bookingDate.start && bookingDate.end) {
      try {
        const options = { day: "numeric", month: "long", year: "numeric" };
        const start = new Date(bookingDate.start).toLocaleDateString(
          "en-US",
          options
        );
        const end = new Date(bookingDate.end).toLocaleDateString(
          "en-US",
          options
        );
        return `${start} - ${end}`;
      } catch (error) {
        console.error("Error formatting bookingDate:", error);
      }
    }
    return "Date unavailable";
  };

  const formatCurrency = (amount) => {
    return `IDR ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const getTotalPrice = () => {
    let total = checkoutItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    if (appliedPromo) {
      if (appliedPromo.promo_discount_price) {
        total -= appliedPromo.promo_discount_price;
      } else if (appliedPromo.discount) {
        const discount = (total * appliedPromo.discount) / 100;
        total -= discount;
      }
    }
    return Math.max(total, 0);
  };

  const applyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);

    if (!promoCode) {
      setPromoError("Please enter a promo code");
      return;
    }

    if (promoCode.toUpperCase() === "BELI2") {
      const beli2Promo = {
        id: "c3b80f23-2fe5-4b34-a4bd-8b56848daf6e",
        title: "Staycation Brings Silaturahmi 🙏",
        description:
          "Friendly reminder, family staycation shall be forever memorable ✨",
        promo_code: "BELI2",
        promo_discount_price: 100000,
        minimum_claim_price: 500000,
      };

      const totalBeforeDiscount = checkoutItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      if (totalBeforeDiscount >= beli2Promo.minimum_claim_price) {
        setAppliedPromo(beli2Promo);
        setPromoSuccess(
          `Promo code "BELI2" applied successfully! (IDR ${beli2Promo.promo_discount_price.toLocaleString(
            "id-ID"
          )} discount)`
        );
        setPromoCode("");
        return;
      } else {
        setPromoError(
          `Minimum transaction of IDR ${beli2Promo.minimum_claim_price.toLocaleString(
            "id-ID"
          )} required`
        );
        return;
      }
    }

    const promo = promos.find(
      (p) =>
        p.code?.toLowerCase() === promoCode.toLowerCase() ||
        p.promo_code?.toLowerCase() === promoCode.toLowerCase()
    );

    if (promo) {
      const totalBeforeDiscount = checkoutItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      if (
        promo.minimum_claim_price &&
        totalBeforeDiscount < promo.minimum_claim_price
      ) {
        setPromoError(
          `Minimum transaction of IDR ${promo.minimum_claim_price.toLocaleString(
            "id-ID"
          )} required`
        );
        return;
      }

      setAppliedPromo(promo);

      let successMessage = `Promo code "${promoCode}" applied successfully!`;
      if (promo.promo_discount_price) {
        successMessage += ` (IDR ${promo.promo_discount_price.toLocaleString(
          "id-ID"
        )} discount)`;
      } else if (promo.discount) {
        successMessage += ` (${promo.discount}% off)`;
      }

      setPromoSuccess(successMessage);
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to continue.");

      if (!item.activityId || !item.quantity)
        throw new Error("Invalid item data: activityId or quantity missing.");

      const cartData = { activityId: item.activityId, quantity: item.quantity };

      console.log("Sending cart data:", cartData);
      const addResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_TO_CART}`,
        cartData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (addResponse.data.code !== "200" || addResponse.data.status !== "OK") {
        throw new Error(
          addResponse.data.message || "Failed to add item to cart."
        );
      }

      const cartResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARTS}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        cartResponse.data.code === "200" &&
        cartResponse.data.status === "OK"
      ) {
        const cartItems = cartResponse.data.data || [];
        const cartItem = cartItems.find(
          (cart) => cart.activityId === item.activityId
        );
        if (!cartItem || !cartItem.id)
          throw new Error("Cart ID not found for the added item.");
        return cartItem.id;
      } else {
        throw new Error(
          cartResponse.data.message || "Failed to fetch cart items."
        );
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  const handlePaymentSubmission = async () => {
    setIsProcessing(true);

    try {
      if (!fullName) {
        alert("Please enter your full name.");
        setIsProcessing(false);
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        setIsProcessing(false);
        return;
      }
      if (!phoneNumber) {
        alert("Please enter a phone number.");
        setIsProcessing(false);
        return;
      }
      if (phoneNumberError) {
        alert(phoneNumberError);
        setIsProcessing(false);
        return;
      }
      if (!/^\d{8,}$/.test(phoneNumber)) {
        alert("Please enter a valid phone number (minimum 8 digits).");
        setIsProcessing(false);
        return;
      }
      if (!selectedPaymentMethod) {
        alert("Please select a payment method.");
        setIsProcessing(false);
        return;
      }
      if (checkoutItems.length === 0 || !checkoutItems[0]) {
        alert("No items in checkout.");
        setIsProcessing(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        setIsProcessing(false);
        return;
      }

      let cartIds = checkoutItems
        .map((item) => item.cartId || null)
        .filter((id) => id);
      if (cartIds.length === 0) {
        const cartIdPromises = checkoutItems.map((item) => addToCart(item));
        cartIds = await Promise.all(cartIdPromises);
        const updatedItems = checkoutItems.map((item, index) => ({
          ...item,
          cartId: cartIds[index],
        }));
        setCheckoutItems(updatedItems);
      }

      const totalAmount = getTotalPrice();
      const transactionData = {
        cartIds,
        paymentMethodId: selectedPaymentMethod,
        total_amount: totalAmount,
      };

      console.log("Sending transaction data:", transactionData);
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_TRANSACTION}`,
        transactionData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Create transaction response:", response.data);

      if (
        response.data &&
        response.data.code === "200" &&
        response.data.status === "OK"
      ) {
        localStorage.removeItem("checkoutItems");
        setCheckoutItems([]);

        setTimeout(() => {
          alert(
            "Transaction created successfully. You will be redirected to the transactions page."
          );
          window.location.href = "/transactions";
        }, 1000);
      } else {
        throw new Error(
          response.data.message || "Failed to create transaction."
        );
      }
    } catch (err) {
      console.error("Error creating transaction:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = "Failed to process payment.";
      if (err.message.includes("cart")) {
        errorMessage =
          "Invalid cart data. Please add items to your cart again.";
      } else if (err.response) {
        if (err.response.status === 400) {
          errorMessage =
            err.response.data.message || "Invalid transaction data.";
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (err.response.status === 404) {
          errorMessage = "Transaction endpoint not found.";
        } else {
          errorMessage = err.response.data.message || "Unknown error occurred.";
        }
      }
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 font-sans text-gray-800">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Complete Your Booking
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Please review and confirm all details before proceeding to payment.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-bold mb-2">
              Contact Details (for E-Voucher)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Ensure all fields are completed accurately to receive your booking
              confirmation voucher via email.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name (as per Passport/ID)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Maeda"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use only letters (A-Z), no titles, special characters, or
                punctuation.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., email@example.com"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <div className="flex">
                <div className="relative w-16">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="appearance-none w-full border border-gray-300 rounded-l-md p-2 pr-8 bg-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="+62">+62</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 pointer-events-none text-gray-500" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="12345678"
                  className={`flex-grow border border-gray-300 rounded-r-md p-2 text-sm border-l-0 focus:ring-2 focus:ring-blue-500 ${
                    phoneNumberError ? "border-red-500" : ""
                  }`}
                />
              </div>
              {phoneNumberError ? (
                <p className="text-xs text-red-500 mt-1">{phoneNumberError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Example: +6212345678, for Country Code (+62) and Mobile No.
                  12345678. Numbers only.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Promo Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError(null);
                    setPromoSuccess(null);
                  }}
                  placeholder="e.g., BELI2"
                  className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 bg-primary border border-primary hover:bg-transparent hover:text-primary text-white rounded-md text-sm cursor-pointer transition-colors focus:ring-2 focus:ring-blue-300"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-500 mt-1">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-xs text-green-500 mt-1">{promoSuccess}</p>
              )}
            </div>

            {!isContactInfoValid() && (
              <div className="mt-4 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 mx-auto"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 12h10" />
                  <path d="M7 8h4" />
                  <path d="M7 16h4" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">
                  Please complete all contact details to select a payment
                  method.
                </p>
              </div>
            )}
          </div>

          {isContactInfoValid() && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-bold mb-2">Payment Method</h2>
              <div className="mb-4">
                <h6 className="text-sm font-medium text-gray-600">
                  Select Payment Method
                </h6>
              </div>

              {loading ? (
                <div className="text-center py-3 text-sm">
                  Loading payment methods...
                </div>
              ) : error ? (
                <div className="text-center py-3 text-sm text-red-500">
                  {error}
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {paymentMethods.map((method) => (
                    <div className="relative" key={method.id}>
                      <input
                        type="radio"
                        id={`payment-${method.id}`}
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="absolute opacity-0 peer"
                      />
                      <label
                        htmlFor={`payment-${method.id}`}
                        className={`flex items-center border rounded-md p-3 cursor-pointer transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 ${
                          selectedPaymentMethod === method.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="w-12 h-8 mr-3 flex-shrink-0">
                          <img
                            src={method.imageUrl || "https://picsum.photos/200"}
                            alt={method.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = "https://picsum.photos/200";
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <span className="text-sm font-medium">
                            {method.name}
                          </span>
                          <p className="text-xs text-gray-500">Card details</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-sm">
                  No payment methods available
                </div>
              )}
            </div>
          )}

          <div className="mt-8 mb-12">
            <button
              onClick={handlePaymentSubmission}
              disabled={
                !selectedPaymentMethod ||
                isProcessing ||
                checkoutItems.length === 0
              }
              className={`w-full py-4 rounded-lg font-medium flex items-center justify-center cursor-pointer ${
                !selectedPaymentMethod || checkoutItems.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white border border-primary hover:bg-transparent hover:text-primary"
              } transition-colors focus:ring-2 focus:ring-blue-300`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Continue to Payment
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              By clicking "Continue to Payment", you agree to our Terms and
              Conditions
            </p>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 sticky top-4">
            <h2 className="text-xl font-semibold">Booking Details</h2>
            {checkoutItems.length === 0 ? (
              <p className="text-gray-500">No items selected for checkout.</p>
            ) : (
              <div className="space-y-4">
                {checkoutItems.map((item) => (
                  <div
                    key={item.cartId || item.activityId}
                    className="border-b pb-4"
                  >
                    <div className="flex mb-2">
                      <div className="w-20 h-20 mr-3">
                        <img
                          src={item.imageUrl || "https://picsum.photos/200"}
                          alt={item.title || "Item"}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = "https://picsum.photos/200";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold">
                          {item.title || item.name || "Unnamed Item"}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs mt-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="ml-1">
                            {item.address || "No address"}
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-400 text-sm mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill={
                                i < (item.rating || 0) ? "currentColor" : "none"
                              }
                              stroke="currentColor"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.16 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                          <span className="text-primary ml-2 text-xs">
                            {(item.rating || 0).toFixed(1)} (
                            {item.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {item.bookingDate && (
                        <div className="flex items-center text-gray-500 text-xs">
                          <Calendar size="14" className="mr-1" />
                          <span>{formatDateRange(item.bookingDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 text-xs">
                        <Users size="14" className="mr-1" />
                        <span>{item.quantity || 1} ticket(s)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price ({item.quantity || 1} ticket(s)):</span>
                        <span>
                          {formatCurrency(
                            (item.price || 0) * (item.quantity || 1)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Promo Discount (
                      {appliedPromo.promo_code || appliedPromo.code}):
                    </span>
                    <span>
                      -
                      {appliedPromo.promo_discount_price
                        ? formatCurrency(appliedPromo.promo_discount_price)
                        : formatCurrency(
                            (checkoutItems.reduce(
                              (sum, item) =>
                                sum + (item.price || 0) * (item.quantity || 1),
                              0
                            ) *
                              (appliedPromo.discount || 0)) /
                              100
                          )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-4 border-t">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <p className="text-xs text-gray-600 italic">
                  Price includes taxes & service fees
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
