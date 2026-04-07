// src/services/review.service.js
// Review / comment API service.

import api from "../lib/axios";
import { API_ENDPOINTS } from "../constants/api";

export const reviewService = {
  /** Get all reviews for a user. */
  getAll: (targetUserId) => api.get(API_ENDPOINTS.REVIEW_DETAIL(targetUserId)),

  /** Create a review. */
  create: (data) => api.post(API_ENDPOINTS.REVIEWS, data),
};

export default reviewService;

