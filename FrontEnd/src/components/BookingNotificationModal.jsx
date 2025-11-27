import React, { useState, useEffect } from 'react';
import { getPendingBookingsCount } from '../api/foodBookingApi.js';
import { getPendingSafariBookingsCount } from '../api/safariBookingApi.js';
import { useNavigate } from 'react-router-dom';

export default function BookingNotificationModal({ isOpen, onClose }) {
  const [foodCount, setFoodCount] = useState(0);
  const [safariCount, setSafariCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchPendingCounts();
    }
  }, [isOpen]);

  const fetchPendingCounts = async () => {
    try {
      setLoading(true);
      const [foodResponse, safariResponse] = await Promise.all([
        getPendingBookingsCount(),
        getPendingSafariBookingsCount()
      ]);
      
      setFoodCount(foodResponse.pendingCount || 0);
      setSafariCount(safariResponse.pendingCount || 0);
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodBookings = () => {
    navigate('/admin/foodmenu/bookings');
    onClose();
  };

  const handleSafariBookings = () => {
    navigate('/admin/safari-bookings');
    onClose();
  };

  if (!isOpen) return null;

  const totalCount = foodCount + safariCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d3af37] to-[#b89d2e] px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  NEW BOOKINGS AVAILABLE!
                </h2>
                <p className="text-white text-opacity-90 text-sm">
                  You have new pending bookings. Which would you like to view?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d3af37]"></div>
              <span className="ml-3 text-gray-600">Loading booking counts...</span>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending bookings at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Food Bookings Button */}
              <button
                onClick={handleFoodBookings}
                disabled={foodCount === 0}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  foodCount > 0
                    ? 'border-[#d3af37] bg-gradient-to-r from-[#d3af37] to-[#b89d2e] text-[#0a0a0a] hover:shadow-lg hover:scale-105'
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Food Bookings</h3>
                      <p className="text-sm opacity-80">
                        {foodCount === 0 ? 'No pending food orders' : `${foodCount} pending food order${foodCount > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  {foodCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
                        {foodCount}
                      </span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Safari Bookings Button */}
              <button
                onClick={handleSafariBookings}
                disabled={safariCount === 0}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  safariCount > 0
                    ? 'border-gray-800 bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg hover:scale-105'
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Safari Bookings</h3>
                      <p className="text-sm opacity-80">
                        {safariCount === 0 ? 'No pending safari bookings' : `${safariCount} pending safari booking${safariCount > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  {safariCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
                        {safariCount}
                      </span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Pending:</span>
                  <span className="font-semibold text-gray-900">{totalCount} booking{totalCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click on a booking type to view details</span>
            </div>
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
