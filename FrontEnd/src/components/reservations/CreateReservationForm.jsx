import { useState, useEffect } from "react";
import axios from "axios";
import { XCircle, CalendarDays, Users, Home, DollarSign, Clock, CreditCard, MapPin, Bed } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import RoomTypeDropdownWithCRUD from "../common/RoomTypeDropdownWithCRUD";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`;

const C_ACCENT = "#d3af37";
const C_TEXT = "#0a0a0a";

export default function CreateReservationForm({ onClose, onSuccess, accent = C_ACCENT, text = C_TEXT }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    countryCode: "",
    phoneNumber: "",
    packageId: "",
    roomType: "",
    checkIn: "",
    checkOut: "",
    roomsWanted: 1,
    adults: 1,
    children: 0,
    travellingWithPet: false,
    safariRequested: false,
    arrivalWindow: "unknown",
    status: "booked",
    currency: "USD",
    paymentStatus: "pending",
    totalAmount: 0,
    customRoomId: "",
    customPricePerNight: 0,
    customAdultsIncluded: 2
  });

  const [packages, setPackages] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const [filteredRoomIds, setFilteredRoomIds] = useState([]);
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [roomIdsLoading, setRoomIdsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const token = localStorage.getItem("token");

  // Fetch available packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPackagesLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/room_package/packages`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPackages(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [token]);

  // Fetch available room IDs
  useEffect(() => {
    const fetchRoomIds = async () => {
      try {
        setRoomIdsLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/room/ids`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const roomIdsData = Array.isArray(data?.data) ? data.data : [];
        setRoomIds(roomIdsData);
        setFilteredRoomIds(roomIdsData);
      } catch (error) {
        console.error("Error fetching room IDs:", error);
        setRoomIds([]);
        setFilteredRoomIds([]);
      } finally {
        setRoomIdsLoading(false);
      }
    };

    fetchRoomIds();
  }, [token]);

  // Filter room IDs based on search term
  useEffect(() => {
    if (roomSearchTerm.trim() === "") {
      setFilteredRoomIds(roomIds);
    } else {
      const filtered = roomIds.filter(roomId => 
        roomId.toLowerCase().includes(roomSearchTerm.toLowerCase())
      );
      setFilteredRoomIds(filtered);
    }
  }, [roomSearchTerm, roomIds]);

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  // Handle phone number changes
  const handlePhoneChange = (value) => {
    set("phone", value || "");
    if (value) {
      const countryCode = value.split(' ')[0] || '';
      const phoneNumber = value.replace(countryCode, '').trim();
      set("countryCode", countryCode);
      set("phoneNumber", phoneNumber);
    } else {
      set("countryCode", "");
      set("phoneNumber", "");
    }
    validateField("phone", value);
  };

  // Real-time validation for specific fields
  const validateField = (key, value) => {
    const newErrors = { ...errors };
    
    switch (key) {
      case 'firstName':
        if (!value.trim()) {
          newErrors[key] = "First name is required";
        } else if (value.trim().length < 2) {
          newErrors[key] = "First name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors[key] = "First name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors[key];
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          newErrors[key] = "Last name is required";
        } else if (value.trim().length < 2) {
          newErrors[key] = "Last name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors[key] = "Last name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors[key];
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors[key] = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[key] = "Please enter a valid email address";
        } else {
          delete newErrors[key];
        }
        break;
        
      case 'phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            newErrors[key] = "Please enter a valid phone number";
          } else {
            delete newErrors[key];
          }
        } else {
          delete newErrors[key];
        }
        break;
        
      case 'customPricePerNight':
        if (form.packageId === "admin-reservation") {
          if (!value || value <= 0) {
            newErrors[key] = "Price per night must be greater than 0";
          } else if (value > 10000) {
            newErrors[key] = "Price per night cannot exceed $10,000";
          } else {
            delete newErrors[key];
          }
        }
        break;
        
      case 'checkIn':
        if (value) {
          const checkInDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (checkInDate < today) {
            newErrors[key] = "Check-in date cannot be in the past";
          } else {
            delete newErrors[key];
          }
        } else {
          delete newErrors[key];
        }
        break;
        
      case 'checkOut':
        if (value) {
          const checkOutDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (checkOutDate < today) {
            newErrors[key] = "Check-out date cannot be in the past";
          } else if (form.checkIn && checkOutDate <= new Date(form.checkIn)) {
            newErrors[key] = "Check-out date must be after check-in date";
          } else {
            delete newErrors[key];
          }
        } else {
          delete newErrors[key];
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Fetch room details when room ID is selected
  const fetchRoomDetails = async (roomId) => {
    if (!roomId) {
      setSelectedRoomDetails(null);
      return;
    }

    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/room/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSelectedRoomDetails(data?.data || null);
    } catch (error) {
      console.error("Error fetching room details:", error);
      setSelectedRoomDetails(null);
    }
  };

  // Handle room ID change
  const handleRoomIdChange = (roomId) => {
    set("customRoomId", roomId);
    fetchRoomDetails(roomId);
  };

  // Load demo data
  const loadDemoData = () => {
    const demoData = {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+94771234567",
      country: "Sri Lanka",
      countryCode: "+94",
      phoneNumber: "771234567",
      packageId: "admin-reservation",
      roomType: "Deluxe",
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
      roomsWanted: 2,
      adults: 4,
      children: 2,
      travellingWithPet: true,
      safariRequested: true,
      arrivalWindow: "afternoon",
      status: "booked",
      currency: "USD",
      paymentStatus: "pending",
      totalAmount: 450.00,
      customRoomId: "DELUXE-SUITE-WITH-GARDEN-VIEW-001",
      customPricePerNight: 150.00,
      customAdultsIncluded: 2
    };

    // Set all demo data
    Object.keys(demoData).forEach(key => {
      set(key, demoData[key]);
    });

    // Clear any existing errors
    setErrors({});
  };

  // Clear form data
  const clearForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      countryCode: "",
      phoneNumber: "",
      packageId: "",
      roomType: "",
      checkIn: "",
      checkOut: "",
      roomsWanted: 1,
      adults: 1,
      children: 0,
      travellingWithPet: false,
      safariRequested: false,
      arrivalWindow: "unknown",
      status: "booked",
      currency: "USD",
      paymentStatus: "pending",
      totalAmount: 0,
      customRoomId: "",
      customPricePerNight: 0,
      customAdultsIncluded: 2
    });
    setErrors({});
    setSelectedRoomDetails(null);
    setRoomSearchTerm("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (form.firstName.trim().length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (form.lastName.trim().length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (form.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters";
    }

    if (!form.packageId) {
      newErrors.packageId = "Package selection is required";
    }

    if (!form.roomType) {
      newErrors.roomType = "Room type is required";
    }

    if (!form.checkIn) {
      newErrors.checkIn = "Check-in date is required";
    }

    if (!form.checkOut) {
      newErrors.checkOut = "Check-out date is required";
    }

    // Phone validation
    if (form.phone && form.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Country validation
    if (form.country && form.country.trim()) {
      if (form.country.trim().length < 2) {
        newErrors.country = "Country must be at least 2 characters";
      } else if (form.country.trim().length > 50) {
        newErrors.country = "Country must be less than 50 characters";
      } else if (!/^[a-zA-Z\s'-]+$/.test(form.country.trim())) {
        newErrors.country = "Country can only contain letters, spaces, hyphens, and apostrophes";
      }
    }

    // Admin reservation specific validation
    if (form.packageId === "admin-reservation") {
      if (!form.customRoomId.trim()) {
        newErrors.customRoomId = "Room ID is required for admin reservation";
      } else if (form.customRoomId.trim().length < 2) {
        newErrors.customRoomId = "Room ID must be at least 2 characters";
      } else if (form.customRoomId.trim().length > 50) {
        newErrors.customRoomId = "Room ID must be less than 50 characters";
      }

      if (!form.customPricePerNight || form.customPricePerNight <= 0) {
        newErrors.customPricePerNight = "Price per night must be greater than 0";
      } else if (form.customPricePerNight > 10000) {
        newErrors.customPricePerNight = "Price per night cannot exceed $10,000";
      }

      if (form.customAdultsIncluded < 1) {
        newErrors.customAdultsIncluded = "Adults included must be at least 1";
      } else if (form.customAdultsIncluded > 10) {
        newErrors.customAdultsIncluded = "Adults included cannot exceed 10";
      }
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (form.checkIn) {
      const checkInDate = new Date(form.checkIn);
      if (checkInDate < today) {
        newErrors.checkIn = "Check-in date cannot be in the past";
      }
    }

    if (form.checkOut) {
      const checkOutDate = new Date(form.checkOut);
      if (checkOutDate < today) {
        newErrors.checkOut = "Check-out date cannot be in the past";
      }
    }

    if (form.checkIn && form.checkOut) {
      const checkInDate = new Date(form.checkIn);
      const checkOutDate = new Date(form.checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }
    }

    // Number validation
    if (form.roomsWanted < 1) {
      newErrors.roomsWanted = "At least 1 room is required";
    } else if (form.roomsWanted > 10) {
      newErrors.roomsWanted = "Cannot book more than 10 rooms";
    }

    if (form.adults < 1) {
      newErrors.adults = "At least 1 adult is required";
    } else if (form.adults > 20) {
      newErrors.adults = "Cannot have more than 20 adults";
    }

    if (form.children < 0) {
      newErrors.children = "Children count cannot be negative";
    } else if (form.children > 20) {
      newErrors.children = "Cannot have more than 20 children";
    }

    // Total guests validation
    const totalGuests = form.adults + form.children;
    if (totalGuests > 40) {
      newErrors.adults = "Total guests (adults + children) cannot exceed 40";
      newErrors.children = "Total guests (adults + children) cannot exceed 40";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const now = Date.now();
    
    // Prevent duplicate submissions with multiple checks
    if (isSubmitting || loading) {
      console.log("Submission already in progress, ignoring duplicate click");
      return;
    }
    
    // Prevent rapid successive submissions (debounce)
    if (now - lastSubmissionTime < 2000) {
      console.log("Too soon since last submission, ignoring duplicate click");
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setLastSubmissionTime(now);
    
    // Generate a unique idempotency key for this submission
    const idempotencyKey = `reservation_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      let submitData = { ...form };

      // Handle admin reservation case
      if (form.packageId === "admin-reservation") {
        // For admin reservations, we need to create a custom package first
        // or modify the submission to handle custom pricing
        submitData = {
          ...form,
          // Create a virtual package ID or handle it in the backend
          customPackage: {
            roomId: form.customRoomId,
            pricePerNight: form.customPricePerNight,
            adultsIncluded: form.customAdultsIncluded,
            isAdminReservation: true
          }
        };
      }

      // Add idempotency key to prevent duplicates
      submitData.idempotencyKey = idempotencyKey;

      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/reservations/reserve`, submitData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        },
      });

      if (data.ok && data.reservation) {
        onSuccess(data.reservation);
      } else {
        throw new Error(data.error || "Failed to create reservation");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to create reservation";
      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const selectedPackage = packages.find(pkg => pkg._id === form.packageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: accent }}>
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create New Reservation</h3>
                <p className="text-sm text-gray-600">Fill in the details to create a new reservation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadDemoData}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: "#3b82f6" }}
              >
                📋 Demo Data
              </button>
              <button
                onClick={clearForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg transition-colors hover:bg-gray-200"
              >
                🗑️ Clear Form
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <style jsx>{`
            .phone-input-container .PhoneInputInput {
              border: none;
              outline: none;
              padding: 0.5rem;
              font-size: 0.875rem;
              width: 100%;
            }
            .phone-input-container .PhoneInputCountrySelect {
              border: none;
              outline: none;
              padding: 0.5rem;
              background: transparent;
            }
            .phone-input-container {
              border: 1px solid #d1d5db;
              border-radius: 0.5rem;
              padding: 0.5rem;
              display: flex;
              align-items: center;
              background: white;
            }
            .phone-input-container:focus-within {
              border-color: #d3af37;
              box-shadow: 0 0 0 2px rgba(211, 175, 55, 0.2);
            }
            .phone-input-container.border-red-500 {
              border-color: #ef4444;
            }
            .phone-input-container.border-green-500 {
              border-color: #10b981;
            }
            .phone-input-container.bg-red-50 {
              background-color: #fef2f2;
            }
            .phone-input-container.bg-green-50 {
              background-color: #f0fdf4;
            }
          `}</style>
          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600">⚠️</span>
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}


          <div className="space-y-6">
            {/* Guest Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Guest Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => {
                      set("firstName", e.target.value);
                      validateField("firstName", e.target.value);
                    }}
                    onBlur={(e) => validateField("firstName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.firstName ? "border-red-500 bg-red-50" : 
                      form.firstName && !errors.firstName ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                    maxLength={50}
                  />
                  {errors.firstName && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.firstName}
                  </p>}
                  {form.firstName && !errors.firstName && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid first name
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => {
                      set("lastName", e.target.value);
                      validateField("lastName", e.target.value);
                    }}
                    onBlur={(e) => validateField("lastName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.lastName ? "border-red-500 bg-red-50" : 
                      form.lastName && !errors.lastName ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                    maxLength={50}
                  />
                  {errors.lastName && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.lastName}
                  </p>}
                  {form.lastName && !errors.lastName && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid last name
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      set("email", e.target.value);
                      validateField("email", e.target.value);
                    }}
                    onBlur={(e) => validateField("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.email ? "border-red-500 bg-red-50" : 
                      form.email && !errors.email ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                    maxLength={100}
                  />
                  {errors.email && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>}
                  {form.email && !errors.email && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid email address
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => validateField("phone", form.phone)}
                    defaultCountry="LK"
                    international
                    countryCallingCodeEditable={false}
                    className={`phone-input-container ${
                      errors.phone ? "border-red-500 bg-red-50" : 
                      form.phone && !errors.phone ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    placeholder="Enter phone number (optional)"
                    style={{
                      '--PhoneInputCountryFlag-height': '1.2em',
                      '--PhoneInputCountrySelectArrow-color': '#6b7280',
                    }}
                  />
                  {errors.phone && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.phone}
                  </p>}
                  {form.phone && !errors.phone && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid phone number
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.country ? "border-red-500 bg-red-50" : 
                      form.country && !errors.country ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    placeholder="Enter country (optional)"
                    maxLength={50}
                  />
                  {errors.country && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.country}
                  </p>}
                </div>
              </div>
            </div>

            {/* Date Selection Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Date Selection
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Check-in Date *</label>
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => {
                      set("checkIn", e.target.value);
                      validateField("checkIn", e.target.value);
                    }}
                    onBlur={(e) => validateField("checkIn", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.checkIn ? "border-red-500 bg-red-50" : 
                      form.checkIn && !errors.checkIn ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.checkIn && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.checkIn}
                  </p>}
                  {form.checkIn && !errors.checkIn && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid check-in date
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Check-out Date *</label>
                  <input
                    type="date"
                    value={form.checkOut}
                    onChange={(e) => {
                      set("checkOut", e.target.value);
                      validateField("checkOut", e.target.value);
                    }}
                    onBlur={(e) => validateField("checkOut", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.checkOut ? "border-red-500 bg-red-50" : 
                      form.checkOut && !errors.checkOut ? "border-green-500 bg-green-50" : 
                      "border-gray-300"
                    }`}
                    min={form.checkIn || new Date().toISOString().split('T')[0]}
                  />
                  {errors.checkOut && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.checkOut}
                  </p>}
                  {form.checkOut && !errors.checkOut && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✅</span> Valid check-out date
                    </p>
                  )}
                </div>
              </div>
              {form.checkIn && form.checkOut && !errors.checkIn && !errors.checkOut && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Stay Duration:</span> {
                      Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24))
                    } night{Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Package Selection Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Package Selection
              </h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Package *</label>
                {packagesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: accent }}></div>
                    <span className="ml-2 text-gray-500">Loading packages...</span>
                  </div>
                ) : (
                  <select
                    value={form.packageId}
                    onChange={(e) => set("packageId", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.packageId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a package</option>
                    <option value="admin-reservation" style={{ fontWeight: 'bold', color: '#d3af37' }}>
                      🏨 Admin Reservation (Custom Package)
                    </option>
                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.roomId} - ${pkg.priceUSD} USD per night
                      </option>
                    ))}
                  </select>
                )}
                {errors.packageId && <p className="text-sm text-red-600">{errors.packageId}</p>}
                
                {form.packageId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    {form.packageId === "admin-reservation" ? (
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> 🏨 Admin Reservation (Custom Package) - 
                        This allows you to create a reservation with custom pricing and details.
                      </p>
                    ) : selectedPackage ? (
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> Room {selectedPackage.roomId} - 
                        Adults included: {selectedPackage.adultsIncluded} - 
                        Price: ${selectedPackage.priceUSD} USD per night
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Room Type Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Room Type
              </h4>
              <div className="space-y-2">
                <RoomTypeDropdownWithCRUD
                  selectedRoomType={form.roomType}
                  onSelectRoomType={(roomType) => {
                    set("roomType", roomType);
                    validateField("roomType", roomType);
                  }}
                  error={errors.roomType}
                  placeholder="-- Select Room Type --"
                  className="w-full"
                />
                {errors.roomType && <p className="text-sm text-red-600">{errors.roomType}</p>}
              </div>
            </div>

            {/* Custom Package Details Section - Only show for Admin Reservation */}
            {form.packageId === "admin-reservation" && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Custom Package Details
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Room ID *</label>
                    {roomIdsLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: accent }}></div>
                        <span className="ml-2 text-gray-500 text-sm">Loading rooms...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Search input for room IDs */}
                        <input
                          type="text"
                          value={roomSearchTerm}
                          onChange={(e) => setRoomSearchTerm(e.target.value)}
                          placeholder="Search room IDs..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                          maxLength={50}
                        />
                        
                        {/* Room ID dropdown */}
                        <select
                          value={form.customRoomId}
                          onChange={(e) => handleRoomIdChange(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                            errors.customRoomId ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a room ID</option>
                          {filteredRoomIds.map((roomId) => (
                            <option key={roomId} value={roomId}>
                              {roomId}
                            </option>
                          ))}
                        </select>
                        
                        {/* Show count of filtered results */}
                        {roomSearchTerm && (
                          <p className="text-xs text-gray-500">
                            Showing {filteredRoomIds.length} of {roomIds.length} rooms
                          </p>
                        )}
                      </div>
                    )}
                    {errors.customRoomId && <p className="text-sm text-red-600">{errors.customRoomId}</p>}
                    {roomIds.length === 0 && !roomIdsLoading && (
                      <p className="text-sm text-gray-500">No active rooms available</p>
                    )}
                    {filteredRoomIds.length === 0 && roomIds.length > 0 && !roomIdsLoading && (
                      <p className="text-sm text-gray-500">No rooms match your search</p>
                    )}
                    
                    {/* Room Details Display */}
                    {selectedRoomDetails && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="text-sm font-medium text-green-800 mb-2">Room Details:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                          <div>
                            <span className="font-medium">Type:</span> {selectedRoomDetails.roomType || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Bed:</span> {selectedRoomDetails.bedLabel || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {selectedRoomDetails.sizeSqm || 'N/A'} sqm
                          </div>
                          <div>
                            <span className="font-medium">Capacity:</span> {selectedRoomDetails.capacityAdults || 'N/A'} adults
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Available:</span> {selectedRoomDetails.availableCount || 0} rooms
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price per Night *</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="0.01"
                      value={form.customPricePerNight}
                      onChange={(e) => {
                        set("customPricePerNight", Number(e.target.value));
                        validateField("customPricePerNight", Number(e.target.value));
                      }}
                      onBlur={(e) => validateField("customPricePerNight", Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.customPricePerNight ? "border-red-500 bg-red-50" : 
                        form.customPricePerNight && !errors.customPricePerNight ? "border-green-500 bg-green-50" : 
                        "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.customPricePerNight && <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.customPricePerNight}
                    </p>}
                    {form.customPricePerNight && !errors.customPricePerNight && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span>✅</span> Valid price
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Adults Included</label>
                    <input
                      type="number"
                      min="1"
                      value={form.customAdultsIncluded}
                      onChange={(e) => set("customAdultsIncluded", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This creates a custom reservation with the specified room and pricing. 
                    The system will calculate the total amount based on the number of nights and rooms.
                    <br />
                    <strong>Room Selection:</strong> Use the search box to filter room IDs, then select from the dropdown. 
                    Room details will be displayed automatically when selected.
                  </p>
                </div>
              </div>
            )}


            {/* Room & Guest Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Room & Guest Details
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Rooms Wanted *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.roomsWanted}
                    onChange={(e) => set("roomsWanted", Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.roomsWanted ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.roomsWanted && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.roomsWanted}
                  </p>}
                  <p className="text-xs text-gray-500">Maximum 10 rooms per reservation</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Adults *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.adults}
                    onChange={(e) => set("adults", Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.adults ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.adults && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.adults}
                  </p>}
                  <p className="text-xs text-gray-500">Maximum 20 adults per reservation</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={form.children}
                    onChange={(e) => set("children", Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.children ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.children && <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.children}
                  </p>}
                  <p className="text-xs text-gray-500">Maximum 20 children per reservation</p>
                </div>
              </div>
            </div>

            {/* Additional Options Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Options</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.travellingWithPet}
                    onChange={(e) => set("travellingWithPet", e.target.checked)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Travelling with pet</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.safariRequested}
                    onChange={(e) => set("safariRequested", e.target.checked)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Safari experience requested</span>
                </label>
              </div>
            </div>

            {/* Arrival Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Arrival Information
              </h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Expected Arrival Window</label>
                <select
                  value={form.arrivalWindow}
                  onChange={(e) => set("arrivalWindow", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="unknown">Unknown</option>
                  <option value="morning">Morning (6:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
                  <option value="evening">Evening (6:00 PM - 12:00 AM)</option>
                  <option value="late-night">Late Night (12:00 AM - 6:00 AM)</option>
                </select>
                <p className="text-xs text-gray-500">Select the expected arrival time window for the guest</p>
              </div>
            </div>

            {/* Reservation Status Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Reservation Status & Payment
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reservation Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="booked">Booked</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => set("paymentStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Currency & Amount Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Currency & Amount
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalAmount}
                    onChange={(e) => set("totalAmount", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Enter the total amount for this reservation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent }}
            >
              {loading || isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                'Create Reservation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
