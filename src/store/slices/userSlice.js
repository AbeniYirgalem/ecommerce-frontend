// src/store/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../../services/user.service";

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (userData, thunkAPI) => {
    try {
      const response = await userService.updateProfile(userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const updateUserAvatar = createAsyncThunk(
  "user/updateUserAvatar",
  async (formData, thunkAPI) => {
    try {
      const response = await userService.updateAvatar(formData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update avatar"
      );
    }
  }
);

// Unified update action that handles old legacy names from frontend temporarily
export const updateSpecificProfile = createAsyncThunk(
  "user/updateSpecificProfile",
  async (profileData, thunkAPI) => {
    try {
      // In the new unified backend, all roles just update the same User model 
      // via the same updateUserProfile endpoint!
      const response = await userService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// We keep these named exports so we don't break existing frontend component imports,
// but they all just dispatch the same unified update function under the hood.
export const updateStudentProfile = updateSpecificProfile;
export const updateMerchantProfile = updateSpecificProfile;
export const updateTutorProfile = updateSpecificProfile;
export const updateCampusAdminProfile = updateSpecificProfile;

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    error: null,
    avatarUpdateSuccess: false,
    profileUpdateSuccess: false,
  },
  reducers: {
    clearUserError: (state) => { state.error = null; },
    resetSuccessFlags: (state) => {
      state.avatarUpdateSuccess = false;
      state.profileUpdateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => { state.loading = true; state.error = null; state.profileUpdateSuccess = false; })
      .addCase(updateUserProfile.fulfilled, (state) => { state.loading = false; state.profileUpdateSuccess = true; })
      .addCase(updateUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(updateUserAvatar.pending, (state) => { state.loading = true; state.error = null; state.avatarUpdateSuccess = false; })
      .addCase(updateUserAvatar.fulfilled, (state) => { state.loading = false; state.avatarUpdateSuccess = true; })
      .addCase(updateUserAvatar.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Handle the generic profile update thunk (covers student, merchant, tutor, admin)
      .addCase(updateSpecificProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateSpecificProfile.fulfilled, (state) => { state.loading = false; state.profileUpdateSuccess = true; })
      .addCase(updateSpecificProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearUserError, resetSuccessFlags } = userSlice.actions;
export default userSlice.reducer;
