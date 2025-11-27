import React, { useState, useEffect } from "react";
import { X, Bell, Calendar, Tag, Clock } from "lucide-react";
import axios from "axios";

const NotificationPopup = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications");
      const d = res?.data;
      const list =
        (Array.isArray(d?.data) && d.data) ||
        (Array.isArray(d?.notifications) && d.notifications) ||
        (Array.isArray(d?.promotions) && d.promotions) ||
        (Array.isArray(d) && d) ||
        [];
      setNotifications(list);
      setError(null);
    } catch (err) {
      console.error("Notification fetch error:", err);
      
      // Check if it's a 404 error (server not found)
      if (err.response?.status === 404) {
        setError("Notification service is not available. Please try again later.");
        setNotifications([]);
      } else {
        // Provide fallback data for other errors
        const fallbackNotifications = [
          {
            id: 1,
            title: "Welcome to Hasthi Safari Cottage",
            description: "Thank you for visiting our website. Explore our amazing cottages and safari experiences.",
            type: "announcement",
            priority: "high",
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: "Special Promotion Available",
            description: "Book your stay now and get 20% off on all cottage bookings this month.",
            type: "promotion",
            priority: "medium",
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            title: "Food Menu Update",
            description: "Check out our new seasonal menu with fresh local ingredients.",
            type: "update",
            priority: "low",
            createdAt: new Date().toISOString()
          }
        ];
        setNotifications(fallbackNotifications);
        setError("Unable to load notifications from server. Showing sample notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'promotion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'update':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d3af37] to-[#b8941f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <p className="text-white/80 text-sm">Stay updated with latest news</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d3af37]"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-yellow-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {notifications.map((notification, idx) => (
                <div
                  key={notification.notification_id ?? notification._id ?? notification.id ?? idx}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {notification.title || notification.name || 'Notification'}
                    </h3>
                    <Clock className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-[#d3af37] to-transparent mb-2"></div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
                    {notification.description || notification.message || notification.content || 'No description available'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {notification.type && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeColor(notification.type)}`}>
                        <Tag className="w-2 h-2 inline mr-1" />
                        {notification.type}
                      </span>
                    )}
                    {notification.priority && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    )}
                    {notification.category && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">
                        {notification.category}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  {notification.createdAt && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-2 h-2 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#d3af37] text-white rounded-lg hover:bg-[#b8941f] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
