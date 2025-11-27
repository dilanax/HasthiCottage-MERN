// src/pages/reservations/Summary.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Users, CalendarDays, ShieldCheck, Info } from "lucide-react";
import { useReservation } from "../../components/reservations/reservationContext.js";
import axios from "axios";
import { toast } from "react-hot-toast";

const C_BG = "#f0f0f0";
const C_TEXT = "#0a0a0a";
const C_ACCENT = "#d3af37";

// 🔸 Default currency now USD
const currencyFmt = (num, c = "USD") =>
  `${c} ${Intl.NumberFormat().format(Math.max(0, Number(num || 0)))}`;

// 24-hex check
const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// Label helpers
const humanizeKey = (s = "") => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function Summary() {
  const navigate = useNavigate();
  const { reservation, update } = useReservation();
  const [arrival, setArrival] = useState("unknown");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  useEffect(() => {
    if (!reservation?.packageId || !reservation?.checkIn || !reservation?.checkOut) {
      navigate("/reserve/start");
    } else if (!isValidObjectId(reservation.packageId)) {
      toast.error("Invalid package selected. Please choose a valid room package.");
      navigate("/reserve/rooms");
    }
  }, [reservation, navigate]);

  if (!reservation?.packageId || !reservation?.checkIn || !reservation?.checkOut) return null;

  const {
    checkIn,
    checkOut,
    roomsWanted,
    adults,
    children = 0,
    travellingWithPet = false,
    selectedPackage = {},
    guest = {},
    packageId,
  } = reservation;

  // 🔸 Force currency to USD for all calculations and display
  const currency = "USD";

  const nights = useMemo(() => {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [checkIn, checkOut]);

  const pricePerNight =
    Number(selectedPackage.nightlyPrice) ||
    Number(selectedPackage.pricePerNight) ||
    0;

  const subtotal = useMemo(
    () => pricePerNight * nights * (roomsWanted || 1),
    [pricePerNight, nights, roomsWanted]
  );
  const taxes = Math.round(subtotal * 0.01);
  const total = subtotal + taxes;

  // Normalize perks to an array for rendering
  const perkList = (() => {
    const p = selectedPackage?.perks;
    if (Array.isArray(p)) return p;
    if (p && typeof p === "object") {
      return Object.entries(p)
        .filter(([, v]) => !!v)
        .map(([k]) => humanizeKey(k));
    }
    if (typeof p === "string" && p.trim()) {
      return p.split(/[;|,]\s*/).filter(Boolean);
    }
    return [
      "Free cancellation anytime",
      "No prepayment needed – pay at property",
      "No credit card needed",
    ];
  })();

  const goToPayment = async () => {
    if (!isValidObjectId(packageId)) {
      toast.error("Invalid package ID. Please select a valid room package.");
      navigate("/reserve/rooms");
      return;
    }

    // Check for pending payments first before proceeding to payment
    try {
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      
      // Check for pending payments without creating reservation
      const checkResponse = await axios.get(
        `${base}/api/reservations/check-pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // If we get here, no pending payments found - we can proceed

    } catch (err) {
      // Handle pending payment error specifically
      if (err?.response?.status === 409 && err?.response?.data?.pendingReservation) {
        const pendingRes = err.response.data.pendingReservation;
        toast.error(err.response.data.error);
        
        // Redirect to payment page with pending reservation details
        navigate("/reserve/payment", {
          state: {
            reservationNumber: pendingRes.reservationNumber,
            totalAmount: pendingRes.totalAmount,
            currency: pendingRes.currency,
            isPendingPayment: true
          }
        });
        return;
      }
      
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Cannot proceed to payment. Please try again.";
      toast.error(msg);
      return;
    }

    // If we reach here, no pending payments found - proceed to payment page
    // WITHOUT creating reservation yet
    navigate("/reserve/payment", {
      state: {
        ...reservation,
        arrivalWindow: arrival,
        // NO reservationNumber - it will be created after successful payment
        pricing: { pricePerNight, nights, subtotal, taxes, total, currency },
        // Pass all the data needed to create reservation after payment
        reservationData: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          country: guest.country,
          countryCode: guest.countryCode,
          phoneNumber: guest.phoneNumber,
          packageId,
          checkIn,
          checkOut,
          roomsWanted,
          adults,
          children,
          travellingWithPet,
          safariRequested: false,
          arrivalWindow: arrival,
          currency,
        }
      },
    });

    toast.success("Ready for payment");
  };
  if (import.meta.env.DEV) {
    console.log({
      packageId, checkIn, checkOut, roomsWanted, adults,
      children, travellingWithPet, currency,
      guest
    });
  }

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="mb-4 text-2xl font-semibold md:text-3xl" style={{ color: C_TEXT }}>
        Booking overview
      </h1>

      <section className="flex-1 overflow-hidden bg-white border shadow rounded-2xl flex flex-col">
        <div className="p-5 border-b md:p-6" style={{ background: C_BG }}>
          <div className="mb-1 text-sm text-neutral-600">Your selection</div>
          <h2 className="text-xl font-semibold" style={{ color: C_TEXT }}>
            {selectedPackage.title || selectedPackage.name || "Selected room"}
          </h2>

          {/* perks list */}
          <ul className="mt-3 space-y-2 text-[15px]">
            {perkList.map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                <span>{txt}</span>
              </li>
            ))}
          </ul>

          <div className="grid gap-3 mt-4 text-sm sm:grid-cols-2 text-neutral-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {adults} adult{adults > 1 ? "s" : ""}
                {children ? ` · ${children} child${children > 1 ? "ren" : ""}` : ""}
                {roomsWanted ? ` · ${roomsWanted} room${roomsWanted > 1 ? "s" : ""}` : ""}
                {travellingWithPet ? " · Pet" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 md:p-6 grid md:grid-cols-[1fr_260px] gap-6">
          <div>
            <div className="mb-2 text-base font-semibold" style={{ color: C_TEXT }}>
              My expected arrival time
            </div>
            <div className="mb-3 text-sm text-neutral-600">
              You can check-in to the property at any time shown below.
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["unknown", "I don't know"],
                ["morning", "Morning (06:00–12:00)"],
                ["afternoon", "Afternoon (12:00–17:00)"],
                ["evening", "Evening (17:00–21:00)"],
                ["late", "Late night (after 21:00)"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setArrival(val)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${arrival === val ? "font-semibold" : ""}`}
                  style={{
                    background: arrival === val ? C_ACCENT : "white",
                    color: arrival === val ? C_TEXT : "#111",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-[#fafafa] p-4 self-start">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="w-4 h-4" /> You’re booking with free cancellation
            </div>
            <div className="text-sm text-neutral-600">Price (per night)</div>
            <div className="mb-2 text-xl font-semibold" style={{ color: C_TEXT }}>
              {currencyFmt(pricePerNight, currency)}
            </div>
            <hr className="my-2" />
            <div className="flex items-center justify-between text-sm">
              <span>
                {roomsWanted} room × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>{currencyFmt(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-sm">
              <span className="inline-flex items-center gap-1">
                Taxes & charges <Info className="w-3.5 h-3.5" />
              </span>
              <span>{currencyFmt(taxes, currency)}</span>
            </div>
            <div className="flex items-center justify-between mt-3 text-base font-semibold">
              <span>Total</span>
              <span>{currencyFmt(total, currency)}</span>
            </div>
            <button
              onClick={goToPayment}
              disabled={loading || isSubmitting}
              className="w-full px-5 py-3 mt-4 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: C_ACCENT, color: C_TEXT }}
            >
              {loading || isSubmitting ? "Processing..." : "Proceed to payment"}
            </button>
            <p className="mt-2 text-xs text-neutral-500">
              No prepayment needed — pay at the property (if applicable).
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 text-xs text-neutral-500">
        Booking for <span className="font-medium">{guest.firstName} {guest.lastName}</span> · {guest.email}
      </div>
    </div>
  );
}
