// Food Booking API functions
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Helper function for making API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Create a new food booking
export const createFoodBooking = (bookingData) => {
  return apiCall('/food-bookings/create', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

// Get all food bookings (admin only)
export const getAllFoodBookings = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/food-bookings/admin/all${queryString ? `?${queryString}` : ''}`;
  return apiCall(endpoint);
};

// Update booking status (admin only)
export const updateBookingStatus = (bookingId, status, adminNotes = '') => {
  return apiCall(`/food-bookings/admin/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminNotes }),
  });
};


// Get pending bookings count for notifications (admin only)
export const getPendingBookingsCount = () => {
  return apiCall('/food-bookings/admin/pending-count');
};

// Get food booking analytics (admin only)
export const getFoodBookingAnalytics = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/food-bookings/analytics${queryString ? `?${queryString}` : ''}`;
  return apiCall(endpoint);
};

