import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, Plus, Calendar, Search, SortAsc, 
  Clock, CheckCircle, XCircle, AlertCircle,
  BarChart3
} from 'lucide-react';
import BookingList from '../../components/guest/BookingList';
import api from '../../api/axios'; // Use the configured axios instance
import dayjs from 'dayjs';

export default function Bookings() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, checkIn, totalAmount, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // Use the guest-specific endpoint
      const res = await api.get('/reservations/guest'); // Base URL already includes /api

      const data = res.data.data || res.data.reservations || res.data;
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);


  // Enhanced filtering and searching
  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter(reservation => {
      const today = new Date();
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);

      // Apply status filter
      let statusMatch = true;
      switch (filter) {
        case 'upcoming':
          statusMatch = checkIn > today && reservation.status === 'booked';
          break;
        case 'past':
          statusMatch = checkOut < today || reservation.status === 'completed';
          break;
        case 'cancelled':
          statusMatch = reservation.status === 'cancel';
          break;
        default:
          statusMatch = true;
      }

      // Apply search filter
      const searchMatch = !searchTerm || 
        reservation.reservationNumber?.toString().includes(searchTerm) ||
        reservation.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.guest?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'checkIn':
          aValue = new Date(a.checkIn);
          bValue = new Date(b.checkIn);
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [reservations, filter, searchTerm, sortBy, sortOrder]);

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case 'upcoming':
        return reservations.filter(r => new Date(r.checkIn) > new Date() && r.status === 'booked').length;
      case 'past':
        return reservations.filter(r => new Date(r.checkOut) < new Date() || r.status === 'completed').length;
      case 'cancelled':
        return reservations.filter(r => r.status === 'cancelled').length;
      default:
        return reservations.length;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa', color: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Clean Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#d3af37' }}>
                <Calendar className="w-8 h-8" style={{ color: '#0a0a0a' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#0a0a0a' }}>My Bookings</h1>
                <p className="text-lg opacity-75">Manage your reservations and track your travel history</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex items-center gap-2 px-4 py-3 rounded-xl hover:brightness-95 transition-all font-medium"
              style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
              onClick={() => navigate('/guest/analytics')}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-3 rounded-xl hover:brightness-95 transition-all font-medium"
              style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0' }}
              onClick={loadReservations}
              disabled={loading}
              title="Refresh bookings"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl hover:brightness-95 transition-all shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #d3af37 0%, #f4d03f 100%)',
                color: '#0a0a0a'
              }}
              onClick={() => navigate('/reserve/start')}
            >
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        {reservations.length > 0 && (
          <div className="space-y-6">
            {/* Search and Sort Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search by reservation number, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-d3af37 focus:outline-none transition-colors"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
              
              {/* Sort Controls */}
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-d3af37 focus:outline-none transition-colors"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="checkIn">Sort by Check-in</option>
                  <option value="totalAmount">Sort by Amount</option>
                  <option value="status">Sort by Status</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-d3af37 transition-colors"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <SortAsc className={`w-5 h-5 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Bookings', icon: Calendar, color: '#d3af37' },
                { key: 'upcoming', label: 'Upcoming', icon: Clock, color: '#10b981' },
                { key: 'past', label: 'Past', icon: CheckCircle, color: '#3b82f6' },
                { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: '#ef4444' }
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                    filter === key ? 'shadow-lg transform scale-105' : 'hover:brightness-95'
                  }`}
                  style={{
                    backgroundColor: filter === key ? color : '#ffffff',
                    color: filter === key ? (key === 'all' ? '#0a0a0a' : '#ffffff') : '#0a0a0a',
                    border: filter === key ? `2px solid ${color}` : '2px solid #e5e7eb'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                  <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ 
                    backgroundColor: filter === key ? (key === 'all' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)') : 'rgba(0, 0, 0, 0.1)' 
                  }}>
                    {getFilterCount(key)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-d3af37 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold mb-2">Loading your reservations...</div>
                <div className="text-sm opacity-75">Please wait while we fetch your booking data</div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#fecaca' }}>
                <AlertCircle className="w-8 h-8" style={{ color: '#dc2626' }} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2" style={{ color: '#dc2626' }}>Error Loading Bookings</h4>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadReservations}
                  className="px-6 py-3 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredReservations.length === 0 && reservations.length === 0 && (
          <div className="p-16 text-center rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff', border: '2px solid #d3af37' }}>
            <div className="mb-8">
              <div className="text-8xl mb-6">🏨</div>
              <h3 className="text-3xl font-bold mb-4">No Bookings Yet</h3>
              <p className="text-xl opacity-75 mb-8 max-w-2xl mx-auto">
                You haven't made any reservations yet. Start planning your next adventure at Hasthi Safari Cottage!
              </p>
            </div>
            <button
              className="flex items-center gap-3 px-8 py-4 text-xl font-semibold rounded-xl hover:brightness-95 transition-all shadow-lg mx-auto"
              style={{ 
                background: 'linear-gradient(135deg, #d3af37 0%, #f4d03f 100%)',
                color: '#0a0a0a'
              }}
              onClick={() => navigate('/reserve/start')}
            >
              <Plus className="w-6 h-6" />
              Make Your First Booking
            </button>
          </div>
        )}

        {/* Filtered Empty State */}
        {!loading && !error && filteredReservations.length === 0 && reservations.length > 0 && (
          <div className="p-16 text-center rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff', border: '2px solid #e5e7eb' }}>
            <div className="mb-8">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold mb-4">No {filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings</h3>
              <p className="text-xl opacity-75 mb-8">
                {filter === 'upcoming' && "You don't have any upcoming bookings at the moment."}
                {filter === 'past' && "You don't have any past bookings in your history."}
                {filter === 'cancelled' && "You don't have any cancelled bookings."}
                {filter === 'all' && "No bookings match your current search criteria."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setFilter('all')}
                className="px-8 py-4 text-lg font-semibold rounded-xl hover:brightness-95 transition-all"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
              >
                View All Bookings
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className="px-8 py-4 text-lg font-semibold rounded-xl hover:brightness-95 transition-all"
                style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
              >
                Clear Search
              </button>
            </div>
          </div>
        )}


        {/* Bookings List */}
        {!loading && !error && filteredReservations.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {filter === 'all' ? 'All Bookings' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
                </h3>
                <p className="text-lg opacity-75">
                  Showing {filteredReservations.length} of {reservations.length} reservations
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              
            </div>

            {/* Bookings Grid */}
            <div className="grid gap-6">
              <BookingList
                bookings={filteredReservations}
                onOpenReservation={(resv) => navigate(`/guest/reservation/${resv.reservationNumber}`)}
                onUpdate={loadReservations}
                onDelete={loadReservations}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}