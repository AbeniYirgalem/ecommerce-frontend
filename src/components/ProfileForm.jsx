import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateUserProfile,
  resetSuccessFlags,
} from "../redux/slices/userSlice";
import { fetchUserProfile } from "../redux/slices/authSlice";
import { FaSave, FaTimes } from "react-icons/fa";

function ProfileForm({ onCancel }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    bio: user?.bio || "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    return () => {
      dispatch(resetSuccessFlags());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      await dispatch(fetchUserProfile()).unwrap();
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8 text-white">
        <p>Please log in to edit your profile.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        <button onClick={onCancel} className="text-white/70 hover:text-white">
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/30 backdrop-blur-md p-3 rounded-lg mb-6">
          <p className="text-white text-sm text-center">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/30 backdrop-blur-md p-3 rounded-lg mb-6">
          <p className="text-white text-sm text-center">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50 text-white"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50 text-white"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50 text-white"
            placeholder="Tell others about yourself"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-white/30 rounded-md hover:bg-white/10 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md flex items-center transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Saving...
              </div>
            ) : (
              <>
                <FaSave className="mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
