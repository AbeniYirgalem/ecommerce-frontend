// src/services/listing.service.js
// Listing (marketplace item) API service.

import api from "../lib/axios";
import { API_ENDPOINTS } from "../constants/api";

export const listingService = {
  /** Get all listings (optionally filtered). */
  getAll: (params) => api.get(API_ENDPOINTS.LISTINGS, { params }),

  /** Get a single listing by ID. */
  getById: (id) => api.get(API_ENDPOINTS.LISTING_DETAIL(id)),

  /** Create a new listing (expects FormData). */
  create: (data) => api.post(API_ENDPOINTS.LISTINGS, data),

  /** Update a listing. */
  update: (id, data) => api.put(API_ENDPOINTS.LISTING_DETAIL(id), data),

  /** Delete a listing. */
  remove: (id) => api.delete(API_ENDPOINTS.LISTING_DETAIL(id)),
};

export default listingService;
