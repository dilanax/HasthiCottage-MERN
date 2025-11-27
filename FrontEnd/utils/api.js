// src/utils/api.js
import axios from "axios";

/**
 * Expect VITE_BACKEND_URL like:
 *   http://localhost:5000
 * API base:
 *   http://localhost:5000/api
 */
const RAW_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const clean = (s) => (s || "").replace(/\/+$/, "");
const API_BASE = `${clean(RAW_BASE)}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export default api;
