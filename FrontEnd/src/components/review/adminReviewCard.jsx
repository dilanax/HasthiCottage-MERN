import React, { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import axios from "../../api/axios";

const AdminReviewCard = ({ review, onReviewDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Get display name - show firstName and lastName if available
  const getDisplayName = () => {
    if (review.firstName && review.lastName) {
      return `${review.firstName} ${review.lastName}`;
    } else if (review.firstName) {
      return review.firstName;
    } else if (review.lastName) {
      return review.lastName;
    } else {
      return "Anonymous";
    }
  };

  // Delete review handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/review/delete/${review.reviewId}`);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Call parent callback instead of reloading page
        if (onReviewDeleted) {
          onReviewDeleted(review.reviewId);
        }
      }, 2000);
      
    } catch (error) {
      alert("Error deleting review");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          Review deleted successfully!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Delete Review
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Card */}
      <div className="bg-white shadow-lg rounded-2xl p-5 border border-[#d3af37]/30 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Delete Button */}
        <button
          onClick={openDeleteModal}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
          title="Delete Review"
          disabled={isDeleting}
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {/* Reviewer Name */}
        <h3 className="text-xl text-gray-800 mb-2">
          {getDisplayName()}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.rating
                  ? "text-[#d3af37] fill-[#d3af37]"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-500">({review.rating}/5)</span>
        </div>

        {/* Comment */}
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          {review.comment || "No comment provided."}
        </p>

        {/* Timestamp */}
        <p className="text-sm text-gray-500 italic text-right">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default AdminReviewCard;
