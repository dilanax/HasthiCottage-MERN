import React from 'react';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';

const AdminArtisanalCard = ({ artisanal }) => {
  console.log('AdminArtisanalCard - artisanal data:', artisanal); // Debug log
  console.log('AdminArtisanalCard - images:', artisanal.images); // Debug log
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await axios.delete(`/artisanal/delete/${artisanal.artisanalId}`);
        alert(response.data.message);
        // Refresh the page to show updated list
        window.location.reload();
      } catch (error) {
        alert('Error deleting artisanal item');
      }
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-3xl">
        <img 
          src={artisanal.images && artisanal.images.length > 0 ? artisanal.images[0] : '/placeholder-art.jpg'} 
          alt={artisanal.name} 
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110" 
          onError={(e) => {
            e.target.src = '/placeholder-art.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#d3af37] text-[#0a0a0a] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            {artisanal.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-bold text-[#0a0a0a] group-hover:text-[#d3af37] transition-colors duration-300">
            {artisanal.name}
          </h2>
          <div className="bg-[#f0f0f0] px-3 py-1 rounded-full">
            <span className="text-[#0a0a0a] font-bold text-lg">${artisanal.price}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#0a0a0a]/70 text-sm leading-relaxed mb-6 line-clamp-3">
          {artisanal.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link 
            to={`/artisanal/edit/${artisanal.artisanalId}`} 
            className="flex-1 bg-[#d3af37] hover:bg-[#d3af37]/90 text-[#0a0a0a] font-semibold py-3 px-4 rounded-2xl transition-all duration-300 text-center transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </Link>
          
          <button 
            onClick={handleDelete} 
            className="flex-1 bg-[#f0f0f0] hover:bg-red-500 text-[#0a0a0a] hover:text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </span>
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-[#d3af37] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default AdminArtisanalCard;
