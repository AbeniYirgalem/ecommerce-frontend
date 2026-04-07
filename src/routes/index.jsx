// src/routes/index.jsx
// Centralized route definitions. App.jsx imports this and renders <AppRoutes />.
// Adding a new route = add one line here, zero changes to App.jsx.

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { ROUTES } from "../constants/routes";

// Pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ProductsPage from "../pages/ProductsPage";
import SimilarItemsPage from "../pages/SimilarItemsPage";
import ProductDetail from "../pages/ProductDetail";
import About from "../pages/About";
import Contact from "../pages/Contact";
import CartPage from "../pages/CartPage";
import ThankYou from "../pages/ThankYou";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ProfilePage from "../pages/ProfilePage";
import Account from "../pages/Accout";
import UserDashboard from "../pages/UserDashboard";
import CreateProductPage from "../pages/CreateProductPage";
import Chat from "../components/Chat/Chat";
import SignupCompletionHandler from "../components/SignupCompletionHandler";

export default function AppRoutes() {
  return (
    <Routes>
      {/* -- Public -- */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
      <Route path={ROUTES.SIMILAR_ITEMS} element={<SimilarItemsPage />} />
      <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.CHAT} element={<Chat />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.THANK_YOU} element={<ThankYou />} />

      {/* -- Email Verification & Password Reset -- */}
      <Route path="/verify/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* -- Signup Completion -- */}
      <Route
        path={ROUTES.SIGNUP_COMPLETE}
        element={<SignupCompletionHandler />}
      />

      {/* -- Protected: general -- */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profilepage"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_PRODUCT}
        element={
          <PrivateRoute>
            <CreateProductPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.ACCOUNT}
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.CART}
        element={
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
