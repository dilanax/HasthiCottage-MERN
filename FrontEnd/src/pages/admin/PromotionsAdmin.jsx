import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import PromotionCard from '../../components/promotion/PromotionCard';
import PromotionFormModal from '../../components/promotion/PromotionFormModal';
import EditPromotionModal from '../../components/promotion/EditPromotionModal';
import PromotionsAnalytics from './PromotionsAnalytics';
import Swal from 'sweetalert2';
import axios from 'axios';

const PromotionsAdmin = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Fetch promotions from API
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/promotions');
      setPromotions(response.data.promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
      // Fallback to empty array if API fails
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (promotionData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/promotions', promotionData);
      setPromotions(prev => [...prev, response.data.promotion]);
      toast.success('Promotion created successfully!', { duration: 2500 });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
      throw error;
    }
  };

  const handleEditPromotion = async (updatedPromotion) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/promotions/${updatedPromotion.promotion_id}`, updatedPromotion);
      setPromotions(prev => 
        prev.map(p => 
          p.promotion_id === updatedPromotion.promotion_id 
            ? response.data.promotion 
            : p
        )
      );
      toast.success('Promotion updated successfully!', { duration: 2500 });
      setEditingPromotion(null);
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Failed to update promotion');
      throw error;
    }
  };

  const handleDeletePromotion = async (promotion) => {
    const result = await Swal.fire({
      title: 'Delete Promotion',
      text: `Are you sure you want to delete "${promotion.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/promotions/${promotion.promotion_id}`);
        setPromotions(prev => prev.filter(p => p.promotion_id !== promotion.promotion_id));
        toast.success('Promotion deleted successfully!', { duration: 2500 });
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error('Failed to delete promotion');
      }
    }
  };

  const handleViewDetails = (promotion) => {
    Swal.fire({
      title: promotion.title,
      html: `
        <div class="text-left space-y-3">
          <div>
            <strong class="text-gray-700">Description:</strong>
            <p class="text-gray-600 mt-1">${promotion.description}</p>
          </div>
          <div>
            <strong class="text-gray-700">Category:</strong>
            <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${promotion.promotion_category}</span>
          </div>
          <div>
            <strong class="text-gray-700">Discount:</strong>
            <span class="ml-2 text-lg font-bold text-green-600">${promotion.discount_value}${promotion.discount_type === 'percentage' ? '%' : ' LKR'}</span>
          </div>
          <div>
            <strong class="text-gray-700">Status:</strong>
            <span class="ml-2 px-2 py-1 rounded-full text-sm ${promotion.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${promotion.status.toUpperCase()}</span>
          </div>
          <div>
            <strong class="text-gray-700">Valid Period:</strong>
            <p class="text-gray-600 mt-1">${new Date(promotion.start_date).toLocaleDateString()} - ${new Date(promotion.end_date).toLocaleDateString()}</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl'
      }
    });
  };

  // Filter promotions based on status, category, search term, and date range
  const filteredPromotions = promotions.filter(promotion => {
    const matchesStatus = filterStatus === 'all' || promotion.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || promotion.promotion_category === filterCategory;
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filtering logic
    let matchesDateRange = true;
    if (filterStartDate || filterEndDate) {
      const promotionStartDate = new Date(promotion.start_date);
      const promotionEndDate = new Date(promotion.end_date);
      
      if (filterStartDate) {
        const filterStart = new Date(filterStartDate);
        matchesDateRange = matchesDateRange && promotionStartDate >= filterStart;
      }
      
      if (filterEndDate) {
        const filterEnd = new Date(filterEndDate);
        matchesDateRange = matchesDateRange && promotionEndDate <= filterEnd;
      }
    }
    
    return matchesStatus && matchesCategory && matchesSearch && matchesDateRange;
  });

  const getStatusCounts = () => {
    return {
      all: promotions.length,
      active: promotions.filter(p => p.status === 'active').length,
      inactive: promotions.filter(p => p.status === 'inactive').length,
      expired: promotions.filter(p => p.status === 'expired').length
    };
  };

  const statusCounts = getStatusCounts();

  // Clear all filters
  const clearAllFilters = () => {
    setFilterStatus('all');
    setFilterCategory('all');
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Check if any filters are active
  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || searchTerm !== '' || filterStartDate !== '' || filterEndDate !== '';

  // Show analytics page if requested
  if (showAnalytics) {
    return <PromotionsAnalytics onBack={() => setShowAnalytics(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-lg p-8">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-20 bg-gray-200 rounded mb-6"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f0f0f0' }}>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#0a0a0a' }}>Promotions Management</h1>
              <p style={{ color: '#0a0a0a' }}>Manage your offers and promotions with professional tools</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Analytics Button */}
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
              
              {/* Add Promotion Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b8941f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#d3af37';
                }}
              >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Promotion
            </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-emerald-600">{statusCounts.active}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-amber-600">{statusCounts.inactive}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.expired}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Promotions</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    style={{ borderColor: searchTerm ? '#d3af37' : '#e5e7eb' }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  style={{ borderColor: filterStatus !== 'all' ? '#d3af37' : '#e5e7eb' }}
                >
                  <option value="all">All Status</option>
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                  <option value="expired">⏰ Expired</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  style={{ borderColor: filterCategory !== 'all' ? '#d3af37' : '#e5e7eb' }}
                >
                  <option value="all">All Categories</option>
                  <option value="Food Promotions">🍽️ Food Promotions</option>
                  <option value="Safari Package Promotions">🦁 Safari Package Promotions</option>
                  <option value="Room Reservation Promotions">🏨 Room Reservation Promotions</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm"
                      style={{ borderColor: filterStartDate ? '#d3af37' : '#e5e7eb' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">From</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      placeholder="End Date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-sm"
                      style={{ borderColor: filterEndDate ? '#d3af37' : '#e5e7eb' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">To</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {filterStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-yellow-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Category: {filterCategory}
                      <button onClick={() => setFilterCategory('all')} className="ml-1 hover:text-yellow-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-yellow-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterStartDate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      From: {filterStartDate}
                      <button onClick={() => setFilterStartDate('')} className="ml-1 hover:text-yellow-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterEndDate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      To: {filterEndDate}
                      <button onClick={() => setFilterEndDate('')} className="ml-1 hover:text-yellow-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Promotions Grid */}
        {filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No promotions match your filters' : 'No promotions found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters or clear them to see all promotions.' 
                : 'Create your first promotion to get started.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                {hasActiveFilters ? 'Create New Promotion' : 'Create First Promotion'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map(promotion => (
              <PromotionCard
                key={promotion.promotion_id}
                promotion={promotion}
                onEdit={setEditingPromotion}
                onDelete={handleDeletePromotion}
                onViewDetails={handleViewDetails}
                className="transform transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <PromotionFormModal
          onSave={handleAddPromotion}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingPromotion && (
        <EditPromotionModal
          promotion={editingPromotion}
          onSave={handleEditPromotion}
          onClose={() => setEditingPromotion(null)}
        />
      )}
    </div>
  );
};

export default PromotionsAdmin;
