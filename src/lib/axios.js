// src/lib/axios.js
// Centralized Axios instance with JWT auth interceptors and token refresh logic.
import axios from "axios";

// Lazily-injected store reference - avoids circular dependency with store.js
let storeInstance = null;
export const injectStore = (store) => {
  storeInstance = store;
};

const readPersistedToken = () => {
  try {
    const raw = localStorage.getItem("authTokens");
    if (!raw) return null;
    return JSON.parse(raw).access || null;
  } catch (err) {
    console.warn("Failed to read persisted auth token", err);
    return null;
  }
};

const clearPersistedAuth = () => {
  localStorage.removeItem("authTokens");
  localStorage.removeItem("newUserData");
  sessionStorage.clear();
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

const clearServerCookie = async () => {
  if (!import.meta.env.VITE_API_URL) return;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch (err) {
    // Silently ignore; cookie may already be gone
  }
};

// ---------- Retry parameters ----------
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

let handlingUnauthorized = false;

// Helper to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Request interceptor ----------
// Attaches the Bearer token from Redux state to every outgoing request.
api.interceptors.request.use(
  (config) => {
    let token = null;

    if (storeInstance) {
      token = storeInstance.getState().auth.token;
    }

    // Fallback to persisted token so first load still sends Authorization header
    if (!token) {
      token = readPersistedToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData so the browser sets the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ---------- Response interceptor ----------
// Handles 401 errors by logging the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    console.error(
      `API Error (${originalRequest?.url}):`,
      error.response?.status,
      error.response?.data || error.message,
    );

    // If unauthorized and not hitting auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/api/auth/login" &&
      originalRequest.url !== "/api/auth/register"
    ) {
      if (!handlingUnauthorized) {
        handlingUnauthorized = true;

        clearPersistedAuth();

        clearServerCookie();

        if (storeInstance) {
          storeInstance.dispatch({ type: "auth/logoutUser/fulfilled" });
        }

        // Redirect to login
        window.location.href = "/login";

        // Allow future 401 handling after a short debounce
        setTimeout(() => {
          handlingUnauthorized = false;
        }, 300);
      }
    }

    // Retry Logic for Network Errors or 5xx Server Errors
    const shouldRetry =
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600);

    // Initialize retry count if undefined
    if (originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (
      shouldRetry &&
      originalRequest &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount += 1;
      console.warn(
        `Retrying request to ${originalRequest.url} (Attempt ${originalRequest._retryCount} of ${MAX_RETRIES})...`,
      );
      return wait(RETRY_DELAY_MS * originalRequest._retryCount).then(() => {
        return api(originalRequest);
      });
    }

    return Promise.reject(error);
  },
);

export default api;

