// src/components/reservations/reservationContext.js
import { createContext, useContext } from "react";

export const ReservationContext = createContext(null);

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservation must be used inside ReservationProvider");
  return ctx;
}
