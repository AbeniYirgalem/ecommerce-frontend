// src/constants/routes.js
// Single source of truth for all client-side route paths.
// Use these constants in <Link to={ROUTES.HOME}> and navigate(ROUTES.LOGIN) etc.

export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  UNAUTHORIZED: "/unauthorized",
  THANK_YOU: "/thank-you",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  SIGNUP_COMPLETE: "/signup/complete",

  // Marketplace / products
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  SIMILAR_ITEMS: "/similar/:id",

  // User
  PROFILE: "/profile",
  ACCOUNT: "/account",
  CART: "/cart",
  CHAT: "/chat",

  // Profile forms
  // Create product
  CREATE_PRODUCT: "/create",

  // Dashboard
  DASHBOARD: "/dashboard",
};

export default ROUTES;
