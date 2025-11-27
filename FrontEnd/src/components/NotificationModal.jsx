import React, { useState, useEffect } from "react";
import { X, Bell, Calendar, Tag, Clock, Filter, Search, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const NotificationModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAll, setShowAll] = useState(false);

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
      
      // Provide fallback data for demo
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
        },
        {
          id: 4,
          title: "Safari Adventure Package",
          description: "New safari packages available with guided tours and wildlife photography sessions.",
          type: "promotion",
          priority: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          title: "Maintenance Notice",
          description: "Scheduled maintenance on December 20th from 2-4 PM. Services will be temporarily unavailable.",
          type: "announcement",
          priority: "medium",
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(fallbackNotifications);
      setError("Showing sample notifications");
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

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === "" || 
      (notification.title || notification.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.description || notification.message || notification.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
      (notification.type || notification.category || "").toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const displayNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-16 sm:pt-20 lg:pt-24 animate-in slide-in-from-top-4 duration-400">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-400"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 h-[80vh] sm:h-[85vh] max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-400 ease-out">
        {/* Header */}
        <div 
          className="px-8 py-6 flex items-center justify-between relative overflow-hidden flex-shrink-0"
          style={{ 
            background: 'linear-gradient(135deg, #d3af37 0%, #b8941f 100%)',
            color: '#0a0a0a'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/25 rounded-xl shadow-lg">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Notifications</h2>
              <p className="text-base opacity-90 font-medium">Stay updated with latest news and updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/25 rounded-xl transition-all duration-200 hover:scale-105 relative z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d3af37] focus:border-[#d3af37] focus:shadow-[0_0_0_3px_rgba(211,175,55,0.1)] outline-none transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d3af37] focus:border-[#d3af37] outline-none transition-all duration-200 bg-white shadow-sm"
              >
                <option value="all">All Types</option>
                <option value="promotion">Promotions</option>
                <option value="announcement">Announcements</option>
                <option value="update">Updates</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d3af37] scrollbar-track-gray-100 hover:scrollbar-thumb-[#b8941f]">
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

          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length > 0 && (
            <>
              <div className="space-y-6 pt-4">
                {displayNotifications.map((notification, idx) => (
                  <div
                    key={notification.notification_id ?? notification._id ?? notification.id ?? idx}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#d3af37]/50 group relative overflow-hidden w-full hover:-translate-y-1 hover:before:opacity-100 before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#d3af37]/5 before:to-[#b8941f]/5 before:opacity-0 before:transition-opacity before:duration-300 before:rounded-xl before:-z-10"
                  >
                    {/* Background Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d3af37] to-[#b8941f]"></div>
                    
                    <div className="flex items-start gap-4">
                      {/* Left side - Icon and priority indicator */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#d3af37] to-[#b8941f] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-[0_4px_12px_rgba(211,175,55,0.3)] transition-all duration-300">
                          <Bell className="w-6 h-6 text-white" />
                        </div>
                        {notification.priority === 'high' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* Right side - Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#d3af37] transition-colors duration-200">
                            {notification.title || notification.name || 'Notification'}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {notification.createdAt && (
                              <span className="text-sm">
                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-base leading-relaxed mb-4">
                          {notification.description || notification.message || notification.content || 'No description available'}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {notification.type && (
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${getTypeColor(notification.type)} shadow-sm`}>
                              <Tag className="w-3 h-3 inline mr-1" />
                              {notification.type}
                            </span>
                          )}
                          {notification.priority && (
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${getPriorityColor(notification.priority)} shadow-sm`}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More/Less Button */}
              {filteredNotifications.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 bg-[#d3af37] hover:bg-[#b8941f] hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_25px_rgba(211,175,55,0.4)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500"
                  >
                    {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAll ? 'Show Less' : `Show All (${filteredNotifications.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#d3af37] rounded-full"></div>
                <p className="text-sm font-semibold text-gray-700">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredNotifications.length > 0 && (
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 text-[#0a0a0a] rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl bg-gradient-to-r from-[#d3af37] to-[#b8941f] hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_25px_rgba(211,175,55,0.4)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
