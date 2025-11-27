// src/pages/review/manageReview.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import AdminReviewCard from '../../../components/review/adminReviewCard';
import { FileText, BarChart3, TrendingUp, Users, Star } from 'lucide-react';
import { generateReviewsPDF } from '../../../utils/pdfReportGenerator';

const ManageReview = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch all reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/review/all');
        setReviews(res.data);
        setFilteredReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        alert("Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Apply all filters
  const applyFilters = () => {
    setSearchLoading(true);
    try {
      let filtered = [...reviews];

      // Filter by user name
      if (searchName.trim()) {
        const searchTerm = searchName.trim().toLowerCase();
        filtered = filtered.filter(review => 
          review.firstName?.toLowerCase().includes(searchTerm) ||
          review.lastName?.toLowerCase().includes(searchTerm) ||
          `${review.firstName} ${review.lastName}`.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by rating
      if (filterRating !== 'all') {
        filtered = filtered.filter(review => review.rating === parseInt(filterRating));
      }

      // Filter by date
      if (filterDate !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(review => {
          const reviewDate = new Date(review.createdAt);
          const reviewDateOnly = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
          
          switch (filterDate) {
            case 'today':
              return reviewDateOnly.getTime() === today.getTime();
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              return reviewDateOnly >= weekAgo;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              return reviewDateOnly >= monthAgo;
            case 'year':
              const yearAgo = new Date(today);
              yearAgo.setFullYear(today.getFullYear() - 1);
              return reviewDateOnly >= yearAgo;
            default:
              return true;
          }
        });
      }

      setFilteredReviews(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
      alert("Error applying filters");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search by user name
  const handleSearch = () => {
    applyFilters();
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle review deletion from child component
  const handleReviewDeleted = (deletedReviewId) => {
    const updatedReviews = reviews.filter(review => review.reviewId !== deletedReviewId);
    setReviews(updatedReviews);
    // Reapply filters after deletion
    setTimeout(() => applyFilters(), 100);
  };

  // Clear all filters and show all reviews
  const handleClearFilters = () => {
    setSearchName('');
    setFilterRating('all');
    setFilterDate('all');
    setFilteredReviews(reviews);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'rating') {
      setFilterRating(value);
    } else if (filterType === 'date') {
      setFilterDate(value);
    }
    // Apply filters after a short delay to avoid too many calls
    setTimeout(() => applyFilters(), 100);
  };


  // Generate and export PDF analysis
  const generatePDFReport = async () => {
    try {
      console.log('Starting PDF generation...');
      await generateReviewsPDF(reviews, filteredReviews);
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const dataToAnalyze = filteredReviews.length > 0 ? filteredReviews : reviews;
    const totalReviews = dataToAnalyze.length;
    
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
        satisfactionScore: 0,
        recentTrend: 'stable',
        topFeedback: []
      };
    }

    const averageRating = (dataToAnalyze.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(2);
    
    // Rating distribution
    const ratingDistribution = dataToAnalyze.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {});

    // Satisfaction score (4-5 stars percentage)
    const satisfiedReviews = (ratingDistribution[4] || 0) + (ratingDistribution[5] || 0);
    const satisfactionScore = ((satisfiedReviews / totalReviews) * 100).toFixed(1);

    // Recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentWeek = dataToAnalyze.filter(review => new Date(review.createdAt) >= weekAgo);
    const previousWeek = dataToAnalyze.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return reviewDate >= twoWeeksAgo && reviewDate < weekAgo;
    });

    const recentAvg = recentWeek.length > 0 ? recentWeek.reduce((sum, r) => sum + r.rating, 0) / recentWeek.length : 0;
    const previousAvg = previousWeek.length > 0 ? previousWeek.reduce((sum, r) => sum + r.rating, 0) / previousWeek.length : 0;
    
    let recentTrend = 'stable';
    if (recentAvg > previousAvg + 0.2) recentTrend = 'improving';
    else if (recentAvg < previousAvg - 0.2) recentTrend = 'declining';

    // Most common feedback themes (simplified)
    const comments = dataToAnalyze.filter(r => r.comment && r.comment.trim()).map(r => r.comment.toLowerCase());
    const commonWords = {};
    comments.forEach(comment => {
      const words = comment.split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => {
        commonWords[word] = (commonWords[word] || 0) + 1;
      });
    });
    
    const topFeedback = Object.entries(commonWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    return {
      averageRating: parseFloat(averageRating),
      totalReviews,
      ratingDistribution,
      satisfactionScore: parseFloat(satisfactionScore),
      recentTrend,
      topFeedback,
      recentWeekCount: recentWeek.length,
      previousWeekCount: previousWeek.length
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Customer Reviews</h1>
            <p className="text-gray-600">View and manage customer feedback</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={generatePDFReport}
              className="flex items-center gap-2 bg-[#d3af37] text-white px-6 py-3 rounded-lg hover:bg-[#b5952b] transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              Export PDF Report
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Reviews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* User Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by User Name
              </label>
              <input
                type="text"
                id="search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter first name, last name, or full name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rating
              </label>
              <select
                id="rating-filter"
                value={filterRating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <select
                id="date-filter"
                value={filterDate}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {searchLoading ? 'Searching...' : 'Apply Filters'}
            </button>
            
            {(searchName || filterRating !== 'all' || filterDate !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
          
          {/* Filter results info */}
          {(searchName || filterRating !== 'all' || filterDate !== 'all') && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredReviews.length === 0 ? (
                <p>No reviews found matching your filters.</p>
              ) : (
                <p>
                  Showing {filteredReviews.length} of {reviews.length} reviews
                  {searchName && ` for "${searchName}"`}
                  {filterRating !== 'all' && ` with ${filterRating} stars`}
                  {filterDate !== 'all' && ` from ${filterDate}`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#d3af37]" />
            <h3 className="text-lg font-semibold text-gray-800">Analytics & Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Average Rating */}
            <div className="bg-gradient-to-br from-[#d3af37] to-[#b5952b] rounded-lg p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs font-medium">Average Rating</span>
              </div>
              <div className="text-2xl font-bold">{analytics.averageRating}</div>
              <div className="text-xs opacity-90">out of 5.0</div>
            </div>

            {/* Total Reviews */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Total Reviews</span>
              </div>
              <div className="text-2xl font-bold">{analytics.totalReviews}</div>
              <div className="text-xs opacity-90">customer feedback</div>
            </div>

            {/* Satisfaction Score */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Satisfaction</span>
              </div>
              <div className="text-2xl font-bold">{analytics.satisfactionScore}%</div>
              <div className="text-xs opacity-90">4-5 star reviews</div>
            </div>

            {/* Recent Trend */}
            <div className={`rounded-lg p-3 text-white ${
              analytics.recentTrend === 'improving' ? 'bg-gradient-to-br from-green-500 to-green-600' :
              analytics.recentTrend === 'declining' ? 'bg-gradient-to-br from-red-500 to-red-600' :
              'bg-gradient-to-br from-gray-500 to-gray-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Trend</span>
              </div>
              <div className="text-lg font-bold capitalize">{analytics.recentTrend}</div>
              <div className="text-xs opacity-90">vs last week</div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="mb-4">
            <h4 className="text-base font-semibold text-gray-800 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = analytics.ratingDistribution[rating] || 0;
                const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="w-4 h-4 text-[#d3af37]" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-[#d3af37] h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-20 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Feedback Themes */}
          {analytics.topFeedback.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-3">Most Common Feedback Themes</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.topFeedback.map(({ word, count }, index) => (
                  <span 
                    key={word}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#d3af37]/10 text-[#d3af37] rounded-full text-sm font-medium"
                  >
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && (
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <AdminReviewCard 
                  key={review.reviewId} 
                  review={review} 
                  onReviewDeleted={handleReviewDeleted}
                />
              ))
            ) : (
              !loading && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-600">
                    {searchName 
                      ? "Try searching with a different name or clear the search to see all reviews."
                      : "There are no reviews available at the moment."
                    }
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Total reviews count */}
        {!loading && filteredReviews.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredReviews.length} of {reviews.length} total reviews
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReview;
