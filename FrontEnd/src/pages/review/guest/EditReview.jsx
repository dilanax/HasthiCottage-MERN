// src/pages/review/EditReview.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditReview = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate(); // Replace useHistory with useNavigate
  const [review, setReview] = useState({
    firstName: '',
    lastName: '',
    userEmail: '',
    rating: 1,
    comment: '',
  });

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await axios.get(`/get/${reviewId}`);
        setReview(response.data.review);
      } catch (error) {
        alert('Error fetching review');
      }
    };

    fetchReview();
  }, [reviewId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/update/${reviewId}`, review);
      alert(response.data.message);
      navigate('/review'); // Use navigate() to redirect
    } catch (error) {
      alert('Error updating review');
    }
  };

  return (
    <div className="p-6 bg-primary text-tertiary font-merriweather">
      <h1 className="text-3xl font-amatic mb-4">Edit Review</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
            type="text"
            placeholder="First Name"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#d3af37] focus:outline-none"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
        />
        <input
            type="text"
            placeholder="Last Name"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#d3af37] focus:outline-none"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)} 
        />
        
        <input
          type="number"
          min="1"
          max="5"
          placeholder="Rating (1-5)"
          className="p-2 border border-gray-300 rounded"
          value={review.rating}
          onChange={(e) => setReview({ ...review, rating: e.target.value })}
        />
        <textarea
          placeholder="Your Comments"
          className="p-2 border border-gray-300 rounded"
          value={review.comment}
          onChange={(e) => setReview({ ...review, comment: e.target.value })}
        />
        <button type="submit" className="bg-secondary text-white p-2 rounded">
          Update Review
        </button>
      </form>
    </div>
  );
};

export default EditReview;
