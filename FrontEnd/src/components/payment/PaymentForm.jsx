import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!pk) throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is missing");
const stripePromise = loadStripe(pk);

// --- Checkout Form ---
function CheckoutForm({ reservationData, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: "http://localhost:5173/success",
        payment_method_data: {
          billing_details: {
            email: reservationData.userEmail,
          },
        },
      },
    });

    if (error) {
      toast.error(error.message || "Payment failed. Try again.");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Handle successful payment
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        
        console.log("Payment successful! Processing reservation...", {
          needsReservationCreation: reservationData.needsReservationCreation,
          hasReservationDetails: !!reservationData.reservationDetails,
          reservationDetails: reservationData.reservationDetails,
          reservationNumber: reservationData.reservationNumber
        });
        
        if (reservationData.needsReservationCreation && reservationData.reservationDetails) {
          console.log("Creating new reservation after payment...");
          // Create new reservation after successful payment
          const createResponse = await axios.post(
            `${base}/api/reservations/reserve`,
            {
              ...reservationData.reservationDetails,
              paymentIntentId: paymentIntent.id,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          console.log("Reservation creation response:", createResponse.data);
          
          const { reservation: newReservation } = createResponse.data || {};
          if (newReservation?.reservationNumber) {
            // Update the reservation with payment intent ID
            await axios.put(
              `${base}/api/reservations/complete/${newReservation.reservationNumber}`,
              {
                paymentIntentId: paymentIntent.id,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            toast.success("✅ Payment successful! Reservation created.");
          } else {
            throw new Error("Failed to create reservation after payment");
          }
        } else if (!reservationData.needsReservationCreation && reservationData.reservationNumber && reservationData.reservationNumber !== "NEW") {
          console.log("Updating existing reservation after payment...");
          // Update existing reservation status
          await axios.put(
            `${base}/api/reservations/complete/${reservationData.reservationNumber}`,
            {
              paymentIntentId: paymentIntent.id,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          toast.success("✅ Payment successful!");
        } else {
          console.error("No valid reservation path found:", {
            needsReservationCreation: reservationData.needsReservationCreation,
            reservationNumber: reservationData.reservationNumber,
            hasReservationDetails: !!reservationData.reservationDetails
          });
          throw new Error("Cannot process reservation after payment - missing required data");
        }
        
        // Call the success callback instead of navigating
        if (onPaymentSuccess) {
          onPaymentSuccess();
        } else {
          setTimeout(() => navigate("/success"), 1500);
        }
      } catch (err) {
        toast.error("Payment succeeded but reservation processing failed. Contact support.");
        console.error("Reservation processing failed:", err);
      }
    } else {
      toast("Payment in progress. Please complete authentication.", {
        icon: "⏳",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <PaymentElement />
      </div>
      
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          background: 'linear-gradient(135deg, #d3af37 0%, #f4d03f 100%)',
          color: '#0a0a0a'
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Complete Payment</span>
          </>
        )}
      </button>
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        </div>
        <span>Protected by 256-bit SSL encryption</span>
      </div>
    </div>
  );
}

// --- Parent wrapper ---
export default function PaymentForm({ reservationData, onPaymentSuccess }) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const requestInProgressRef = useRef(false);

  useEffect(() => {
    let active = true;
    
    // Prevent multiple simultaneous requests for the same data
    if (requestInProgressRef.current) {
      return;
    }
    
    requestInProgressRef.current = true;
    (async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const { data } = await axios.post(
          `${base}/api/payment/create-payment-intent`,
          reservationData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (active) {
          setClientSecret(data.clientSecret);
          setLoading(false);
        }
      } catch (err) {
        console.error("PI init failed:", err?.response?.data || err);
        if (active) {
          toast.error(err?.response?.data?.message || "Failed to initialize payment");
          setLoading(false);
        }
      } finally {
        requestInProgressRef.current = false;
      }
    })();
    return () => {
      active = false;
      requestInProgressRef.current = false;
    };
  }, [reservationData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">Loading secure payment form...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your checkout</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 border border-red-200 rounded-xl bg-red-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Payment Error</h3>
            <p className="text-sm text-red-700">Could not load payment form. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#d3af37",
            colorBackground: "#ffffff",
            colorText: "#0a0a0a",
            colorDanger: "#df1b41",
            fontFamily: "Inter, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
      key={clientSecret}
    >
      <CheckoutForm reservationData={reservationData} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}