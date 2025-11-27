// src/api/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
  // do not enable withCredentials unless you use cookies
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request URL:', config.baseURL + config.url);
  return config;
});

export default api;
