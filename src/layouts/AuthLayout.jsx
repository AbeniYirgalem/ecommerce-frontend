// src/layouts/AuthLayout.jsx
// Minimal centered layout for auth pages (login, signup, password reset).
// No Navbar or Footer — keeps the focus on the auth form.

import ScrollToTop from "../components/ScrollToTop";

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <ScrollToTop />
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
