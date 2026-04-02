// src/constants/api.js
// API endpoint path constants - centralizes all backend URL strings.

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  ME: "/api/auth/me",

  // Users
  PROFILE: "/api/users/profile",
  AVATAR: "/api/users/avatar",
  FAVORITES: (productId) => `/api/users/favorites/${productId}`,

  // PRODUCTS
  PRODUCTS: "/api/products",
  PRODUCT_DETAIL: (id) => `/api/products/${id}`,

  // Reviews
  REVIEWS: "/api/reviews",
  REVIEW_DETAIL: (id) => `/api/reviews/${id}`,

  // Chatbot (legacy synchronous)
  CHAT: "/api/chat",
  // Chatbot queue (async BullMQ path)
  CHAT_QUEUE: "/api/chat/queue",
  // Poll a queued job's status + result
  CHAT_STATUS: (jobId) => `/api/chat/status/${jobId}`,
};

export default API_ENDPOINTS;
