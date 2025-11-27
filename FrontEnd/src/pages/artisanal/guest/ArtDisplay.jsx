// src/pages/artisanal/ArtDisplay.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../api/axios';
import GuestArtisanalCard from '../../../components/artisanal/guestArtisanalCard';

const ArtDisplay = () => {
  const [artisanalItems, setArtisanalItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisanalItems = async () => {
      try {
        const response = await axios.get('/artisanal/all');
        const allItems = response.data.artisanal || [];
        // Sort by creation date (newest first) and take only the latest 4 items
        const latestItems = allItems
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        setArtisanalItems(latestItems);
      } catch (error) {
        console.error('Error fetching artisanal items:', error);
        alert('Error fetching artisanal items');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanalItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <h1 className="text-5xl flex items-center justify-center font-bold text-gray-900 mb-2">Latest Artisanal</h1> <br/>
          <p className="text-lg flex items-center justify-center text-gray-600">Discover our newest handmade treasures crafted with passion.</p>
        </div>
        <br/>

        {/* Grid View */}
        {artisanalItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artisanalItems.map((item) => (
                <GuestArtisanalCard key={item.artisanalId} artisanal={item} />
              ))}
            </div>
            
            {/* View All Button */}
            <div className="text-center mt-8">
              <Link
                to="/artisanal/all"
                className="inline-flex items-center gap-2 bg-[#d3af37] border border-[#d3af37] text-white px-8 py-3 rounded-full hover:bg-[#b5952b] hover:border-[#b5952b] hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View All Artisanal
              </Link>
            </div>
            <br/>
            
            <div className="mt-6 text-center text-lg text-gray-600">
              You can buy our <b>handmade treasures</b> at the <b>hotel</b>. Thank You!
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🎨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
            <p className="text-gray-600">
              No artisanal items are currently available. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtDisplay;