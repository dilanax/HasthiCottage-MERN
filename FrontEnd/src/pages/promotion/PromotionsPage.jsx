import React, { useState, useEffect } from "react";
import axios from "axios";
import PromotionCard from "../../components/promotion/PromotionCard";
import PromotionForm from "../../components/promotion/PromotionForm";
import PromotionFormModal from "../../components/promotion/PromotionFormModal";
import PromotionsAnalytics from "../admin/PromotionsAnalytics";
import Swal from "sweetalert2";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  const fetchPromotions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/promotions");
      setPromotions(response.data.promotions);
      setFilteredPromotions(response.data.promotions);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching promotions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleAdd = (newPromotion) => {
    setPromotions((prev) => [...prev, newPromotion]);
    setFilteredPromotions((prev) => [...prev, newPromotion]);
    setShowForm(false);
  };

  const handleUpdate = (updated) => {
    setPromotions((prev) =>
      prev.map((p) => (p.promotion_id === updated.promotion_id ? updated : p))
    );
    setFilteredPromotions((prev) =>
      prev.map((p) => (p.promotion_id === updated.promotion_id ? updated : p))
    );
  };

  const handleDelete = async (promotion) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${promotion.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/promotions/${promotion.promotion_id}`);
        setPromotions((prev) => prev.filter((p) => p.promotion_id !== promotion.promotion_id));
        setFilteredPromotions((prev) => prev.filter((p) => p.promotion_id !== promotion.promotion_id));
        Swal.fire('Deleted!', 'The promotion has been deleted successfully.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete the promotion. Please try again.', 'error');
      }
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingPromotion(null);
    setShowEditModal(false);
  };

  // Filter functions
  const applyFilters = () => {
    let filtered = [...promotions];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(promotion => promotion.promotion_category === filters.category);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(promotion => promotion.status === filters.status);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(promotion => 
        new Date(promotion.start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(promotion => 
        new Date(promotion.end_date) <= new Date(filters.endDate)
      );
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(promotion => 
        promotion.title.toLowerCase().includes(searchLower) ||
        promotion.description.toLowerCase().includes(searchLower) ||
        promotion.promotion_category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPromotions(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setFilteredPromotions(promotions);
  };

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, promotions]);

  // Show analytics page if requested
  if (showAnalytics) {
    return <PromotionsAnalytics onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f0f0" }}>
      <div className="max-w-[1200px] mx-auto p-8 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: "#0a0a0a" }}>Promotions</h1>

        {/* Filter Section */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#d3af37' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <h2 className="text-xl font-bold" style={{ color: '#0a0a0a' }}>Filter Promotions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search Term */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0a0a0a' }}>
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, description, or category..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                    style={{ backgroundColor: '#f9f9f9' }}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0a0a0a' }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  style={{ backgroundColor: '#f9f9f9' }}
                >
                  <option value="">All Categories</option>
                  <option value="Food Promotions">Food Promotions</option>
                  <option value="Safari Package Promotions">Safari Package Promotions</option>
                  <option value="Room Reservation Promotions">Room Reservation Promotions</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0a0a0a' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  style={{ backgroundColor: '#f9f9f9' }}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border-2"
                  style={{ 
                    backgroundColor: '#f0f0f0', 
                    color: '#0a0a0a',
                    borderColor: '#d3af37'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d3af37';
                    e.target.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.color = '#0a0a0a';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0a0a0a' }}>
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0a0a0a' }}>
                  End Date (To)
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </div>
            </div>

            {/* Active Filters and Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <p className="text-sm font-medium" style={{ color: '#0a0a0a' }}>
                  Showing {filteredPromotions.length} of {promotions.length} promotions
                </p>
                {(filters.category || filters.status || filters.startDate || filters.endDate || filters.searchTerm) && (
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                        Category: {filters.category}
                      </span>
                    )}
                    {filters.status && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.startDate && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                        From: {filters.startDate}
                      </span>
                    )}
                    {filters.endDate && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                        To: {filters.endDate}
                      </span>
                    )}
                    {filters.searchTerm && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                        Search: "{filters.searchTerm}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mb-6">
          {!showForm && (
            <>
              <button
                onClick={() => setShowAnalytics(true)}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ 
                  backgroundColor: '#4f46e5', 
                  color: '#ffffff',
                  border: '2px solid #4f46e5'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3730a3';
                  e.target.style.borderColor = '#3730a3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4f46e5';
                  e.target.style.borderColor = '#4f46e5';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </button>
              <button
                className="font-bold px-5 py-3 rounded-lg transition hover:brightness-95"
                style={{ backgroundColor: "#d3af37", color: "#0a0a0a" }}
                onClick={() => setShowForm(true)}
              >
                Add Promotion
              </button>
            </>
          )}
        </div>

        {showForm && <PromotionForm onAdd={handleAdd} onClose={() => setShowForm(false)} />}
        
        {/* Edit Modal */}
        {showEditModal && editingPromotion && (
          <PromotionFormModal
            onUpdate={handleUpdate}
            onClose={handleCloseEditModal}
            editingPromotion={editingPromotion}
            isEditMode={true}
          />
        )}

        {loading && (
          <p className="text-neutral-900 text-center my-10 text-lg font-semibold">Loading...</p>
        )}
        {error && (
          <p className="text-red-600 text-center my-6 p-4 bg-red-600/10 border border-red-600 rounded-lg font-bold">
            {error}
          </p>
        )}

        {!showForm && filteredPromotions.length === 0 && !loading && !error && (
          <p className="text-neutral-900 text-center my-10 text-lg bg-white/80 p-8 rounded-xl">
            {promotions.length === 0 ? 'No promotions found.' : 'No promotions match your filter criteria.'}
          </p>
        )}

        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {filteredPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.promotion_id}
                promotion={promotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
