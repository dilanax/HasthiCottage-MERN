import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createSafariBooking } from '../../api/safariBookingApi.js';
import { convertAndFormatLKRToUSD } from '../../utils/currencyUtils.js';

const SafariPackageCard = ({ package: pkg }) => {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = async (e) => {
    // Prevent event propagation and default behavior to stop navigation to reservation page
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    console.log('Book Now button clicked - preventing navigation to /reserve/start'); // Debug log
    console.log('Event details:', e.type, e.target); // Debug log
    
    // Additional safety check to prevent any navigation to reservation page
    if (e.defaultPrevented) {
      console.log('Navigation to /reserve/start already prevented');
    }
    
    // Explicitly prevent navigation to reservation page
    if (window.location.pathname === '/reserve/start') {
      console.log('Already on reservation page - preventing further navigation');
      return;
    }
    
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

    console.log('Showing booking confirmation modal instead of navigating to reservation page'); // Debug log
    
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
            
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-3">${pkg.description}</h3>
              <div class="space-y-2">
                <div class="flex justify-center items-center">
                  <svg class="h-5 w-5 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-lg font-semibold text-gray-700">Package Type: ${pkg.type}</span>
                </div>
                <div class="flex justify-center items-center">
                  <svg class="h-5 w-5 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                  <span class="text-lg font-semibold text-gray-700">Destination: ${pkg.destination}</span>
                </div>
                <div class="text-center mt-3">
                  <span class="text-2xl font-bold text-[#d3af37]">${convertAndFormatLKRToUSD(pkg.price)}</span>
                  <span class="text-sm text-gray-500 ml-1">per package</span>
              </div>
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
            <input id="numberOfPeople" type="number" min="1" value="1" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                   oninput="if(this.value < 1) this.value = 1;"
                   onkeydown="if(event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') event.preventDefault();">
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
        
        // Convert to number and validate
        const numPeople = parseInt(numberOfPeople);
        
        if (!numberOfPeople || isNaN(numPeople)) {
          Swal.showValidationMessage('Please enter a valid number of people');
          return false;
        }
        
        if (numPeople < 1) {
          Swal.showValidationMessage('Number of people cannot be less than 1');
          return false;
        }
        
        if (numPeople !== parseFloat(numberOfPeople)) {
          Swal.showValidationMessage('Please enter a whole number (no decimals)');
          return false;
        }
        
        return {
          numberOfPeople: numPeople,
          specialRequests: specialRequests.trim()
        };
      }
    });

    if (formValues) {
      try {
        setIsBooking(true);
        
        // Collect customer details
        const { value: customerDetails } = await Swal.fire({
          title: 'CUSTOMER DETAILS',
          html: `
            <div class="text-left space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input id="customerName" type="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                       placeholder="Enter your full name" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input id="customerEmail" type="email" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                       placeholder="Enter your email" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input id="customerPhone" type="tel" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                       placeholder="e.g., 0771234567 or +94771234567" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input id="quantity" type="number" min="1" max="50" value="${formValues.numberOfPeople}" step="1"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                       oninput="if(this.value < 1) this.value = 1; if(this.value > 50) this.value = 50; if(this.value.includes('.')) this.value = Math.floor(this.value);"
                       onkeydown="if(event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E' || event.key === '.') event.preventDefault();"
                       onpaste="event.preventDefault();">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea id="specialRequests" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                          placeholder="Any special dietary requirements or requests...">${formValues.specialRequests}</textarea>
              </div>
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonColor: '#d3af37',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirm Booking',
          cancelButtonText: 'Cancel',
          width: '500px',
          preConfirm: () => {
            const name = document.getElementById('customerName').value.trim();
            const email = document.getElementById('customerEmail').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            const specialRequests = document.getElementById('specialRequests').value.trim();

            // Validation for required fields
            if (!name) {
              Swal.showValidationMessage('Full Name is required');
              return false;
            }

            // Name validation - only letters, spaces, and basic punctuation
            const nameRegex = /^[a-zA-Z\s.'-]+$/;
            if (!nameRegex.test(name)) {
              Swal.showValidationMessage('Name can only contain letters, spaces, periods, apostrophes, and hyphens');
              return false;
            }

            if (name.length < 2) {
              Swal.showValidationMessage('Name must be at least 2 characters long');
              return false;
            }

            if (!email) {
              Swal.showValidationMessage('Email Address is required');
              return false;
            }

            if (!phone) {
              Swal.showValidationMessage('Phone Number is required');
              return false;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              Swal.showValidationMessage('Please enter a valid email address');
              return false;
            }

            // Enhanced phone number validation for Sri Lankan numbers
            const phoneRegex = /^(\+94|0)?[0-9]{9}$/;
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
            
            if (!phoneRegex.test(cleanPhone)) {
              Swal.showValidationMessage('Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)');
              return false;
            }

            // Enhanced quantity validation
            if (quantity < 1) {
              Swal.showValidationMessage('Number of people must be at least 1');
              return false;
            }

            if (quantity > 50) {
              Swal.showValidationMessage('Maximum 50 people allowed per safari booking');
              return false;
            }

            if (quantity !== parseFloat(document.getElementById('quantity').value)) {
              Swal.showValidationMessage('Number of people must be a whole number (no decimals)');
              return false;
            }

            // Check if quantity is a valid positive integer
            if (!Number.isInteger(quantity) || quantity <= 0) {
              Swal.showValidationMessage('Please enter a valid number of people (1-50)');
              return false;
            }

            return { name, email, phone, quantity, specialRequests };
          }
        });

        if (!customerDetails) {
          setIsBooking(false);
          return;
        }
        
        // Get user details from token for customerId
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = user.id || user._id;
        
        if (!customerId) {
          throw new Error('User ID not found. Please login again.');
        }

        const bookingData = {
          packageId: pkg._id,
          customerId: customerId,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          numberOfPeople: customerDetails.quantity,
          specialRequests: customerDetails.specialRequests
        };

        const response = await createSafariBooking(bookingData);
        
        // Show success modal with package details (no image)
        await Swal.fire({
          title: 'BOOKING SUCCESSFUL!',
          html: `
            <div class="text-center">
              <div class="mb-6">
                <div class="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <!-- Package Information Section -->
                <div class="bg-white border-2 border-[#d3af37] rounded-xl p-6 mb-6 shadow-lg">
                  <div class="text-center mb-4">
                    <h3 class="text-2xl font-bold text-gray-900 mb-3">${pkg.description}</h3>
                    <div class="space-y-2 mb-4">
                      <div class="flex justify-center items-center">
                        <svg class="h-5 w-5 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="text-lg font-semibold text-gray-700">Package Type: ${pkg.type}</span>
                      </div>
                      <div class="flex justify-center items-center">
                        <svg class="h-5 w-5 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="text-lg font-semibold text-gray-700">Destination: ${pkg.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-[#d3af37] mb-1">${convertAndFormatLKRToUSD(pkg.price)}</div>
                    <div class="text-sm text-gray-500">per package</div>
                  </div>
                </div>
                
                <!-- Booking Details -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 class="text-lg font-bold text-gray-900 mb-3">Booking Details</h4>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between items-center">
                      <span class="font-medium">Number of People:</span>
                      <span class="font-semibold">${customerDetails.quantity}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="font-medium">Price per Package:</span>
                      <span class="font-semibold">${convertAndFormatLKRToUSD(pkg.price)}</span>
                    </div>
                    <div class="border-t pt-2 mt-2">
                      <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span class="text-xl font-bold text-[#d3af37]">${convertAndFormatLKRToUSD(pkg.price * customerDetails.quantity)}</span>
                      </div>
                  </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-sm text-green-800">
                  <strong>🎉 Congratulations!</strong> Your safari booking has been confirmed and sent to the management team. 
                  You will receive updates on preparation status and confirmation details via email.
                </p>
              </div>
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

  const imageUrl = pkg.image || null; // Azure URL is already complete

  return (
    <div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={pkg.description}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
            pkg.type === "Luxury"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
              : pkg.type === "Semi-Luxury"
              ? "bg-gradient-to-r from-indigo-400 to-indigo-500 text-white"
              : "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
          }`}>
            {pkg.type}
          </span>
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#d3af37] transition-colors duration-300">
          {pkg.description}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {pkg.destination}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(pkg.date).toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.period}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Up to {pkg.visitors} people
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-[#d3af37] group-hover:text-[#b8971f] transition-colors duration-300">
              {convertAndFormatLKRToUSD(pkg.price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">per package</span>
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
            className="group/btn relative px-6 py-3 bg-gradient-to-r from-[#d3af37] to-[#b8971f] text-[#0a0a0a] font-semibold rounded-xl hover:from-[#b8971f] hover:to-[#d3af37] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            type="button"
          >
            <span className="relative z-10 flex items-center">
              {isBooking ? 'Booking...' : 'Book Now'}
              {!isBooking && (
                <svg className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300 rounded-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafariPackageCard;
