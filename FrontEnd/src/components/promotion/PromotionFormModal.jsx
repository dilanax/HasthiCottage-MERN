import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const TYPE_OPTIONS = ["percentage", "fixed"];
const CATEGORY_OPTIONS = [
  "Food Promotions",
  "Safari Package Promotions",
  "Room Reservation Promotions",
];

// helpers
function pad(n) {
  return String(n).padStart(2, "0");
}
function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function wordCount(s = "") {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function isAlnum(s = "") {
  return /^[A-Za-z0-9]+$/.test(s);
}

export default function PromotionFormModal({ 
  onAdd, 
  onUpdate, 
  onClose, 
  editingPromotion = null,
  isEditMode = false 
}) {
  const [formData, setFormData] = useState({
    promotion_id: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    discount_type: "",
    discount_value: "",
    status: "active",
    promotion_category: "Food Promotions",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Function to generate next sequential promotion ID using backend API
  const generateNextPromotionId = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/promotions/next-id');
      const nextId = response.data.data.promotion_id;
      console.log(`Generated next Promotion ID from backend: ${nextId}`);
      return nextId;
    } catch (error) {
      console.error('Error fetching next promotion ID from backend:', error);
      // Fallback to timestamp-based ID
      const timestampId = Math.floor(Date.now() / 1000) % 10000;
      console.log(`Generated ID from fallback: P${String(timestampId).padStart(3, '0')}`);
      return `P${String(timestampId).padStart(3, '0')}`;
    }
  };

  // Generate promotion ID on component mount
  useEffect(() => {
    const initializeForm = async () => {
      if (!isEditMode) {
        // Only generate new ID for new promotions
        const nextId = await generateNextPromotionId();
        setFormData(prev => ({ ...prev, promotion_id: nextId }));
      }
      setLoading(false);
    };
    
    initializeForm();
  }, [isEditMode]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && editingPromotion) {
      setFormData({
        promotion_id: editingPromotion.promotion_id || "",
        title: editingPromotion.title || "",
        description: editingPromotion.description || "",
        start_date: editingPromotion.start_date ? editingPromotion.start_date.split('T')[0] : "",
        end_date: editingPromotion.end_date ? editingPromotion.end_date.split('T')[0] : "",
        discount_type: editingPromotion.discount_type || "",
        discount_value: editingPromotion.discount_value || "",
        status: editingPromotion.status || "active",
        promotion_category: editingPromotion.promotion_category || "Food Promotions",
      });
      setLoading(false);
    }
  }, [isEditMode, editingPromotion]);

  const validateField = (key, value, snapshot) => {
    switch (key) {
      case "promotion_id":
        // Promotion ID is auto-generated, no validation needed
        return;
      case "title":
        if (!value.trim()) return "Title is required.";
        if (wordCount(value) < 3) return "Title must have at least 3 words.";
        if (value.length > 120) return "Title must be ≤ 120 characters.";
        return;
      case "description":
        if (!value.trim()) return "Description is required.";
        if (wordCount(value) < 5) return "Description must have at least 5 words.";
        if (value.length > 2000) return "Description must be ≤ 2000 characters.";
        return;
      case "discount_type":
        if (!TYPE_OPTIONS.includes((value || "").toLowerCase())) {
          return `Discount type must be one of: ${TYPE_OPTIONS.join(" | ")}`;
        }
        return;
      case "discount_value": {
        if (value === "") return "Discount value is required.";
        const num = Number(value);
        if (!Number.isInteger(num)) return "Discount value must be a whole number.";
        if (num <= 0) return "Discount value must be greater than 0.";
        if ((snapshot.discount_type || "").toLowerCase() === "percentage" && num > 100) {
          return "Percentage discount cannot exceed 100.";
        }
        return;
      }
      case "start_date": {
        if (!value) return "Start date is required.";
        const today = new Date(todayYMD());
        const start = new Date(value);
        if (start < today) return "Start date cannot be in the past.";
        if (snapshot.end_date) {
          const end = new Date(snapshot.end_date);
          if (end < start) return "Start date must be before or equal to end date.";
        }
        return;
      }
      case "end_date": {
        if (!value) return "End date is required.";
        const today = new Date(todayYMD());
        const end = new Date(value);
        if (end < today) return "End date cannot be in the past.";
        if (snapshot.start_date) {
          const start = new Date(snapshot.start_date);
          if (end < start) return "End date must be after or equal to start date.";
        }
        return;
      }
      case "promotion_category":
        if (!CATEGORY_OPTIONS.includes(value)) {
          return `Category must be one of: ${CATEGORY_OPTIONS.join(" | ")}`;
        }
        return;
      default:
        return;
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

  const handleChange = (key) => (ev) => {
    const value = ev.target.value;
    const next = { ...formData, [key]: value };
    setFormData(next);
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value, next) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedType =
      TYPE_OPTIONS.find(
        (t) => t.toLowerCase() === (formData.discount_type || "").toLowerCase()
      ) || formData.discount_type;

    const candidate = { ...formData, discount_type: normalizedType };
    const fieldErrors = validateAll(candidate);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      Swal.fire({ icon: "error", title: "Please fix the highlighted fields" });
      return;
    }

    try {
      if (isEditMode && editingPromotion) {
        // Update existing promotion - don't include promotion_id in update
        const payload = {
          title: candidate.title.trim(),
          description: candidate.description.trim(),
          start_date: new Date(candidate.start_date).toISOString(),
          end_date: new Date(candidate.end_date).toISOString(),
          discount_type: candidate.discount_type.toLowerCase(),
          discount_value: Number(candidate.discount_value),
          status: candidate.status,
          promotion_category: candidate.promotion_category,
        };
        
        const response = await axios.put(`http://localhost:5000/api/promotions/${editingPromotion.promotion_id}`, payload);
        onUpdate && onUpdate(response.data?.promotion || payload);
        
        Swal.fire({
          icon: "success",
          title: "Promotion Updated",
          text: "The promotion has been successfully updated!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Create new promotion - backend will generate promotion_id
        const payload = {
          title: candidate.title.trim(),
          description: candidate.description.trim(),
          start_date: new Date(candidate.start_date).toISOString(),
          end_date: new Date(candidate.end_date).toISOString(),
          discount_type: candidate.discount_type.toLowerCase(),
          discount_value: Number(candidate.discount_value),
          status: candidate.status,
          promotion_category: candidate.promotion_category,
        };
        
        const response = await axios.post("http://localhost:5000/api/promotions", payload);
        onAdd && onAdd(response.data?.promotion || payload);
        
        Swal.fire({
          icon: "success",
          title: "Promotion Added",
          text: "The promotion has been successfully added!",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // Reset form
      setFormData({
        promotion_id: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        discount_type: "",
        discount_value: "",
        status: "active",
        promotion_category: "Food Promotions",
      });
      setErrors({});

      onClose && onClose();
    } catch (error) {
      console.error('Promotion form error:', error);
      const errorMessage = error.response?.data?.message || error.message || `Error ${isEditMode ? 'updating' : 'adding'} promotion`;
      
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
        footer: error.response?.data?.error ? `<small>Technical details: ${error.response.data.error}</small>` : undefined
      });
    }
  };

  const today = todayYMD();
  const endMin = formData.start_date || today;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating promotion ID...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold" style={{ color: "#d3af37" }}>
              {isEditMode ? "Edit Promotion" : "Create New Promotion"}
            </h2>
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
          <p className="text-gray-600 mt-2">
            {isEditMode 
              ? "Update the promotion details below" 
              : "Fill in the details to create a new promotion for your customers"
            }
          </p>
        </div>
        
        <form
          className="p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Promotion ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Promotion ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.promotion_id}
              readOnly
              placeholder="Auto-generated promotion ID"
              className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-gray-300 focus:ring-yellow-500 bg-gray-100 cursor-not-allowed"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: "#d3af37"
              }}
            />
            <p className="text-sm text-gray-600 mt-1">
              Automatically generated by the system
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: "#0a0a0a" }}>
              Promotion Category <span className="text-red-500">*</span>
            </label>
            
            {/* Current Category Display */}
            <div className="mb-4">
              <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-white/90 text-sm font-medium mr-3">Category</span>
                    <span className="text-white font-semibold text-lg">
                      {formData.promotion_category || "Select a category"}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, promotion_category: category });
                    setErrors({ ...errors, promotion_category: null });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    formData.promotion_category === category
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#0a0a0a" }}>
                        {category}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category === "Food Promotions" && "Restaurant & dining offers"}
                        {category === "Safari Package Promotions" && "Wildlife & adventure deals"}
                        {category === "Room Reservation Promotions" && "Accommodation discounts"}
                      </div>
                    </div>
                    {formData.promotion_category === category && (
                      <div className="bg-yellow-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {errors.promotion_category && (
              <div className="flex items-center mt-3 text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.promotion_category}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Promotion Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleChange("title")}
              placeholder="Enter an attractive title for your promotion"
              aria-invalid={!!errors.title}
              required
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
              }`}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: errors.title ? "#ef4444" : "#d3af37"
              }}
            />
            {errors.title && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Describe your promotion in detail to attract customers"
              aria-invalid={!!errors.description}
              required
              rows={4}
              className={`w-full resize-y rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
              }`}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: errors.description ? "#ef4444" : "#d3af37"
              }}
            />
            {errors.description && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-4" style={{ color: "#0a0a0a" }}>
              Promotion Period <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange("start_date")}
                  min={today}
                  aria-invalid={!!errors.start_date}
                  required
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.start_date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
                  }`}
                  style={{
                    backgroundColor: "#f0f0f0",
                    color: "#0a0a0a",
                    borderColor: errors.start_date ? "#ef4444" : "#d3af37"
                  }}
                />
                {errors.start_date && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.start_date}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-600">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange("end_date")}
                  min={endMin}
                  aria-invalid={!!errors.end_date}
                  required
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.end_date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
                  }`}
                  style={{
                    backgroundColor: "#f0f0f0",
                    color: "#0a0a0a",
                    borderColor: errors.end_date ? "#ef4444" : "#d3af37"
                  }}
                />
                {errors.end_date && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.end_date}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discount Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discount_type}
              onChange={handleChange("discount_type")}
              aria-invalid={!!errors.discount_type}
              required
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                errors.discount_type ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
              }`}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: errors.discount_type ? "#ef4444" : "#d3af37"
              }}
            >
              <option value="">-- Select Discount Type --</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            {errors.discount_type && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.discount_type}
              </div>
            )}
          </div>

          {/* Discount Value */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Discount Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.discount_value}
                onChange={handleChange("discount_value")}
                placeholder="Enter discount value"
                aria-invalid={!!errors.discount_value}
                required
                min="1"
                step="1"
                className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.discount_value ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-yellow-500"
                }`}
                style={{
                  backgroundColor: "#f0f0f0",
                  color: "#0a0a0a",
                  borderColor: errors.discount_value ? "#ef4444" : "#d3af37"
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">
                  {formData.discount_type === "percentage" ? "%" : "LKR"}
                </span>
              </div>
            </div>
            {errors.discount_value && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.discount_value}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0a0a0a" }}>
              Promotion Status
            </label>
            <select
              value={formData.status}
              onChange={handleChange("status")}
              className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#0a0a0a",
                borderColor: "#d3af37"
              }}
            >
              <option value="active">🟢 Active - Promotion is live</option>
              <option value="inactive">🔴 Inactive - Promotion is paused</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditMode ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
              </svg>
              {isEditMode ? "Update Promotion" : "Create Promotion"}
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
