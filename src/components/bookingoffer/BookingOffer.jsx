import { useState } from "react";
import {
  ChevronLeft,
  X,
  ShoppingCart,
  Check,
  Eye,
  Calendar,
} from "lucide-react";
import { useCartAPI } from "../../hooks/useCartAPI";
import ToastNotification from "../../components/toastnotification/ToastNotification";
import { UI_TEXT, CASHBACK_PERCENTAGE } from "../../constants/bookingConstants";
import { ROOM_DETAILS } from "../../constants/roomDetails";
import { toast } from "react-toastify";

function BookingOffer({ activity, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [endDate, setEndDate] = useState(getDateAfterTomorrow());

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  function getDateAfterTomorrow() {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split("T")[0];
  }

  function formatDateIndonesian(dateString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  function calculateDuration() {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    const startDateObj = new Date(newStartDate);
    const nextDay = new Date(startDateObj);
    nextDay.setDate(startDateObj.getDate() + 1);
    const nextDayString = nextDay.toISOString().split("T")[0];
    if (new Date(endDate) <= new Date(newStartDate)) {
      setEndDate(nextDayString);
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  let cartAPI;
  try {
    cartAPI = useCartAPI();
  } catch (error) {
    console.error("useCartAPI error:", error.message);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">
            This component must be used within a CartProvider. Please contact
            the administrator.
          </p>
          <button
            type="button"
            tabIndex={-1}
            onClick={onClose}
            className="mt-4 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { addToCart, isLoading: cartIsLoading, fetchCartItems } = cartAPI;

  const originalPrice = activity?.price || 0;
  const discountedPrice =
    activity?.price_discount && activity.price_discount < originalPrice
      ? activity.price_discount
      : originalPrice;

  const discountPercentage =
    originalPrice && discountedPrice < originalPrice
      ? Math.round((1 - discountedPrice / originalPrice) * 100)
      : 0;

  const cashbackAmount = Math.round(discountedPrice * CASHBACK_PERCENTAGE);

  const formatCurrency = (amount) => {
    return `IDR ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const getImageUrl = (img) => {
    return img && img.trim() !== "" ? img : "https://picsum.photos/800/400";
  };

  const duration = calculateDuration();
  const getTotalPrice = () => discountedPrice * quantity * duration;
  const getFinalPrice = () => getTotalPrice();
  const pricePerUnit = discountedPrice;

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const prepareCartPayload = (qty = 1) => {
    if (!activity?.id) {
      throw new Error("Invalid activity ID");
    }
    if (!startDate || !endDate) {
      throw new Error("Invalid start or end date");
    }
    const payload = {
      activityId: activity.id,
      quantity: qty,
      bookingDate: {
        start: startDate,
        end: endDate,
      },
      price: discountedPrice,
      title: activity.name || activity.title || "Unnamed Item",
      imageUrl: activity.images?.[0] || "https://picsum.photos/200",
      address: activity.address || "",
      rating: activity.rating || 0,
      totalReviews: activity.total_reviews || 0,
    };
    console.log(
      `BookingOffer prepareCartPayload for activityId: ${activity.id}, quantity: ${qty}, dates: ${startDate} - ${endDate}`,
      JSON.stringify(payload, null, 2)
    );
    return payload;
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      if (!activity?.id) {
        throw new Error("Invalid activity data");
      }
      console.log(
        `BookingOffer handleAddToCart for activityId: ${activity.id}, quantity: ${quantity}`
      );

      const addPromises = [];
      for (let i = 0; i < quantity; i++) {
        const payload = prepareCartPayload(1);
        const result = await addToCart(payload);
        addPromises.push(result);
      }
      const results = await Promise.all(addPromises);
      console.log(
        `BookingOffer addToCart results for activityId: ${activity.id}`,
        JSON.stringify(results, null, 2)
      );

      const failedRequests = results.filter(
        (result) => String(result?.code) !== "200"
      );
      if (failedRequests.length > 0) {
        console.error("Some addToCart requests failed:", failedRequests);
        throw new Error(
          `Failed to add ${failedRequests.length} item(s) to cart`
        );
      }

      localStorage.setItem(
        `bookingDate_${activity.id}`,
        JSON.stringify({
          start: startDate,
          end: endDate,
        })
      );

      await fetchCartItems(); // Perbarui cartItems setelah penambahan
      showToast(`Successfully added ${quantity} item(s) to cart`, "success");
      setTimeout(() => {
        window.location.href = "/carts";
      }, 1000);
    } catch (error) {
      console.error(`Error adding to cart for activityId: ${activity?.id}`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        const errorMessage =
          error.message === "Success"
            ? "An error occurred while adding to cart"
            : error.message || "An error occurred while adding to cart";
        showToast(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (!activity?.id) {
        throw new Error("Invalid activity data");
      }
      console.log(
        `BookingOffer handleBookNow for activityId: ${activity.id}, quantity: ${quantity}`
      );

      const addPromises = [];
      for (let i = 0; i < quantity; i++) {
        const payload = prepareCartPayload(1);
        const result = await addToCart(payload);
        addPromises.push(result);
      }
      const results = await Promise.all(addPromises);
      console.log(
        `BookingOffer bookNow results for activityId: ${activity.id}`,
        JSON.stringify(results, null, 2)
      );

      const failedRequests = results.filter(
        (result) => String(result?.code) !== "200"
      );
      if (failedRequests.length > 0) {
        console.error("Some bookNow requests failed:", failedRequests);
        throw new Error(`Failed to process ${failedRequests.length} item(s)`);
      }

      // Ambil cartItems terbaru dari backend
      const cartItems = await fetchCartItems();
      const newCheckoutItems = cartItems
        .filter((item) => item.activityId === activity.id)
        .map((item) => ({
          ...item,
          ...activity, // Gabungkan properti dari activity
          title: activity.name || activity.title || "Unnamed Item", // Pastikan title diatur
          bookingDate: {
            start: startDate,
            end: endDate,
          },
          quantity: quantity, // Pastikan quantity sesuai
          price: discountedPrice, // Gunakan harga yang dihitung
          imageUrl: activity.images?.[0] || "https://picsum.photos/200",
        }));

      // Simpan ke localStorage sebagai checkoutItems
      localStorage.setItem("checkoutItems", JSON.stringify(newCheckoutItems));

      showToast(
        `Successfully processed booking for ${quantity} item(s)`,
        "success"
      );
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 1000);
    } catch (error) {
      console.error(`Error booking for activityId: ${activity?.id}`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        const errorMessage =
          error.message === "Success"
            ? "An error occurred while processing booking"
            : error.message || "An error occurred while processing booking";
        showToast(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  console.log("BookingOffer activity:", JSON.stringify(activity, null, 2));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between z-10">
          <div className="flex items-center">
            <button
              type="button"
              tabIndex={-1}
              onClick={onClose}
              className="mr-3 hover:bg-gray-100 p-2 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activity?.name || activity?.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {activity?.rating?.label || ROOM_DETAILS.rating.label}
                </span>
                <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full">
                  {activity?.rating?.value || ROOM_DETAILS.rating.value}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            tabIndex={-1}
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section: Activity Information */}
          <div className="col-span-1">
            {/* Image */}
            <div className="bg-gray-100 h-48 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(activity?.images?.[0])}
                alt={activity?.name || "Activity"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://picsum.photos/800/400";
                }}
              />
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="mt-2 text-teal-600 hover:text-teal-800 flex items-center gap-1 text-sm transition-colors"
            >
              <Eye size={16} />
              {ROOM_DETAILS.buttons.viewDetails}
            </button>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📏</span>
                <span>{activity?.size || ROOM_DETAILS.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🌄</span>
                <span>{activity?.view || ROOM_DETAILS.view}</span>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="mt-6 border border-gray-100 rounded-lg p-4 bg-teal-50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-teal-600" />
                <h3 className="text-xl font-semibold text-teal-600">
                  Booking Period
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={getTomorrowDate()}
                    onChange={handleStartDateChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateIndonesian(startDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={new Date(startDate).toISOString().split("T")[0]}
                    onChange={handleEndDateChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateIndonesian(endDate)}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Duration:{" "}
                    <span className="text-teal-600">{duration} day(s)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {Array.isArray(activity?.features || ROOM_DETAILS.features)
                ? (activity?.features || ROOM_DETAILS.features).map(
                    (feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 ${
                          feature.status === "positive"
                            ? "text-teal-600"
                            : "text-red-600"
                        }`}
                      >
                        <Check size={16} />
                        <span>{feature.label}</span>
                      </div>
                    )
                  )
                : ROOM_DETAILS.features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${
                        feature.status === "positive"
                          ? "text-teal-600"
                          : "text-red-600"
                      }`}
                    >
                      <Check size={16} />
                      <span>{feature.label}</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Middle Section: Promotions */}
          <div className="col-span-1">
            <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-teal-600">
                {ROOM_DETAILS.promotion.title}
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                {ROOM_DETAILS.promotion.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                {ROOM_DETAILS.labels.cashback}
              </span>
              <span className="text-teal-600 font-semibold">
                {formatCurrency(cashbackAmount)}
              </span>
            </div>
          </div>

          {/* Right Section: Price and Buttons */}
          <div className="col-span-1">
            {/* Price */}
            <div className="space-y-2">
              {originalPrice > discountedPrice && (
                <p className="text-sm text-gray-500 line-through">
                  {formatCurrency(originalPrice)}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(discountedPrice)}{" "}
                {discountPercentage > 0 && (
                  <span className="text-red-600">-{discountPercentage}%</span>
                )}
              </p>
              <p className="text-lg text-teal-600">
                {duration} day(s): {formatCurrency(discountedPrice * duration)}
              </p>
              <p className="text-xl font-semibold text-gray-800">
                Total: {formatCurrency(getFinalPrice())}
              </p>
              <p className="text-sm text-gray-500">
                Price includes taxes & service fees
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(pricePerUnit)}{" "}
                <span className="text-gray-500">
                  {ROOM_DETAILS.labels.pricePerUnit}
                </span>
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Number of Items:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={decreaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={increaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 space-y-3">
              <button
                type="button"
                tabIndex={-1}
                onClick={handleBookNow}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                disabled={isLoading || cartIsLoading}
              >
                {isLoading || cartIsLoading ? "Processing..." : "Book Now"}
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={handleAddToCart}
                className="w-full bg-white border border-teal-600 text-teal-600 py-3 px-4 rounded-lg font-medium hover:bg-teal-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={isLoading || cartIsLoading}
              >
                {isLoading || cartIsLoading ? (
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <ShoppingCart className="mr-2" size={18} />
                )}
                {isLoading || cartIsLoading ? "Adding..." : "Add to Cart"}
              </button>
              <p className="text-sm text-gray-600 text-center">
                {ROOM_DETAILS.labels.bookingTime}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-center">
          <button
            type="button"
            tabIndex={-1}
            onClick={handleBookNow}
            className="bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50"
            disabled={isLoading || cartIsLoading}
          >
            <span>{ROOM_DETAILS.labels.lastItem}</span>
            <span className="bg-teal-800 text-white px-2 py-1 rounded text-xs">
              {ROOM_DETAILS.labels.noRisk}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingOffer;
