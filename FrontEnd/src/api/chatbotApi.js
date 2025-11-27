import axios from './axios';

const API_BASE_URL = 'http://localhost:5000/api/chatbot';

export const chatbotApi = {
  // Send query to chatbot
  sendQuery: async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, { query });
      return response.data;
    } catch (error) {
      console.error('Error sending chatbot query:', error);
      throw error;
    }
  },

  // Get all nearby places
  getAllPlaces: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places`);
      return response.data;
    } catch (error) {
      console.error('Error fetching places:', error);
      throw error;
    }
  },

  // Get featured places
  getFeaturedPlaces: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured places:', error);
      throw error;
    }
  },

  // Search places
  searchPlaces: async (searchQuery) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/search?q=${encodeURIComponent(searchQuery)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  },

  // Get places by category
  getPlacesByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching places by category:', error);
      throw error;
    }
  },

  // Get place details by ID
  getPlaceDetails: async (placeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/${placeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  },

  // Get places by distance
  getPlacesByDistance: async (maxDistance) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/distance?maxDistance=${maxDistance}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching places by distance:', error);
      throw error;
    }
  },

  // Admin functions (require authentication)
  addNewPlace: async (placeData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/places`, placeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding new place:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      }
      throw error;
    }
  },

  updatePlace: async (placeId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/places/${placeId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating place:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      }
      throw error;
    }
  },

  deletePlace: async (placeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/places/${placeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting place:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      }
      throw error;
    }
  }
};

export default chatbotApi;
