import React from "react";

const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function UserPromotionCard({ promotion }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food Promotions":
        return "🍽️";
      case "Safari Package Promotions":
        return "🦁";
      case "Room Reservation Promotions":
        return "🏨";
      default:
        return "🎯";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Food Promotions":
        return "#ff6b6b";
      case "Safari Package Promotions":
        return "#4ecdc4";
      case "Room Reservation Promotions":
        return "#45b7d1";
      default:
        return "#d3af37";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={{ 
        backgroundColor: "#ffffff", 
        color: "#0a0a0a",
        border: "2px solid #d3af37"
      }}
    >
      {/* Category Badge */}
      <div 
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
        style={{ 
          backgroundColor: getCategoryColor(promotion?.promotion_category),
          color: "#ffffff"
        }}
      >
        <span>{getCategoryIcon(promotion?.promotion_category)}</span>
        <span className="hidden sm:inline">{promotion?.promotion_category?.split(' ')[0]}</span>
      </div>

      {/* Status Indicator */}
      <div 
        className="absolute top-4 left-4 w-3 h-3 rounded-full"
        style={{ backgroundColor: getStatusColor(promotion?.status) }}
      ></div>

      <div className="p-6 pt-12">
        {/* Title */}
        <h3 
          className="text-xl font-bold mb-3 leading-tight"
          style={{ color: "#0a0a0a" }}
        >
          {promotion?.title}
        </h3>

        {/* Category Display */}
        <div className="mb-3">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ 
              backgroundColor: getCategoryColor(promotion?.promotion_category),
              color: "#ffffff"
            }}
          >
            <span className="text-sm">{getCategoryIcon(promotion?.promotion_category)}</span>
            <span>{promotion?.promotion_category}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-4 text-gray-600 line-clamp-3">
          {promotion?.description}
        </p>

        {/* Discount Highlight */}
        <div 
          className="mb-4 p-3 rounded-xl text-center font-bold"
          style={{ 
            backgroundColor: "#d3af37",
            color: "#0a0a0a"
          }}
        >
          <div className="text-lg">
            {promotion?.discount_value} {promotion?.discount_type} OFF
          </div>
          <div className="text-xs opacity-80">Special Discount</div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="text-xs font-semibold text-gray-500 mb-1">START DATE</div>
            <div className="text-sm font-bold" style={{ color: "#0a0a0a" }}>
              {safeDate(promotion?.start_date)}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="text-xs font-semibold text-gray-500 mb-1">END DATE</div>
            <div className="text-sm font-bold" style={{ color: "#0a0a0a" }}>
              {safeDate(promotion?.end_date)}
            </div>
          </div>
        </div>

        {/* Category Type Display */}
        <div className="mb-4">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: getCategoryColor(promotion?.promotion_category) + "20",
              color: getCategoryColor(promotion?.promotion_category),
              border: `2px solid ${getCategoryColor(promotion?.promotion_category)}40`
            }}
          >
            <span className="text-lg">{getCategoryIcon(promotion?.promotion_category)}</span>
            <span>{promotion?.promotion_category}</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 text-center">
          <span 
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: getStatusColor(promotion?.status) + "20",
              color: getStatusColor(promotion?.status)
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(promotion?.status) }}
            ></div>
            {promotion?.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      ></div>
    </div>
  );
}
