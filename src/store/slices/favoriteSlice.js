// src/store/slices/favoriteSlice.js
// Moved from src/redux/slices/favoriteSlice.js - no import changes needed.
import { createSlice } from "@reduxjs/toolkit";

const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: savedFavorites,
  reducers: {
    toggleFavorite: (state, action) => {
      const productId = action.payload;
      const index = state.indexOf(productId);
      let newState;

      if (index > -1) {
        newState = state.filter((id) => id !== productId);
      } else {
        newState = [...state, productId];
      }

      localStorage.setItem("favorites", JSON.stringify(newState));
      return newState;
    },
    clearFavorites: () => {
      localStorage.removeItem("favorites");
      return [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
