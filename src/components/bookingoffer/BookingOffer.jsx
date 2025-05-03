import { useState } from "react";
import {
  ChevronLeft,
  X,
  ShoppingCart,
  CheckCircle,
  Bed,
  Square,
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

  // Tambahkan state untuk tanggal check-in dan check-out
  const [checkInDate, setCheckInDate] = useState(getTomorrowDate());
  const [checkOutDate, setCheckOutDate] = useState(getDateAfterTomorrow());

  // Fungsi untuk mendapatkan tanggal besok
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Fungsi untuk mendapatkan tanggal lusa
  function getDateAfterTomorrow() {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split("T")[0];
  }

  // Fungsi untuk memformat tanggal ke format Indonesia
  function formatDateIndonesian(dateString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  // Fungsi untuk menghitung jumlah malam
  function calculateNights() {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const timeDiff = Math.abs(endDate - startDate);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  // Tangani perubahan tanggal check-in
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckInDate(newCheckIn);

    // Pastikan check-out minimal 1 hari setelah check-in
    const checkInDateObj = new Date(newCheckIn);
    const nextDay = new Date(checkInDateObj);
    nextDay.setDate(checkInDateObj.getDate() + 1);
    const nextDayString = nextDay.toISOString().split("T")[0];

    if (new Date(checkOutDate) <= new Date(newCheckIn)) {
      setCheckOutDate(nextDayString);
    }
  };

  // Tangani perubahan tanggal check-out
  const handleCheckOutChange = (e) => {
    setCheckOutDate(e.target.value);
  };

  // Tangani error jika useCartAPI tidak dalam CartProvider
  let cartAPI;
  try {
    cartAPI = useCartAPI();
  } catch (error) {
    console.error("useCartAPI error:", error.message);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-500">Error</h2>
          <p className="text-gray-600">
            Komponen ini harus digunakan dalam CartProvider. Hubungi
            administrator.
          </p>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const { addToCart, isLoading: cartIsLoading } = cartAPI;

  // Calculate original and discounted prices
  const originalPrice = activity?.price || 0;
  const discountedPrice =
    activity?.price_discount && activity.price_discount < originalPrice
      ? activity.price_discount
      : originalPrice;

  // Calculate discount percentage if applicable
  const discountPercentage =
    originalPrice && discountedPrice < originalPrice
      ? Math.round((1 - discountedPrice / originalPrice) * 100)
      : 0;

  // Calculate cashback amount using constant
  const cashbackAmount = Math.round(discountedPrice * CASHBACK_PERCENTAGE);

  // Format currency
  const formatCurrency = (amount) => {
    return `Rp ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  // Calculate final amount based on nights
  const nights = calculateNights();
  const getTotalPrice = () => discountedPrice * quantity * nights;
  const getFinalPrice = () => getTotalPrice();
  const pricePerNight = discountedPrice; // Harga per malam

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

  // Prepare cart item payload with dates and quantity
  const prepareCartPayload = (qty = 1) => {
    if (!activity?.id) {
      throw new Error("ID aktivitas tidak valid");
    }
    if (!checkInDate || !checkOutDate) {
      throw new Error("Tanggal check-in atau check-out tidak valid");
    }
    const payload = {
      activityId: activity.id,
      quantity: qty,
      bookingDate: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
    };
    console.log(
      `BookingOffer prepareCartPayload for activityId: ${activity.id}`,
      JSON.stringify(payload, null, 2)
    );
    return payload;
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Validasi data
      if (!activity?.id) {
        throw new Error("Data aktivitas tidak valid");
      }
      console.log(
        `BookingOffer handleAddToCart for activityId: ${activity.id}, quantity: ${quantity}`
      );

      // Kirim permintaan addToCart terpisah untuk setiap unit
      const addPromises = [];
      for (let i = 0; i < quantity; i++) {
        const payload = prepareCartPayload(1);
        addPromises.push(addToCart(payload));
      }
      const results = await Promise.all(addPromises);
      console.log(
        `BookingOffer addToCart results for activityId: ${activity.id}`,
        JSON.stringify(results, null, 2)
      );

      // Periksa setiap hasil
      const failedRequests = results.filter(
        (result) => String(result.code) !== "200"
      );
      if (failedRequests.length > 0) {
        console.error("Some addToCart requests failed:", failedRequests);
        throw new Error(
          `Gagal menambahkan ${failedRequests.length} item ke keranjang`
        );
      }

      // Simpan bookingDate di localStorage sebagai fallback
      localStorage.setItem(
        `bookingDate_${activity.id}`,
        JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        })
      );

      showToast(
        `Berhasil menambahkan ${quantity} item ke keranjang`,
        "success"
      );
      setTimeout(() => {
        window.location.href = "/carts"; // Diarahkan ke /carts
      }, 1000); // Delay navigasi untuk menampilkan toast
    } catch (error) {
      console.error(
        `Error menambahkan ke keranjang untuk activityId: ${activity?.id}`,
        {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
      );

      // Tangani error autentikasi (401)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login"; // Arahkan ke halaman login
        }, 1000);
      } else {
        const errorMessage =
          error.message === "Success"
            ? "Terjadi kesalahan saat menambahkan ke keranjang"
            : error.message ||
              "Terjadi kesalahan saat menambahkan ke keranjang";
        showToast(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      // Validasi data
      if (!activity?.id) {
        throw new Error("Data aktivitas tidak valid");
      }
      console.log(
        `BookingOffer handleBookNow for activityId: ${activity.id}, quantity: ${quantity}`
      );

      // Kirim permintaan addToCart terpisah untuk setiap unit
      const addPromises = [];
      for (let i = 0; i < quantity; i++) {
        const payload = prepareCartPayload(1);
        addPromises.push(addToCart(payload));
      }
      const results = await Promise.all(addPromises);
      console.log(
        `BookingOffer bookNow results for activityId: ${activity.id}`,
        JSON.stringify(results, null, 2)
      );

      // Periksa setiap hasil
      const failedRequests = results.filter(
        (result) => String(result.code) !== "200"
      );
      if (failedRequests.length > 0) {
        console.error("Some bookNow requests failed:", failedRequests);
        throw new Error(`Gagal memproses ${failedRequests.length} item`);
      }

      // Simpan bookingDate di localStorage sebagai fallback
      localStorage.setItem(
        `bookingDate_${activity.id}`,
        JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        })
      );

      showToast(`Pemesanan ${quantity} item berhasil diproses`, "success");
      setTimeout(() => {
        window.location.href = "/checkout"; // Tetap ke /checkout
      }, 1000); // Delay navigasi untuk menampilkan toast
    } catch (error) {
      console.error(`Error memesan untuk activityId: ${activity?.id}`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Tangani error autentikasi (401)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login"; // Arahkan ke halaman login
        }, 1000);
      } else {
        const errorMessage =
          error.message === "Success"
            ? "Terjadi kesalahan saat memproses pemesanan"
            : error.message || "Terjadi kesalahan saat memproses pemesanan";
        showToast(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debugging log
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

      <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between z-10">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-3 hover:bg-gray-100 p-1 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-semibold">{activity?.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {activity?.rating?.label || ROOM_DETAILS.rating.label}
                </span>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  {activity?.rating?.value || ROOM_DETAILS.rating.value}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bagian Kiri: Informasi Kamar */}
          <div className="col-span-1">
            {/* Placeholder Gambar */}
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Gambar Kamar</span>
            </div>
            <button className="mt-2 text-blue-500 hover:underline flex items-center gap-1 text-sm">
              <Eye size={16} />
              {ROOM_DETAILS.buttons.viewDetails}
            </button>

            {/* Detail Kamar */}
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Bed size={16} />
                <span>{activity?.bedType || ROOM_DETAILS.bedType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Square size={16} />
                <span>
                  Ukuran kamar: {activity?.roomSize || ROOM_DETAILS.roomSize}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🖼️</span>
                <span>Pemandangan: {activity?.view || ROOM_DETAILS.view}</span>
              </div>
            </div>

            {/* Tanggal Pemesanan */}
            <div className="mt-6 border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-blue-600" />
                <h3 className="font-medium text-blue-800">Tanggal Menginap</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    min={getTomorrowDate()}
                    onChange={handleCheckInChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateIndonesian(checkInDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={new Date(checkInDate).toISOString().split("T")[0]}
                    onChange={handleCheckOutChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateIndonesian(checkOutDate)}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Durasi:{" "}
                    <span className="text-blue-600">{nights} malam</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Fasilitas */}
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              {Array.isArray(activity?.facilities || ROOM_DETAILS.facilities)
                ? (activity?.facilities || ROOM_DETAILS.facilities).map(
                    (facility, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 ${
                          facility.status === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span>{facility.label}</span>
                      </div>
                    )
                  )
                : ROOM_DETAILS.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${
                        facility.status === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <CheckCircle size={16} />
                      <span>{facility.label}</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Bagian Tengah: Promosi */}
          <div className="col-span-1">
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-600">
                {ROOM_DETAILS.promotion.title}
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {ROOM_DETAILS.promotion.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-700">
                {ROOM_DETAILS.labels.cashback}
              </span>
              <span className="text-orange-600 font-semibold">
                {formatCurrency(cashbackAmount)}
              </span>
            </div>
          </div>

          {/* Bagian Kanan: Harga dan Tombol */}
          <div className="col-span-1">
            {/* Harga */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 line-through">
                {formatCurrency(originalPrice)} digunakan
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(discountedPrice)}{" "}
                <span className="text-red-600">-{discountPercentage}%</span>
              </p>
              <p className="text-lg text-blue-600">
                {nights} malam: {formatCurrency(discountedPrice * nights)}
              </p>
              <p className="text-xl font-semibold text-gray-800">
                Total: {formatCurrency(getFinalPrice())}
              </p>
              <p className="text-sm text-gray-500">
                Harga sudah termasuk pajak & biaya layanan
              </p>
              <p className="text-sm text-gray-700">
                {formatCurrency(pricePerNight)}{" "}
                <span className="text-gray-500">
                  {ROOM_DETAILS.labels.pricePerNight}
                </span>
              </p>
            </div>

            {/* Kuantitas */}
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-1">Jumlah Kamar:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tombol */}
            <div className="mt-4 space-y-3">
              <button
                onClick={handleBookNow}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md font-medium"
                disabled={isLoading || cartIsLoading}
              >
                {isLoading || cartIsLoading ? "Memproses..." : "Pesan sekarang"}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 py-3 px-6 rounded-md font-medium flex items-center justify-center"
                disabled={isLoading || cartIsLoading}
              >
                {isLoading || cartIsLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <ShoppingCart className="mr-2" size={18} />
                )}
                {isLoading || cartIsLoading
                  ? "Menambahkan..."
                  : "Tambah ke troli"}
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
            onClick={handleBookNow}
            className="bg-green-500 text-white py-2 px-4 rounded-md flex items-center gap-2"
            disabled={isLoading || cartIsLoading}
          >
            <span>{ROOM_DETAILS.labels.lastRoom}</span>
            <span className="bg-green-700 text-white px-2 py-1 rounded text-xs">
              {ROOM_DETAILS.labels.noRisk}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingOffer;
