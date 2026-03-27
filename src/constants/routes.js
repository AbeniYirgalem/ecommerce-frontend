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

  // Marketplace / Listings
  LISTINGS: "/listings",
  LISTING_DETAIL: "/listing/:id",
  SIMILAR_ITEMS: "/similar/:id",
  PRODUCT_DETAIL: "/products/:id",

  // User
  PROFILE: "/profile",
  ACCOUNT: "/account",
  CART: "/cart",
  CHAT: "/chat",

  // Profile forms
  PROFILE_STUDENT_CREATE: "/profile/student/create",
  PROFILE_STUDENT_EDIT: "/profile/student/edit",
  PROFILE_MERCHANT_CREATE: "/profile/merchant/create",
  PROFILE_MERCHANT_EDIT: "/profile/merchant/edit",
  PROFILE_TUTOR_CREATE: "/profile/tutor/create",
  PROFILE_TUTOR_EDIT: "/profile/tutor/edit",

  // Create listing
  CREATE_LISTING: "/create",

  // Dashboard
  DASHBOARD: "/dashboard",
  DASHBOARD_REDIRECT: "/dashboard-redirect",
  STUDENT_DASHBOARD: "/student-dashboard",
  MERCHANT_DASHBOARD: "/merchant-dashboard",
  MERCHANT_PRODUCTS: "/merchant/products",
  MERCHANT_EARNINGS: "/merchant/earnings",
  TUTOR_DASHBOARD: "/tutor-dashboard",
  ADMIN_DASHBOARD: "/admin-dashboard",
  CAMPUS_ADMIN_DASHBOARD: "/campusadmindashboard",
};

export default ROUTES;
