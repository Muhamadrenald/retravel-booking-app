import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useActivitiesAPI from "../../hooks/useActivitiesAPI";
import RootLayout from "../../layouts/RootLayout";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Check,
  ExternalLink,
} from "lucide-react";
import BookingOffer from "../../components/bookingoffer/BookingOffer";

// Import constants from separate file
import {
  ACTIVITY_TYPES,
  ACTIVITY_HIGHLIGHTS,
  LANDMARK_LIST,
  ALL_FEATURES,
  NAVIGATION_TABS,
  SAMPLE_REVIEWS,
  getFeatureIcon,
} from "../../utils/activityConstants";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { getActivityById } = useActivitiesAPI();
  const navigate = useNavigate();
  const [mapPosition, setMapPosition] = useState([-7.7956, 110.3695]);
  const [showBookingOffer, setShowBookingOffer] = useState(false);
  const contentRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      setIsLoading(true);
      try {
        const activityData = await getActivityById(id);
        if (!activityData) throw new Error("Activity not found");

        if (activityData.price) {
          activityData.price = parseFloat(activityData.price);
        }
        if (activityData.priceDiscount) {
          activityData.priceDiscount = parseFloat(activityData.priceDiscount);
        }

        setActivity(activityData);

        if (
          activityData.location_maps &&
          activityData.location_maps.includes(",")
        ) {
          const [lat, lng] = activityData.location_maps
            .split(",")
            .map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapPosition([lat, lng]);
          }
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivityDetail();
  }, [id]);

  useEffect(() => {
    // Restore scroll position after tab change
    if (contentRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
      console.log("Restored scroll position:", scrollPositionRef.current);
      console.log("Content height:", contentRef.current.offsetHeight);
    }
  }, [activeTab]);

  const formatFeature = (feature) => {
    return typeof feature === "string" && feature.trim() ? feature : null;
  };

  const normalizeFeatures = (facilities) => {
    if (Array.isArray(facilities)) {
      return facilities.filter((f) => typeof f === "string" && f.trim());
    }
    if (typeof facilities === "string") {
      return facilities
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f);
    }
    return [];
  };

  const getImageUrl = (img) => {
    return img && img.trim() !== "" ? img : "https://picsum.photos/800/400";
  };

  const formatCurrency = (amount) => {
    return `IDR ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const openGoogleMaps = () => {
    if (activity && activity.location_maps) {
      if (activity.location_maps.startsWith("http")) {
        window.open(activity.location_maps, "_blank");
      } else if (activity.location_maps.includes(",")) {
        const [lat, lng] = activity.location_maps.split(",");
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, "_blank");
      }
    } else if (activity && activity.address) {
      const query = encodeURIComponent(
        `${activity.address}, ${activity.city}, ${activity.province}`
      );
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, "_blank");
    }
  };

  const handleViewOfferClick = () => {
    setShowBookingOffer(true);
  };

  const handleCloseBookingOffer = () => {
    setShowBookingOffer(false);
  };

  const handleTabClick = (tabId, event) => {
    event.preventDefault();
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    console.log(
      "Switching to tab:",
      tabId,
      "Scroll position:",
      scrollPositionRef.current
    );
    setActiveTab(tabId);
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className="p-8 animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </RootLayout>
    );
  }

  const features = normalizeFeatures(activity?.facilities);

  return (
    <RootLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center py-3 bg-gray-50 text-gray-600 text-sm rounded-lg px-4 mb-6 shadow-sm">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => navigate("/")}
            className="hover:text-teal-600 transition-colors"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => navigate("/activities")}
            className="hover:text-teal-600 transition-colors"
          >
            Activities
          </button>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">{activity?.name}</span>
        </div>

        {/* Main Content */}
        {activity ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div>
                <img
                  src={getImageUrl(activity.images?.[0])}
                  alt={activity.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = "https://picsum.photos/800/600";
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative">
                    <img
                      src={getImageUrl(activity.images?.[index])}
                      alt={`${activity.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/800/600?random=${index}`;
                      }}
                    />
                    {index === 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <button
                          type="button"
                          tabIndex={-1}
                          className="text-white font-medium flex items-center"
                        >
                          <span className="mr-2">View all photos</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 px-4">
              {NAVIGATION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  tabIndex={-1}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-teal-600 text-teal-600"
                      : "text-gray-600 hover:text-teal-600"
                  }`}
                  onClick={(e) => handleTabClick(tab.id, e)}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Content Based on Active Tab */}
            <div ref={contentRef} className="p-6">
              {activeTab === "overview" && (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column */}
                  <div className="w-full lg:w-2/3">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {activity.name}
                      </h1>
                      <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        {ACTIVITY_TYPES[activity.categoryId] ||
                          activity.location ||
                          "Activity"}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-600">
                        {activity.address}, {activity.city}, {activity.province}
                      </span>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Description
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {activity.description ||
                          "Enjoy an unforgettable experience with this activity, perfect for adventure, culture, or relaxation. Discover excitement tailored to your interests!"}
                      </p>
                    </div>

                    {/* Features Section */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Main Features
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        {features.length > 0
                          ? features.slice(0, 5).map((feature, index) => (
                              <div
                                key={index}
                                className="flex flex-col items-center"
                              >
                                <div className="text-3xl mb-2">
                                  {getFeatureIcon(feature)}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {formatFeature(feature)}
                                </p>
                              </div>
                            ))
                          : ALL_FEATURES.slice(0, 5).map(
                              (featureItem, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center"
                                >
                                  <div className="text-3xl mb-2">
                                    {featureItem.icon}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {featureItem.name}
                                  </p>
                                </div>
                              )
                            )}
                      </div>
                    </div>

                    {/* Activity Highlights */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Activity Highlights
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Discover special inclusions for your experience
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ACTIVITY_HIGHLIGHTS.map((highlight, index) => (
                          <div
                            key={index}
                            className="border border-gray-100 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-center mb-3">
                              <span className="text-2xl mr-2">
                                {highlight.icon}
                              </span>
                              <h3 className="font-medium text-gray-800">
                                {highlight.title}
                              </h3>
                            </div>
                            <ul className="space-y-2">
                              {highlight.items.map((item, itemIndex) => (
                                <li
                                  key={itemIndex}
                                  className="flex items-center"
                                >
                                  <Check
                                    size={16}
                                    className="text-teal-500 mr-2"
                                  />
                                  <span className="text-sm text-gray-600">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="w-full lg:w-1/3">
                    <div className="bg-white border border-gray-100 rounded-lg p-6 sticky top-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star
                            className="text-yellow-400 fill-yellow-400 mr-1"
                            size={20}
                          />
                          <span className="font-bold text-lg text-gray-800">
                            {activity.rating} Excellent
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {activity.totalReviews} reviews
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Strategic Location
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="mr-2">🅿️</span>
                            <span>Parking</span>
                          </div>
                          <span className="text-teal-500 font-medium">
                            FREE
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Popular Landmarks
                        </h3>
                        <ul className="space-y-2">
                          {LANDMARK_LIST.map((landmark, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-600">
                                {landmark.name}
                              </span>
                              <span className="text-gray-500">
                                {landmark.distance}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-600">Starting from</span>
                          <div className="flex flex-col items-end">
                            {activity.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(activity.price)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-teal-600">
                              {formatCurrency(
                                activity.priceDiscount || activity.price
                              )}
                            </span>
                            {activity.price && activity.priceDiscount && (
                              <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-full mt-1">
                                Save{" "}
                                {Math.round(
                                  (1 -
                                    activity.priceDiscount / activity.price) *
                                    100
                                )}
                                %
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={handleViewOfferClick}
                          className="w-full py-3 px-4 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                        >
                          View Offer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {features.length > 0
                      ? features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <Check size={18} className="text-teal-500 mr-2" />
                            <span className="text-gray-600">
                              {formatFeature(feature)}
                            </span>
                          </div>
                        ))
                      : ALL_FEATURES.map((featureItem, index) => (
                          <div key={index} className="flex items-center">
                            <Check size={18} className="text-teal-500 mr-2" />
                            <span className="text-gray-600">
                              {featureItem.name}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Location
                  </h2>
                  <div className="h-96 rounded-lg shadow-md overflow-hidden">
                    <MapContainer
                      center={mapPosition}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapPosition}>
                        <Popup>
                          <strong>{activity.name}</strong>
                          <br />
                          {activity.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Full Address
                      </h3>
                      <p className="text-gray-600">
                        {activity.address}, {activity.city}, {activity.province}
                      </p>
                    </div>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={openGoogleMaps}
                      className="flex items-center text-teal-600 hover:text-teal-800 transition-colors"
                    >
                      <span className="mr-2">Open in Google Maps</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Reviews
                    </h2>
                    <div className="flex items-center">
                      <Star
                        className="text-yellow-400 fill-yellow-400 mr-1"
                        size={20}
                      />
                      <span className="font-bold text-lg text-gray-800">
                        {activity.rating}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({activity.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SAMPLE_REVIEWS.map((review, index) => (
                      <div
                        key={index}
                        className="border border-gray-100 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-800">
                            {review.name}
                          </span>
                          <div className="flex items-center">
                            <Star
                              className="text-yellow-400 fill-yellow-400 mr-1"
                              size={16}
                            />
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <span className="text-gray-400 text-sm mt-2">
                          Visited on {review.date}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
                    >
                      View All Reviews
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">
            No activity found.
          </div>
        )}

        {/* Booking Offer Modal */}
        {showBookingOffer && (
          <BookingOffer activity={activity} onClose={handleCloseBookingOffer} />
        )}
      </div>
    </RootLayout>
  );
}

export default ActivityDetail;
