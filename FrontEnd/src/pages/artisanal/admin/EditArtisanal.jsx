// src/pages/artisanal/EditArtisanal.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditArtisanal = () => {
  const { artisanalId } = useParams();
  const navigate = useNavigate();
  const [artisanal, setArtisanal] = useState({
    name: '',
    price: '',
    description: '',
    images: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisanal = async () => {
      try {
        const response = await axios.get(`/artisanal/get/${artisanalId}`);
        setArtisanal(response.data.artisanal);
        setLoading(false);
      } catch (error) {
        alert('Error fetching artisanal item');
        setLoading(false);
      }
    };

    fetchArtisanal();
  }, [artisanalId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/artisanal/update/${artisanalId}`, artisanal);
      alert(response.data.message);
      navigate('/artisanal');
    } catch (error) {
      alert('Error updating artisanal item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d3af37] border-t-transparent mx-auto"></div>
          <p className="text-[#0a0a0a]/70 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight">
            Edit Item
          </h1>
          <p className="text-lg text-[#0a0a0a]/70">
            Update the details of your artisanal piece
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#d3af37] to-[#d3af37]/80 p-6">
            <h2 className="text-2xl font-semibold text-[#0a0a0a]">Edit Details</h2>
          </div>
          
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0a0a0a]/80 uppercase tracking-wide">
                Item Name
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                className="w-full p-4 border-2 border-[#f0f0f0] rounded-2xl bg-[#f0f0f0]/30 text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:border-[#d3af37] focus:bg-white focus:outline-none transition-all duration-300"
                value={artisanal.name}
                onChange={(e) => setArtisanal({ ...artisanal, name: e.target.value })}
              />
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0a0a0a]/80 uppercase tracking-wide">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-[#0a0a0a]/60 font-medium">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-4 pl-8 border-2 border-[#f0f0f0] rounded-2xl bg-[#f0f0f0]/30 text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:border-[#d3af37] focus:bg-white focus:outline-none transition-all duration-300"
                  value={artisanal.price}
                  onChange={(e) => setArtisanal({ ...artisanal, price: e.target.value })}
                />
              </div>
            </div>

            {/* Category Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0a0a0a]/80 uppercase tracking-wide">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g., Pottery, Jewelry, Textiles"
                className="w-full p-4 border-2 border-[#f0f0f0] rounded-2xl bg-[#f0f0f0]/30 text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:border-[#d3af37] focus:bg-white focus:outline-none transition-all duration-300"
                value={artisanal.category}
                onChange={(e) => setArtisanal({ ...artisanal, category: e.target.value })}
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0a0a0a]/80 uppercase tracking-wide">
                Description
              </label>
              <textarea
                placeholder="Describe the item's features, materials, and craftsmanship..."
                rows="5"
                className="w-full p-4 border-2 border-[#f0f0f0] rounded-2xl bg-[#f0f0f0]/30 text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:border-[#d3af37] focus:bg-white focus:outline-none transition-all duration-300 resize-none"
                value={artisanal.description}
                onChange={(e) => setArtisanal({ ...artisanal, description: e.target.value })}
              />
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0a0a0a]/80 uppercase tracking-wide">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full p-4 border-2 border-[#f0f0f0] rounded-2xl bg-[#f0f0f0]/30 text-[#0a0a0a] placeholder-[#0a0a0a]/40 focus:border-[#d3af37] focus:bg-white focus:outline-none transition-all duration-300"
                value={artisanal.images}
                onChange={(e) => setArtisanal({ ...artisanal, images: e.target.value })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate('/artisanal')}
                className="flex-1 bg-[#f0f0f0] hover:bg-[#f0f0f0]/80 text-[#0a0a0a] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-[#0a0a0a]/10"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-[#d3af37] hover:bg-[#d3af37]/90 text-[#0a0a0a] font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Update Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArtisanal;