// src/api/rooms.js
import axios from './axios';

// Get all rooms for admin (includes unavailable rooms)
export const getAllRooms = () => axios.get('/room-packages/all');

// Get available rooms for users (only available rooms)
export const getAvailableRooms = () => axios.get('/room-packages/available');

// roomId is your business id (e.g., "quadrupleroomwithgardenview_8")
export const getRoomById = (roomId) =>
  axios.get(`/room-packages/${roomId}`);

export const createRoom = (formData) =>
  axios.post('/room-packages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ✅ export name must be exactly "updateRoom"
export const updateRoom = (roomId, formData) =>
  axios.put(`/room-packages/${roomId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteRoom = (roomId) =>
  axios.delete(`/room-packages/${roomId}`);
