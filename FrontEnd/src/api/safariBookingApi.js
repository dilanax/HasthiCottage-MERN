// Safari Booking API functions
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

// Create a new safari booking
export const createSafariBooking = (bookingData) => {
  return apiCall('/safari-bookings/create', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

// Get all safari bookings (admin only)
export const getAllSafariBookings = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/safari-bookings/admin/all${queryString ? `?${queryString}` : ''}`;
  return apiCall(endpoint);
};

// Update booking status (admin only)
export const updateSafariBookingStatus = (bookingId, status, adminNotes = '') => {
  return apiCall(`/safari-bookings/admin/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminNotes }),
  });
};

// Get pending bookings count for notifications (admin only)
export const getPendingSafariBookingsCount = () => {
  return apiCall('/safari-bookings/admin/pending-count');
};

// Get safari booking analytics (admin only)
export const getSafariBookingAnalytics = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/safari-bookings/analytics${queryString ? `?${queryString}` : ''}`;
  return apiCall(endpoint);
};

// Get user's safari bookings
export const getUserSafariBookings = () => {
  return apiCall('/safari-bookings/user');
};
