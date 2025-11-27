import React, { useState } from "react";
import NotificationForm from "../../components/NotificationForm";
import NotificationsTable from "../../components/NotificationsTable";
import NotificationView from "../../components/NotificationView";



export default function NotificationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleAdded = () => {
    setRefreshKey((k) => k + 1);
    setShowForm(false);
  };

  return (
    <div className="notifications-page relative p-4 max-w-7xl mx-auto min-h-screen" style={{ backgroundColor: "#f0f0f0" }}>
      {!showForm && !selectedNotification && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#0a0a0a" }}>Notifications</h1>
          <button
            className="font-bold px-6 py-3 rounded-xl text-sm md:text-base transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            style={{ backgroundColor: "#d3af37", color: "#0a0a0a" }}
            onClick={() => setShowForm(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Notification
          </button>
        </div>
      )}

      {showForm && (
        <NotificationForm
          onAdd={handleAdded}
          onClose={() => setShowForm(false)}
        />
      )}

      {!showForm && !selectedNotification && (
        <NotificationsTable
          refreshKey={refreshKey}
          onChanged={() => {}}
          onRowClick={(n) => setSelectedNotification(n)}
        />
      )}

      {selectedNotification && (
        <NotificationView
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
