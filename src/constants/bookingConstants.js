// constants/bookingConstants.js

// Constants for room information
export const ROOM_INFO = {
  title: "Room & Property Details",
  capacity: "2 Tamu · 1 Kamar tidur · 1 Kasur · 1 Kamar mandi",
  rating: "4.9 (120)",
};

// Benefits list for room booking
export const ROOM_BENEFITS = [
  {
    id: 1,
    text: "Harga terbaik untuk Anda",
    showInfoIcon: true,
  },
  {
    id: 2,
    text: "Bonus diskon berlaku",
    showInfoIcon: false,
  },
  {
    id: 3,
    text: "Pembatalan gratis hingga 24 jam sebelum check-in",
    showInfoIcon: false,
  },
];

// Room features list - menggunakan string untuk icon, bukan JSX
export const ROOM_FEATURES = [
  {
    id: 1,
    icon: "📶", // Wi-Fi icon menggunakan emoji
    description: "Wi-Fi gratis",
  },
  {
    id: 2,
    icon: "☕", // Coffee icon menggunakan emoji
    description: "Sarapan termasuk",
  },
  {
    id: 3,
    icon: "📺", // TV icon menggunakan emoji
    description: "TV layar datar",
  },
  {
    id: 4,
    icon: "🛁", // Bath icon menggunakan emoji
    description: "Kamar mandi pribadi",
  },
];

// Financial constants
export const CASHBACK_PERCENTAGE = 0.05; // 5% cashback
export const TAX_RATE = 0.11; // 11% tax

// UI Text strings
export const UI_TEXT = {
  bestPrice: "Harga Terbaik",
  bonusDiscount: "Bonus Diskon",
  cashbackReward: "Cashback reward",
  termsConditions: "Syarat & Ketentuan berlaku",
  cashback: "Cashback akan ditambahkan ke saldo akun Anda",
  pricePerNight: "per malam",
  showPriceDetails: "Lihat rincian harga",
  hidePriceDetails: "Sembunyikan rincian harga",
  noRisk: "Tanpa risiko",
  freeCancellation: "Pembatalan gratis",
  priceDetails: "Rincian Harga",
  nights: "malam",
  // taxAndFees: "Pajak & Biaya",
  taxAndFees: "PPN",
  total: "Total",
  roomInfo: "Fasilitas Kamar",
  addToCart: "Tambahkan ke Keranjang",
  bookNow: "Pesan Sekarang",
  backToDetails: "Kembali ke Detail",
  bookDirect: "Pesan",
};
