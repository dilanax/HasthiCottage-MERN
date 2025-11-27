// src/components/NotificationView.jsx
import React from "react";

export default function NotificationView({ notification, onClose }) {
  if (!notification) return null;

  const dateLabel =
    notification.date
      ? new Date(notification.date).toLocaleString()
      : "-";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" style={{ color: "#d3af37" }}>
              {notification.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm leading-6 whitespace-pre-wrap" style={{ color: "#0a0a0a" }}>
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-semibold" style={{ color: "#d3af37" }}>Date:</span>
            <span className="text-sm" style={{ color: "#0a0a0a" }}>{dateLabel}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-80 flex items-center gap-2"
              style={{ backgroundColor: "#0a0a0a", color: "#f0f0f0" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
