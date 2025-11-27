import React, { useEffect, useRef } from "react";
import { X, CheckCircle, Home, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReservation } from "../reservations/reservationContext.js";
import Swal from "sweetalert2";

export default function PaymentSuccessModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { reset } = useReservation();
  const hasReset = useRef(false);

  useEffect(() => {
    if (isOpen && !hasReset.current) {
      // Show SweetAlert success message
      Swal.fire({
        title: "Payment Successful!",
        text: "Your reservation has been confirmed. Thank you for choosing Hasthi Safari & Stay!",
        icon: "success",
        confirmButtonText: "Continue",
        confirmButtonColor: "#d3af37",
        timer: 5000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInUp'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown'
        }
      });

      // Reset reservation context after successful payment (only once)
      reset();
      hasReset.current = true;
    }
  }, [isOpen, reset]);

  // Reset the flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasReset.current = false;
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    navigate("/");
  };

  const handleNewReservation = () => {
    onClose();
    navigate("/reserve");
  };

  const handleViewBookings = () => {
    onClose();
    navigate("/guest/bookings");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            Your reservation has been confirmed. We look forward to hosting you at Hasthi Safari & Stay!
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNewReservation}
              className="w-full flex items-center justify-center gap-2 bg-[#d3af37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b8941f] transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Make New Reservation
            </button>

            <button
              onClick={handleViewBookings}
              className="w-full flex items-center justify-center gap-2 border border-[#d3af37] text-[#d3af37] px-6 py-3 rounded-lg font-medium hover:bg-[#d3af37]/10 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              View My Reservations
            </button>

            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
