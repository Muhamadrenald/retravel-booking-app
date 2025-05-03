import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RootLayout from "../../layouts/RootLayout";
import { getAllCategories, getCategoryById } from "../../api/categoryService";
import useActivitiesAPI from "../../hooks/useActivitiesAPI";
import ActivityCard from "../../components/activitycard/ActivityCard";

function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryActivities, setCategoryActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState(4);
  const [hasMore, setHasMore] = useState(true);

  const { getActivitiesByCategory } = useActivitiesAPI();

  // Check for category ID in URL when component mounts
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("category");

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await getAllCategories();
        const fetchedCategories = result.data || [];
        setCategories(fetchedCategories);
        setHasMore(fetchedCategories.length > visibleCategories);

        // If there's a category ID in URL, load that category
        if (categoryIdFromUrl) {
          handleCategorySelect(categoryIdFromUrl);
        }

        setError(null);
      } catch (err) {
        setError("Gagal memuat kategori");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [visibleCategories, searchParams]);

  // Handler untuk memilih kategori
  const handleCategorySelect = async (categoryId) => {
    try {
      setLoading(true);

      // Update URL dengan menambahkan parameter category
      navigate(`?category=${categoryId}`, { replace: true });

      // Fetch detail kategori
      const categoryDetail = await getCategoryById(categoryId);
      setSelectedCategory(categoryDetail.data);

      // Fetch aktivitas berdasarkan kategori
      const activities = await getActivitiesByCategory(categoryId);
      setCategoryActivities(activities || []);

      setError(null);
    } catch (err) {
      setError("Gagal memuat detail kategori atau aktivitas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk navigasi ke halaman aktivitas
  const handleViewAllActivities = (categoryId) => {
    navigate(`/activities?category=${categoryId}`);
  };

  // Handler untuk navigasi ke detail aktivitas
  const handleActivitySelect = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  // Handler untuk load more categories
  const handleLoadMore = () => {
    const newVisibleCount = visibleCategories + 4;
    setVisibleCategories(newVisibleCount);
    setHasMore(categories.length > newVisibleCount);
  };

  const defaultImage = "https://picsum.photos/200";

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="categories-page p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
      <h1 className="text-3xl text-neutral-800 font-bold mb-6 text-center">
        Travel <span className="text-primary">Category</span>
      </h1>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="categories-list grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {categories.slice(0, visibleCategories).map((category) => (
          <div
            key={category.id}
            className="category-item cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            onClick={() => handleCategorySelect(category.id)}
          >
            <img
              src={category.imageUrl || defaultImage}
              alt={category.name}
              className="h-48 w-full object-cover"
              onError={handleImageError}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">{category.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-primary border border-primary hover:bg-transparent hover:border-primary hover:text-primary text-white rounded cursor-pointer transition ease-in-out duration-300"
          >
            Load More
          </button>
        </div>
      )}

      {selectedCategory && (
        <div className="category-detail border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">{selectedCategory.name}</h2>
          {selectedCategory.description && (
            <p className="text-gray-600 mb-6">{selectedCategory.description}</p>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Activities in this category
            </h3>
            <button
              className="px-4 py-2 bg-primary border border-primary hover:bg-transparent hover:border-primary hover:text-primary text-white rounded transition ease-in-out duration-300 cursor-pointer"
              onClick={() => handleViewAllActivities(selectedCategory.id)}
            >
              See All
            </button>
          </div>

          {categoryActivities.length > 0 ? (
            <div className="activities-list grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryActivities.slice(0, 3).map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivitySelect}
                  handleImageError={handleImageError}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              There is no activity in this category
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Categories;
