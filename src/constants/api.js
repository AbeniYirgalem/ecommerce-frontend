// src/constants/api.js
// API endpoint path constants — centralizes all backend URL strings.

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  ME: "/api/auth/me",

  // Users
  PROFILE: "/api/users/profile",
  AVATAR: "/api/users/avatar",
  FAVORITES: (listingId) => `/api/users/favorites/${listingId}`,

  // Listings
  LISTINGS: "/api/listings",
  LISTING_DETAIL: (id) => `/api/listings/${id}`,

  // Reviews
  REVIEWS: "/api/reviews",
  REVIEW_DETAIL: (id) => `/api/reviews/${id}`,

  // Admin
  ADMIN_USERS: "/api/admin/users",
  ADMIN_STATS: "/api/admin/stats",
  ADMIN_LISTING_STATUS: (id) => `/api/admin/listings/${id}/status`,

  // Chatbot (legacy synchronous)
  CHAT: "/api/chat",
  // Chatbot queue (async BullMQ path)
  CHAT_QUEUE: "/api/chat/queue",
  // Poll a queued job's status + result
  CHAT_STATUS: (jobId) => `/api/chat/status/${jobId}`,
};

export default API_ENDPOINTS;
