// src/pages/review/guest/AllReviews.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import GuestReviewCard from '../../../components/review/guestReviewCard';
import AuthHeader from '../../../components/AuthHeader';
import Footer from '../../../components/Footer';
import { ArrowLeft, Star, Filter } from 'lucide-react';

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState('all'); // 'all', '5', '4', etc.
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/review/all');
        setReviews(response.data || []);
      } catch (error) {
        console.error("Error fetching all reviews:", error);
        setError("Error loading reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAndSortedReviews = [...reviews]
    .filter(review => {
      if (filterRating === 'all') return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 text-center flex-1">All Customer Reviews</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Explore all feedback from our valued guests.
        </p>

        {/* Statistics Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Overall Rating</h3>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-[#d3af37]">{averageRating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? "text-[#d3af37] fill-[#d3af37]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600 mt-1">{totalReviews} Total Reviews</p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Rating Distribution</h3>
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-8">{star} Star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-[#d3af37] h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter and Sort Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rating
              </label>
              <select
                id="filter"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Oops!</h3>
            <p className="text-gray-600 mb-4 text-center">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedReviews.map((review, index) => (
              <GuestReviewCard key={review.reviewId || index} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              Adjust your filters or try again later.
            </p>
          </div>
        )}

        {/* Back to Top Button */}
        {filteredAndSortedReviews.length > 5 && (
          <div className="text-center mt-12">
            <button
              onClick={handleBackToTop}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-md shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Back to Top
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllReviews;