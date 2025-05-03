import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useActivitiesAPI from "../../hooks/useActivitiesAPI";
import { getAllCategories } from "../../api/categoryService";
import ActivityCard from "../../components/activitycard/ActivityCard";

function Activities() {
  const { id } = useParams(); // Ambil ID dari URL kalau ada
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get("category");

  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryIdFromUrl || null
  );
  const [totalActivities, setTotalActivities] = useState(0);
  const itemsPerPage = 3;

  // State for scroll arrows visibility - from Promo component
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const {
    getAllActivities,
    getActivityById,
    getActivitiesByCategory,
    isLoading,
    error,
  } = useActivitiesAPI();

  // Reference for scrollable category container
  const categoryRef = useRef(null);

  // Function to check scroll position - from Promo component
  const checkScrollPosition = () => {
    const container = categoryRef.current;
    if (!container) return;

    // Check if we're at the beginning of the scroll
    setShowLeftArrow(container.scrollLeft > 0);

    // Check if we're at the end of the scroll
    const isAtEnd =
      Math.ceil(container.scrollLeft + container.clientWidth) >=
      container.scrollWidth;
    setShowRightArrow(!isAtEnd);
  };

  // Fetch categories from API (integration with categoryService)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch activities based on category or all activities
  useEffect(() => {
    const fetchActivities = async () => {
      let activitiesData;

      if (categoryIdFromUrl) {
        setSelectedCategory(categoryIdFromUrl);
        activitiesData = await getActivitiesByCategory(categoryIdFromUrl);
      } else {
        activitiesData = await getAllActivities();
      }

      setDestinations(activitiesData);
      setTotalActivities(activitiesData.length);
    };

    fetchActivities();
  }, [categoryIdFromUrl]);

  useEffect(() => {
    const fetchDetailIfNeeded = async () => {
      if (id) {
        const detail = await getActivityById(id);
        setSelectedActivity(detail);
      }
    };

    fetchDetailIfNeeded();
  }, [id]);

  // Setup scroll event listeners and initial check - from Promo component
  useEffect(() => {
    const container = categoryRef.current;
    if (container && !id) {
      // Reset scroll position when returning to list view
      container.scrollLeft = 0;

      // Initial check after a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        checkScrollPosition();
      }, 100);

      // Add scroll event listener
      container.addEventListener("scroll", checkScrollPosition);

      // Add resize event listener to re-check when window size changes
      window.addEventListener("resize", checkScrollPosition);

      // Clean up
      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [categories, id, location.pathname]); // Re-run when data, id, or location changes

  const handleCategorySelect = async (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      const activitiesData = await getAllActivities();
      setDestinations(activitiesData);
      // Update URL to remove category parameter
      navigate("/activities");
    } else {
      setSelectedCategory(categoryId);
      const filteredActivities = await getActivitiesByCategory(categoryId);
      setDestinations(filteredActivities);
      // Update URL with category parameter
      navigate(`/activities?category=${categoryId}`);
    }
    setCurrentPage(1);
  };

  const handleActivitySelect = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
    if (categoryIdFromUrl) {
      navigate(`/activities?category=${categoryIdFromUrl}`);
    } else {
      navigate("/activities");
    }
  };

  // Calculate total pages based on totalActivities
  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  // Calculate the start index for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Slice the destinations based on current page
  const visibleDestinations = destinations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Default image if activity image fails to load
  const defaultImage = "https://picsum.photos/200";

  // Fallback function for image
  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  // Function to scroll categories left - from Promo component
  const scrollLeft = () => {
    categoryRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  // Function to scroll categories right - from Promo component
  const scrollRight = () => {
    categoryRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="activities-page p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading activities...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
            <div className="flex items-center mb-2">
              <AlertCircle size={20} className="mr-2" />
              <h3 className="font-bold">Failed to load activities</h3>
            </div>
            <p>{error}</p>
            <button
              onClick={() => getAllActivities()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : selectedActivity ? (
        <div className="activity-detail">
          <button
            onClick={handleBackToList}
            className="flex items-center px-4 py-2 rounded-l-2xl bg-primary border border-primary hover:bg-transparent hover:border-primary hover:text-primary text-white mb-4 duration-300 cursor-pointer"
          >
            <ArrowLeft className="mr-2" size={18} /> Back to activities
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedActivity.images && selectedActivity.images.length > 0 && (
              <div className="h-48 overflow-hidden">
                <img
                  src={selectedActivity.images[0]}
                  alt={selectedActivity.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                {selectedActivity.name}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedActivity.description}
              </p>

              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">
                  Location Details
                </h3>
                <p className="text-gray-600">
                  <strong>Address:</strong> {selectedActivity.address}
                </p>
                <p className="text-gray-600">
                  <strong>Province:</strong> {selectedActivity.province}
                </p>
                <p className="text-gray-600">
                  <strong>City:</strong> {selectedActivity.city}
                </p>
              </div>

              {selectedActivity.images &&
                selectedActivity.images.length > 1 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-2">Photos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedActivity.images.slice(1).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${selectedActivity.name} image ${idx + 1}`}
                          className="rounded w-full h-32 object-cover"
                          onError={handleImageError}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {selectedActivity.location_maps && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Location Map
                  </h3>
                  <a
                    href={selectedActivity.location_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl text-neutral-800 font-bold mb-6">
            Travel <span className="text-primary">Activity</span>
          </h1>

          {/* Categories with Scroll and Arrow Buttons - improved with Promo logic */}
          <div className="relative mb-6">
            {categories.length > 0 && showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/3 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              ref={categoryRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-12 pb-2 scroll-smooth"
              onScroll={checkScrollPosition}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {categories.length > 0 && showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/3 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {destinations.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-500 mb-2">
                No activities available at this time
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  getAllActivities();
                }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:border-primary hover:bg-transparent hover:text-primary border border-primary transition-colors cursor-pointer"
              >
                Reload
              </button>
            </div>
          ) : (
            <>
              <div className="activities-list grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleDestinations.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={handleActivitySelect}
                    handleImageError={handleImageError}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={currentPage === 1 ? null : goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => goToPage(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                          ? "bg-primary text-white"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={currentPage === totalPages ? null : goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Displaying total activities */}
              <div className="total-activities mt-4 text-center">
                <p className="text-gray-600">
                  Total Activities: {totalActivities}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Activities;
