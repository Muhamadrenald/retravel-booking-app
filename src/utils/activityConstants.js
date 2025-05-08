// activityConstants.js - Constants for ActivityDetail

export const ACTIVITY_TYPES = {
  attraction: "Attraction",
  tour: "Guided Tour",
  event: "Event",
  workshop: "Workshop",
  adventure: "Adventure",
};

export const ACTIVITY_HIGHLIGHTS = [
  {
    icon: "🎟️",
    title: "Activity Access",
    items: ["Entry ticket", "Priority access", "Exclusive areas"],
  },
  {
    icon: "🗺️",
    title: "Guided Experience",
    items: [
      "Professional guide",
      "Multilingual support",
      "Interactive sessions",
    ],
  },
  {
    icon: "🎉",
    title: "Special Perks",
    items: ["Souvenir", "Refreshments", "Photo opportunities"],
  },
];

export const LANDMARK_LIST = [
  { name: "Yogyakarta Palace", distance: "7.4 km" },
  { name: "Taman Sari", distance: "7.8 km" },
  { name: "Prambanan Temple", distance: "12.7 km" },
  { name: "Ratu Boko Temple", distance: "13.0 km" },
  { name: "Sewu Temple", distance: "13.2 km" },
];

export const ALL_FEATURES = [
  { icon: "🎟️", name: "Entry Ticket" },
  { icon: "🗣️", name: "Guided Tour" },
  { icon: "📷", name: "Photo Spots" },
  { icon: "🍴", name: "Dining Options" },
  { icon: "♿", name: "Accessibility" },
  { icon: "🛍️", name: "Souvenir Shop" },
  { icon: "🅿️", name: "Parking" },
  { icon: "🚻", name: "Restrooms" },
];

export const NAVIGATION_TABS = [
  { id: "overview", name: "Overview" },
  { id: "features", name: "Features" },
  { id: "location", name: "Location" },
  { id: "reviews", name: "Reviews" },
];

export const SAMPLE_REVIEWS = [
  {
    name: "Traveler 1",
    rating: 4.5,
    comment:
      "Amazing experience! The guided tour was very informative, and the views were stunning.",
    date: "April 2025",
  },
  {
    name: "Traveler 2",
    rating: 4.8,
    comment:
      "Loved every moment of this activity. Perfect for families and solo travelers!",
    date: "April 2025",
  },
  {
    name: "Traveler 3",
    rating: 4.2,
    comment:
      "Worth the price. The staff were friendly, and the activity was well-organized.",
    date: "March 2025",
  },
  {
    name: "Traveler 4",
    rating: 4.7,
    comment:
      "A must-try when visiting! The experience was seamless from start to finish.",
    date: "March 2025",
  },
];

// Function to get feature icon
export const getFeatureIcon = (featureName) => {
  const iconMap = {
    ticket: "🎟️",
    tour: "🗣️",
    photo: "📷",
    dining: "🍴",
    accessibility: "♿",
    shop: "🛍️",
    parking: "🅿️",
    restroom: "🚻",
    guide: "🗺️",
    souvenir: "🎁",
    priority: "⚡",
    interactive: "🎮",
  };

  const key = featureName ? featureName.toLowerCase().replace(/\s+/g, "") : "";
  return iconMap[key] || "✅";
};
