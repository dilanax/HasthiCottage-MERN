import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { createSafariBooking } from '../../api/safariBookingApi.js';
import { imageURL } from "../../utils/api";
import { convertAndFormatLKRToUSD } from '../../utils/currencyUtils.js';

const badgeClasses = (type) => {
  if (type === "Luxury") return "bg-amber-500";
  if (type === "Semi-Luxury") return "bg-indigo-500";
  return "bg-emerald-500";
};

export default function SafariCard({ pkg }) {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = async (e) => {
    // Prevent event propagation and default behavior to stop navigation to reservation page
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      const result = await Swal.fire({
        title: 'Login Required',
        text: 'You need to be logged in to book a safari package. Would you like to login now?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d3af37',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Login',
        cancelButtonText: 'Cancel',
        background: '#ffffff',
        color: '#0a0a0a'
      });

      if (result.isConfirmed) {
        navigate('/login');
      }
      return;
    }

    // Define imageUrl for use in modal
    const imageUrl = pkg.image || null; // Azure URL is already complete
    
    // Show detailed booking confirmation modal similar to food booking
    const { value: formValues } = await Swal.fire({
      title: 'BOOK SAFARI PACKAGE?',
      html: `
        <div class="text-center">
          <div class="mb-6">
            <div class="flex items-center justify-center mb-4">
              <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div class="flex items-center justify-center mb-4">
              
              <div class="text-left">
                <h3 class="text-lg font-bold text-gray-900">${pkg.description}</h3>
                <p class="text-sm text-gray-600">${pkg.destination}</p>
                <p class="text-sm text-gray-600">${pkg.type}</p>
                <p class="text-lg font-bold text-[#d3af37]">${convertAndFormatLKRToUSD(pkg.price)}</p>
              </div>
            </div>
          </div>
          
          <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <strong>Important:</strong> This booking will be sent to the safari management team. 
              Payment will be collected at the hotel upon arrival. Please ensure your details are correct 
              as this will be used for safari preparation and coordination.
            </p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Number of People *</label>
            <input id="numberOfPeople" type="number" min="1" max="${pkg.visitors}" value="1" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Special Requests</label>
            <textarea id="specialRequests" rows="3" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                      placeholder="Any special dietary requirements, accessibility needs, or requests..."></textarea>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">
            Do you want to proceed with booking this safari package?
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#d3af37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Book It!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#0a0a0a',
      width: '500px',
      customClass: {
        title: 'text-2xl font-bold text-gray-900',
        htmlContainer: 'text-left'
      },
      preConfirm: () => {
        const numberOfPeople = document.getElementById('numberOfPeople').value;
        const specialRequests = document.getElementById('specialRequests').value;
        
        if (!numberOfPeople || numberOfPeople < 1 || numberOfPeople > pkg.visitors) {
          Swal.showValidationMessage('Please enter a valid number of people (1-' + pkg.visitors + ')');
          return false;
        }
        
        return {
          numberOfPeople: parseInt(numberOfPeople),
          specialRequests: specialRequests.trim()
        };
      }
    });

    if (formValues) {
      try {
        setIsBooking(true);
        
        // Get user details from token
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Debug: Log user data to see what's available
        console.log('User data from localStorage:', user);
        
        const customerId = user.id || user._id;
        if (!customerId) {
          throw new Error('User ID not found. Please login again.');
        }
        
        // Check if user has a valid phone number
        let customerPhone = user.phone;
        
        // If no phone or phone is "not given", ask user to provide it
        if (!customerPhone || customerPhone === 'not given' || customerPhone === '') {
          const { value: phoneInput } = await Swal.fire({
            title: 'Phone Number Required',
            html: `
              <div class="text-left">
                <p class="text-sm text-gray-600 mb-4">
                  Please provide your phone number for this safari booking. This will be used for coordination and updates.
                </p>
                <input id="phoneNumber" type="tel" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                       placeholder="e.g., 0771234567 or +94771234567" required>
              </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#d3af37',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Continue Booking',
            cancelButtonText: 'Cancel',
            width: '400px',
            preConfirm: () => {
              const phone = document.getElementById('phoneNumber').value.trim();
              if (!phone) {
                Swal.showValidationMessage('Phone number is required');
                return false;
              }
              
              // Basic phone validation for Sri Lankan numbers
              const phoneRegex = /^(\+94|0)?[0-9]{9}$/;
              const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
              
              if (!phoneRegex.test(cleanPhone)) {
                Swal.showValidationMessage('Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)');
                return false;
              }
              
              return phone;
            }
          });
          
          if (!phoneInput) {
            setIsBooking(false);
            return;
          }
          
          customerPhone = phoneInput;
        }

        const bookingData = {
          packageId: pkg._id,
          customerId: customerId,
          customerName: user.name || 'Guest User',
          customerEmail: user.email || 'guest@example.com',
          customerPhone: customerPhone,
          numberOfPeople: formValues.numberOfPeople,
          specialRequests: formValues.specialRequests
        };

        const response = await createSafariBooking(bookingData);
        
        // Show success modal similar to food booking
        await Swal.fire({
          title: 'BOOKING SUCCESSFUL!',
          html: `
            <div class="text-center">
              <div class="mb-4">
                <div class="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="flex items-center justify-center mb-4">
                  
                  <div class="text-left">
                    <h3 class="text-lg font-bold text-gray-900">${pkg.description}</h3>
                    <p class="text-sm text-gray-600">People: ${formValues.numberOfPeople}</p>
                    <p class="text-lg font-bold text-[#d3af37]">Total: ${convertAndFormatLKRToUSD(pkg.price * formValues.numberOfPeople)}</p>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Your safari booking has been sent to the management team. You will receive updates on 
                preparation status and confirmation details via email.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#d3af37',
          confirmButtonText: 'Great!',
          background: '#ffffff',
          color: '#0a0a0a',
          width: '500px'
        });

      } catch (error) {
        console.error('Booking error:', error);
        await Swal.fire({
          title: 'Booking Failed',
          text: error.message || 'Failed to book safari package. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          background: '#ffffff',
          color: '#0a0a0a'
        });
      } finally {
        setIsBooking(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageURL(pkg.image)}
          alt={pkg.destination}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeClasses(pkg.type)}`}>
            {pkg.type}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.destination}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{pkg.description}</p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Period:</span>
            <span className="font-medium">{pkg.period}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{new Date(pkg.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Visitors:</span>
            <span className="font-medium">{pkg.visitors} people</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {convertAndFormatLKRToUSD(pkg.price)}
          </div>
        </div>
        
        <button
          onClick={handleBookNow}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={isBooking}
          className="w-full bg-[#d3af37] text-[#0a0a0a] font-semibold py-3 px-4 rounded-lg hover:bg-[#b8971f] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          style={{ cursor: isBooking ? 'not-allowed' : 'pointer' }}
        >
          {isBooking ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </div>
  );
}