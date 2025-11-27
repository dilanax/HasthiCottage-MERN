import axios from "axios";

const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const api = axios.create({ baseURL: `${base}/api` });

export const listMenu   = (params = {}) => api.get("/menu", { params });
export const getMenu    = (id)          => api.get(`/menu/${id}`);
export const createMenu = (data)        =>
  api.post("/menu", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateMenu = (id, data)    =>
  api.put(`/menu/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const removeMenu = (id)          => api.delete(`/menu/${id}`);

export default api;
