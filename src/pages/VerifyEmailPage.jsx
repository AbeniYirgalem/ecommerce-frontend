import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../redux/api/uniBazzarApi";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    hasVerified.current = true;

    api
      .get(`/api/auth/verify/${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may have expired.",
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Verifying your email...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4" aria-hidden="true">
              &#10003;
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() =>
                navigate("/login", {
                  replace: true,
                  state: { message: "Email verified. You can now log in." },
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4" aria-hidden="true">
              &#10007;
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
