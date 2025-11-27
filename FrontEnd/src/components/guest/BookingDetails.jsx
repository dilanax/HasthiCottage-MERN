import React, { useState, useEffect } from 'react';
import { X, Edit2, Check, Trash2, Calendar, Users, Home, CreditCard, Phone, Mail, MapPin, Clock, Package, FileText, Utensils, Accessibility } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import { updateReservation, cancelReservation } from '../../api/reservations';

export default function BookingDetails({ booking, open, onClose, onUpdated }) {
  const [local, setLocal] = useState(null);
  const [editing, setEditing] = useState({});
  const [savingField, setSavingField] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLocal(booking ? { ...booking } : null);
    setEditing({});
  }, [booking]);

  if (!open || !local) return null;

  const startEdit = (field) => setEditing(prev => ({ ...prev, [field]: true }));
  const cancelEdit = (field) => {
    setLocal(prev => ({ ...prev, [field]: booking[field] }));
    setEditing(prev => ({ ...prev, [field]: false }));
  };

  const saveField = async (field) => {
    setSavingField(field);
    const payload = { [field]: local[field] };
    try {
      await updateReservation(local._id ?? local.reservationNumber, payload);
      toast.success('Updated successfully');
      setEditing(prev => ({ ...prev, [field]: false }));
      onUpdated?.(local);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Update failed');
      // revert value on failure
      setLocal(prev => ({ ...prev, [field]: booking[field] }));
    } finally {
      setSavingField(null);
    }
  };

  const handleCancelReservation = async () => {
    setCancelling(true);
    try {
      await cancelReservation(local._id ?? local.reservationNumber);
      toast.success('Reservation cancelled');
      onUpdated?.({ ...local, status: 'cancelled' });
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Enhanced Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[600px] z-50 bg-gray-50 p-6 overflow-auto">
        <div className="bg-white rounded-2xl shadow-2xl h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: '#d3af37' }}>
                  <Calendar className="w-6 h-6" style={{ color: '#0a0a0a' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
                  <div className="text-sm text-gray-600">#{local.reservationNumber}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created on {dayjs(local.createdAt).format("MMM DD, YYYY")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setConfirmOpen(true)} 
                  className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Cancel
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto space-y-6">

            {/* Guest Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: '#d3af37' }} />
                Guest Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest Name */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Full Name</div>
                    {!editing.firstName ? (
                      <div className="text-sm font-semibold text-gray-900">{local.guest?.firstName} {local.guest?.lastName}</div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={local.guest.firstName}
                          onChange={(e) => setLocal(prev => ({ ...prev, guest: { ...prev.guest, firstName: e.target.value } }))}
                          className="px-3 py-2 border rounded-lg text-sm"
                          placeholder="First Name"
                        />
                        <input
                          value={local.guest.lastName}
                          onChange={(e) => setLocal(prev => ({ ...prev, guest: { ...prev.guest, lastName: e.target.value } }))}
                          className="px-3 py-2 border rounded-lg text-sm"
                          placeholder="Last Name"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!editing.firstName ? (
                      <button onClick={() => startEdit('firstName')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => saveField('guest')} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors" disabled={savingField === 'guest'}>
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => cancelEdit('firstName')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </div>
                    <div className="text-sm font-medium text-gray-800">{local.guest?.email}</div>
                    <div className="text-xs text-gray-400">Cannot be edited</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-gray-800">{local.guest?.phone || 'Not provided'}</div>
                  </div>
                </div>

                {/* Country */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Country
                    </div>
                    <div className="text-sm font-medium text-gray-800">{local.guest?.country || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: '#d3af37' }} />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dates */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Check-in & Check-out</div>
                    {!editing.dates ? (
                      <div className="text-sm font-semibold text-gray-900">
                        {dayjs(local.checkIn).format('MMM DD, YYYY')} → {dayjs(local.checkOut).format('MMM DD, YYYY')}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="date" value={dayjs(local.checkIn).format('YYYY-MM-DD')} onChange={(e)=> setLocal(prev=>({...prev, checkIn:e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" />
                        <input type="date" value={dayjs(local.checkOut).format('YYYY-MM-DD')} onChange={(e)=> setLocal(prev=>({...prev, checkOut:e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" />
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {Math.round((new Date(local.checkOut) - new Date(local.checkIn)) / (1000 * 60 * 60 * 24))} nights stay
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!editing.dates ? (
                      <button onClick={() => startEdit('dates')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => saveField('dates')} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => cancelEdit('dates')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Guests
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {local.adults} adult{local.adults > 1 ? 's' : ''}
                    {local.children > 0 && `, ${local.children} child${local.children > 1 ? 'ren' : ''}`}
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      Rooms
                    </div>
                    {!editing.roomsWanted ? (
                      <div className="text-sm font-semibold text-gray-900">{local.roomsWanted} room{local.roomsWanted > 1 ? 's' : ''}</div>
                    ) : (
                      <input type="number" value={local.roomsWanted} onChange={(e)=> setLocal(prev=>({...prev, roomsWanted: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm w-20" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!editing.roomsWanted ? (
                      <button onClick={() => startEdit('roomsWanted')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => saveField('roomsWanted')} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => cancelEdit('roomsWanted')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Package */}
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Package
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{local.package?.name || local.packageName || 'Standard Package'}</div>
                </div>
              </div>
            </div>

            {/* Special Requests Section */}
            {(local.travellingWithPet || local.safariRequested || local.specialRequests || local.dietaryRequirements || local.accessibilityNeeds) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: '#d3af37' }} />
                  Special Requests
                </h3>
                
                <div className="space-y-4">
                  {/* Special Options */}
                  {(local.travellingWithPet || local.safariRequested) && (
                    <div className="flex flex-wrap gap-2">
                      {local.travellingWithPet && (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                          🐕 Pet Friendly
                        </span>
                      )}
                      {local.safariRequested && (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                          🦁 Safari Tour
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text Requests */}
                  <div className="space-y-3">
                    {local.specialRequests && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Special Requests</div>
                        <div className="text-sm text-gray-800 bg-white p-3 rounded-lg border">{local.specialRequests}</div>
                      </div>
                    )}
                    
                    {local.dietaryRequirements && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          Dietary Requirements
                        </div>
                        <div className="text-sm text-gray-800 bg-white p-3 rounded-lg border">{local.dietaryRequirements}</div>
                      </div>
                    )}
                    
                    {local.accessibilityNeeds && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Accessibility className="w-3 h-3" />
                          Accessibility Needs
                        </div>
                        <div className="text-sm text-gray-800 bg-white p-3 rounded-lg border">{local.accessibilityNeeds}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" style={{ color: '#d3af37' }} />
                Payment Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                  {!editing.totalAmount ? (
                    <div className="text-lg font-bold text-gray-900">{local.currency ?? 'USD'} {Number(local.totalAmount ?? 0).toFixed(2)}</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="text" value={local.totalAmount} onChange={(e)=> setLocal(prev=>({...prev, totalAmount: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm w-32" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                    <div className="text-sm font-medium text-gray-800">{local.paymentStatus || 'Not specified'}</div>
                  </div>
                  {!editing.totalAmount && (
                    <button onClick={() => startEdit('totalAmount')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#d3af37' }} />
                Reservation Status
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Current Status</div>
                  <div className="text-sm font-semibold text-gray-900 capitalize">{local.status}</div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
                  backgroundColor: local.status === 'confirmed' ? '#dcfce7' : local.status === 'pending' ? '#fef3c7' : '#fee2e2',
                  color: local.status === 'confirmed' ? '#166534' : local.status === 'pending' ? '#92400e' : '#991b1b'
                }}>
                  {local.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <ConfirmModal
        open={confirmOpen}
        title="Cancel Reservation"
        description="Are you sure you want to cancel this reservation? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleCancelReservation}
      />
    </>
  );
}
