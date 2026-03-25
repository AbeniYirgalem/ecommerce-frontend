import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HomeModernIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  EnvelopeOpenIcon,
  PencilSquareIcon, // <-- For 'Post'
  InformationCircleIcon, // <-- For 'About'
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { IoMoon, IoSunny } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import ServiceModal from "./TutorDashboard/ServiceModal";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    // Hide user menu on outside click
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser())
      .then(() => {
        localStorage.removeItem("authTokens");
        localStorage.removeItem("newUserData");
        sessionStorage.clear();

        console.log("Logout successful, redirecting to login page");
        navigate("/login", { replace: true });
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        localStorage.removeItem("authTokens");
        localStorage.removeItem("newUserData");
        sessionStorage.clear();
        navigate("/login", { replace: true });
      });
  };

  // Replace Post button logic for tutors
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/listings" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    // For tutors, Post redirects to My Services page
    user && user.is_tutor
      ? { name: "Post", onClick: () => navigate("/tutor-dashboard/services") }
      : { name: "Post", path: "/create" },
  ];

  let desktopNavLinks = [...navLinks];
  const dashboardLink = {
    name: "Dashboard",
    path: "/dashboard-redirect",
  };
  const postIndex = desktopNavLinks.findIndex((link) => link.name === "Post");
  if (postIndex !== -1) {
    desktopNavLinks.splice(postIndex + 1, 0, dashboardLink);
  } else {
    desktopNavLinks.push(dashboardLink);
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
        isScrolled
          ? "bg-white/70 dark:bg-[#0a1535]/80 shadow-2xl " // Reduced padding
          : "bg-white/30 dark:bg-[#0a1535]/40 " // Reduced padding
      }`}
    >
      {/* Glassmorphic & Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -top-10 left-1/3 w-72 h-72 rounded-full bg-[#152B67]/20 blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-10 right-1/4 w-56 h-56 rounded-full bg-blue-300/10 blur-3xl animate-pulse-slow"></div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo with animation */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src="/assets/unibazzar_log.webp"
              alt="UniBazzar Logo"
              className="w-10 drop-shadow-lg rounded-full p-1 border border-blue-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/default_user_1.webp";
              }}
            />
            <span
              className="hidden sm:inline-block text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#152B67] to-blue-400 bg-clip-text text-transparent animate-gradient-move"
              style={{
                WebkitTextStroke: "0.2px #52D7F8",
                textStroke: "0.2px #52D7F8",
              }}
            >
              UniBazzar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {desktopNavLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className="relative text-gray-800 dark:text-gray-200 font-medium px-2 py-1 transition group hover:text-blue-500 cursor-pointer bg-transparent border-none"
                  type="button"
                >
                  {link.name}
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative text-gray-800 dark:text-gray-200 font-medium px-2 py-1 transition group hover:text-blue-500"
                >
                  {link.name}
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                </Link>
              )
            )}
            <button
              onClick={() => {
                setIsToggling(true);
                toggleTheme();
                setTimeout(() => setIsToggling(false), 1500);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-lg text-gray-800 dark:text-gray-300 focus:outline-none cursor-pointer group"
              aria-label="Toggle Theme"
            >
              <motion.span
                key={isDarkMode ? "sun" : "moon"}
                initial={{ rotate: 0, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 360, scale: 1.1, opacity: 1 }}
                exit={{ rotate: -180, scale: 0.7, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="inline-block"
                style={{ willChange: "transform, opacity" }}
              >
                {isDarkMode ? (
                  <IoSunny className="drop-shadow-[0_0_8px_rgba(15,107,174,0.7)] text-xl" />
                ) : (
                  <IoMoon className="drop-shadow-[0_0_8px_rgba(15,107,174,0.7)] text-xl" />
                )}
              </motion.span>
            </button>
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="relative text-gray-800 dark:text-gray-300 hover:text-blue-500"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {/* User Icon Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="ml-2 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-400/60 to-[#152B67]/70 p-1.5 shadow-lg hover:scale-105 transition-transform border-2 border-white/30 focus:outline-none cursor-pointer"
                  >
                    <FaUserCircle className="text-white text-3xl drop-shadow-lg" />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        key="user-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 22,
                        }}
                        className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#0a1535] shadow-2xl ring-1 ring-blue-100/30 dark:ring-blue-900/40 z-50 p-4 flex flex-col gap-2"
                        style={{ minWidth: 180 }}
                      >
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate("/profilepage");
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          Profile
                        </button>
                        {user.is_tutor && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate("/tutor-dashboard");
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium cursor-pointer"
                          >
                            Tutor Dashboard
                          </button>
                        )}
                        {user.is_merchant && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate("/merchant-dashboard");
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium cursor-pointer"
                          >
                            Merchant Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-500 transition font-medium cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <IoSunny
                  className={`text-blue-400 ${
                    isToggling ? "animate-toggle-rotate" : ""
                  }`}
                />
              ) : (
                <IoMoon
                  className={`text-blue-400 ${
                    isToggling ? "animate-toggle-rotate" : ""
                  }`}
                />
              )}
            </button>
            <button
              type="button"
              className="text-gray-800 dark:text-gray-200 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
          </Transition.Child>
          <Dialog.Panel className="fixed inset-y-0 left-0 w-70 max-w-full bg-white/60 dark:bg-[#0a1535]/80 backdrop-blur-2xl shadow-2xl z-50 p-0 flex flex-col border-r border-blue-200/30 dark:border-blue-800/30 animate-slide-in">
            <div className="flex items-center justify-between px-6 pt-7 pb-2 border-b border-blue-100/30 dark:border-blue-900/30">
              <span className="flex items-center gap-2">
                <motion.img
                  src="/assets/unibazzar_log.webp"
                  alt="UniBazzar Logo"
                  className="h-9 w-9 drop-shadow-lg rounded-full bg-white/30 p-1 border border-blue-200 dark:bg-white/20"
                  initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/default_user_1.webp";
                  }}
                />
                <span className="text-lg font-bold bg-gradient-to-r from-[#152B67] to-blue-400 bg-clip-text text-transparent animate-gradient-move">
                  UniBazzar
                </span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-800 dark:text-gray-300 cursor-pointer rounded-full p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-2 px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-gray-700 dark:text-gray-200 cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name === "Home" && (
                    <HomeModernIcon className="w-5 h-5" />
                  )}
                  {link.name === "Marketplace" && (
                    <ShoppingBagIcon className="w-5 h-5" />
                  )}
                  {link.name === "About" && (
                    <InformationCircleIcon className="w-5 h-5" />
                  )}
                  {link.name === "Contact" && (
                    <EnvelopeOpenIcon className="w-5 h-5" />
                  )}
                  {link.name === "Post" && (
                    <PencilSquareIcon
                      className="w-5 h-5 "
                      title="Create or Post"
                    />
                  )}
                  {link.name}
                </Link>
              ))}
              <Link
                to="/dashboard-redirect"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <Squares2X2Icon className="w-5 h-5" />
                Dashboard
              </Link>
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-gray-700 dark:text-gray-200 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Cart ({cartCount})
                  </Link>
                  <Link
                    to="/profilepage"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    <FaUserCircle className="w-5 h-5" />
                    Profile
                  </Link>
                  <span className="text-gray-800 dark:text-gray-100 font-semibold px-4 py-2">
                    {user.name}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-md font-semibold mt-2 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-gray-700 dark:text-gray-200 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0V5.25A2.25 2.25 0 0015.75 3h-7.5A2.25 2.25 0 006 5.25V9m7.5 0h-7.5m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 008.25 19.5V9m7.5 0h-7.5"
                      />
                    </svg>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-3 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      {/* ServiceModal for tutors' Post button */}
      {showServiceModal && (
        <ServiceModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onSave={() => setShowServiceModal(false)}
        />
      )}
    </nav>
  );
}
