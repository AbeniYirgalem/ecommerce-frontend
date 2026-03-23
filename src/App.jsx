// src/App.jsx
// Slim root component — all route definitions live in src/routes/index.jsx,
// all layout chrome (Navbar, Footer, Chatbot) lives in src/layouts/MainLayout.jsx.
// Theme logic lives in src/hooks/useTheme.js.

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserProfile } from "./store/slices/authSlice";
import { useTheme } from "./hooks/useTheme";
import AppRoutes from "./routes/index";
import MainLayout from "./layouts/MainLayout";

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  useTheme(); // initialise dark/light mode from localStorage

  useEffect(() => {
    if (isAuthenticated && token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, token, user, dispatch]);

  return (
    <MainLayout>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AppRoutes />
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
