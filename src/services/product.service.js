// src/services/product.service.js
// Product API service.

import api from "../lib/axios";

export const productService = {
  /** Get all products (optionally filtered). */
  getAll: (params) => api.get("/api/products", { params }),

  /** Get a single product by ID. */
  getById: (id) => api.get(`/api/products/${id}`),

  /** Create a product (expects FormData or JSON). */
  create: (data) => api.post("/api/products", data),

  /** Update a product. */
  update: (id, data) => api.patch(`/api/products/${id}`, data),

  /** Delete a product. */
  remove: (id) => api.delete(`/api/products/${id}`),

  /** Toggle favorite for a product. */
  toggleFavorite: (id) => api.post(`/api/products/${id}/favorite`),
};

export default productService;
