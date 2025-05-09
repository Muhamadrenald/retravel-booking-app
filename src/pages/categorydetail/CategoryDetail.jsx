import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategoryById } from "../../services/categoryService";
import useActivitiesAPI from "../../hooks/useActivitiesAPI";
import ActivityCard from "../../components/activitycard/ActivityCard";

function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getActivitiesByCategory } = useActivitiesAPI();

  // Fetch category and its activities when component mounts or id changes
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);

        // Fetch category details
        const categoryResult = await getCategoryById(id);
        setCategory(categoryResult.data);

        // Fetch activities for this category
        const activitiesResult = await getActivitiesByCategory(id);
        setActivities(activitiesResult || []);

        setError(null);
      } catch (err) {
        setError("Gagal memuat detail kategori atau aktivitas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

  // Handler untuk navigasi ke halaman aktivitas with filter
  const handleViewAllActivities = () => {
    navigate(`/activities?category=${id}`);
  };

  // Handler untuk navigasi ke detail aktivitas
  const handleActivitySelect = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const defaultImage = "https://picsum.photos/200";

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  if (loading) {
    return (
      <div className="p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/categories")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
        <p className="text-gray-600">Category not found</p>
        <button
          onClick={() => navigate("/categories")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="category-detail-page p-8 w-full lg:px-24 md:px-16 sm:px-7 px-4">
      <div className="mb-6">
        <button
          onClick={() => navigate("/categories")}
          className="mb-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          ← Back to Categories
        </button>
      </div>

      <div className="category-header mb-8">
        {category.imageUrl && (
          <img
            src={category.imageUrl || defaultImage}
            alt={category.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
            onError={handleImageError}
          />
        )}
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-3">{category.description}</p>
        )}
      </div>

      <div className="category-activities">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Activities in this category
          </h2>
          <button
            className="px-4 py-2 bg-primary border border-primary hover:bg-transparent hover:border-primary hover:text-primary text-white rounded transition ease-in-out duration-300 cursor-pointer"
            onClick={handleViewAllActivities}
          >
            See All
          </button>
        </div>

        {activities.length > 0 ? (
          <div className="activities-list grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.slice(0, 3).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={handleActivitySelect}
                handleImageError={handleImageError}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">There is no activity in this category</p>
        )}
      </div>
    </div>
  );
}

export default CategoryDetail;
