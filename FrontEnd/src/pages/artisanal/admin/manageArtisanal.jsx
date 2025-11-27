// src/pages/artisanal/admin/manageArtisanal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import AdminArtisanalCard from '../../../components/artisanal/adminArtisanalCard';
import { Plus, Download, FileText } from 'lucide-react';
import { generateArtisanalPDF } from '../../../utils/pdfReportGenerator';

const ManageArtisanal = () => {
  const [artisanalItems, setArtisanalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtisanalItems = async () => {
      try {
        const response = await axios.get('/artisanal/all');
        setArtisanalItems(response.data.artisanal || []);
      } catch (error) {
        console.error('Error fetching artisanal items:', error);
        alert('Error fetching artisanal items');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanalItems();
  }, []);

  // Get unique categories for filter
  const categories = [...new Set(artisanalItems
    .map(item => item.category)
    .filter(category => category && category.trim() !== '')
  )];

  // Filter items based on search term and category
  const filteredItems = artisanalItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle navigation to create page
  const handleAddItemClick = () => {
    navigate('/artisanal/create');
  };

  // Generate and export PDF analysis
  const generatePDFReport = async () => {
    try {
      console.log('Starting PDF generation...');
      await generateArtisanalPDF(artisanalItems, filteredItems);
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading artisanal items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Artisanal Collection</h1>
            <p className="text-gray-600">Handcrafted treasures made with passion</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={generatePDFReport}
              className="flex items-center gap-2 bg-[#d3af37] text-white px-6 py-3 rounded-lg hover:bg-[#b5952b] transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              Export PDF Report
            </button>
            
            <button
              onClick={handleAddItemClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Showing {filteredItems.length} of {artisanalItems.length} items
              </p>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Grid View */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <AdminArtisanalCard key={item.artisanalId} artisanal={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search terms or filters."
                : "No artisanal items available yet. Add your first item!"
              }
            </p>
            <button
              onClick={handleAddItemClick}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Item
            </button>
          </div>
        )}

        {/* Total items count */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Total items: {filteredItems.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageArtisanal;
