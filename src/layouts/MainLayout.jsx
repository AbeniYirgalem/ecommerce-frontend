// src/layouts/MainLayout.jsx
// The primary public-facing layout: Navbar on top, Footer at bottom.
// Wrap any public page with <MainLayout> to get consistent chrome.

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot/Chatbot";
import ScrollToTop from "../components/ScrollToTop";

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
