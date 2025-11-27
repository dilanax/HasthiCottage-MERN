import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PaymentForm from "../../components/payment/PaymentForm";
import PaymentSuccessModal from "../../components/payment/PaymentSuccessModal";
import { toast, Toaster } from "react-hot-toast";
import { CalendarDays, Users, Hash, CreditCard } from "lucide-react";
import { useReservation } from "../../components/reservations/reservationContext.js";
import axios from "axios";

const C_TEXT = "#0a0a0a";
const C_ACCENT = "#d3af37";

export default function Payment() {
  const { state } = useLocation();
  const { reservation } = useReservation();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingReservationData, setPendingReservationData] = useState(null);
  const [loadingReservation, setLoadingReservation] = useState(false);

  // Build a fallback payload from reservation context
  const computedFromCtx =
    reservation?.packageId && reservation?.guest?.email
      ? (() => {
          const pricePerNight =
            reservation.selectedPackage?.pricePerNight ||
            reservation.selectedPackage?.nightlyPrice ||
            0;
          const a = new Date(reservation.checkIn);
          const b = new Date(reservation.checkOut);
          const nights = Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
          const subtotal = pricePerNight * nights * (reservation.roomsWanted || 1);
          const taxes = Math.round(subtotal * 0.01);
          const total = subtotal + taxes;
          return {
            pricing: {
              pricePerNight,
              nights,
              subtotal,
              taxes,
              total,
              currency: reservation.currency || "LKR",
            },
            guest: reservation.guest,
            packageId: reservation.packageId,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            adults: reservation.adults,
            children: reservation.children || 0,
            roomsWanted: reservation.roomsWanted || 1,
            travellingWithPet: reservation.travellingWithPet || false,
            arrivalWindow: "unknown",
          };
        })()
      : null;

  // Fetch pending reservation data if it's a pending payment case
  useEffect(() => {
    if (state?.isPendingPayment && state?.reservationNumber && !pendingReservationData) {
      const fetchPendingReservation = async () => {
        setLoadingReservation(true);
        try {
          const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
          const response = await axios.get(
            `${base}/api/reservations/${state.reservationNumber}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          const resData = response.data?.data;
          if (resData) {
            setPendingReservationData({
              ...resData,
              pricing: {
                total: resData.totalAmount,
                currency: resData.currency,
                // Calculate other pricing if needed
                subtotal: resData.totalAmount,
                taxes: 0,
              }
            });
          }
        } catch (error) {
          console.error("Failed to fetch pending reservation:", error);
          toast.error("Failed to load pending reservation details");
        } finally {
          setLoadingReservation(false);
        }
      };
      
      fetchPendingReservation();
    }
  }, [state?.isPendingPayment, state?.reservationNumber, pendingReservationData]);

  // Single source of truth for the page - use pending data if available
  const data = pendingReservationData || state || computedFromCtx;

  // Guard + redirect if we don't have required data
  useEffect(() => {
    const hasPaymentData = data?.pricing?.total || data?.totalAmount;
    const hasGuestData = data?.guest?.email || data?.guest?.firstName;
    const hasPackageData = data?.packageId;
    const hasReservationData = state?.reservationNumber || state?.reservationData;
    
    if (!loadingReservation && !hasPaymentData && !hasGuestData && !hasPackageData && !hasReservationData) {
      toast.error("Missing booking details or reservation number. Please start your reservation again.");
      navigate("/reserve/start");
    }
  }, [data, state, navigate, loadingReservation]);

  // Show loading state while fetching pending reservation
  if (loadingReservation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending reservation details...</p>
        </div>
      </div>
    );
  }

  // If redirecting, don't render the page
  const hasValidData = (data?.pricing?.total || data?.totalAmount) && 
                      (data?.guest?.email || data?.guest?.firstName);
                      
  if (!hasValidData) return null;

  // Extract reservationNumber reliably from state or data (may be null for new reservations)
  const actualReservationNumber = state?.reservationNumber || data?.reservationNumber;
  
  // If we have reservationData from Summary page, it means we need to create reservation after payment
  const needsReservationCreation = state?.reservationData && !actualReservationNumber;

  // Currency and amount for payment (Stripe uses minor units)
  const currency = (data?.pricing?.currency || data?.currency || "USD").toUpperCase();
  const totalAmount = data?.pricing?.total || data?.totalAmount || 0;
  const amountInMinorUnits = useMemo(() => Math.round(Number(totalAmount) * 100), [totalAmount]);

  // Data to send to payment form
  const reservationData = {
    amount: amountInMinorUnits,
    currency,
    reservationNumber: actualReservationNumber || "NEW", // Use "NEW" as placeholder for new reservations
    userEmail: data?.guest?.email,
    description: actualReservationNumber && actualReservationNumber !== "NEW" ? `New Room Reservation (${actualReservationNumber})` : "New Room Reservation",
    needsReservationCreation, // Flag to indicate if we need to create reservation after payment
    reservationDetails: state?.reservationData, // Pass the full reservation details for creation
    metadata: {
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      rooms: data.roomsWanted || 1,
      nights: data.pricing?.nights || 1,
      packageId: data.packageId,
      arrivalWindow: data.arrivalWindow || state?.reservationData?.arrivalWindow || "unknown",
      adults: data.adults || 1,
      children: data.children || 0,
      // Guest details
      guestFirstName: data?.guest?.firstName || state?.reservationData?.firstName,
      guestLastName: data?.guest?.lastName || state?.reservationData?.lastName,
      guestEmail: data?.guest?.email || state?.reservationData?.email,
      guestPhone: data?.guest?.phone || state?.reservationData?.phone,
      guestCountry: data?.guest?.country || state?.reservationData?.country,
      guestCountryCode: data?.guest?.countryCode || state?.reservationData?.countryCode,
      guestPhoneNumber: data?.guest?.phoneNumber || state?.reservationData?.phoneNumber,
      travellingWithPet: data?.travellingWithPet || state?.reservationData?.travellingWithPet || false,
    },
  };

  // Debug logging
  console.log("Payment.jsx - reservationData being passed to PaymentForm:", {
    needsReservationCreation,
    hasReservationDetails: !!state?.reservationData,
    reservationDetails: state?.reservationData,
    actualReservationNumber,
    reservationNumber: reservationData.reservationNumber,
    userEmail: reservationData.userEmail
  });

  // Friendly info toast
  useEffect(() => {
    const totalHuman = new Intl.NumberFormat().format(totalAmount || 0);
    if (state?.isPendingPayment) {
      toast.success(`Complete payment for pending reservation ${actualReservationNumber}: ${currency} ${totalHuman}`, { duration: 3000 });
    } else if (needsReservationCreation) {
      toast.success(`Complete payment to create your reservation: ${currency} ${totalHuman}`, { duration: 3000 });
    } else {
      toast.success(`Paying ${currency} ${totalHuman}`, { duration: 2000 });
    }
  }, [currency, totalAmount, state?.isPendingPayment, actualReservationNumber, needsReservationCreation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: C_ACCENT }}>
            <CreditCard className="w-8 h-8" style={{ color: C_TEXT }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: C_TEXT }}>
            Complete Payment
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Secure checkout powered by Stripe. Your payment information is encrypted and processed safely.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Payment form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: C_TEXT }}>
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">Enter your card information below</p>
              </div>
              <div className="p-6">
                <PaymentForm 
                  reservationData={reservationData} 
                  onPaymentSuccess={() => setShowSuccessModal(true)}
                />
              </div>
            </div>
          </div>

          {/* Right: Summary - Takes up 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: C_TEXT }}>
                    <Hash className="w-4 h-4" />
                    Booking Summary
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-white border font-medium text-gray-600">
                    {currency} Total
                  </span>
                </div>
              </div>
              <div className="p-6">

                <div className="space-y-4">
                  {/* Reservation Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Hash className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Reservation Number</div>
                        <div className="font-semibold text-gray-900">
                          {actualReservationNumber || "Will be assigned after payment"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Stay Duration</div>
                        <div className="font-semibold text-gray-900">
                          {data.checkIn} → {data.checkOut}
                        </div>
                        <div className="text-sm text-gray-600">
                          {data.pricing?.nights || 1} night{Number(data.pricing?.nights) > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Guests & Rooms</div>
                        <div className="font-semibold text-gray-900">
                          {data.adults} adult{data.adults > 1 ? "s" : ""}
                          {data.children ? `, ${data.children} child${data.children > 1 ? "ren" : ""}` : ""}
                        </div>
                        <div className="text-sm text-gray-600">
                          {data.roomsWanted} room{data.roomsWanted > 1 ? "s" : ""}
                          {data.travellingWithPet ? " • Pet allowed" : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price per night</span>
                        <span className="font-medium text-gray-900">
                          {currency} {new Intl.NumberFormat().format(data.pricing?.pricePerNight || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {data.pricing?.rooms || data.roomsWanted || 1} room × {data.pricing?.nights || 1} night{Number(data.pricing?.nights) > 1 ? "s" : ""}
                        </span>
                        <span className="font-medium text-gray-900">
                          {currency} {new Intl.NumberFormat().format(data.pricing?.subtotal || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & charges</span>
                        <span className="font-medium text-gray-900">
                          {currency} {new Intl.NumberFormat().format(data.pricing?.taxes || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold" style={{ color: C_ACCENT }}>
                          {currency} {new Intl.NumberFormat().format(totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-900">Receipt Information</div>
                        <div className="text-xs text-blue-700 mt-1">
                          Payment receipt will be sent to <span className="font-medium">{data?.guest?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      <PaymentSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </div>
  );
}