// activityConstants.js - Extracted constants from ActivityDetail

export const FACILITY_ICONS = [
  { icon: "🍽️", name: "Hidangan & restoran" },
  { icon: "👍", name: "Pas untuk aktivitas" },
  { icon: "🏊‍♂️", name: "Kolam renang" },
  { icon: "🏞️", name: "Pemandangan luar biasa" },
  { icon: "🧼", name: "Bersih & higienis" },
];

export const STAYCATION_OFFERS = [
  {
    icon: "🍽️",
    title: "Makanan & Minuman",
    facilities: ["Layanan kamar 24 jam", "Kedai kopi", "Restoran"],
  },
  {
    icon: "💆‍♀️",
    title: "Wellness",
    facilities: ["Salon", "Pusat kebugaran", "Spa"],
  },
  {
    icon: "🏋️‍♂️",
    title: "Aktivitas",
    facilities: ["Area bermain anak", "Kolam renang", "Taman"],
  },
];

export const LANDMARK_LIST = [
  { name: "Istana Yogyakarta", distance: "7.4 km" },
  { name: "Taman Sari", distance: "7.8 km" },
  { name: "Ballet Ramayana di Prambanan", distance: "12.7 km" },
  { name: "Candi Ratu Boko", distance: "13.0 km" },
  { name: "Candi Sewu", distance: "13.2 km" },
];

export const ALL_FACILITIES = [
  { icon: "📶", name: "Wifi gratis" },
  { icon: "🅿️", name: "Parkir gratis" },
  { icon: "🏊‍♂️", name: "Kolam renang" },
  { icon: "🧘‍♀️", name: "Spa" },
  { icon: "🛎️", name: "Resepsionis 24 jam" },
  { icon: "🏋️‍♂️", name: "Pusat kebugaran" },
  { icon: "🍽️", name: "Restoran" },
  { icon: "🍸", name: "Bar" },
];

export const NAVIGATION_TABS = [
  { id: "information", name: "Informasi Umum" },
  { id: "facilities", name: "Fasilitas" },
  { id: "location", name: "Lokasi" },
  { id: "reviews", name: "Ulasan" },
];

export const SAMPLE_REVIEWS = [
  {
    name: "Pengunjung 1",
    rating: 4.5,
    comment:
      "Tempat yang sangat bagus untuk liburan. Pemandangan indah, fasilitas lengkap, dan pelayanan ramah.",
    date: "April 2025",
  },
  {
    name: "Pengunjung 2",
    rating: 4.8,
    comment:
      "Sangat merekomendasikan tempat ini! Suasana yang tenang dan nyaman, cocok untuk relaksasi.",
    date: "April 2025",
  },
  {
    name: "Pengunjung 3",
    rating: 4.2,
    comment:
      "Fasilitas lengkap dan pemandangan yang indah. Saya akan kembali lagi di lain waktu.",
    date: "Maret 2025",
  },
  {
    name: "Pengunjung 4",
    rating: 4.7,
    comment:
      "Pelayanan ramah dan profesional. Lokasi strategis dekat dengan berbagai tempat wisata.",
    date: "Maret 2025",
  },
];

// Function to get facility icon
export const getFacilityIcon = (facilityName) => {
  const iconMap = {
    wifi: "📶",
    parking: "🅿️",
    pool: "🏊‍♂️",
    restaurant: "🍽️",
    gym: "💪",
    spa: "💆‍♀️",
    ac: "❄️",
    bar: "🍸",
    laundry: "👕",
    garden: "🌳",
    playground: "🧒",
    elevator: "🛗",
    security: "👮‍♂️",
    concierge: "🛎️",
    roomservice: "🛏️",
    conference: "👥",
  };

  // Try to match facility name (case insensitive) with our icon map
  const key = facilityName
    ? facilityName.toLowerCase().replace(/\s+/g, "")
    : "";
  return iconMap[key] || "✅"; // Default to checkmark if no icon found
};
