// src/pages/reservations/ReservationStart.jsx
import { useState, useMemo, useEffect } from "react";
import { Plus, Minus, PawPrint, CalendarDays, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReservation } from "../../components/reservations/reservationContext.js";


export default function ReservationStart() {


  const navigate = useNavigate();
  const { reservation, update } = useReservation();

  // initialize local form from context
  const [form, setForm] = useState(() => ({
    checkIn: reservation.checkIn || "",
    
    checkOut: reservation.checkOut || "",
    roomsWanted: reservation.roomsWanted ?? 1,
    adults: reservation.adults ?? 1,
    children: reservation.children ?? 0,
    travellingWithPet: reservation.travellingWithPet ?? false,
  }));

  // keep local -> context in sync on every change (instant persistence)
  useEffect(() => {
    update(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const inD = new Date(form.checkIn);
    const outD = new Date(form.checkOut);
    const diff = Math.round((outD - inD) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }, [form.checkIn, form.checkOut]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const inc = (key) => setForm((f) => ({ ...f, [key]: f[key] + 1 }));
  const dec = (key, min = 0) => setForm((f) => ({ ...f, [key]: Math.max(min, f[key] - 1) }));

  const validate = () => {
    const errors = [];

    // Basic required field validations
    if (!form.checkIn) {
      errors.push("Check-in date is required");
    }

    if (!form.checkOut) {
      errors.push("Check-out date is required");
    } else if (form.checkIn) {
      const checkInDate = new Date(form.checkIn);
      const checkOutDate = new Date(form.checkOut);
      
      if (checkOutDate <= checkInDate) {
        errors.push("Check-out date must be after check-in date");
      }
    }

    // Basic room and guest validations
    if (form.roomsWanted < 1) {
      errors.push("At least 1 room is required");
    }

    if (form.adults < 1) {
      errors.push("At least 1 adult is required");
    }

    if (form.children < 0) {
      errors.push("Children count cannot be negative");
    }

    return errors.length > 0 ? errors : null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors) {
      // Show first error message
      alert(errors[0]);
      return;
    }
    // context already updated in effect — just navigate
    navigate("/reserve/rooms");
  };

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="flex items-center gap-2 mb-6 text-2xl font-semibold md:text-3xl">
        <CalendarDays className="inline-block" />
        Start your reservation
      </h1>

      <form onSubmit={handleNext} className="flex-1 p-6 space-y-6 bg-white shadow rounded-2xl flex flex-col" style={{ color: "#0a0a0a" }}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Check-in</label>
              <input
                type="date"
                value={form.checkIn}
                min={todayStr}
                onChange={(e) => set("checkIn", e.target.value)}
                className="w-full px-3 py-2 border outline-none rounded-xl focus:ring-2"
                style={{ borderColor: "#e5e7eb", boxShadow: "none" }}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Check-out</label>
              <input
                type="date"
                value={form.checkOut}
                min={form.checkIn || todayStr}
                onChange={(e) => set("checkOut", e.target.value)}
                className="w-full px-3 py-2 border outline-none rounded-xl focus:ring-2"
                style={{ borderColor: "#e5e7eb", boxShadow: "none" }}
              />
            </div>
          </div>

          <p className="text-sm opacity-80">
            {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Select dates to see nights"}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Counter 
              label="Rooms" 
              value={form.roomsWanted} 
              onDec={() => dec("roomsWanted", 1)} 
              onInc={() => inc("roomsWanted")} 
              min={1}
            />
            <Counter 
              label="Adults" 
              icon={<Users className="w-4 h-4" />} 
              value={form.adults} 
              onDec={() => dec("adults", 1)} 
              onInc={() => inc("adults")} 
              min={1}
            />
            <Counter 
              label="Children" 
              value={form.children} 
              onDec={() => dec("children", 0)} 
              onInc={() => inc("children")} 
              min={0}
            />
          </div>


          <div className="flex items-center justify-between rounded-xl border p-4 bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5" />
              <span className="font-medium">Travelling with pets?</span>
            </div>
            <button
              type="button"
              onClick={() => set("travellingWithPet", !form.travellingWithPet)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition`}
              style={{ background: form.travellingWithPet ? "#d3af37" : "#e5e7eb" }}
              aria-pressed={form.travellingWithPet}
            >
              <span className="inline-block w-6 h-6 transition transform bg-white rounded-full" style={{ translate: form.travellingWithPet ? "28px" : "4px" }} />
            </button>
          </div>

          <div className="pt-2 mt-auto">
            <button type="submit" className="w-full px-5 py-3 font-medium md:w-auto rounded-xl" style={{ background: "#d3af37", color: "#0a0a0a" }}>
              Continue
            </button>
          </div>
        </form>
    </div>
  );
}

function Counter({ label, value, onInc, onDec, icon, min = 0 }) {
  const isAtMin = value <= min;
  
  return (
    <div className="rounded-xl border p-4 bg-[#fafafa]">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-medium">{icon} {label}</span>
      </div>
      <div className="flex items-center justify-between">
        <button 
          type="button" 
          onClick={onDec} 
          disabled={isAtMin}
          className={`p-2 border rounded-lg ${isAtMin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          aria-label={`decrease ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        <button 
          type="button" 
          onClick={onInc} 
          className="p-2 border rounded-lg hover:bg-gray-100"
          aria-label={`increase ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
