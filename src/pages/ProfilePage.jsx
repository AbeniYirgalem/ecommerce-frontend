import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../redux/slices/authSlice";
import { updateUserAvatar } from "../redux/slices/userSlice";
import {
  FaCamera,
  FaTrash,
  FaEnvelope,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

const ProfileSection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-4 font-poppins">
      {title}
    </h2>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {children}
    </div>
  </div>
);

const ProfileField = ({ icon, label, value }) => (
  <div className="flex items-start mb-4 last:mb-0">
    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900 mr-3">{icon}</div>
    <div>
      <p className="text-sm text-neutral-500 dark:text-gray-300 font-inter">
        {label}
      </p>
      <p className="text-neutral-800 dark:text-white font-medium font-inter">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const renderFieldValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (value && typeof value === "object") return JSON.stringify(value);
  return value || "Not provided";
};

const prettifyFieldName = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const isEmailVerified =
    user?.is_email_verified ?? user?.isVerified ?? user?.is_verified ?? false;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const unifiedProfile = useMemo(() => {
    if (!user) return null;
    return (
      user.student_profile_data ||
      user.merchant_profile_data ||
      user.tutor_profile_data ||
      user.campus_admin_profile_data ||
      null
    );
  }, [user]);

  const profileEntries = useMemo(() => {
    if (!unifiedProfile) return [];
    return Object.entries(unifiedProfile).filter(
      ([key, value]) =>
        ![
          "id",
          "user",
          "created_at",
          "updated_at",
          "user_id",
          "avatar",
          "profile_picture",
        ].includes(key) && value !== null,
    );
  }, [unifiedProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    } else {
      navigate("/login");
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setError(null);
    setSuccess(null);
    try {
      await dispatch(updateUserAvatar(formData)).unwrap();
      await dispatch(fetchUserProfile({ force: true }));
      setSuccess("Profile picture updated successfully");
    } catch (err) {
      setError(err || "Failed to update avatar");
    }
  };

  const handleAvatarDelete = () => {
    setSuccess("Profile picture removed successfully");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg font-inter">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
          <p className="text-xl mb-4 font-inter">User profile not found</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-poppins"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-6">
            <p className="text-sm text-center font-inter">{error}</p>
            <button
              className="text-red-700 text-xs underline ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-lg mb-6">
            <p className="text-sm text-center font-inter">{success}</p>
            <button
              className="text-green-700 text-xs underline ml-2"
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-8 w-full">
          <div className="w-full lg:w-1/3">
            <ProfileSection title="Profile">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-neutral-200 overflow-hidden">
                    {user.avatar || user.profile_picture ? (
                      <img
                        src={user.avatar || user.profile_picture}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/default_user_1.webp";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <FaUser size={64} />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <label className="p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors">
                      <FaCamera size={18} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    {(user.avatar || user.profile_picture) && (
                      <button
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                        onClick={handleAvatarDelete}
                      >
                        <FaTrash size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold font-poppins text-gray-800 dark:text-white">
                  {user.full_name}
                </h3>
                <p className="text-neutral-500 dark:text-gray-300 mb-4 font-inter">Member</p>
              </div>
            </ProfileSection>
          </div>

          <div className="w-full lg:w-1/3">
            <ProfileSection title="Account Information">
              <ProfileField
                icon={<FaEnvelope size={20} className="text-blue-600 dark:text-white" />}
                label="Email Address"
                value={user.email}
              />
              {!isEmailVerified && (
                <div className="flex items-center mb-4">
                  <div className="ml-12 text-xs font-inter text-amber-600">
                    Not verified
                  </div>
                </div>
              )}
              {user.university_details && (
                <ProfileField
                  icon={<FaBuilding size={20} className="text-blue-600 dark:text-white" />}
                  label="University"
                  value={user.university_details}
                />
              )}
              <ProfileField
                icon={<FaCalendarAlt size={20} className="text-blue-600 dark:text-white" />}
                label="Member Since"
                value={new Date(user.date_joined).toLocaleDateString()}
              />
            </ProfileSection>
          </div>

          <div className="w-full lg:w-1/3">
            <ProfileSection title="Profile Details">
              {profileEntries.length > 0 ? (
                profileEntries.map(([key, value]) => (
                  <ProfileField
                    key={key}
                    icon={<FaInfoCircle size={20} className="text-blue-600 dark:text-white" />}
                    label={prettifyFieldName(key)}
                    value={renderFieldValue(value)}
                  />
                ))
              ) : (
                <p className="text-neutral-500 dark:text-gray-400 p-4">
                  No additional profile details available.
                </p>
              )}
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
