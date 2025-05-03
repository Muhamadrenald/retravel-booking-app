/**
 * Formats a number as Indonesian currency (Rupiah)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `Rp ${amount?.toLocaleString("id-ID") || "0"}`;
};

/**
 * Calculate discount percentage based on original and discounted price
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage as integer
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || discountedPrice >= originalPrice) {
    return 0;
  }
  return Math.round((1 - discountedPrice / originalPrice) * 100);
};

/**
 * Calculate cashback amount based on price and cashback percentage
 * @param {number} price - Price to calculate cashback from
 * @param {number} percentage - Cashback percentage as decimal (e.g., 0.033 for 3.3%)
 * @returns {number} Cashback amount
 */
export const calculateCashback = (price, percentage) => {
  return Math.round(price * percentage);
};

/**
 * Calculate total price with tax
 * @param {number} basePrice - Base price
 * @param {number} quantity - Quantity
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns {number} Total price with tax
 */
export const calculateTotalWithTax = (basePrice, quantity, taxRate) => {
  const subtotal = basePrice * quantity;
  return subtotal * (1 + taxRate);
};

/**
 * Calculate tax amount
 * @param {number} basePrice - Base price
 * @param {number} quantity - Quantity
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns {number} Tax amount
 */
export const calculateTaxAmount = (basePrice, quantity, taxRate) => {
  const subtotal = basePrice * quantity;
  return subtotal * taxRate;
};
