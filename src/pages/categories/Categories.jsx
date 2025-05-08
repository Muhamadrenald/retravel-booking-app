import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/categoryService";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState(4);
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await getAllCategories();
        const fetchedCategories = result.data || [];
        setCategories(fetchedCategories);
        setHasMore(fetchedCategories.length > visibleCategories);
        setError(null);
      } catch (err) {
        setError("Gagal memuat kategori");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [visibleCategories]);

  // Handler untuk navigasi ke detail kategori
  const handleCategorySelect = (categoryId) => {
    navigate(`/categories/${categoryId}`);
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
    </div>
  );
}

export default Categories;
