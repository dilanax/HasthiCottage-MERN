// correct relative path: from src/api -> src/utils is ../utils

import api from "../../utils/api";


export const PackageDetailsAPI = {
  list:  (params = {}) => api.get("/packages", { params }).then(r => r.data),
  get:   (id) => api.get(`/packages/${id}`).then(r => r.data),
  create:(payload) => api.post("/packages", payload).then(r => r.data),
  update:(id, payload) => api.put(`/packages/${id}`, payload).then(r => r.data),
  remove:(id) => api.delete(`/packages/${id}`).then(r => r.data),
};
