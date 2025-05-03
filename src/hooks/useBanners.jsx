import { useState, useEffect } from "react";
import { API_CONFIG } from "../api/config";

const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    try {
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
      setBanners(data.data || []);
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
