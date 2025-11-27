import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import GuestArtisanalCard from '../../../components/artisanal/guestArtisanalCard';
import AuthHeader from '../../../components/AuthHeader';
import Footer from '../../../components/Footer';
import { ArrowLeft, Filter, Search } from 'lucide-react';

const AllArtisanal = () => {
  const [artisanalItems, setArtisanalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-high', 'price-low'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtisanalItems = async () => {
      try {
        const response = await axios.get('/artisanal/all');
        setArtisanalItems(response.data.artisanal || []);
      } catch (error) {
        console.error("Error fetching all artisanal items:", error);
        setError("Error loading artisanal items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtisanalItems();
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique categories
  const categories = [...new Set(artisanalItems
    .map(item => item.category)
    .filter(category => category && category.trim() !== '')
  )];

  const filteredAndSortedItems = [...artisanalItems]
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'price-low') return a.price - b.price;
      return 0;
    });

  const totalItems = artisanalItems.length;
  const averagePrice = totalItems > 0 
    ? (artisanalItems.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all artisanal items...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 text-center flex-1">All Artisanal Collection</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Explore our complete collection of handcrafted treasures and unique artisanal items.
        </p>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1 w-full">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
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
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedItems.length} of {totalItems} items
            {(searchTerm || selectedCategory !== 'all') && (
              <span className="ml-2 text-blue-600">
                (filtered results)
              </span>
            )}
          </p>
        </div>

        {/* Items Grid */}
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
        ) : filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item, index) => (
              <GuestArtisanalCard key={item.artisanalId || index} artisanal={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all'
                ? "Adjust your filters or try a different search term."
                : "No artisanal items are currently available."
              }
            </p>
          </div>
        )}

        {/* Back to Top Button */}
        {filteredAndSortedItems.length > 8 && (
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

        {/* Footer Message */}
        <div className="mt-12 text-center text-lg text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p>
            You can purchase our <b>handmade treasures</b> at the <b>hotel</b>. 
            Each item is carefully crafted with passion and attention to detail. Thank you!
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllArtisanal;
