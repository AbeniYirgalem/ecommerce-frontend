// src/layouts/DashboardLayout.jsx
// Shared shell for all dashboard pages (student, merchant, tutor, admin).
// Pages that need a dashboard frame should wrap themselves with this layout.

import ScrollToTop from "../components/ScrollToTop";

/**
 * @param {{ children: React.ReactNode, sidebar?: React.ReactNode }} props
 */
export default function DashboardLayout({ children, sidebar }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <ScrollToTop />
      <div className="flex">
        {sidebar && (
          <aside className="w-64 shrink-0">{sidebar}</aside>
        )}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
