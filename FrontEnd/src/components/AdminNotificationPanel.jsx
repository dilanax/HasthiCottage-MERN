import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import BookingNotificationModal from './BookingNotificationModal.jsx';

export default function AdminNotificationPanel() {
  const { foodCount, safariCount, totalCount, isLoading, refreshNotifications } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleFoodBookings = () => {
    navigate('/admin/foodmenu/bookings');
  };

  const handleSafariBookings = () => {
    navigate('/admin/safari-bookings');
  };

  const handleViewAll = () => {
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d3af37]"></div>
          <span className="ml-3 text-gray-600">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#d3af37] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Notifications</h3>
              <p className="text-sm text-gray-600">Manage pending bookings and orders</p>
            </div>
          </div>
          <button
            onClick={refreshNotifications}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
            <p className="text-gray-600">No pending bookings at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Food Bookings Card */}
            <div 
              onClick={handleFoodBookings}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                foodCount > 0 
                  ? 'border-[#d3af37] bg-gradient-to-r from-[#d3af37] to-[#b89d2e] text-[#0a0a0a] hover:shadow-lg hover:scale-105' 
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Food Bookings</h4>
                    <p className="text-sm opacity-80">
                      {foodCount === 0 ? 'No pending orders' : `${foodCount} pending order${foodCount > 1 ? 's' : ''}`}
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
            </div>

            {/* Safari Bookings Card */}
            <div 
              onClick={handleSafariBookings}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                safariCount > 0 
                  ? 'border-gray-800 bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg hover:scale-105' 
                  : 'border-gray-200 bg-gray-50 text-gray-400'
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
                  <div>
                    <h4 className="font-semibold">Safari Bookings</h4>
                    <p className="text-sm opacity-80">
                      {safariCount === 0 ? 'No pending bookings' : `${safariCount} pending booking${safariCount > 1 ? 's' : ''}`}
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
            </div>

            {/* Summary and Action */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Pending:</span> {totalCount} booking{totalCount > 1 ? 's' : ''}
              </div>
              <button
                onClick={handleViewAll}
                className="text-sm text-[#d3af37] hover:text-[#b89d2e] font-medium transition-colors"
              >
                View All Details →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Notification Modal */}
      <BookingNotificationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}
