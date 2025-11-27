import React from 'react';

export default function PromotionCard({ 
  promotion, 
  onViewDetails, 
  onApplyPromotion,
  onEdit,
  onDelete,
  className = "" 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food Promotions':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'Safari Package Promotions':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Room Reservation Promotions':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'Food Promotions':
        return 'from-orange-500 to-red-500';
      case 'Safari Package Promotions':
        return 'from-green-500 to-emerald-500';
      case 'Room Reservation Promotions':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-yellow-500 to-amber-500';
    }
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case 'Food Promotions':
        return 'bg-orange-50';
      case 'Safari Package Promotions':
        return 'bg-green-50';
      case 'Room Reservation Promotions':
        return 'bg-blue-50';
      default:
        return 'bg-yellow-50';
    }
  };

  return (
    <div className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 ${className}`} style={{ backgroundColor: '#f0f0f0' }}>
      {/* Gradient Header Background */}
      <div className={`absolute top-0 left-0 right-0 h-2`} style={{ background: '#d3af37' }}></div>
      
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(promotion.status)}`}>
          {promotion.status?.toUpperCase()}
        </span>
      </div>

      <div className="p-8">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-4 rounded-2xl shadow-sm`} style={{ backgroundColor: '#d3af37' }}>
            <div className={`text-white`}>
              {getCategoryIcon(promotion.promotion_category)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 line-clamp-2 transition-colors" style={{ color: '#0a0a0a' }}>
              {promotion.title}
            </h3>
            <p className="text-sm font-medium uppercase tracking-wide" style={{ color: '#0a0a0a' }}>
              {promotion.promotion_category}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: '#0a0a0a' }}>
          {promotion.description}
        </p>

        {/* Discount Highlight Card */}
        <div className={`relative overflow-hidden rounded-2xl p-6 mb-6 border`} style={{ backgroundColor: '#d3af37', borderColor: '#d3af37' }}>
          <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="currentColor" style={{ color: '#0a0a0a' }} />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#0a0a0a' }}>Special Discount</p>
                <p className="text-3xl font-black" style={{ color: '#0a0a0a' }}>
                  {promotion.discount_value}
                  <span className="text-lg font-semibold ml-1">
                    {promotion.discount_type === 'percentage' ? '%' : ' LKR'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-1" style={{ color: '#0a0a0a' }}>Valid Until</p>
                <p className="text-lg font-bold" style={{ color: '#0a0a0a' }}>
                  {formatDate(promotion.end_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="flex items-center justify-between text-sm mb-6 px-2" style={{ color: '#0a0a0a' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d3af37' }}></div>
            <span className="font-medium">From: {formatDate(promotion.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d3af37' }}></div>
            <span className="font-medium">To: {formatDate(promotion.end_date)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="flex gap-3">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(promotion)}
                className="flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border"
                style={{ 
                  backgroundColor: '#f0f0f0', 
                  color: '#0a0a0a',
                  borderColor: '#d3af37'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d3af37';
                  e.target.style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.color = '#0a0a0a';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            )}
            {onApplyPromotion && promotion.status === 'active' && (
              <button
                onClick={() => onApplyPromotion(promotion)}
                className="flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b8941f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#d3af37';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Apply Promotion
              </button>
            )}
          </div>

          {/* Admin Actions */}
          {(onEdit || onDelete) && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              {onEdit && (
                <button
                  onClick={() => onEdit(promotion)}
                  className="flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b8941f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#d3af37';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(promotion)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}