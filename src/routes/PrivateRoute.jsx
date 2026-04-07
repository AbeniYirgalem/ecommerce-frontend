// src/routes/PrivateRoute.jsx
// Auth guard -- redirects unauthenticated users to /login.
// Moved from src/components/PrivateRoute.jsx.

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

/**
 * @param {{ children: React.ReactNode }} props
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default PrivateRoute;
