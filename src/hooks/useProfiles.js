// src/hooks/useProfiles.js
// Custom hook for managing user profiles (student, merchant, tutor, campus_admin).
// Import paths updated to new canonical locations.
import { useState } from "react";
import api from "../lib/axios";
import universities from "../constants/universities";
import { useSelector, useStore } from "react-redux";

/**
 * Custom hook for managing role-specific user profiles.
 * @param {string} profileType - 'student' | 'merchant' | 'tutor' | 'campus_admin'
 */
const useProfiles = (profileType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [universityList, setUniversityList] = useState(universities || []);
  const { user } = useSelector((state) => state.auth);
  const storeInstance = useStore();

  const clearError = () => setError(null);

  const getUniversities = async () => {
    setUniversityList(universities);
    return universities;
  };

  const createProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      let url;
      const userId = user?.id;

      if (!userId) throw new Error("Authentication error: User ID not found");

      const profileDataToSubmit = { ...profileData };

      if (profileDataToSubmit.university_id && !profileDataToSubmit.university_name) {
        const selectedUniversity = universityList.find(
          (uni) => uni.id.toString() === profileDataToSubmit.university_id.toString()
        );
        if (selectedUniversity) {
          profileDataToSubmit.university_name = selectedUniversity.name;
        }
      }

      if (profileData instanceof FormData) {
        profileData.append("user", parseInt(userId, 10));
        if (profileData.get("university_id") && !profileData.get("university_name")) {
          const uniId = profileData.get("university_id");
          const selectedUniversity = universityList.find(
            (uni) => uni.id.toString() === uniId.toString()
          );
          if (selectedUniversity) {
            profileData.append("university_name", selectedUniversity.name);
          }
        }
      } else {
        profileDataToSubmit.user = parseInt(userId, 10);
      }

      switch (profileType) {
        case "merchant":   url = "/api/users/merchant-profiles"; break;
        case "tutor":      url = "/api/users/tutor-profiles"; break;
        case "campus_admin": url = "/api/users/campus-admin-profiles"; break;
        default: throw new Error(`Unsupported profile type: ${profileType}`);
      }

      const authState = storeInstance.getState().auth;
      if (!authState.token) throw new Error("Authentication error: Please log in again");

      const dataToSend = profileData instanceof FormData ? profileData : profileDataToSubmit;
      const response = await api.post(url, dataToSend);

      if (response.data) {
        setCurrentProfile(response.data);
        try {
          const userResponse = await api.get("/api/auth/me");
          storeInstance.dispatch({ type: "auth/fetchUserProfile/fulfilled", payload: userResponse.data });
        } catch (err) {
          console.error("Failed to refresh user profile:", err);
        }
      }

      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Authentication error: Your session may have expired. Please log in again.");
        if (storeInstance) storeInstance.dispatch({ type: "auth/logoutUser/fulfilled" });
        throw err;
      }
      if (
        err.response?.data?.user?.includes("merchant profile with this user already exists.")
      ) {
        window.location.href = `/${profileType.split("_")[0]}-dashboard`;
        return null;
      }
      setError(err.response?.data || err.message || "Failed to create profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileId, profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      let url;
      switch (profileType) {
        case "merchant":     url = `/api/users/merchant-profiles/${profileId}`; break;
        case "tutor":        url = `/api/users/tutor-profiles/${profileId}`; break;
        case "campus_admin": url = `/api/users/campus-admin-profiles/${profileId}`; break;
        default: throw new Error(`Unsupported profile type: ${profileType}`);
      }
      const response = await api.patch(url, profileData);
      setCurrentProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to update profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (profileId) => {
    setIsLoading(true);
    setError(null);
    try {
      let url;
      switch (profileType) {
        case "merchant":     url = `/api/users/merchant-profiles/${profileId}`; break;
        case "tutor":        url = `/api/users/tutor-profiles/${profileId}`; break;
        case "campus_admin": url = `/api/users/campus-admin-profiles/${profileId}`; break;
        default: throw new Error(`Unsupported profile type: ${profileType}`);
      }
      const response = await api.get(url);
      setCurrentProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to fetch profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    currentProfile,
    universities: universityList,
    clearError,
    createProfile,
    updateProfile,
    getProfile,
    getUniversities,
  };
};

export default useProfiles;
