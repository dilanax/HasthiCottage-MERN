// src/components/guest/BookingList.jsx
import React, { useState } from 'react';
import BookingCard from './BookingCard';
import BookingDetails from './BookingDetails';
import toast from 'react-hot-toast';

/**
 * Returns a stable unique key for a booking item.
 * Prefer database id (_id), then reservationNumber, then id, then fallback to index.
 */
function getKey(booking, index) {
  if (!booking) return `booking-${index}`;
  return booking._id ?? booking.reservationNumber ?? booking.id ?? `booking-${index}`;
}

export default function BookingList({ bookings = [], onOpenReservation, onChange }) {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (b) => {
    setSelected(b);
    setOpen(true);
    onOpenReservation?.(b);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleUpdated = (updated) => {
    // inform parent (if needed) so they can refresh list
    onChange?.(updated);
    // update local selected state
    setSelected(updated);
    toast.success('Reservation updated in list');
  };

  const handleDeleted = (deletedId) => {
    // inform parent to refresh the list
    onChange?.();
    toast.success('Reservation cancelled');
  };

  if (!bookings || bookings.length === 0) {
    return <div className="p-6 text-center bg-white rounded-lg shadow">No bookings yet</div>;
  }

  return (
    <>
      <div className="space-y-3">
        {bookings.map((b, i) => (
          // key must be placed on the BookingCard element returned by map
          <BookingCard
            key={getKey(b, i)}
            booking={b}
            onUpdate={handleUpdated}
            onDelete={handleDeleted}
          />
        ))}
      </div>

      <BookingDetails
        booking={selected}
        open={open}
        onClose={handleClose}
        onUpdated={handleUpdated}
      />
    </>
  );
}
