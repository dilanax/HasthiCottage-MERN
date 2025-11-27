import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Moon, DollarSign, ArrowRight, Plus, Eye, BarChart3, Download } from 'lucide-react';
import StatCard from '../../components/guest/StatCard';
import { generateReceiptPDF } from '../../utils/generateReceipt.js';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    upcomingStays: 0,
    totalNights: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE}/api/reservations/guest`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data || [];
      setReservations(data);

      // Calculate stats
      const today = new Date();
      const upcomingStays = data.filter(res => 
        new Date(res.checkIn) > today && res.status === 'booked'
      ).length;

      const totalNights = data.reduce((sum, res) => {
        const checkIn = new Date(res.checkIn);
        const checkOut = new Date(res.checkOut);
        const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return sum + (nights * res.roomsWanted);
      }, 0);

      const totalAmount = data.reduce((sum, res) => sum + (res.totalAmount || 0), 0);

      setStats({
        totalReservations: data.length,
        upcomingStays,
        totalNights,
        totalAmount
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (reservation) => {
    try {
      toast.loading('Generating receipt...', { id: 'receipt-loading' });
      
      // Generate PDF receipt
      await generateReceiptPDF(reservation, reservation.package);
      
      toast.success('Receipt downloaded successfully!', { id: 'receipt-loading' });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt. Please try again.', { id: 'receipt-loading' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d3af37' }}></div>
          <div className="text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0a0a0a' }}>
              Welcome Back! 👋
            </h1>
            <p className="text-lg opacity-75">Your booking statistics and insights</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm opacity-75">Today is</div>
              <div className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
             style={{ backgroundColor: '#f0f0f0', border: '2px solid #d3af37' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#0a0a0a' }} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: '#0a0a0a' }}>{stats.totalReservations}</div>
              <div className="text-sm opacity-75">Total Reservations</div>
            </div>
          </div>
          <div className="text-xs opacity-75">All time bookings</div>
        </div>

        <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
             style={{ backgroundColor: '#f0f0f0', border: '2px solid #d3af37' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
              <Calendar className="w-6 h-6" style={{ color: '#0a0a0a' }} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: '#0a0a0a' }}>{stats.upcomingStays}</div>
              <div className="text-sm opacity-75">Upcoming Stays</div>
            </div>
          </div>
          <div className="text-xs opacity-75">Confirmed bookings</div>
        </div>

        <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
             style={{ backgroundColor: '#f0f0f0', border: '2px solid #d3af37' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
              <Moon className="w-6 h-6" style={{ color: '#0a0a0a' }} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: '#0a0a0a' }}>{stats.totalNights}</div>
              <div className="text-sm opacity-75">Total Nights</div>
            </div>
          </div>
          <div className="text-xs opacity-75">All time nights booked</div>
        </div>

        <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
             style={{ backgroundColor: '#f0f0f0', border: '2px solid #d3af37' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
              <DollarSign className="w-6 h-6" style={{ color: '#0a0a0a' }} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: '#0a0a0a' }}>${stats.totalAmount.toFixed(0)}</div>
              <div className="text-sm opacity-75">Total Spent</div>
            </div>
          </div>
          <div className="text-xs opacity-75">USD</div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6" style={{ color: '#0a0a0a' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
               style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a', border: '2px solid #d3af37' }}
               onClick={() => navigate('/guest/bookings')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                <Eye className="w-6 h-6" style={{ color: '#0a0a0a' }} />
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#d3af37' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2">View My Bookings</h4>
            <p className="text-sm opacity-75 mb-4">See all your reservations and manage them</p>
            <div className="text-xs opacity-75">
              {stats.totalReservations > 0 ? `${stats.totalReservations} booking${stats.totalReservations > 1 ? 's' : ''} found` : 'No bookings yet'}
            </div>
          </div>
          
          <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
               style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a', border: '2px solid #d3af37' }}
               onClick={() => navigate('/reserve/start')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                <Plus className="w-6 h-6" style={{ color: '#0a0a0a' }} />
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#d3af37' }} />
            </div>
            <h4 className="text-lg font-semibold mb-2">Make New Booking</h4>
            <p className="text-sm opacity-75 mb-4">Start planning your next stay with us</p>
            <div className="text-xs opacity-75">
              {stats.upcomingStays > 0 ? `${stats.upcomingStays} upcoming stay${stats.upcomingStays > 1 ? 's' : ''}` : 'Plan your next adventure'}
            </div>
          </div>

          <div className="group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
               style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a', border: '2px solid #d3af37' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                <BarChart3 className="w-6 h-6" style={{ color: '#0a0a0a' }} />
              </div>
            </div>
            <h4 className="text-lg font-semibold mb-2">Booking Insights</h4>
            <div className="space-y-2 text-sm opacity-75">
              {stats.totalReservations > 0 ? (
                <>
                  <div>✅ {stats.totalReservations} reservation{stats.totalReservations > 1 ? 's' : ''} made</div>
                  <div>🏨 {stats.totalNights} nights booked</div>
                  <div>💰 ${stats.totalAmount.toFixed(0)} total spent</div>
                  {stats.upcomingStays > 0 && (
                    <div className="text-xs" style={{ color: '#d3af37' }}>
                      {stats.upcomingStays} upcoming stay{stats.upcomingStays > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              ) : (
                <div>Make your first booking to see insights here</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {stats.totalReservations > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#0a0a0a' }}>Recent Activity</h3>
          <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#f0f0f0', border: '2px solid #d3af37' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#0a0a0a' }} />
                </div>
                <div>
                  <div className="font-semibold">Your Latest Bookings</div>
                  <div className="text-sm opacity-75">Most recent reservations</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/guest/bookings')}
                className="px-4 py-2 rounded-lg hover:brightness-95 text-sm font-medium"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {reservations.slice(0, 3).map((reservation, index) => (
                <div key={reservation._id} className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: reservation.status === 'booked' ? '#d3af37' : '#0a0a0a' }}></div>
                    <div>
                      <div className="font-medium">#{reservation.reservationNumber}</div>
                      <div className="text-sm opacity-75">
                        {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(reservation)}
                      className="p-1 rounded hover:brightness-95 transition-all"
                      style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                      title="Download receipt"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <div className="text-right">
                      <div className="font-medium">${reservation.totalAmount?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm opacity-75 capitalize">{reservation.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
