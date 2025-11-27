// src/pages/guest/BookingDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Edit, Trash2, Calendar, Users, Home, CreditCard, Phone, Mail, MapPin, Clock, Package, FileText, Utensils, Accessibility, User } from "lucide-react";
import axios from "../../api/axios";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reservations/by-id/${id}`);
        setBooking(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handleDownloadReceipt = () => {
    // Implementation for downloading receipt
    toast.success('Receipt download started');
  };

  const handleEditReservation = () => {
    // Navigate to edit page or open edit modal
    toast.info('Edit functionality will be implemented');
  };

  const handleCancelReservation = () => {
    // Implementation for canceling reservation
    toast.info('Cancel functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-d3af37 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Booking not found</p>
          <button 
            onClick={() => navigate('/guest/bookings')}
            className="mt-4 px-6 py-2 bg-d3af37 text-black rounded-lg hover:brightness-95 transition-all"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/guest/bookings')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  RESERVATION #{booking.reservationNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Created on {dayjs(booking.createdAt).format("MMMM DD, YYYY")}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <User className="w-5 h-5" style={{ color: '#d3af37' }} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">GUEST INFORMATION</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.guest?.firstName} {booking.guest?.lastName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{booking.guest?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{booking.guest?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Country
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{booking.guest?.country || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#d3af37' }} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">BOOKING DETAILS</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</label>
                  <p className="text-sm text-gray-900 mt-1">{dayjs(booking.checkIn).format("MMMM DD, YYYY")}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-out</label>
                  <p className="text-sm text-gray-900 mt-1">{dayjs(booking.checkOut).format("MMMM DD, YYYY")}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} nights
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    Rooms
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{booking.roomsWanted}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Guests
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {booking.adults} adult{booking.adults > 1 ? 's' : ''}
                    {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arrival</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.arrivalWindow || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pet</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.travellingWithPet ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Safari</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.safariRequested ? 'Requested' : 'Not requested'}</p>
                </div>
              </div>
            </div>

            {/* Package Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <Package className="w-5 h-5" style={{ color: '#d3af37' }} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">PACKAGE INFORMATION</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Room ID</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.package?.name || booking.packageName || 'Standard Package'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price per night</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {booking.currency || 'USD'} {booking.package?.price || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adults included</label>
                  <p className="text-sm text-gray-900 mt-1">{booking.adults}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Package details cannot be changed after booking.
                </p>
              </div>
            </div>

            {/* Special Requests Card */}
            {(booking.specialRequests || booking.dietaryRequirements || booking.accessibilityNeeds) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                    <FileText className="w-5 h-5" style={{ color: '#d3af37' }} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">SPECIAL REQUESTS</h2>
                </div>
                
                <div className="space-y-4">
                  {booking.specialRequests && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Special Requests</label>
                      <p className="text-sm text-gray-900 mt-1">{booking.specialRequests}</p>
                    </div>
                  )}
                  
                  {booking.dietaryRequirements && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        Dietary Requirements
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{booking.dietaryRequirements}</p>
                    </div>
                  )}
                  
                  {booking.accessibilityNeeds && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Accessibility className="w-3 h-3" />
                        Accessibility Needs
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{booking.accessibilityNeeds}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <Clock className="w-5 h-5" style={{ color: '#d3af37' }} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">STATUS & ACTIONS</h2>
              </div>
              
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ 
                    backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: booking.status === 'confirmed' ? '#166534' : booking.status === 'pending' ? '#92400e' : '#991b1b'
                  }}>
                    {booking.status}
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Total Amount</label>
                  <div className="text-2xl font-bold text-gray-900">
                    {booking.currency || 'USD'} {Number(booking.totalAmount || 0).toFixed(2)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleEditReservation}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Reservation
                  </button>
                  
                  <button
                    onClick={handleCancelReservation}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
