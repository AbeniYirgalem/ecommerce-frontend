// src/services/auth.service.js
// Authentication API calls — thin wrappers over the Axios instance.
// Redux slices can import these instead of calling api.post() directly.

import api from "../lib/axios";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
  /**
   * Log in with email + password (bypasses interceptors to avoid token loops).
   */
  login: (email, password) =>
    axios.post(
      `${BASE_URL}/api/auth/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true, // needed to receive httpOnly cookie in cross-site scenarios
      },
    ),

  /**
   * Register a new user.
   */
  register: (userData) => api.post("/api/auth/register", userData),

  /**
   * Fetch the currently authenticated user profile.
   */
  fetchMe: () => api.get("/api/auth/me"),

  /**
   * Clear auth cookie on the server (useful when relying on cookies).
   */
  logout: () => api.post("/api/auth/logout"),
};

export default authService;
