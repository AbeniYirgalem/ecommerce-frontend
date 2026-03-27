// src/utils/storage.js
// Type-safe localStorage helpers — centralises all localStorage access.

const AUTH_TOKENS_KEY = "authTokens";
const NEW_USER_DATA_KEY = "newUserData";
const THEME_KEY = "theme";
const CART_KEY = "cart";

// ---------- Auth Tokens ----------

export const getAuthTokens = () => {
  try {
    const raw = localStorage.getItem(AUTH_TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthTokens = (tokens) => {
  localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
};

export const removeAuthTokens = () => {
  localStorage.removeItem(AUTH_TOKENS_KEY);
};

// ---------- New User Data (post-registration) ----------

export const getNewUserData = () => {
  try {
    const raw = localStorage.getItem(NEW_USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setNewUserData = (data) => {
  localStorage.setItem(NEW_USER_DATA_KEY, JSON.stringify(data));
};

export const removeNewUserData = () => {
  localStorage.removeItem(NEW_USER_DATA_KEY);
};

// ---------- Theme ----------

export const getSavedTheme = () => {
  return localStorage.getItem(THEME_KEY);
};

export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

// ---------- Cart ----------

export const getSavedCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};
