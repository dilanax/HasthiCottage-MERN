// src/components/review/CreateReviewCard.jsx
import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Star, Send, Sparkles, User, MessageSquare, Award } from "lucide-react";

const CreateReviewCard = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Autofill user data when component mounts or when user logs in
  useEffect(() => {
    const checkAndFillUserData = () => {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (userData && token) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          if (user.firstName && user.lastName) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsLoggedIn(false);
        }
      } else {
        // Clear fields if user is not logged in
        setFirstName("");
        setLastName("");
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkAndFillUserData();

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => checkAndFillUserData();
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Professional color scheme with gold
  const colors = {
    primary: '#ffffff',      // Pure white background
    secondary: '#d3af37',    // Gold accent
    tertiary: '#1e293b',     // Dark slate text
    accent: '#f8fafc',       // Light gray accent
    border: '#e2e8f0'        // Light border
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || rating === 0 || !comment) {
      alert("Please fill all fields and select a rating!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/review/create", { 
        firstName, 
        lastName,
        rating, 
        comment 
      });
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFirstName("");
        setLastName("");
        setRating(0);
        setComment("");
      }, 2000);
      
    } catch (error) {
      alert("Error creating review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-6 h-6 cursor-pointer transition-all duration-200 transform hover:scale-110 ${
          (hoverRating || rating) >= star
            ? "text-amber-400 fill-amber-400"
            : "text-gray-300 hover:text-amber-200"
        }`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      />
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl border">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Submitted Successfully</h3>
            <p className="text-gray-600">Thank you for your valuable feedback.</p>
          </div>
        </div>
      )}

      {/* Main Review Card - Landscape Layout */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex min-h-[400px]">
          {/* Left Side - Header/Branding */}
          <div 
            className="w-72 p-6 flex flex-col justify-center text-white relative overflow-hidden"
            style={{ backgroundColor: colors.secondary }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 right-3">
                <Award className="w-20 h-20" />
              </div>
              <div className="absolute bottom-3 left-3">
                <Star className="w-14 h-14" />
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold mb-2">
                Share Your
                <br />
                Experience
              </h1>
              
              <div className="space-y-1 text-xs text-yellow-100">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  <span>Rate your experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Verified reviews only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  <span>Quality service commitment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Leave a Review</h2>
                <p className="text-sm text-gray-600">Please provide your honest feedback about our service</p>
                
              </div>

              <div className="flex-1 space-y-6">
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                      {isLoggedIn && firstName && (
                        <span className="ml-2 text-xs text-green-600 font-normal">(Auto-filled)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm ${
                        isLoggedIn && firstName 
                          ? 'border-green-300 bg-green-50 focus:bg-white' 
                          : 'border-gray-300 bg-gray-50 focus:bg-white'
                      }`}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                      {isLoggedIn && lastName && (
                        <span className="ml-2 text-xs text-green-600 font-normal">(Auto-filled)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm ${
                        isLoggedIn && lastName 
                          ? 'border-green-300 bg-green-50 focus:bg-white' 
                          : 'border-gray-300 bg-gray-50 focus:bg-white'
                      }`}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Star Rating - Below Name Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Your Experience
                  </label>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars()}
                  </div>
                  <span className="text-xs text-gray-500">
                    {rating > 0 ? `${rating} out of 5 stars` : 'Click stars to rate your experience'}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    placeholder="Please share your experience with our service. What did you like? How could we improve?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none h-24 bg-gray-50 focus:bg-white text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Minimum 10 characters required
                    </span>
                    <span className={`text-xs ${comment.length > 450 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {comment.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button and Privacy */}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Your information will remain private and only be used for verification purposes.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !firstName || !lastName || rating === 0 || !comment || comment.length < 10}
                    className="px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 min-w-[140px] text-sm"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewCard;