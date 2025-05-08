import { useState, useEffect } from "react";
import { API_CONFIG } from "../api/config";

const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    try {
      // Fetch list of banners
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BANNERS}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data banner");
      }

      const data = await response.json();
      const bannerList = data.data || [];

      // Fetch details for each banner
      const detailedBanners = await Promise.all(
        bannerList.map(async (banner) => {
          try {
            const detailResponse = await fetch(
              `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BANNER_DETAIL(
                banner.id
              )}`,
              {
                headers: {
                  apiKey: API_CONFIG.API_KEY,
                },
              }
            );

            if (!detailResponse.ok) {
              throw new Error(`Gagal mengambil detail banner ${banner.id}`);
            }

            const detailData = await detailResponse.json();
            return {
              ...banner,
              ...detailData.data, // Merge banner data with detailed data
            };
          } catch (detailError) {
            console.error(detailError.message);
            return banner; // Fallback to original banner data if detail fetch fails
          }
        })
      );

      setBanners(detailedBanners);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return { banners, loading, error };
};

export default useBanners;
