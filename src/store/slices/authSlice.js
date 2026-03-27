// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/auth.service";

// Thunks
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message || "Registration failed",
          fieldErrors: error.response.data.errors || {},
        });
      }
      return thunkAPI.rejectWithValue({
        message: error.message || "Registration failed",
        fieldErrors: {},
      });
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await authService.login(email, password);

      const { _id, email: userEmail, role, token } = response.data;

      localStorage.setItem("authTokens", JSON.stringify({ access: token }));

      const userData = { id: _id, email: userEmail, role };
      localStorage.setItem("newUserData", JSON.stringify(userData));

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout failures; client-side cleanup still proceeds
      console.warn("Server logout failed", err?.response?.data || err.message);
    }

    localStorage.removeItem("authTokens");
    localStorage.removeItem("newUserData");
    sessionStorage.clear();
    return null;
  },
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_arg, thunkAPI) => {
    try {
      const response = await authService.fetchMe();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
  {
    condition: (arg = {}, { getState }) => {
      const { force = false } = arg || {};
      const { token, user, loading } = getState().auth;

      if (!token) return false; // No token, skip request
      if (!force && user) return false; // Already have user, skip unless forced
      if (loading) return false; // Avoid overlapping requests

      return true;
    },
  },
);

// Initial State Helpers
const loadAuthState = () => {
  try {
    const serializedTokens = localStorage.getItem("authTokens");
    if (!serializedTokens) return undefined;
    return JSON.parse(serializedTokens);
  } catch {
    return undefined;
  }
};

const loadUserData = () => {
  try {
    const data = localStorage.getItem("newUserData");
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: loadUserData(),
    token: loadAuthState()?.access || null,
    loading: false,
    error: null,
    fieldErrors: {},
    isAuthenticated: !!loadAuthState()?.access,
    registrationSuccess: null,
    registrationData: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.fieldErrors = {};
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = null;
      state.registrationData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess =
          action.payload.message || "Registration successful!";
        state.registrationData = action.payload;
        // Do not authenticate on registration; wait for email verification + login
        state.isAuthenticated = false;
        state.token = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
        state.fieldErrors = action.payload?.fieldErrors || {};
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          id: action.payload._id,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.fieldErrors = {};
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        // Optionally logout if profile fetch fails due to token expiry
      });
  },
});

export const { clearError, clearRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
