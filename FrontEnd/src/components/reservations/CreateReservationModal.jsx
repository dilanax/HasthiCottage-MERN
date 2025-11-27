import { useState } from "react";
import CreateReservationForm from "./CreateReservationForm";
import { CheckCircle, XCircle } from "lucide-react";

const C_ACCENT = "#d3af37";
const C_SUCCESS = "#10b981";

export default function CreateReservationModal({ isOpen, onClose, onSuccess }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  const handleFormSuccess = (reservation) => {
    setCreatedReservation(reservation);
    setShowSuccess(true);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedReservation(null);
      onClose();
      if (onSuccess) {
        onSuccess(reservation);
      }
    }, 3000);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setCreatedReservation(null);
    onClose();
  };

  if (!isOpen) return null;

  // Success overlay
  if (showSuccess && createdReservation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: C_SUCCESS }}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reservation Created Successfully!
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reservation Number:</strong> #{createdReservation.reservationNumber}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Guest:</strong> {createdReservation.guest?.firstName} {createdReservation.guest?.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Check-in:</strong> {new Date(createdReservation.checkIn).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Amount:</strong> {createdReservation.currency} {createdReservation.totalAmount?.toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              This dialog will close automatically in a few seconds...
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form modal
  return (
    <CreateReservationForm
      onClose={handleClose}
      onSuccess={handleFormSuccess}
      accent={C_ACCENT}
    />
  );
}
