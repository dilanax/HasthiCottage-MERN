// src/components/reservations/ReservationProvider.jsx
import React, { useCallback, useEffect, useState } from "react";
import { ReservationContext } from "./reservationContext.js";

const STORAGE_KEY = "reserve:state";

export function ReservationProvider({ children }) {
  const [reservation, setReservation] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            checkIn: "",
            checkOut: "",
            roomsWanted: 1,
            adults: 1,
            children: 0,
            travellingWithPet: false,
            packageId: null,
            selectedPackage: null,
            guest: null,
          };
    } catch {
      return {
        checkIn: "",
        checkOut: "",
        roomsWanted: 1,
        adults: 1,
        children: 0,
        travellingWithPet: false,
        packageId: null,
        selectedPackage: null,
        guest: null,
      };
    }
  });

  // persist reservation in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservation));
    } catch (e) {
      console.warn("Could not persist reservation", e);
    }
  }, [reservation]);

  const update = useCallback((patch) => setReservation((r) => ({ ...r, ...patch })), []);
  const reset = useCallback(() => {
    const empty = {
      checkIn: "",
      checkOut: "",
      roomsWanted: 1,
      adults: 1,
      children: 0,
      travellingWithPet: false,
      packageId: null,
      selectedPackage: null,
      guest: null,
    };
    setReservation(empty);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ReservationContext.Provider value={{ reservation, update, reset }}>
      {children}
    </ReservationContext.Provider>
  );
}

export default ReservationProvider;
