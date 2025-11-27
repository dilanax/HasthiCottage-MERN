import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNotification from "../../components/UserNotification";
import NotificationDetailModal from "../../components/NotificationDetailModal";
import { Bell, Calendar, Tag, Clock, Filter, Search } from "lucide-react";



export default function UseNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
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
            }
          ];
          setNotifications(fallbackNotifications);
          setError("Unable to load notifications from server. Showing sample notifications.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === "" || 
      (notification.title || notification.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.description || notification.message || notification.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
      (notification.type || notification.category || "").toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const hasItems = Array.isArray(filteredNotifications) && filteredNotifications.length > 0;

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#d3af37] to-[#b8941f] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              Notifications
            </h1>
            <p className="text-white/90 text-base">
              Stay updated with the latest news and updates
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent outline-none"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="promotion">Promotions</option>
                <option value="announcement">Announcements</option>
                <option value="update">Updates</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d3af37]"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading notifications...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Notice</h3>
                <p className="text-sm text-yellow-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasItems && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No notifications found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "You're all caught up! Check back later for new updates."}
            </p>
          </div>
        )}

        {/* Notifications Grid */}
        {hasItems && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredNotifications.map((notification, idx) => (
              <div
                key={notification.notification_id ?? notification._id ?? notification.id ?? idx}
                onClick={() => handleNotificationClick(notification)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200 hover:border-[#d3af37]/30 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 line-clamp-2 group-hover:text-[#d3af37] transition-colors">
                    {notification.title || notification.name || 'Notification'}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-[#d3af37] transition-colors"></div>
                  </div>
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
                </div>

                {/* Date and Click Hint */}
                {notification.createdAt && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-2 h-2 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <span className="text-[#d3af37] opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {hasItems && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
