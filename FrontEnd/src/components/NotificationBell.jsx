import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Check if user has viewed notifications in this session
    const viewedStatus = sessionStorage.getItem('hasViewedNotifications');
    if (viewedStatus === 'true') {
      setHasViewedNotifications(true);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/notifications');
      
      // Handle different response structures
      let notificationsData = [];
      if (response.data && Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data && response.data.notifications && Array.isArray(response.data.notifications)) {
        notificationsData = response.data.notifications;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        notificationsData = response.data.data;
      }

      setNotifications(notificationsData);
      
      // Count unread notifications (assuming notifications without 'read' field are unread)
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      
      // If there are new unread notifications, reset the viewed status
      if (unread > 0) {
        const currentUnreadCount = sessionStorage.getItem('lastUnreadCount');
        if (currentUnreadCount && parseInt(currentUnreadCount) < unread) {
          setHasViewedNotifications(false);
          sessionStorage.removeItem('hasViewedNotifications');
        }
        sessionStorage.setItem('lastUnreadCount', unread.toString());
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set fallback data
      const fallbackNotifications = [
        {
          id: 1,
          title: "Welcome to Hasthi Safari Cottage",
          description: "Thank you for visiting our website. Explore our amazing cottages and safari experiences.",
          type: "announcement",
          priority: "high",
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          title: "Special Promotion Available",
          description: "Book your stay now and get 20% off on all cottage bookings this month.",
          type: "promotion",
          priority: "medium",
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      setNotifications(fallbackNotifications);
      setUnreadCount(2);
      
      // For fallback data, also set the unread count
      sessionStorage.setItem('lastUnreadCount', '2');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    
    // If opening the dropdown for the first time, mark as viewed
    if (!isOpen && !hasViewedNotifications) {
      setHasViewedNotifications(true);
      sessionStorage.setItem('hasViewedNotifications', 'true');
    }
  };

  const handleViewAllClick = () => {
    setHasViewedNotifications(true);
    sessionStorage.setItem('hasViewedNotifications', 'true');
    setIsOpen(false);
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && !hasViewedNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <Link
                to="/notification"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={handleViewAllClick}
              >
                View All
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d3af37]"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id || notification.notification_id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id || notification.notification_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title || notification.name || 'Notification'}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {notification.description || notification.message || notification.content || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.type && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        )}
                        {notification.priority && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt || notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                to="/notification"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={handleViewAllClick}
              >
                View {notifications.length - 5} more notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;