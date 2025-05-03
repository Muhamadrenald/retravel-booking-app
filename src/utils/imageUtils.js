// src/utils/imageUtils.js

/**
 * Memvalidasi dan mengembalikan URL gambar yang valid, dengan fallback ke placeholder
 * @param {string} url - URL gambar yang akan divalidasi
 * @param {number} width - Lebar gambar placeholder (default: 400)
 * @param {number} height - Tinggi gambar placeholder (default: 320)
 * @returns {string} - URL gambar valid atau placeholder
 */
export const validateImageUrl = (url, width = 400, height = 320) => {
  // Periksa apakah URL ada dan merupakan string yang valid
  if (!url || typeof url !== "string" || url.trim() === "") {
    return `/api/placeholder/${width}/${height}`;
  }

  // Periksa apakah URL memiliki format yang valid
  try {
    new URL(url);
    return url;
  } catch (e) {
    // Jika URL tidak valid, kembalikan placeholder
    return `/api/placeholder/${width}/${height}`;
  }
};

/**
 * Menangani kesalahan pemuatan gambar dengan menggantikannya dengan placeholder
 * @param {Event} event - Event error dari elemen img
 * @param {number} width - Lebar gambar placeholder (default: 400)
 * @param {number} height - Tinggi gambar placeholder (default: 320)
 */
export const handleImageError = (event, width = 400, height = 320) => {
  event.target.src = `/api/placeholder/${width}/${height}`;
  // Tambahkan alt text jika belum ada
  if (!event.target.alt || event.target.alt === "") {
    event.target.alt = "Gambar tidak tersedia";
  }
};

/**
 * Memproses array URL gambar untuk memastikan setiap URL valid
 * @param {Array} imageUrls - Array URL gambar
 * @param {number} width - Lebar gambar placeholder (default: 400)
 * @param {number} height - Tinggi gambar placeholder (default: 320)
 * @returns {Array} - Array URL gambar yang telah divalidasi
 */
export const processImageArray = (imageUrls, width = 400, height = 320) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return [`/api/placeholder/${width}/${height}`];
  }

  return imageUrls.map((url) => validateImageUrl(url, width, height));
};
