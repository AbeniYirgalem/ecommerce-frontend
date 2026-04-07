// src/store/store.js
// Redux store - reorganized from src/redux/store.js.
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import favoriteReducer from "./slices/favoriteSlice";
import { injectStore } from "../lib/axios";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    user: userReducer,
    favorites: favoriteReducer,
  },
});

// Inject the store into the Axios instance for auth interceptors
injectStore(store);

// Persist cart to localStorage on every state change
store.subscribe(() => {
  const { cart } = store.getState();
  localStorage.setItem("cart", JSON.stringify(cart));
});

export default store;
