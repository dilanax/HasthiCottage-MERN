import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { ArrowLeft, Edit, Trash2, Calendar, User, CreditCard, MapPin, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { generateReceiptPDF } from '../../utils/generateReceipt.js';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ReservationDetails() {
  const { reservationNumber } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchReservation();
  }, [reservationNumber]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get(`${API_BASE}/api/reservations/${reservationNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data || response.data;
      setReservation(data);
      
      // Initialize edit form
      setEditForm({
        adults: data.adults || 1,
        children: data.children || 0,
        travellingWithPet: data.travellingWithPet || false,
        safariRequested: data.safariRequested || false,
        arrivalWindow: data.arrivalWindow || 'unknown',
        guest: {
          phone: data.guest?.phone || '',
          country: data.guest?.country || ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/api/reservations/guest/${reservation._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: 'Updated!',
        text: 'Your reservation has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#d3af37',
        background: '#f0f0f0',
        color: '#0a0a0a'
      });

      setReservation(response.data.data);
      setIsEditing(false);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || 'Failed to update reservation',
        icon: 'error',
        confirmButtonColor: '#d3af37',
        background: '#f0f0f0',
        color: '#0a0a0a'
      });
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Cancel Reservation?',
      html: `
        <div style="text-align: left;">
          <p><strong>Are you sure you want to cancel reservation #${reservationNumber}?</strong></p>
          <br>
          <p><strong>Reservation Details:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check-in: ${dayjs(reservation.checkIn).format('MMMM DD, YYYY')}</li>
            <li>Check-out: ${dayjs(reservation.checkOut).format('MMMM DD, YYYY')}</li>
            <li>Total Amount: ${reservation.currency || 'USD'} ${Number(reservation.totalAmount || 0).toFixed(2)}</li>
          </ul>
          <br>
          <p style="color: #dc2626; font-weight: bold;">
            ⚠️ This action cannot be undone. You will need to make a new reservation if you change your mind.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#d3af37',
      confirmButtonText: 'Yes, cancel reservation',
      cancelButtonText: 'Keep reservation',
      background: '#f0f0f0',
      color: '#0a0a0a',
      width: '500px'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `${API_BASE}/api/reservations/guest/cancel/${reservation._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          title: 'Reservation Cancelled!',
          html: `
            <div style="text-align: center;">
              <p>Your reservation #${reservationNumber} has been successfully cancelled.</p>
              <br>
              <p style="color: #059669; font-weight: bold;">✅ Cancellation confirmed</p>
              <p style="font-size: 14px; color: #6b7280;">
                You will be redirected to your bookings page.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#d3af37',
          background: '#f0f0f0',
          color: '#0a0a0a',
          confirmButtonText: 'View My Bookings'
        }).then(() => {
          navigate('/guest/bookings');
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.error || 'Failed to cancel reservation',
          icon: 'error',
          confirmButtonColor: '#d3af37',
          background: '#f0f0f0',
          color: '#0a0a0a'
        });
      }
    }
  };

  const canEdit = reservation?.status === 'booked' && 
                  new Date(reservation?.checkIn) > new Date() && 
                  reservation?.paymentStatus !== 'cancelled';

  const handleDownloadReceipt = async () => {
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
          <div className="text-lg">Loading reservation details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/guest/bookings')}
          className="px-4 py-2 rounded hover:brightness-95"
          style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
        <div className="text-lg mb-4">Reservation not found</div>
        <button
          onClick={() => navigate('/guest/bookings')}
          className="px-4 py-2 rounded hover:brightness-95"
          style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/guest/bookings')}
            className="p-2 rounded-lg hover:brightness-95"
            style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Reservation #{reservation.reservationNumber}</h1>
            <p className="text-sm opacity-75">
              Created on {dayjs(reservation.createdAt).format('MMMM DD, YYYY')}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadReceipt}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:brightness-95 font-medium transition-all"
          style={{ backgroundColor: '#10b981', color: '#ffffff' }}
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f0f0f0', border: '1px solid #d3af37' }}>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" style={{ color: '#d3af37' }} />
              <h2 className="text-lg font-semibold">Guest Information</h2>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={reservation.guest.firstName}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={reservation.guest.lastName}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={reservation.guest.email}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.guest.phone}
                    onChange={(e) => setEditForm({...editForm, guest: {...editForm.guest, phone: e.target.value}})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.guest.country}
                    onChange={(e) => setEditForm({...editForm, guest: {...editForm.guest, country: e.target.value}})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-medium">Name:</span> {reservation.guest.firstName} {reservation.guest.lastName}</div>
                <div><span className="font-medium">Email:</span> {reservation.guest.email}</div>
                {reservation.guest.phone && <div><span className="font-medium">Phone:</span> {reservation.guest.phone}</div>}
                {reservation.guest.country && <div><span className="font-medium">Country:</span> {reservation.guest.country}</div>}
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f0f0f0', border: '1px solid #d3af37' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" style={{ color: '#d3af37' }} />
              <h2 className="text-lg font-semibold">Booking Details</h2>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={dayjs(reservation.checkIn).format('YYYY-MM-DD')}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Check-in date cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Date</label>
                    <input
                      type="date"
                      value={dayjs(reservation.checkOut).format('YYYY-MM-DD')}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Check-out date cannot be changed</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Adults</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.adults}
                      onChange={(e) => setEditForm({...editForm, adults: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.children}
                      onChange={(e) => setEditForm({...editForm, children: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Arrival Window</label>
                  <select
                    value={editForm.arrivalWindow}
                    onChange={(e) => setEditForm({...editForm, arrivalWindow: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="morning">Morning (6 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                    <option value="evening">Evening (6 PM - 12 AM)</option>
                    <option value="unknown">Not specified</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.travellingWithPet}
                      onChange={(e) => setEditForm({...editForm, travellingWithPet: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Travelling with pet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.safariRequested}
                      onChange={(e) => setEditForm({...editForm, safariRequested: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Safari requested</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-medium">Check-in:</span> {dayjs(reservation.checkIn).format('MMMM DD, YYYY')}</div>
                <div><span className="font-medium">Check-out:</span> {dayjs(reservation.checkOut).format('MMMM DD, YYYY')}</div>
                <div><span className="font-medium">Duration:</span> {Math.round((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24))} nights</div>
                <div><span className="font-medium">Rooms:</span> {reservation.roomsWanted}</div>
                <div><span className="font-medium">Guests:</span> {reservation.adults} adult{reservation.adults > 1 ? 's' : ''}{reservation.children > 0 && `, ${reservation.children} child${reservation.children > 1 ? 'ren' : ''}`}</div>
                <div><span className="font-medium">Arrival:</span> {reservation.arrivalWindow === 'morning' ? 'Morning (6 AM - 12 PM)' : reservation.arrivalWindow === 'afternoon' ? 'Afternoon (12 PM - 6 PM)' : reservation.arrivalWindow === 'evening' ? 'Evening (6 PM - 12 AM)' : 'Not specified'}</div>
                {reservation.travellingWithPet && <div><span className="font-medium">Pet:</span> Yes</div>}
                {reservation.safariRequested && <div><span className="font-medium">Safari:</span> Requested</div>}
              </div>
            )}
          </div>

          {/* Package Information */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f0f0f0', border: '1px solid #d3af37' }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#d3af37' }} />
              <h2 className="text-lg font-semibold">Package Information</h2>
            </div>
            
            <div className="space-y-2">
              <div><span className="font-medium">Room ID:</span> {reservation.package?.roomId}</div>
              <div><span className="font-medium">Price per night:</span> ${reservation.package?.priceUSD || 0}</div>
              <div><span className="font-medium">Adults included:</span> {reservation.package?.adultsIncluded || 0}</div>
              <p className="text-sm text-gray-500 mt-2">Package details cannot be changed after booking</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#f0f0f0', border: '1px solid #d3af37' }}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" style={{ color: '#d3af37' }} />
              <h2 className="text-lg font-semibold">Status & Actions</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="font-medium">Status:</span>
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm ml-2"
                  style={{
                    backgroundColor: reservation.status === "booked" ? '#d3af37' : 
                                   reservation.status === "cancel" ? '#dc2626' : '#0a0a0a',
                    color: reservation.status === "booked" ? '#0a0a0a' : '#f0f0f0'
                  }}
                >
                  {reservation.status}
                </div>
              </div>

              {reservation.status === "cancel" && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-sm" style={{ color: '#dc2626' }}>
                    ⚠️ This reservation has been cancelled and cannot be edited.
                  </p>
                </div>
              )}

              {!canEdit && reservation.status === "booked" && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                  <p className="text-sm" style={{ color: '#d97706' }}>
                    ℹ️ This reservation cannot be edited because the check-in date has passed.
                  </p>
                </div>
              )}

              <div>
                <span className="font-medium">Total Amount:</span>
                <div className="text-lg font-semibold">
                  {reservation.currency || 'USD'} {Number(reservation.totalAmount || 0).toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="w-full px-4 py-2 rounded-lg hover:brightness-95 font-medium"
                      style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full px-4 py-2 rounded-lg hover:brightness-95 font-medium"
                      style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0' }}
                    >
                      Cancel Edit
                    </button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full px-4 py-2 rounded-lg hover:brightness-95 font-medium"
                        style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                      >
                        Edit Reservation
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={handleCancel}
                        className="w-full px-4 py-2 rounded-lg hover:brightness-95 font-medium"
                        style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0' }}
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
