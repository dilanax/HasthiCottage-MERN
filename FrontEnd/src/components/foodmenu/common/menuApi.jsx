// src/utils/menuApi.js
import axios from "axios";

// Create an Axios instance with base URL configuration
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE}/api`,
});

// Function to list menu items with optional query parameters
export const listMenu = (params = {}) => api.get("/menu", { params });

// Function to get a single menu item by ID
export const getMenu = (id) => api.get(`/menu/${id}`);

// Function to create a new menu item (multipart form data for image uploads)
export const createMenu = (data) =>
  api.post("/menu", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Function to update an existing menu item by ID (multipart form data for image uploads)
export const updateMenu = (id, data) =>
  api.put(`/menu/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Function to delete a menu item by ID
export const removeMenu = (id) => api.delete(`/menu/${id}`);

export default api;
