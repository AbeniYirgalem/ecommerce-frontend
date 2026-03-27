// src/services/user.service.js
// User profile API service.

import api from "../lib/axios";
import { API_ENDPOINTS } from "../constants/api";

export const userService = {
  /** Fetch the authenticated user. */
  getMe: () => api.get(API_ENDPOINTS.ME),

  /** Update user profile. */
  updateProfile: (data) => api.put(API_ENDPOINTS.PROFILE, data),
  
  /** Update user avatar. */
  updateAvatar: (formData) => api.put(API_ENDPOINTS.AVATAR, formData),
  
  /** Toggle favorite listing. */
  toggleFavorite: (listingId) => api.post(API_ENDPOINTS.FAVORITES(listingId)),
};

export default userService;
