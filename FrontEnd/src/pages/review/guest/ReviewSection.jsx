// src/pages/home/ReviewSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../api/axios';
import GuestReviewCard from '../../../components/review/guestReviewCard';
import CreateReviewCard from '../../../components/review/CreateReviewCard';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/review/all');
        setReviews(response.data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Error loading reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewCreated = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  // Get top 3 reviews for display in a single line
  const displayedReviews = reviews.slice(0, 3);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why our guests love staying with us. Read their experiences and share your own story.
          </p>
        </div>

        {/* Review Cards in Single Row */}
        <div className="mb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
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
          ) : (
             <>
               <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                 {/* Review Cards Container */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {displayedReviews.map((review, index) => (
                     <div key={review.reviewId || index} className="flex justify-center">
                       <GuestReviewCard review={review} />
                     </div>
                   ))}
                 </div>
                 
                 {/* View All Reviews Button - Right side of review cards */}
                 {reviews.length > 3 && (
                   <div className="flex justify-center items-center">
                     <div className="text-center">
                       <Link
                         to="/reviews/all"
                         className="inline-flex items-center justify-center w-16 h-16 bg-[#d3af37] text-white rounded-full hover:bg-[#b5952b] transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                         title={`View All ${reviews.length} Reviews`}
                       >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </Link>
                      
                     </div>
                   </div>
                 )}
               </div>
             </>
          )}
        </div>

        {/* Review Form Below - Full Width */}
        <div className="flex justify-center">
          <div className="w-full">
            <CreateReviewCard onReviewCreated={handleReviewCreated} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default ReviewSection;