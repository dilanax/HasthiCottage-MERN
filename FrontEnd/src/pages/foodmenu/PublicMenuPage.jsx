import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMenu } from "../../api/menuApi.js";
import { createFoodBooking } from "../../api/foodBookingApi.js";
import Badge from "../../components/foodmenu/common/Badge.jsx";
import Header from "../../components/Header.jsx";
import AuthHeader from "../../components/AuthHeader.jsx";
import Swal from "sweetalert2";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

const money = (v) => convertAndFormatLKRToUSD(v);

export default function PublicMenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [spice, setSpice] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          JSON.parse(userData); // Validate JSON
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login/logout events
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await listMenu({ archived: "false" });
      setItems(data);
    })();
  }, []);

  const apiBase = import.meta.env.VITE_API_BASE || "";

  const handleBookNow = async (menuItem) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        const result = await Swal.fire({
          title: 'LOGIN REQUIRED',
          text: 'You need to be logged in to book a food item. Would you like to login now?',
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

      // Get quantity from the quantity input field
      const quantityInput = document.getElementById(`quantity-${menuItem._id}`);
      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
      
      // Validate quantity
      if (quantity < 1) {
        await Swal.fire({
          title: 'Invalid Quantity',
          text: 'Quantity must be at least 1',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (quantity > 20) {
        await Swal.fire({
          title: 'Invalid Quantity',
          text: 'Quantity cannot exceed 20',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Get user details from localStorage (stored as 'user')
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Extract user details with proper field mapping
      const userDetails = {
        name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || 'not given'
      };

      // Debug logging
      console.log('User data from localStorage:', userData);
      console.log('Processed user details:', userDetails);
      console.log('Menu item details:', menuItem);

      // Validate that we have the required user details
      if (!userDetails.email) {
        await Swal.fire({
          title: 'Incomplete Profile',
          text: 'Your profile is missing email information. Please update your profile before booking.',
          icon: 'warning',
          confirmButtonColor: '#d3af37',
          confirmButtonText: 'Update Profile',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/profile');
          }
        });
        return;
      }

      // First confirmation dialog
      const confirmResult = await Swal.fire({
        title: 'Book Food Item?',
        html: `
          <div class="text-left">
            <div class="flex items-center mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">${menuItem.name}</h3>
                <p class="text-sm text-gray-600">${menuItem.category}</p>
                <p class="text-lg font-bold text-[#d3af37]">${convertAndFormatLKRToUSD(menuItem.price)}</p>
                <p class="text-sm text-gray-600">Quantity: ${quantity}</p>
                <p class="text-sm font-semibold text-gray-800">Total: ${convertAndFormatLKRToUSD(menuItem.price * quantity)}</p>
              </div>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg mb-3">
              <p class="text-sm text-gray-600 mb-1"><strong>Booking for:</strong></p>
              <p class="text-sm text-gray-800">${userDetails.name}</p>
              <p class="text-sm text-gray-600">${userDetails.email}</p>
              <p class="text-sm text-gray-600">${userDetails.phone}</p>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Important:</strong> This booking will be sent to the hotel kitchen. 
              Please ensure your details are correct as this will be used for food preparation.
            </p>
            <p class="text-sm text-gray-500">
              Do you want to proceed with booking this food item?
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d3af37',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Book It!',
        cancelButtonText: 'Cancel',
        width: '500px'
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      // Second dialog for quantity and special requests only
      const { value: bookingDetails } = await Swal.fire({
        title: 'Booking Details',
        html: `
          <div class="text-left space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <div class="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#d3af37] focus-within:border-transparent">
                <button type="button" onclick="const input = document.getElementById('quantity'); if(input.value > 1) input.value = parseInt(input.value) - 1;" 
                        class="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-r border-gray-300 focus:outline-none focus:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input id="quantity" type="number" min="1" max="20" value="${quantity}" step="1"
                       class="flex-1 px-3 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                       oninput="if(this.value < 1) this.value = 1; if(this.value > 20) this.value = 20; if(this.value.includes('.')) this.value = Math.floor(this.value);"
                       onkeydown="if(event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E' || event.key === '.') event.preventDefault();"
                       onpaste="event.preventDefault();">
                <button type="button" onclick="const input = document.getElementById('quantity'); if(input.value < 20) input.value = parseInt(input.value) + 1;" 
                        class="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-l border-gray-300 focus:outline-none focus:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea id="specialRequests" rows="3" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                        placeholder="Any special dietary requirements or requests..."></textarea>
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
          const quantity = parseInt(document.getElementById('quantity').value) || 1;
          const specialRequests = document.getElementById('specialRequests').value.trim();

          // Enhanced quantity validation
          if (quantity < 1) {
            Swal.showValidationMessage('Quantity must be at least 1 item');
            return false;
          }

          if (quantity > 20) {
            Swal.showValidationMessage('Maximum quantity allowed is 20 items per order');
            return false;
          }

          if (quantity !== parseFloat(document.getElementById('quantity').value)) {
            Swal.showValidationMessage('Quantity must be a whole number (no decimals)');
            return false;
          }

          // Check if quantity is a valid positive integer
          if (!Number.isInteger(quantity) || quantity <= 0) {
            Swal.showValidationMessage('Please enter a valid quantity (1-20)');
            return false;
          }

          return { quantity, specialRequests };
        }
      });

      if (!bookingDetails) {
        return;
      }

      // Get user ID from localStorage
      const userId = userData.id || userData._id;
      
      // Create the booking using logged user details
      const bookingData = {
        foodItemId: menuItem._id,
        customerId: userId,
        customerName: userDetails.name,
        customerEmail: userDetails.email,
        customerPhone: userDetails.phone,
        quantity: bookingDetails.quantity,
        specialRequests: bookingDetails.specialRequests
      };

      // Debug logging for booking data
      console.log('Booking data being sent:', bookingData);

      const response = await createFoodBooking(bookingData);

      // Success message with single button
      await Swal.fire({
        title: 'Booking Successful! 🎉',
        html: `
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${menuItem.name}</h3>
            <p class="text-sm text-gray-600 mb-2">Quantity: ${bookingDetails.quantity}</p>
            <p class="text-sm text-gray-600 mb-2">Total: ${convertAndFormatLKRToUSD(menuItem.price * bookingDetails.quantity)}</p>
            <p class="text-sm text-gray-500">
              Your food order has been sent to the kitchen. You will receive updates on the preparation status.
            </p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#d3af37',
        confirmButtonText: 'Great!',
        showCancelButton: false,
        width: '450px'
      });

    } catch (error) {
      console.error('Booking error:', error);
      await Swal.fire({
        title: 'Booking Failed',
        text: error.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };

  const visible = useMemo(
    () =>
      items.filter((i) => {
        const avail = i.available?.isAvailable !== false;
        const matchQ = !q || (i.name + " " + i.description).toLowerCase().includes(q.toLowerCase());
        const matchC = !cat || i.category === cat;
        const matchS = !spice || String(i.spicyLevel) === spice;
        return avail && matchQ && matchC && matchS;
      }),
    [items, q, cat, spice]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? <AuthHeader /> : <Header />}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4">Today's Menu</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fresh, tasty, and prepared with love. Filter and find your favourite dishes.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#d3af37] p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                className="w-full rounded-lg border border-[#d3af37] bg-white px-4 py-3 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
                placeholder="Search items..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select
                className="w-full rounded-lg border border-[#d3af37] bg-white px-4 py-3 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="">All Categories</option>
                {["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "BEVERAGE", "DESSERT", "OTHER"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-lg border border-[#d3af37] bg-white px-4 py-3 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
                value={spice}
                onChange={(e) => setSpice(e.target.value)}
              >
                <option value="">Any Spice Level</option>
                <option value="0">None</option>
                <option value="1">Mild</option>
                <option value="2">Medium</option>
                <option value="3">Hot</option>
              </select>

              <div className="flex items-center justify-center md:justify-end">
                <div className="text-center md:text-right">
                  <div className="text-sm text-gray-600">Showing</div>
                  <div className="text-lg font-semibold text-[#0a0a0a]">
                    <span className="text-[#d3af37]">{visible.length}</span> of {items.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visible.map((it) => {
          const img = it.image || "https://picsum.photos/600/400"; // Azure URL is already complete
          return (
            <div key={it._id} className="bg-white rounded-2xl shadow-lg border border-[#d3af37] overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img alt={it.name} src={img} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-[#0a0a0a] flex-1 mr-2">{it.name}</h3>
                  <div className="font-bold text-xl text-[#d3af37]">{money(it.price)}</div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{it.description}</p>
                <div className="flex gap-2 items-center mb-4 flex-wrap">
                  <Badge tone="gray">{it.category}</Badge>
                  {it.spicyLevel > 0 ? <Badge tone="warn">{["", "Mild", "Medium", "Hot"][it.spicyLevel]}</Badge> : null}
                  {(it.tags?.slice(0, 2) || []).map((t) => (
                    <span key={t} className="bg-[#d3af37]/10 text-[#0a0a0a] px-3 py-1 rounded-full text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                
                {/* Quantity Controls */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#d3af37] focus-within:border-transparent">
                    <button 
                      type="button" 
                      onClick={() => {
                        const input = document.getElementById(`quantity-${it._id}`);
                        if (input && parseInt(input.value) > 1) {
                          input.value = parseInt(input.value) - 1;
                        }
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-r border-gray-300 focus:outline-none focus:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input 
                      id={`quantity-${it._id}`}
                      type="number" 
                      min="1" 
                      max="20" 
                      step="1"
                      defaultValue="1"
                      className="flex-1 px-3 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                      oninput="if(this.value < 1) this.value = 1; if(this.value > 20) this.value = 20; if(this.value.includes('.')) this.value = Math.floor(this.value);"
                      onkeydown="if(event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E' || event.key === '.') event.preventDefault();"
                      onpaste="event.preventDefault();"
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const input = document.getElementById(`quantity-${it._id}`);
                        if (input && parseInt(input.value) < 20) {
                          input.value = parseInt(input.value) + 1;
                        }
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-l border-gray-300 focus:outline-none focus:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Book Now Button */}
                <button 
                  onClick={() => handleBookNow(it)}
                  className="w-full rounded-xl bg-[#d3af37] px-4 py-3 font-semibold text-[#0a0a0a] shadow-md hover:bg-[#b89d2e] transition-colors hover:shadow-lg"
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
            {visible.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <div className="text-xl text-gray-500 font-medium">No matching items found</div>
                <div className="text-gray-400 mt-2">Try adjusting your filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
