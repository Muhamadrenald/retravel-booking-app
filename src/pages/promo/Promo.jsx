import {
  Gift,
  Info,
  Ticket,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePromoApi from "../../hooks/usePromoApi";
import { API_CONFIG } from "../../api/config";

function Promo() {
  const [showToast, setShowToast] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const promosApi = usePromoApi(API_CONFIG.ENDPOINTS.PROMOS);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    const isAtEnd =
      Math.ceil(container.scrollLeft + container.clientWidth) >=
      container.scrollWidth;
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    promosApi.fetchData();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollLeft = 0;
      setTimeout(() => {
        checkScrollPosition();
      }, 100);

      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [promosApi.data, location.pathname]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const renderIcon = (title) => {
    let bgColor = "bg-red-100";
    let iconColor = "#f50a0a";

    if (
      title?.toLowerCase().includes("hotel") ||
      title?.toLowerCase().includes("staycation")
    ) {
      bgColor = "bg-red-100";
      iconColor = "#f50a0a";
    } else if (
      title?.toLowerCase().includes("experience") ||
      title?.toLowerCase().includes("xperience") ||
      title?.toLowerCase().includes("holiday")
    ) {
      bgColor = "bg-red-100";
      iconColor = "#ef4444";
    } else if (
      title?.toLowerCase().includes("airport") ||
      title?.toLowerCase().includes("transport")
    ) {
      bgColor = "bg-cyan-100";
      iconColor = "#06b6d4";
    }

    return (
      <div
        className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <Ticket size={16} color={iconColor} />
      </div>
    );
  };

  const handleViewDetail = (id) => {
    navigate(`/promos/${id}`);
  };

  const promos = promosApi.data?.data || [];

  if (promosApi.loading && !promos.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        agrí{" "}
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  if (promosApi.error && !promos.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
            <div className="flex items-center mb-2">
              <AlertCircle size={20} className="mr-2" />
              <h3 className="font-bold">Failed to load promotions</h3>
            </div>
            <p>{promosApi.error}</p>
            <button
              onClick={() => promosApi.fetchData()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Gift size={28} className="text-primary" />
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800">
            Available <span className="text-primary">Promotions</span>
          </h2>
        </div>
        <p className="text-neutral-600 mt-2 text-lg">
          Exclusive offers{" "}
          <span className="text-primary">for your next adventure</span>
        </p>
      </div>

      {!promosApi.loading && promos.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            No promotions available at the moment
          </div>
          <button
            onClick={() => promosApi.fetchData()}
            className="px-4 py-2 bg-blue-100 text-primary rounded-md hover:bg-blue-200"
          >
            Reload
          </button>
        </div>
      )}

      {promos.length > 0 && (
        <div className="relative">
          {promos.length > 2 && showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10 hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth px-12"
            onScroll={checkScrollPosition}
          >
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-lg shadow-md p-4 min-w-[300px] border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {renderIcon(promo.title)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {promo.title}
                      </h3>
                      {promo.promo_discount_price && (
                        <p className="text-green-600 text-sm font-medium">
                          Discount Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            promo.promo_discount_price
                          )}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        {promo.minimum_claim_price
                          ? `Min. transaction Rp${new Intl.NumberFormat(
                              "id-ID"
                            ).format(promo.minimum_claim_price)}`
                          : "Limited offer"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(promo.id)}
                    className="text-gray-400 hover:text-primary cursor-pointer"
                  >
                    <Info size={20} />
                  </button>
                </div>

                {promo.promo_code && (
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-primary" />
                      <span className="text-primary font-medium">
                        {promo.promo_code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(promo.promo_code)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary hover:text-primary border border-primary hover:bg-transparent text-white transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {promos.length > 2 && showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10 hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-up">
          Code "{copiedCode}" successfully copied!
        </div>
      )}
    </div>
  );
}

export default Promo;
