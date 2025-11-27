import axios from "axios";

const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const api = axios.create({ baseURL: `${base}/api` });

export const createOrder     = (payload)   => api.post("/orders", payload);
export const listOrders      = (params={}) => api.get("/orders", { params });
export const getOrder        = (id)        => api.get(`/orders/${id}`);
export const updateOrder     = (id, body)  => api.put(`/orders/${id}`, body);
export const removeOrder     = (id)        => api.delete(`/orders/${id}`);
export const exportOrdersPdf = (params={}) => api.get("/orders/export/pdf", { params });

export default api;
