import React, { useState, useEffect } from "react";
import { useCartAPI } from "../../hooks/useCartAPI";
import { X, Calendar, Users } from "lucide-react";
import ToastNotification from "../../components/toastnotification/ToastNotification";

const Cart = () => {
  let cartAPI;
  try {
    cartAPI = useCartAPI();
  } catch (error) {
    console.error("useCartAPI error:", error.message);
    return (
      <div className="container mx-auto py-6 px-4 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-red-500">
          Error: This component must be used within a CartProvider.
        </p>
      </div>
    );
  }

  const {
    cartItems,
    removeFromCart,
    isLoading,
    increaseItem,
    decreaseItem,
    fetchCartItems,
  } = cartAPI;

  const [toast, setToast] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCartItems();
      } catch (error) {
        console.error("Failed to load cart:", error);
        setToast({
          message: "Failed to load cart. Please try again.",
          type: "error",
        });
      }
    };
    loadCart();
  }, [fetchCartItems]);

  const formatDateRange = (bookingDate, activityId) => {
    if (bookingDate && bookingDate.start && bookingDate.end) {
      try {
        const options = { day: "numeric", month: "long", year: "numeric" };
        const start = new Date(bookingDate.start).toLocaleDateString(
          "id-ID",
          options
        );
        const end = new Date(bookingDate.end).toLocaleDateString(
          "id-ID",
          options
        );
        return `${start} - ${end}`;
      } catch (error) {
        console.error("Error formatting bookingDate:", error);
      }
    }

    const storedBookingDate = localStorage.getItem(`bookingDate_${activityId}`);
    if (storedBookingDate) {
      try {
        const parsed = JSON.parse(storedBookingDate);
        if (parsed.start && parsed.end) {
          const options = { day: "numeric", month: "long", year: "numeric" };
          const start = new Date(parsed.start).toLocaleDateString(
            "id-ID",
            options
          );
          const end = new Date(parsed.end).toLocaleDateString("id-ID", options);
          return `${start} - ${end}`;
        }
      } catch (error) {
        console.error("Error parsing stored bookingDate:", error);
      }
    }

    return "Dates not available";
  };

  const mergedCartItems = cartItems.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.activityId === item.activityId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.bookingDate = item.bookingDate || existingItem.bookingDate;
      existingItem.cartIds = [...(existingItem.cartIds || []), item.id];
    } else {
      acc.push({
        ...item,
        cartIds: [item.id],
      });
    }
    return acc;
  }, []);

  const sortedCartItems = [...mergedCartItems].sort((a, b) => {
    if (a.activityId && b.activityId) {
      return a.activityId.localeCompare(b.activityId);
    }
    return 0;
  });

  const formatCurrency = (amount) => {
    return `Rp ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const getSelectedItemsTotal = () => {
    return selectedItems.reduce((total, activityId) => {
      const item = mergedCartItems.find((i) => i.activityId === activityId);
      return item
        ? total +
            (item.activity.price_discount || item.activity.price) *
              item.quantity
        : total;
    }, 0);
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Spectacular";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.0) return "Good";
    if (rating >= 2.0) return "Average";
    return "Poor";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveItem = async (cartIds) => {
    try {
      const removePromises = cartIds.map((cartId) => removeFromCart(cartId));
      const results = await Promise.all(removePromises);
      const allSuccessful = results.every(
        (result) => String(result?.code) === "200"
      );
      if (allSuccessful) {
        setSelectedItems((prev) => prev.filter((id) => !cartIds.includes(id)));
        showToast("Item successfully removed from cart");
      } else {
        throw new Error("Failed to remove some items");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast(
        error.message === "Item already removed from server cart"
          ? "Item already removed"
          : `Failed to remove item: ${error.message}`,
        "error"
      );
    }
  };

  const handleQuantityChange = async (cartId, action) => {
    try {
      if (action === "increase") {
        await increaseItem(cartId);
        showToast("Quantity increased successfully");
      } else {
        await decreaseItem(cartId);
        showToast("Quantity decreased successfully");
      }
      await fetchCartItems();
    } catch (error) {
      console.error(`Failed to update quantity:`, error);
      showToast(
        error.message === "Cart item not found"
          ? "Item not found. Please refresh cart."
          : `Failed to update quantity: ${error.message}`,
        "error"
      );
    }
  };

  const handleRefreshCart = async () => {
    try {
      await fetchCartItems();
      showToast("Cart refreshed successfully", "success");
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      showToast("Failed to refresh cart", "error");
    }
  };

  const handleCheckboxChange = (activityId) => {
    setSelectedItems((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      const checkoutItems = mergedCartItems
        .filter((item) => selectedItems.includes(item.activityId))
        .map((item) => ({
          activityId: item.activityId,
          title: item.title || item.activity.title || "Unnamed Item",
          imageUrl:
            getImageUrl(item.imageUrls || item.activity.imageUrls) ||
            "https://picsum.photos/200",
          address:
            item.address || item.activity.address || "Address not available",
          rating: item.rating || item.activity.rating || 0,
          totalReviews: item.total_reviews || item.activity.total_reviews || 0,
          price:
            item.price || item.activity.price_discount || item.activity.price,
          quantity: item.quantity,
          bookingDate: item.bookingDate,
        }));
      console.log("Checkout items:", checkoutItems);
      localStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
      window.location.href = "/checkout";
    } else {
      showToast("Please select at least one item for checkout", "error");
    }
  };

  const getImageUrl = (imageUrls) => {
    return imageUrls?.[0] || "https://picsum.photos/200";
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Cart Container */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Your Cart ({mergedCartItems.length})
            </h1>
            <button
              onClick={handleRefreshCart}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Refresh Cart
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading cart...</p>
            </div>
          ) : mergedCartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Your Cart is Empty
              </h2>
              <p className="text-gray-500 mb-6">
                Please add items to your cart
              </p>
              <a
                href="/activities"
                className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCartItems.map((item) => {
                const ratingValue = Math.min(
                  Math.max(item.activity.rating || item.rating || 0, 0),
                  5
                );
                console.log(
                  `Rating for ${item.title || item.activity.title}:`,
                  ratingValue
                );

                return (
                  <div
                    key={item.activityId}
                    className="border rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-primary text-primary p-2 rounded-md mr-2">
                          <svg
                            width="20"
                            height="20"
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
                        </div>
                        <span className="font-medium">Item</span>
                        <button
                          className="ml-auto text-gray-500 hover:text-gray-700"
                          onClick={() => handleRemoveItem(item.cartIds)}
                          disabled={isLoading}
                        >
                          <div className="flex items-center">
                            <X size={18} className="mr-1" />
                            <span>Remove</span>
                          </div>
                        </button>
                      </div>

                      <div className="flex mt-2">
                        <div className="w-24 h-24 mr-4">
                          <img
                            src={getImageUrl(
                              item.imageUrls || item.activity.imageUrls
                            )}
                            alt={item.title || item.activity.title || "Item"}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = "https://picsum.photos/200";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold">
                            {item.title ||
                              item.activity.title ||
                              "Unnamed Item"}
                          </h2>
                          <div className="flex items-center text-gray-500 mt-1">
                            <svg
                              width="16"
                              height="16"
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
                              {item.address ||
                                item.activity.address ||
                                "Location not available"}
                            </span>
                          </div>

                          <div className="flex items-center mt-1">
                            {item.rating != null ||
                            item.activity.rating != null ? (
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill={
                                      star <= ratingValue
                                        ? "currentColor"
                                        : "none"
                                    }
                                    stroke="currentColor"
                                    className="text-yellow-400 mr-1"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.16 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                No rating available
                              </span>
                            )}
                            {(item.rating != null ||
                              item.activity.rating != null) && (
                              <>
                                <span className="text-primary ml-2">
                                  {ratingValue.toFixed(1)}{" "}
                                  {getRatingLabel(ratingValue)}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (
                                  {item.total_reviews ||
                                    item.activity.total_reviews ||
                                    0}{" "}
                                  reviews)
                                </span>
                              </>
                            )}
                          </div>

                          {item.activity.price_discount &&
                            item.activity.price_discount <
                              item.activity.price && (
                              <div className="mt-1">
                                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-md">
                                  {Math.round(
                                    (1 -
                                      item.activity.price_discount /
                                        item.activity.price) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </div>
                            )}

                          <div className="mt-2">
                            <div className="flex items-center">
                              {item.activity.price_discount &&
                                item.activity.price_discount <
                                  item.activity.price && (
                                  <span className="text-gray-500 line-through mr-2">
                                    {formatCurrency(item.activity.price)}
                                  </span>
                                )}
                              <span className="text-lg font-semibold">
                                {formatCurrency(
                                  item.price ||
                                    item.activity.price_discount ||
                                    item.activity.price
                                )}
                              </span>
                              <div className="flex items-center ml-3">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.cartIds[0],
                                      "decrease"
                                    )
                                  }
                                  disabled={isLoading || item.quantity <= 1}
                                  className="px-2 py-1 bg-gray-100 rounded-l-md hover:bg-gray-200 disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 bg-gray-50">
                                  {item.quantity} items
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.cartIds[0],
                                      "increase"
                                    )
                                  }
                                  disabled={isLoading}
                                  className="px-2 py-1 bg-gray-100 rounded-r-md hover:bg-gray-200 disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t p-4">
                      <div className="flex items-center flex-wrap">
                        <div className="flex items-center text-gray-500 mr-6 mb-2 sm:mb-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.activityId)}
                            onChange={() =>
                              handleCheckboxChange(item.activityId)
                            }
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Calendar size={16} className="mr-1" />
                          <span className="ml-1">
                            {formatDateRange(item.bookingDate, item.activityId)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 mb-2 sm:mb-0">
                          <Users size={16} className="mr-1" />
                          <span className="ml-1">{item.quantity} items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 sticky top-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            {selectedItems.length === 0 ? (
              <p className="text-gray-500">No items selected</p>
            ) : (
              <>
                <div className="space-y-2 border-b pb-3">
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span>{formatCurrency(getSelectedItemsTotal())}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    Price includes taxes & service fees
                  </p>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(getSelectedItemsTotal())}
                  </span>
                </div>
              </>
            )}
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                selectedItems.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Proceed to Payment"
              )}
            </button>

            <div className="text-sm text-gray-500">
              <p>
                By proceeding, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
