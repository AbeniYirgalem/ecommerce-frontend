import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  clearError,
  fetchUserProfile,
} from "../redux/slices/authSlice";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user, token } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  // Check for messages in navigation state (e.g., verification messages)
  useEffect(() => {
    if (location.state?.message) {
      setVerificationMessage(location.state.message);
      // Clear the state so the message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  // Fetch user profile when tokens are available but user info isn't
  useEffect(() => {
    if (isAuthenticated && token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, token, user, dispatch]);

  // Redirect logic after authentication and user profile fetch
  useEffect(() => {
    const handleRedirect = async () => {
      if (isAuthenticated && user && token) {
        setIsCheckingProfile(true);
        setSuccessMessage("");

        try {
          setSuccessMessage("Successfully Logged In");
          navigate("/dashboard", { replace: true });
        } catch (error) {
          setErrorMessage("Login completed but redirect failed. Please retry.");
        } finally {
          setIsCheckingProfile(false);
        }
      }
    };

    handleRedirect();
  }, [isAuthenticated, user, token, navigate, dispatch]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      if (typeof error === "object") {
        // Format field errors
        const fieldErrors = Object.entries(error)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`,
          )
          .join("; ");
        setErrorMessage(fieldErrors);
      } else {
        setErrorMessage(error);
      }
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        dispatch(fetchUserProfile());
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleCloseError = () => {
    setErrorMessage("");
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4 pt-20 pb-20">
      <div className="w-full max-w-md my-auto">
        <div className="bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
          <div className="px-6 pt-8 pb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-poppins">
              Welcome to UniBazzar
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 font-inter">
              Sign in to your account
            </p>
          </div>

          {errorMessage && (
            <div className="px-6 pb-4">
              <Alert
                type="error"
                message={errorMessage}
                onClose={handleCloseError}
              />
            </div>
          )}

          {verificationMessage && (
            <div className="px-6 pb-4">
              <Alert
                type="info"
                message={verificationMessage}
                autoClose={false}
              />
            </div>
          )}

          {successMessage && (
            <div className="px-6 pb-4">
              <Alert type="success" message={successMessage} autoClose={true} />
            </div>
          )}

          <form className="px-6 pt-2 pb-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 pl-10 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder-gray-400 text-gray-800 dark:text-white"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pl-10 pr-10 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder-gray-400 text-gray-800 dark:text-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold flex justify-center items-center transition duration-300 shadow-md cursor-pointer"
                disabled={loading || isCheckingProfile}
              >
                {loading || isCheckingProfile ? "Logging in..." : "Login"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/signup"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

