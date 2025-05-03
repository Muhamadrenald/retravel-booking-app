import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  FACILITY_ICONS,
  STAYCATION_OFFERS,
  LANDMARK_LIST,
  ALL_FACILITIES,
  NAVIGATION_TABS,
  SAMPLE_REVIEWS,
  getFacilityIcon,
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
  const [activeTab, setActiveTab] = useState("information");
  const { getActivityById } = useActivitiesAPI();
  const navigate = useNavigate();
  const [mapPosition, setMapPosition] = useState([-7.7956, 110.3695]);
  const [showBookingOffer, setShowBookingOffer] = useState(false);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      setIsLoading(true);
      try {
        const activityData = await getActivityById(id);
        console.log("Fetched activity data:", activityData);

        if (activityData.price) {
          activityData.price = parseFloat(activityData.price);
        }
        if (activityData.priceDiscount) {
          activityData.priceDiscount = parseFloat(activityData.priceDiscount);
        }

        setActivity(activityData);

        if (activityData.latitude && activityData.longitude) {
          setMapPosition([
            parseFloat(activityData.latitude),
            parseFloat(activityData.longitude),
          ]);
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

  const formatFacility = (facility) => {
    if (!facility) return null;
    return facility;
  };

  const getImageUrl = (img) => {
    return img && img.trim() !== "" ? img : "https://picsum.photos/800/400";
  };

  const formatCurrency = (amount) => {
    return `Rp. ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const openGoogleMaps = () => {
    if (activity && activity.latitude && activity.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
      window.open(url, "_blank");
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

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <RootLayout>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-48 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </RootLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  const facility = activity?.facilities
    ? formatFacility(activity.facilities)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center py-2 bg-gray-100 text-gray-600 text-sm rounded-lg px-4 mb-4 mt-4">
        <button
          onClick={() => navigate("/")}
          className="hover:text-primary cursor-pointer"
        >
          Home Page
        </button>
        <span className="mx-2">/</span>
        <button
          onClick={() => navigate("/activities")}
          className="hover:text-primary cursor-pointer"
        >
          Activities
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">{activity?.name}</span>
      </div>

      {/* Main Content */}
      {activity ? (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Image Gallery */}
          <div className="flex flex-wrap p-2">
            <div className="w-full md:w-1/2 p-2">
              <img
                src={getImageUrl(activity.images?.[0])}
                alt={activity.name}
                className="w-full h-96 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://picsum.photos/800/600";
                }}
              />
            </div>
            <div className="w-full md:w-1/2 p-2">
              <div className="grid grid-cols-2 gap-2 h-full">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative">
                    <img
                      src={getImageUrl(activity.images?.[index])}
                      alt={`${activity.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://picsum.photos/800/600?random=${index}`;
                      }}
                    />
                    {index === 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <button className="text-white font-medium flex items-center">
                          <span className="mr-2">View all photos</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b overflow-x-auto whitespace-nowrap">
            {NAVIGATION_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-4 ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary font-medium"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content Based on Active Tab */}
          <div className="p-4">
            {activeTab === "information" && (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="w-full lg:w-2/3">
                  <h1 className="text-2xl font-bold mb-2">{activity.name}</h1>
                  <div className="flex items-center mb-4">
                    <MapPin size={16} className="text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      {activity.address}, {activity.city}, {activity.province}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Deskripsi</h2>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>

                  {/* Facilities Section */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Fasilitas utama
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      {facility ? (
                        <div className="flex flex-col items-center">
                          <div className="text-3xl mb-2">
                            {getFacilityIcon(facility)}
                          </div>
                          <p className="text-sm text-gray-600">{facility}</p>
                        </div>
                      ) : (
                        FACILITY_ICONS.map((facilityItem, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div className="text-3xl mb-2">
                              {facilityItem.icon}
                            </div>
                            <p className="text-sm text-gray-600">
                              {facilityItem.name}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Additional Sections */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Penawaran Staycation
                    </h2>
                    <p className="text-gray-700 mb-4">
                      Dapatkan fasilitas spesial untuk masa inap Anda
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {STAYCATION_OFFERS.map((offer, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <span className="text-2xl mr-2">{offer.icon}</span>
                            <h3 className="font-medium">{offer.title}</h3>
                          </div>
                          <ul className="space-y-2">
                            {offer.facilities.map((facility, facilityIndex) => (
                              <li
                                key={facilityIndex}
                                className="flex items-center"
                              >
                                <Check
                                  size={16}
                                  className="text-green-500 mr-2"
                                />
                                <span className="text-sm">{facility}</span>
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
                  <div className="bg-white border rounded-lg p-6 sticky top-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star
                          className="text-yellow-500 fill-yellow-500 mr-1"
                          size={20}
                        />
                        <span className="font-bold text-lg">
                          {activity.rating} Luar biasa
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.totalReviews} ulasan
                      </span>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Lokasi strategis</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="mr-2">🅿️</span>
                          <span>Parkir</span>
                        </div>
                        <span className="text-green-500 font-medium">
                          GRATIS
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Landmark populer</h3>
                      <ul className="space-y-2">
                        {LANDMARK_LIST.map((landmark, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="text-gray-700">
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
                        <div className="text-gray-700">Mulai</div>
                        <div className="flex flex-col items-end">
                          {activity.priceDiscount &&
                            activity.price &&
                            activity.priceDiscount < activity.price && (
                              <div className="text-sm text-gray-500 line-through mb-1">
                                {formatCurrency(activity.price)}
                              </div>
                            )}
                          <div className="text-2xl font-bold text-red-500">
                            {formatCurrency(
                              activity.priceDiscount &&
                                activity.priceDiscount < activity.price
                                ? activity.priceDiscount
                                : activity.price
                            )}
                          </div>
                          {activity.priceDiscount &&
                            activity.price &&
                            activity.priceDiscount < activity.price && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                Hemat{" "}
                                {Math.round(
                                  (1 -
                                    activity.priceDiscount / activity.price) *
                                    100
                                )}
                                %
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={handleViewOfferClick}
                        className="w-full py-2 px-4 rounded-md font-medium border border-primary bg-primary hover:border-primary hover:bg-transparent hover:text-primary text-white transition duration-300 cursor-pointer"
                      >
                        View Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "facilities" && (
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Fasilitas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {facility ? (
                    <div className="flex items-center">
                      <Check size={18} className="text-green-500 mr-2" />
                      <span>{facility}</span>
                    </div>
                  ) : (
                    ALL_FACILITIES.map((facilityItem, index) => (
                      <div key={index} className="flex items-center">
                        <Check size={18} className="text-green-500 mr-2" />
                        <span>{facilityItem.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Lokasi</h2>

                {/* Interactive Map with Leaflet */}
                <div className="aspect-w-16 aspect-h-9 mb-4 h-96">
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: "0.5rem",
                    }}
                    className="rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold mb-2">Alamat Lengkap:</h3>
                    <button
                      onClick={openGoogleMaps}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <span className="mr-1">Buka di Google Maps</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                  <p className="text-gray-700">
                    {activity.address}, {activity.city}, {activity.province}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Ulasan</h2>
                  <div className="flex items-center">
                    <Star
                      className="text-yellow-500 fill-yellow-500 mr-1"
                      size={20}
                    />
                    <span className="font-bold text-lg">{activity.rating}</span>
                    <span className="text-gray-500 ml-2">
                      ({activity.totalReviews} ulasan)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SAMPLE_REVIEWS.map((review, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{review.name}</div>
                        <div className="flex items-center">
                          <Star
                            className="text-yellow-500 fill-yellow-500 mr-1"
                            size={16}
                          />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <div className="text-gray-400 text-sm mt-2">
                        Mengunjungi pada {review.date}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="text-blue-500 font-medium">
                    Lihat semua ulasan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 p-8">No activity found.</div>
      )}

      {/* Booking Offer Modal */}
      {showBookingOffer && (
        <BookingOffer activity={activity} onClose={handleCloseBookingOffer} />
      )}
    </div>
  );
}

export default ActivityDetail;
