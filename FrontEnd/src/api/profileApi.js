// src/api/profileApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const profileApi = {
  // Get current user's profile from database
  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }
  },

  // Update current user's profile in database
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }
  }
};

export default profileApi;








