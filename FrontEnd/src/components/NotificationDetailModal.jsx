import React from 'react';
import { X, Calendar, Tag, Clock, User, AlertCircle } from 'lucide-react';

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
  if (!isOpen || !notification) return null;

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
      case 'booking':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'reminder':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Time not available';
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return formatDate(dateString);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d3af37] rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                <p className="text-sm text-gray-600">View full notification information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {notification.title || notification.name || 'Untitled Notification'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(notification.createdAt || notification.created_at)}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {notification.type && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(notification.type)}`}>
                <Tag className="w-3 h-3 inline mr-1" />
                {notification.type}
              </span>
            )}
            {notification.priority && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </span>
            )}
            {notification.status && (
              <span className="px-3 py-1 text-sm font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                {notification.status}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {notification.description || notification.message || notification.content || 'No description available'}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Created Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h5 className="font-semibold text-gray-900">Created Date</h5>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(notification.createdAt || notification.created_at)}
              </p>
            </div>

            {/* Notification ID */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <h5 className="font-semibold text-gray-900">Notification ID</h5>
              </div>
              <p className="text-sm text-gray-600 font-mono">
                {notification.notification_id || notification.id || notification._id || 'N/A'}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          {(notification.scheduled_at || notification.scheduledAt) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Scheduled Information</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-900">Scheduled Time</h5>
                </div>
                <p className="text-sm text-blue-700">
                  {formatDate(notification.scheduled_at || notification.scheduledAt)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            {notification.action_url && (
              <a
                href={notification.action_url}
                className="px-6 py-2 bg-[#d3af37] text-white hover:bg-[#b8941f] rounded-lg font-medium transition-colors"
              >
                Take Action
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
