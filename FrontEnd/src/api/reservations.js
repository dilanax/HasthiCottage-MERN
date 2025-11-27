import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  // add headers/auth token if needed:
  // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const updateReservation = async (reservationId, payload) => {
  const { data } = await api.patch(`/api/reservations/${reservationId}`, payload);
  return data;
};

export const cancelReservation = async (reservationId) => {
  const { data } = await api.post(`/api/reservations/${reservationId}/cancel`);
  return data;
};
