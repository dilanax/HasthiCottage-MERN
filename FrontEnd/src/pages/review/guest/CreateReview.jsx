import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import { Star, User } from "lucide-react";

const CreateReview = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // for hover effect
  const [comment, setComment] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || rating === 0 || !comment) {
      alert("Please fill all fields and select a rating!");
      return;
    }
    try {
      const response = await axios.post("/review/create", { firstName, lastName, rating, comment });
      alert(response.data.message);
      setFirstName("");
      setLastName("");
      setRating(0);
      setComment("");
    } catch (error) {
      alert("Error creating review");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
      <h1 className="text-3xl font-amatic text-[#d3af37] mb-6 text-center">
        Write a Review
      </h1>

      {isLoggedIn && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Your name has been automatically filled from your account
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields - Side by Side */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full">
            <label className="block text-sm text-gray-600 mb-1">
              First Name
              {isLoggedIn && firstName && (
                <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
              )}
            </label>
            <input
              type="text"
              placeholder="First Name"
              className={`p-3 border rounded-lg w-full focus:ring-2 focus:ring-[#d3af37] focus:outline-none ${
                isLoggedIn && firstName 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300'
              }`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="block text-sm text-gray-600 mb-1">
              Last Name
              {isLoggedIn && lastName && (
                <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
              )}
            </label>
            <input
              type="text"
              placeholder="Last Name"
              className={`p-3 border rounded-lg w-full focus:ring-2 focus:ring-[#d3af37] focus:outline-none ${
                isLoggedIn && lastName 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300'
              }`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Star Rating - Below Name */}
        <div className="flex flex-col items-center mt-2">
          <label className="text-gray-600 mb-2">Rate your experience</label>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 fill-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You rated: {rating} star{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mt-4">
          <textarea
            placeholder="Your Comments"
            className="p-3 border border-gray-300 rounded-lg w-full h-24 resize-none focus:ring-2 focus:ring-[#d3af37] focus:outline-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#d3af37] text-white font-semibold p-3 rounded-lg w-full hover:bg-[#b5952b] transition-colors mt-4"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default CreateReview;