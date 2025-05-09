import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ticket, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import usePromoApi from "../../hooks/usePromoApi";
import { API_CONFIG } from "../../api/config";
import { toast } from "react-toastify";

function PromoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const promoApi = usePromoApi();

  const defaultImage = "https://picsum.photos/200";

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  useEffect(() => {
    const fetchPromoDetails = async () => {
      try {
        setLoading(true);
        const response = await promoApi.fetchData(
          API_CONFIG.ENDPOINTS.PROMO_DETAIL(id)
        );
        setPromo(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load promotion details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPromoDetails();
    }
  }, [id]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" successfully copied!`, {
      position: "bottom-center",
      autoClose: 2000,
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading promotion details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center mb-2">
            <AlertCircle size={20} className="mr-2" />
            <h3 className="font-bold">Error</h3>
          </div>
          <p>{error}</p>
          <button
            onClick={() => navigate("/promo")}
            className="cursor-pointer mt-4 flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-transparent hover:text-primary hover:border-primary border border-primary transition ease-in-out duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Promotions
          </button>
        </div>
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <p className="text-gray-600 text-center">Promotion not found</p>
        <button
          onClick={() => navigate("/promo")}
          className="cursor-pointer mt-4 flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-transparent hover:text-primary hover:border-primary border border-primary transition ease-in-out duration-300 mx-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Promotions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <button
        onClick={() => navigate("/promo")}
        className="cursor-pointer mb-4 flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-transparent hover:text-primary hover:border-primary border border-primary transition ease-in-out duration-300"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Promotions
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 sm:h-80">
          <img
            src={promo.imageUrl || defaultImage}
            alt={promo.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {promo.title}
            </h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {promo.description || "No description available"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {promo.promo_discount_price && (
                <p className="text-green-600 font-semibold">
                  Discount: Rp{" "}
                  {new Intl.NumberFormat("id-ID").format(
                    promo.promo_discount_price
                  )}
                </p>
              )}
              {promo.minimum_claim_price ? (
                <p className="text-gray-500">
                  Min. Transaction: Rp{" "}
                  {new Intl.NumberFormat("id-ID").format(
                    promo.minimum_claim_price
                  )}
                </p>
              ) : (
                <p className="text-gray-500">Limited Offer</p>
              )}
            </div>
          </div>
          {promo.terms_condition && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Terms & Conditions
              </h2>
              <div
                className="text-gray-600 leading-relaxed prose"
                dangerouslySetInnerHTML={{
                  __html: promo.terms_condition,
                }}
              />
            </div>
          )}
          {promo.promo_code && (
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Promo Code
              </h2>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-primary" />
                  <span className="text-primary font-semibold">
                    {promo.promo_code}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(promo.promo_code)}
                  className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-transparent hover:text-primary hover:border-primary border border-primary transition-colors duration-300"
                >
                  Copy Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromoDetail;
