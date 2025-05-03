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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import usePromoApi from "../../hooks/usePromoApi";
import { API_CONFIG } from "../../api/config";

function Promo() {
  const [showToast, setShowToast] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { promoId } = useParams();
  const location = useLocation();

  const promosApi = usePromoApi(API_CONFIG.ENDPOINTS.PROMOS);
  const promoDetailApi = usePromoApi();

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if we're at the beginning of the scroll
    setShowLeftArrow(container.scrollLeft > 0);

    // Check if we're at the end of the scroll
    const isAtEnd =
      Math.ceil(container.scrollLeft + container.clientWidth) >=
      container.scrollWidth;
    setShowRightArrow(!isAtEnd);
  };

  // Fetch promos on initial load
  useEffect(() => {
    promosApi.fetchData();
  }, []);

  // Fetch promo detail when promoId changes
  useEffect(() => {
    if (promoId) {
      promoDetailApi.fetchData(API_CONFIG.ENDPOINTS.PROMO_DETAIL(promoId));
    } else {
      promoDetailApi.reset();

      // Reset scroll position when returning to list view
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
        setShowLeftArrow(false);
        setShowRightArrow(true);
      }
    }
  }, [promoId]);

  // Setup scroll event listeners and initial check
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && !promoId) {
      // Reset scroll position
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
  }, [promosApi.data, promoId, location.pathname]); // Re-run when data, promoId, or location changes

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
      title?.toLowerCase().includes("liburan")
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

  const handleBackToList = () => {
    navigate("/promo");
  };

  const handleViewDetail = (id) => {
    navigate(`/promos/${id}`);
  };

  const promos = promosApi.data?.data || [];
  const selectedPromo = promoDetailApi.data?.data;

  if (promosApi.loading && !promos.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading promo...</p>
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
              <h3 className="font-bold">Gagal memuat promo</h3>
            </div>
            <p>{promosApi.error}</p>
            <button
              onClick={() => promosApi.fetchData()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (promoId) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <button
          onClick={handleBackToList}
          className="flex items-center px-4 py-2 rounded-l-2xl bg-primary border border-primary hover:bg-transparent hover:border-primary hover:text-primary text-white mb-2  duration-300 cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to all promos
        </button>

        {promoDetailApi.loading && (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        )}

        {promoDetailApi.error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Gagal memuat detail promo</h3>
            <p>{promoDetailApi.error}</p>
            <button
              onClick={() =>
                promoDetailApi.fetchData(
                  API_CONFIG.ENDPOINTS.PROMO_DETAIL(promoId)
                )
              }
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {selectedPromo && !promoDetailApi.loading && !promoDetailApi.error && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedPromo.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img
                  src={selectedPromo.imageUrl}
                  alt={selectedPromo.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                {renderIcon(selectedPromo.title)}
                <div>
                  <h2 className="text-xl font-bold">{selectedPromo.title}</h2>
                  <div className="text-gray-500">
                    {selectedPromo.promo_discount_price && (
                      <p className="text-green-600 font-medium">
                        Diskon Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          selectedPromo.promo_discount_price
                        )}
                      </p>
                    )}
                    {selectedPromo.minimum_claim_price ? (
                      <p>
                        Min. transaksi Rp{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          selectedPromo.minimum_claim_price
                        )}
                      </p>
                    ) : (
                      <p>Penawaran terbatas</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Deskripsi</h3>
                <p className="text-gray-600">
                  {selectedPromo.description || "Tidak ada deskripsi tersedia"}
                </p>
              </div>

              {selectedPromo.terms_condition && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Syarat & Ketentuan
                  </h3>
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: selectedPromo.terms_condition,
                    }}
                  />
                </div>
              )}

              {selectedPromo.promo_code && (
                <div className="mt-8 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Ticket size={18} className="text-primary" />
                        <span className="text-primary font-medium">
                          {selectedPromo.promo_code}
                        </span>
                      </div>
                      {selectedPromo.promo_discount_price && (
                        <span className="text-green-600 text-sm ml-6 mt-1">
                          Hemat hingga Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            selectedPromo.promo_discount_price
                          )}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(selectedPromo.promo_code)}
                      className="px-6 py-2 bg-primary hover:text-primary border border-primary hover:bg-transparent text-white rounded-full text-sm font-medium transition duration-300 ease-in-out cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <div className="flex items-center gap-2 justify-center">
          <Gift size={24} className="text-primary" />
          <h2 className="text-3xl font-bold text-neutral-800">
            Promo <span className="text-primary">Tersedia</span>
          </h2>
        </div>
        <p className="text-neutral-800 mt-1 text-center">
          Penawaran eksklusif{" "}
          <span className="text-primary">untuk petualangan berikutnya</span>
        </p>
      </div>

      {!promosApi.loading && promos.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-2">
            Tidak ada promo tersedia saat ini
          </div>
          <button
            onClick={() => promosApi.fetchData()}
            className="px-4 py-2 bg-blue-100 text-primary rounded-md hover:bg-blue-200"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {promos.length > 0 && (
        <div className="relative">
          {promos.length > 2 && showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10"
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
                className="bg-white rounded-lg shadow-md p-4 min-w-[300px] border border-gray-100 flex flex-col"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {renderIcon(promo.title)}
                    <div>
                      <h3 className="font-medium">{promo.title}</h3>
                      {promo.promo_discount_price && (
                        <p className="text-green-600 text-sm font-medium">
                          Diskon Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            promo.promo_discount_price
                          )}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        {promo.minimum_claim_price
                          ? `min. transaksi Rp${new Intl.NumberFormat(
                              "id-ID"
                            ).format(promo.minimum_claim_price)}`
                          : "Penawaran terbatas"}
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
                    <div className="flex items-center gap-1">
                      <Ticket size={16} className="text-primary" />
                      <span className="text-primary font-medium">
                        {promo.promo_code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(promo.promo_code)}
                      className="px-6 py-2 rounded-full text-sm font-medium bg-primary hover:text-primary border border-primary hover:bg-transparent text-white transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                      Salin
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {promos.length > 2 && showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary border border-gray-200 z-10"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-up">
          Kode "{copiedCode}" berhasil disalin!
        </div>
      )}
    </div>
  );
}

export default Promo;
