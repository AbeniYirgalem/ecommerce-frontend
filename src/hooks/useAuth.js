// src/hooks/useAuth.js
// Selects auth state from Redux -- a clean, reusable hook for
// any component that needs to know if the user is authenticated.

import { useSelector } from "react-redux";

/**
 * Returns authentication state and the current user object from Redux.
 *
 * @returns {{ isAuthenticated: boolean, user: object|null, token: string|null, loading: boolean }}
 */
export const useAuth = () => {
  const { isAuthenticated, user, token, loading } = useSelector(
    (state) => state.auth,
  );
  return { isAuthenticated, user, token, loading };
};

export default useAuth;
