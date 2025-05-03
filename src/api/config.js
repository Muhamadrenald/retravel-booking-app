export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  ENDPOINTS: {
    // Authentication
    LOGIN: "/login",
    REGISTER: "/register",
    LOGOUT: "/logout",

    // User
    CURRENT_USER: "/user",
    ALL_USERS: "/all-user",
    UPDATE_PROFILE: "/update-profile",
    UPDATE_USER_ROLE: (userId) => `/update-user-role/${userId}`,

    // Banner
    CREATE_BANNER: "/create-banner",
    UPDATE_BANNER: (bannerId) => `/update-banner/${bannerId}`,
    DELETE_BANNER: (bannerId) => `/delete-banner/${bannerId}`,
    BANNERS: "/banners",
    BANNER_DETAIL: (bannerId) => `/banner/${bannerId}`,

    // Promo
    CREATE_PROMO: "/create-promo",
    UPDATE_PROMO: (promoId) => `/update-promo/${promoId}`,
    DELETE_PROMO: (promoId) => `/delete-promo/${promoId}`,
    PROMOS: "/promos",
    PROMO_DETAIL: (promoId) => `/promo/${promoId}`,

    // Category
    CREATE_CATEGORY: "/create-category",
    UPDATE_CATEGORY: (categoryId) => `/update-category/${categoryId}`,
    DELETE_CATEGORY: (categoryId) => `/delete-category/${categoryId}`,
    CATEGORIES: "/categories",
    CATEGORY_DETAIL: (categoryId) => `/category/${categoryId}`,

    // Activity
    CREATE_ACTIVITY: "/create-activity",
    ACTIVITIES: "/activities",
    ACTIVITY_DETAIL: (activityId) => `/activity/${activityId}`,
    ACTIVITIES_BY_CATEGORY: (categoryId) =>
      `/activities-by-category/${categoryId}`,
    UPDATE_ACTIVITY: (activityId) => `/update-activity/${activityId}`,
    DELETE_ACTIVITY: (activityId) => `/delete-activity/${activityId}`,

    // Payment Method
    PAYMENT_METHODS: "/payment-methods",
    GENERATE_PAYMENT_METHODS: "/generate-payment-methods",

    // Cart
    ADD_TO_CART: "/add-cart",
    UPDATE_CART: (cartId) => `/update-cart/${cartId}`,
    DELETE_CART: (cartId) => `/delete-cart/${cartId}`,
    CARTS: "/carts",

    // Transaction
    TRANSACTION: "/transaction",
    MY_TRANSACTIONS: "/my-transactions",
    ALL_TRANSACTIONS: "/all-transactions",
    CREATE_TRANSACTION: "/create-transaction",
    CANCEL_TRANSACTION: (transactionId) =>
      `/cancel-transaction/${transactionId}`,
    UPDATE_TRANSACTION_PROOF: (transactionId) =>
      `/update-transaction-proof-payment/${transactionId}`,
    UPDATE_TRANSACTION_STATUS: (transactionId) =>
      `/update-transaction-status/${transactionId}`,

    // Upload
    UPLOAD_IMAGE: "/upload-image",
  },
};
