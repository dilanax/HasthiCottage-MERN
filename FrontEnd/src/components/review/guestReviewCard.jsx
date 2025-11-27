// src/components/review/guestReviewCard.jsx
import React from 'react';
import { Star, Quote } from 'lucide-react';

const GuestReviewCard = ({ review }) => {
  // Color variables
  const colors = {
    accent: '#d3af37',      // Gold accent for name/avatar
    star: '#FFA500',        // Orange for rating stars
    verified: '#4bf63bff',    // Blue for verified dot
    text: '#0a0a0a',        // Text color
    bg: '#f0f0f0'           // Background
  };

  // Generate star rating display
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? `text-[${colors.star}] fill-[${colors.star}]`
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-500">({rating}.0)</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Safely get display name
  const getDisplayName = (name) => {
    return name && name.trim() !== "" ? name : "Anonymous";
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden"
      style={{ width: '380px', height: '250px' }} // Exact dimensions
    >
      {/* Background Decorative Element */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-2xl transform translate-x-6 -translate-y-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: colors.accent + '20' }}
      ></div>
      
      {/* Quote Icon */}
      <div className="absolute top-4 left-4 opacity-5">
        <Quote 
          className="w-12 h-12" 
          style={{ color: colors.accent }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: colors.accent }}
          >
            {getDisplayName(review.firstName).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="font-regular text-lg leading-tight"
              style={{ color: colors.text }}
            >
              {getDisplayName(review.firstName)} {getDisplayName(review.lastName)}
            </h3>
            <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          {renderStars(review.rating)}
        </div>

        {/* Comment - Fixed height with scroll if needed */}
        <div className="relative flex-1 min-h-0">
          <Quote 
            className="absolute -top-2 -left-2 w-4 h-4 opacity-50" 
            style={{ color: colors.accent }}
          />
          <div className="h-full pl-4 overflow-hidden">
            <p 
              className="leading-relaxed text-sm line-clamp-4"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              {review.comment || "No comment provided."}
            </p>
          </div>
        </div>

        {/* Category Tag (if available) */}
        {review.category && (
          <div className="mt-3">
            <span 
              className="inline-block px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: colors.accent + '20',
                color: colors.accent
              }}
            >
              {review.category}
            </span>
          </div>
        )}

        {/* Hover Effect Border */}
        <div 
          className="absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ borderColor: colors.accent + '40' }}
        ></div>
      </div>

      {/* Verified Badge */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.verified }}
        ></div>
        <span className="text-xs" style={{ color: colors.text, opacity: 0.5 }}>
          Verified
        </span>
      </div>

      {/* Inline styles for dynamic colors */}
      <style jsx>{`
        .text-\\[\\#FFA500\\] {
          color: #FFA500;
        }
        .fill-\\[\\#FFA500\\] {
          fill: #FFA500;
        }
        .text-\\[\\#d3af37\\] {
          color: #d3af37;
        }
        .fill-\\[\\#d3af37\\] {
          fill: #d3af37;
        }
      `}</style>
    </div>
  );
};

// Default props for safety
GuestReviewCard.defaultProps = {
  review: {
    firstName: "John",
    lastName: "Doe",
    rating: 5,
    comment: "No comment provided.",
    createdAt: new Date().toISOString(),
    category: ""
  }
};

export default GuestReviewCard;
