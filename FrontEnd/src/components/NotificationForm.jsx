// src/components/NotificationForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Schema-aligned enums
const TYPE_OPTIONS = ["booking", "offer", "promotion", "announcement", "reminder"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];
const STATUS_OPTIONS = ["pending", "sent", "failed"];

// helpers
const toISO = (val) => (val ? new Date(val).toISOString() : "");
const isDigitsOnly = (v) => /^\d+$/.test(String(v));
const pad = (n) => String(n).padStart(2, "0");
const nowLocalInputValue = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

// allow letters, numbers, space, dot, comma, hyphen, underscore
const TITLE_ALLOWED_RE = /^[a-zA-Z0-9\s._,-]*$/;
// word counter (treat multiple spaces/newlines as one)
const wordCount = (s = "") => s.trim().split(/\s+/).filter(Boolean).length;

export default function NotificationForm({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    notification_id: "",
    title: "",
    message: "",
    type: TYPE_OPTIONS[0],
    priority: PRIORITY_OPTIONS[0],
    scheduled_at: "",
    status: STATUS_OPTIONS[0],
    created_at: nowLocalInputValue(),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastGeneratedId, setLastGeneratedId] = useState(0);

  // Function to check if notification ID exists
  const checkNotificationIdExists = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${id}`);
      return response.data !== null;
    } catch (error) {
      // If error is 404, ID doesn't exist (which is what we want)
      return error.response?.status === 404 ? false : true;
    }
  };

  // Function to generate next sequential notification ID using backend API
  const generateNextNotificationId = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/next-id');
      const nextId = response.data.data.notification_id;
      console.log(`Generated next Notification ID from backend: ${nextId}`);
      return nextId;
    } catch (error) {
      console.error('Error fetching next notification ID from backend:', error);
      // Fallback to local counter + 1, or timestamp-based ID if no local counter
      const fallbackId = lastGeneratedId > 0 ? lastGeneratedId + 1 : Math.floor(Date.now() / 1000) % 1000;
      setLastGeneratedId(fallbackId);
      console.log(`Generated ID from fallback: N${String(fallbackId).padStart(3, '0')}`);
      return `N${String(fallbackId).padStart(3, '0')}`;
    }
  };

  // Generate notification ID on component mount
  useEffect(() => {
    const initializeForm = async () => {
      const nextId = await generateNextNotificationId();
      console.log('Generated Notification ID:', nextId);
      setFormData(prev => ({ ...prev, notification_id: nextId }));
      setLoading(false);
    };
    
    initializeForm();
  }, []);



  const validateField = (key, value, snapshot) => {
    switch (key) {
      case "notification_id": {
        // No validation needed for notification_id as it's auto-generated
        return undefined;
      }
      case "title": {
        const v = value ?? "";
        if (!v.trim()) return "Title is required.";
        if (wordCount(v) < 3) return "Title must have at least 3 words.";
        if (v.length > 100) return "Title must be ≤ 100 characters.";
        if (!TITLE_ALLOWED_RE.test(v)) {
          return "Only letters, numbers, space, ., ,, _ and - are allowed.";
        }
        return undefined;
      }
      case "message": {
        const v = value ?? "";
        if (!v.trim()) return "Message is required.";
        if (wordCount(v) < 5) return "Message must have at least 5 words.";
        if (v.length > 1000) return "Message must be ≤ 1000 characters.";
        return undefined;
      }
      case "type": {
        const v = (value ?? "").toLowerCase();
        if (!TYPE_OPTIONS.map((t) => t.toLowerCase()).includes(v)) {
          return `Type must be one of: ${TYPE_OPTIONS.join(", ")}`;
        }
        return undefined;
      }
      case "priority": {
        if (!PRIORITY_OPTIONS.includes(value)) {
          return `Priority must be one of: ${PRIORITY_OPTIONS.join(", ")}`;
        }
        return undefined;
      }
      case "status": {
        if (!STATUS_OPTIONS.includes(value)) {
          return `Status must be one of: ${STATUS_OPTIONS.join(", ")}`;
        }
        return undefined;
      }
      case "scheduled_at": {
        if (!value) return "Scheduled date/time is required.";
        const now = new Date();
        const scheduled = new Date(value);
        if (scheduled < now) return "Scheduled time cannot be in the past.";
        return undefined;
      }
      case "created_at": {
        // No validation needed for created_at as it's auto-generated
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const validateAll = (data) => {
    const e = {};
    Object.keys(data).forEach((k) => {
      const msg = validateField(k, data[k], data);
      if (msg) e[k] = msg;
    });
    return e;
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    const next = { ...formData, [key]: value };
    setFormData(next);
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value, next) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return; // Prevent submission while loading
    }

    const normalizedType =
      TYPE_OPTIONS.find((t) => t.toLowerCase() === formData.type.toLowerCase()) ||
      formData.type;

    const payloadCandidate = { ...formData, type: normalizedType };
    const fieldErrors = validateAll(payloadCandidate);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      Swal.fire({ icon: "error", title: "Please fix the highlighted fields" });
      return;
    }

    // Retry mechanism for duplicate key errors
    let retryCount = 0;
    const maxRetries = 3;
    let currentFormData = { ...formData };

    while (retryCount <= maxRetries) {
      try {
        const payload = {
          notification_id: currentFormData.notification_id,
          title: currentFormData.title.trim(),
          message: currentFormData.message.trim(),
          type: normalizedType,
          priority: currentFormData.priority,
          scheduled_at: toISO(currentFormData.scheduled_at),
          status: currentFormData.status,
          created_at: toISO(currentFormData.created_at),
        };

        await axios.post("http://localhost:5000/api/notifications", payload);
        onAdd && onAdd();

        // Generate new ID for next notification
        const nextId = await generateNextNotificationId();
        console.log('Generated next Notification ID:', nextId);
        
        // Reset form with new ID and current timestamp
        setFormData({
          notification_id: nextId,
          title: "",
          message: "",
          type: TYPE_OPTIONS[0],
          priority: PRIORITY_OPTIONS[0],
          scheduled_at: "",
          status: STATUS_OPTIONS[0],
          created_at: nowLocalInputValue(),
        });
        setErrors({});

        Swal.fire({
          icon: "success",
          title: "Notification Added",
          timer: 1800,
          showConfirmButton: false,
        });
        return; // Success, exit the function

      } catch (error) {
        // Check if it's a duplicate key error
        if (error.response?.data?.message?.includes('E11000') || 
            error.response?.data?.message?.includes('duplicate key')) {
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Duplicate key error detected, retrying with new ID (attempt ${retryCount}/${maxRetries})`);
            
            // Generate a new ID and retry
            const newId = await generateNextNotificationId();
            currentFormData = { ...currentFormData, notification_id: newId };
            console.log(`Generated new ID for retry: ${newId}`);
            
            // Update the form display
            setFormData(prev => ({ ...prev, notification_id: newId }));
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          } else {
            // Max retries reached
            Swal.fire({
              icon: "error",
              title: "Unable to create notification",
              text: "Please try again. The system is experiencing high load.",
            });
            return;
          }
        } else {
          // Other error, show normal error message
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response?.data?.message || "Error adding notification",
          });
          return;
        }
      }
    }
  };

  const minNow = nowLocalInputValue();

  const inputBase =
    "w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50";
  const inputError = "border-red-500 ring-1 ring-red-500";
  const labelCls = "block text-sm font-semibold mb-2";
  const errorText = "text-red-600 text-xs mt-1 flex items-center";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold" style={{ color: "#d3af37" }}>Create New Notification</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">Fill in the details to create a new notification</p>
        </div>
        
        <form
          className="p-8"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* ID */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Notification ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={loading ? "Generating..." : formData.notification_id}
              readOnly
              disabled={loading}
              className={`${inputBase} bg-gray-100 cursor-not-allowed`}
              style={{
                backgroundColor: "#f0f0f0",
                color: loading ? "#9ca3af" : "#0a0a0a",
                borderColor: "#d3af37"
              }}
            />
            <small className="text-gray-500 text-xs mt-1">Automatically generated by the system</small>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter an engaging notification title"
              value={formData.title}
              onChange={handleChange("title")}
              aria-invalid={!!errors.title}
              className={`${inputBase} ${errors.title ? inputError : ""}`}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: errors.title ? "#ef4444" : "#d3af37"
              }}
            />
            {errors.title && (
              <div className={errorText}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Message <span className="text-red-500">*</span></label>
            <textarea
              placeholder="Enter the notification message content"
              rows={4}
              value={formData.message}
              onChange={handleChange("message")}
              aria-invalid={!!errors.message}
              className={`${inputBase} ${errors.message ? inputError : ""}`}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: errors.message ? "#ef4444" : "#d3af37"
              }}
            />
            {errors.message && (
              <div className={errorText}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.message}
              </div>
            )}
          </div>

      {/* Type */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={formData.type}
            onChange={handleChange("type")}
            aria-invalid={!!errors.type}
            className={`${inputBase} ${errors.type ? inputError : ""}`}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.type && <small className={errorText}>{errors.type}</small>}
        </div>

        {/* Priority */}
        <div>
          <label className={labelCls}>Priority</label>
          <select
            value={formData.priority}
            onChange={handleChange("priority")}
            aria-invalid={!!errors.priority}
            className={`${inputBase} ${errors.priority ? inputError : ""}`}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.priority && <small className={errorText}>{errors.priority}</small>}
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={formData.status}
            onChange={handleChange("status")}
            aria-invalid={!!errors.status}
            className={`${inputBase} ${errors.status ? inputError : ""}`}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.status && <small className={errorText}>{errors.status}</small>}
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Scheduled At</label>
          <input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={handleChange("scheduled_at")}
            min={minNow}
            aria-invalid={!!errors.scheduled_at}
            className={`${inputBase} ${errors.scheduled_at ? inputError : ""}`}
          />
          {errors.scheduled_at && <small className={errorText}>{errors.scheduled_at}</small>}
        </div>

        <div>
          <label className={labelCls}>Created At</label>
          <input
            type="datetime-local"
            value={formData.created_at}
            readOnly
            disabled
            className={`${inputBase} bg-gray-100 cursor-not-allowed`}
          />
          <small className="text-gray-500 text-xs mt-1">Automatically set to current date and time</small>
        </div>

      </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating ID...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Notification
                </>
              )}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
