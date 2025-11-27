// src/components/guest/BookingCard.jsx
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, X, Check, Eye, Calendar, Users, Home, CreditCard, Clock, Download } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { generateReceiptPDF } from "../../utils/generateReceipt.js";

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function BookingCard({ booking, onUpdate, onDelete }) {
  const navigate = useNavigate();
  
  // Safety check for booking prop
  if (!booking) {
    return null;
  }
  
  const {
    _id,
    reservationNumber,
    guest,
    package: packageDetails,
    checkIn,
    checkOut,
    roomsWanted,
    adults,
    children,
    travellingWithPet,
    safariRequested,
    totalAmount,
    currency,
    status,
    createdAt,
  } = booking;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    // Guest Information
    firstName: guest?.firstName || '',
    lastName: guest?.lastName || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    
    // Booking Details
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    adults: adults || 1,
    children: children || 0,
    roomsWanted: roomsWanted || 1,
    travellingWithPet: travellingWithPet || false,
    safariRequested: safariRequested || false,
    
    // Package Information (if applicable)
    packageId: packageDetails?._id || '',
    
    // Special Requests
    specialRequests: booking?.specialRequests || '',
    dietaryRequirements: booking?.dietaryRequirements || '',
    accessibilityNeeds: booking?.accessibilityNeeds || ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update check-out date minimum when check-in date changes
  useEffect(() => {
    if (editForm.checkIn && editForm.checkOut) {
      const checkInDate = new Date(editForm.checkIn);
      const checkOutDate = new Date(editForm.checkOut);
      
      if (checkOutDate <= checkInDate) {
        // Auto-update check-out to be day after check-in
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setEditForm(prev => ({
          ...prev,
          checkOut: nextDay.toISOString().split('T')[0]
        }));
      }
    }
  }, [editForm.checkIn]);

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const fillDemoData = () => {
    const demoData = {
      firstName: editForm.firstName || 'John',
      lastName: editForm.lastName || 'Doe',
      email: editForm.email || 'john.doe@example.com',
      phone: editForm.phone || '+1234567890',
      checkIn: editForm.checkIn || dayjs().add(7, 'days').format('YYYY-MM-DD'),
      checkOut: editForm.checkOut || dayjs().add(10, 'days').format('YYYY-MM-DD'),
      adults: editForm.adults || 2,
      children: editForm.children || 1,
      roomsWanted: editForm.roomsWanted || 1,
      travellingWithPet: editForm.travellingWithPet || false,
      safariRequested: editForm.safariRequested || true,
      specialRequests: editForm.specialRequests || 'Please provide extra towels and late checkout if possible.',
      dietaryRequirements: editForm.dietaryRequirements || 'Vegetarian meals preferred.',
      accessibilityNeeds: editForm.accessibilityNeeds || 'Ground floor room preferred due to mobility needs.'
    };

    setEditForm(demoData);
    
    // Clear validation errors after filling demo data
    setValidationErrors({});
    
    toast.success('Demo data filled for empty fields');
  };

  const clearAllData = () => {
    setEditForm({
      // Guest Information
      firstName: guest?.firstName || '',
      lastName: guest?.lastName || '',
      email: guest?.email || '',
      phone: guest?.phone || '',
      
      // Booking Details
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      adults: adults || 1,
      children: children || 0,
      roomsWanted: roomsWanted || 1,
      travellingWithPet: travellingWithPet || false,
      safariRequested: safariRequested || false,
      
      // Package Information (if applicable)
      packageId: packageDetails?._id || '',
      
      // Special Requests
      specialRequests: booking?.specialRequests || '',
      dietaryRequirements: booking?.dietaryRequirements || '',
      accessibilityNeeds: booking?.accessibilityNeeds || ''
    });
    
    setValidationErrors({});
    toast.success('Form reset to original values');
  };

  // Validation functions
  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Guest Information Validation
    if (!editForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (editForm.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!editForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (editForm.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!editForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(editForm.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Booking Details Validation
    if (!editForm.checkIn) {
      errors.checkIn = 'Check-in date is required';
    } else {
      const checkInDate = new Date(editForm.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        errors.checkIn = 'Check-in date cannot be in the past';
      } else if (checkInDate.getTime() === today.getTime()) {
        errors.checkIn = 'Check-in date must be at least tomorrow';
      }
    }

    if (!editForm.checkOut) {
      errors.checkOut = 'Check-out date is required';
    } else {
      const checkOutDate = new Date(editForm.checkOut);
      const checkInDate = new Date(editForm.checkIn);
      
      if (checkOutDate <= checkInDate) {
        errors.checkOut = 'Check-out date must be after check-in date';
      }
      
      // Check if stay is not too long (e.g., max 30 days)
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      if (nights > 30) {
        errors.checkOut = 'Maximum stay is 30 nights';
      }
    }

    if (editForm.adults < 1) {
      errors.adults = 'At least 1 adult is required';
    } else if (editForm.adults > 10) {
      errors.adults = 'Maximum 10 adults allowed';
    }

    if (editForm.children < 0) {
      errors.children = 'Children count cannot be negative';
    } else if (editForm.children > 10) {
      errors.children = 'Maximum 10 children allowed';
    }

    if (editForm.roomsWanted < 1) {
      errors.roomsWanted = 'At least 1 room is required';
    } else if (editForm.roomsWanted > 5) {
      errors.roomsWanted = 'Maximum 5 rooms allowed';
    }

    // Validate total guests vs rooms
    const totalGuests = editForm.adults + editForm.children;
    if (totalGuests > editForm.roomsWanted * 4) {
      errors.roomsWanted = 'Too many guests for the number of rooms (max 4 guests per room)';
    }

    // Special Requests Validation
    if (editForm.specialRequests && editForm.specialRequests.length > 500) {
      errors.specialRequests = 'Special requests cannot exceed 500 characters';
    }

    if (editForm.dietaryRequirements && editForm.dietaryRequirements.length > 300) {
      errors.dietaryRequirements = 'Dietary requirements cannot exceed 300 characters';
    }

    if (editForm.accessibilityNeeds && editForm.accessibilityNeeds.length > 300) {
      errors.accessibilityNeeds = 'Accessibility needs cannot exceed 300 characters';
    }

    return errors;
  };

  const validateField = (fieldName, value) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else {
          delete errors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete errors.lastName;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.email = 'Please enter a valid email address';
          } else {
            delete errors.email;
          }
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else {
          const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
          if (!phoneRegex.test(value)) {
            errors.phone = 'Please enter a valid phone number';
          } else {
            delete errors.phone;
          }
        }
        break;
        
      case 'checkIn':
        if (!value) {
          errors.checkIn = 'Check-in date is required';
        } else {
          const checkInDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          checkInDate.setHours(0, 0, 0, 0);
          
          if (checkInDate < today) {
            errors.checkIn = 'Check-in date cannot be in the past';
          } else if (checkInDate.getTime() === today.getTime()) {
            errors.checkIn = 'Check-in date must be at least tomorrow';
          } else {
            delete errors.checkIn;
            // Also re-validate check-out if it exists
            if (editForm.checkOut) {
              validateField('checkOut', editForm.checkOut);
            }
          }
        }
        break;
        
      case 'checkOut':
        if (!value) {
          errors.checkOut = 'Check-out date is required';
        } else {
          const checkOutDate = new Date(value);
          const checkInDate = new Date(editForm.checkIn);
          
          if (checkOutDate <= checkInDate) {
            errors.checkOut = 'Check-out date must be after check-in date';
          } else {
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            if (nights > 30) {
              errors.checkOut = 'Maximum stay is 30 nights';
            } else {
              delete errors.checkOut;
            }
          }
        }
        break;
        
      case 'adults':
        if (value < 1) {
          errors.adults = 'At least 1 adult is required';
        } else if (value > 10) {
          errors.adults = 'Maximum 10 adults allowed';
        } else {
          delete errors.adults;
        }
        break;
        
      case 'children':
        if (value < 0) {
          errors.children = 'Children count cannot be negative';
        } else if (value > 10) {
          errors.children = 'Maximum 10 children allowed';
        } else {
          delete errors.children;
        }
        break;
        
      case 'roomsWanted':
        if (value < 1) {
          errors.roomsWanted = 'At least 1 room is required';
        } else if (value > 5) {
          errors.roomsWanted = 'Maximum 5 rooms allowed';
        } else {
          const totalGuests = editForm.adults + editForm.children;
          if (totalGuests > value * 4) {
            errors.roomsWanted = 'Too many guests for the number of rooms (max 4 guests per room)';
          } else {
            delete errors.roomsWanted;
          }
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleSave = async () => {
    // Validate form before saving
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Format the data correctly for the backend
      const updateData = {
        // Guest information (nested under guest object)
        guest: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone
        },
        // Booking details (direct fields)
        checkIn: editForm.checkIn,
        checkOut: editForm.checkOut,
        adults: editForm.adults,
        children: editForm.children,
        roomsWanted: editForm.roomsWanted,
        travellingWithPet: editForm.travellingWithPet,
        safariRequested: editForm.safariRequested,
        specialRequests: editForm.specialRequests,
        dietaryRequirements: editForm.dietaryRequirements,
        accessibilityNeeds: editForm.accessibilityNeeds
      };
      
      console.log('Sending update data:', updateData);
      console.log('Reservation ID:', _id);
      
      const response = await axios.put(
        `${API_BASE}/api/reservations/guest/${_id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Update response:', response.data);
      toast.success('Reservation updated successfully');
      setIsEditing(false);
      setValidationErrors({});
      if (onUpdate) onUpdate(response.data.reservation);
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors({});
    setEditForm({
      // Guest Information
      firstName: guest?.firstName || '',
      lastName: guest?.lastName || '',
      email: guest?.email || '',
      phone: guest?.phone || '',
      
      // Booking Details
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      adults: adults || 1,
      children: children || 0,
      roomsWanted: roomsWanted || 1,
      travellingWithPet: travellingWithPet || false,
      safariRequested: safariRequested || false,
      
      // Package Information (if applicable)
      packageId: packageDetails?._id || '',
      
      // Special Requests
      specialRequests: booking?.specialRequests || '',
      dietaryRequirements: booking?.dietaryRequirements || '',
      accessibilityNeeds: booking?.accessibilityNeeds || ''
    });
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Cancel Reservation?',
      text: `Are you sure you want to cancel reservation #${reservationNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d3af37',
      cancelButtonColor: '#0a0a0a',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      background: '#f0f0f0',
      color: '#0a0a0a'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `${API_BASE}/api/reservations/guest/cancel/${_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          title: 'Cancelled!',
          text: 'Your reservation has been cancelled.',
          icon: 'success',
          confirmButtonColor: '#d3af37',
          background: '#f0f0f0',
          color: '#0a0a0a'
        });

        if (onDelete) onDelete(_id);
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

  const handleViewDetails = () => {
    navigate(`/guest/reservation/${reservationNumber}`);
  };

  const handleDownloadReceipt = async () => {
    try {
      toast.loading('Generating receipt...', { id: 'receipt-loading' });
      
      // Generate PDF receipt
      await generateReceiptPDF(booking, booking.package);
      
      toast.success('Receipt downloaded successfully!', { id: 'receipt-loading' });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt. Please try again.', { id: 'receipt-loading' });
    }
  };

  const canEdit = status === 'booked' && new Date(checkIn) > new Date();
  const isUpcoming = new Date(checkIn) > new Date();
  const daysUntilCheckIn = Math.ceil((new Date(checkIn) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="group p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-2 border-gray-100 hover:border-d3af37">
      {isEditing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5" style={{ color: '#d3af37' }} />
              <h3 className="text-base font-semibold">Edit Reservation Details</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fillDemoData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:brightness-95 transition-all font-medium text-sm"
                style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                title="Fill empty fields with demo data"
              >
                <span>📝</span>
                Fill Demo
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:brightness-95 transition-all font-medium text-sm"
                style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
                title="Reset form to original values"
              >
                <span>🔄</span>
                Reset
              </button>
            </div>
          </div>

          {/* Guest Information Section */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#0a0a0a' }}>Guest Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => {
                    setEditForm({...editForm, firstName: e.target.value});
                    validateField('firstName', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.firstName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => {
                    setEditForm({...editForm, lastName: e.target.value});
                    validateField('lastName', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.lastName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({...editForm, email: e.target.value});
                    validateField('email', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => {
                    setEditForm({...editForm, phone: e.target.value});
                    validateField('phone', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details Section */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#0a0a0a' }}>Booking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={editForm.checkIn ? dayjs(editForm.checkIn).format('YYYY-MM-DD') : ''}
                  onChange={(e) => {
                    setEditForm({...editForm, checkIn: e.target.value});
                    validateField('checkIn', e.target.value);
                  }}
                  min={dayjs().format('YYYY-MM-DD')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.checkIn 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.checkIn}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={editForm.checkOut ? dayjs(editForm.checkOut).format('YYYY-MM-DD') : ''}
                  onChange={(e) => {
                    setEditForm({...editForm, checkOut: e.target.value});
                    validateField('checkOut', e.target.value);
                  }}
                  min={editForm.checkIn ? dayjs(editForm.checkIn).add(1, 'day').format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    validationErrors.checkOut 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-d3af37'
                  }`}
                />
                {validationErrors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.checkOut}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adults</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.adults}
                  onChange={(e) => setEditForm({...editForm, adults: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Children</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.children}
                  onChange={(e) => setEditForm({...editForm, children: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rooms Wanted</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.roomsWanted}
                  onChange={(e) => setEditForm({...editForm, roomsWanted: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Special Requests Section */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#0a0a0a' }}>Special Requests</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-3 rounded-md" style={{ backgroundColor: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={editForm.travellingWithPet}
                    onChange={(e) => setEditForm({...editForm, travellingWithPet: e.target.checked})}
                    className="w-4 h-4 mr-3"
                    style={{ accentColor: '#d3af37' }}
                  />
                  <span className="text-sm font-medium">Travelling with pet</span>
                </label>
                <label className="flex items-center p-3 rounded-md" style={{ backgroundColor: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={editForm.safariRequested}
                    onChange={(e) => setEditForm({...editForm, safariRequested: e.target.checked})}
                    className="w-4 h-4 mr-3"
                    style={{ accentColor: '#d3af37' }}
                  />
                  <span className="text-sm font-medium">Safari requested</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Special Requests</label>
                <textarea
                  value={editForm.specialRequests}
                  onChange={(e) => setEditForm({...editForm, specialRequests: e.target.value})}
                  rows={3}
                  placeholder="Any special requests or notes..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dietary Requirements</label>
                <textarea
                  value={editForm.dietaryRequirements}
                  onChange={(e) => setEditForm({...editForm, dietaryRequirements: e.target.value})}
                  rows={2}
                  placeholder="Any dietary restrictions or preferences..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Accessibility Needs</label>
                <textarea
                  value={editForm.accessibilityNeeds}
                  onChange={(e) => setEditForm({...editForm, accessibilityNeeds: e.target.value})}
                  rows={2}
                  placeholder="Any accessibility requirements..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-d3af37 border-gray-300 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isSubmitting || Object.keys(validationErrors).length > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:brightness-95'
              }`}
              style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'
              }`}
              style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: '#d3af37' }}>
                <Calendar className="w-6 h-6" style={{ color: '#0a0a0a' }} />
              </div>
              <div>
                <div className="text-xs font-medium opacity-75 mb-1">Reservation #{reservationNumber}</div>
                <div className="text-lg font-bold text-gray-900">{guest?.firstName} {guest?.lastName}</div>
                <div className="text-xs text-gray-600">{guest?.email}</div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex flex-col items-end gap-3">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: status === "booked" ? '#d3af37' : 
                                 status === "cancel" ? '#ef4444' : '#6b7280',
                  color: status === "booked" ? '#0a0a0a' : '#ffffff'
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status === "booked" ? '#0a0a0a' : '#ffffff' }}></div>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleViewDetails}
                  className="p-3 rounded-xl hover:brightness-95 transition-all shadow-sm"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownloadReceipt}
                  className="p-3 rounded-xl hover:brightness-95 transition-all shadow-sm"
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  title="Download receipt"
                >
                  <Download className="w-5 h-5" />
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="p-3 rounded-xl hover:brightness-95 transition-all shadow-sm"
                      style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
                      title="Edit reservation"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-3 rounded-xl hover:brightness-95 transition-all shadow-sm"
                      style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                      title="Cancel reservation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Booking Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#0a0a0a' }} />
                </div>
                <div className="text-xs font-medium text-gray-600">Check-in</div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {checkIn ? dayjs(checkIn).format("MMM DD, YYYY") : "-"}
              </div>
            </div>
            
            <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#0a0a0a' }} />
                </div>
                <div className="text-xs font-medium text-gray-600">Check-out</div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {checkOut ? dayjs(checkOut).format("MMM DD, YYYY") : "-"}
              </div>
            </div>
            
            <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Users className="w-4 h-4" style={{ color: '#0a0a0a' }} />
                </div>
                <div className="text-xs font-medium text-gray-600">Guests</div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {adults} adult{adults > 1 ? 's' : ''}
                {children > 0 && `, ${children} child${children > 1 ? 'ren' : ''}`}
              </div>
            </div>
            
            <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Home className="w-4 h-4" style={{ color: '#0a0a0a' }} />
                </div>
                <div className="text-xs font-medium text-gray-600">Rooms</div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {roomsWanted} room{roomsWanted > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Additional Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#d3af37' }}>
                  <Clock className="w-4 h-4" style={{ color: '#0a0a0a' }} />
                </div>
                <div className="text-xs font-medium text-gray-600">Duration</div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights
              </div>
            </div>

            {isUpcoming && (
              <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#0ea5e9' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </div>
                  <div className="text-xs font-medium text-blue-600">Check-in in</div>
                </div>
                <div className="text-sm font-bold text-blue-900">
                  {daysUntilCheckIn === 0 ? 'Today' : 
                   daysUntilCheckIn === 1 ? 'Tomorrow' : 
                   `${daysUntilCheckIn} days`}
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          {(travellingWithPet || safariRequested) && (
            <div className="mb-6 p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs font-medium text-gray-600 mb-3">Special Requests</div>
              <div className="flex flex-wrap gap-2">
                {travellingWithPet && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                    🐕 Pet Friendly
                  </span>
                )}
                {safariRequested && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}>
                    🦁 Safari Tour
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-600">
                Created on {dayjs(createdAt).format("MMM DD, YYYY")}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 mb-1">
                {currency ?? "USD"} {Number(totalAmount ?? 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Total Amount</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

