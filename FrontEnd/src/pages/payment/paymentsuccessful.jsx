// src/pages/SuccessPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReservation } from "../../components/reservations/reservationContext.js";

export default function SuccessPage() {
  const { reset } = useReservation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset reservation context and redirect to home
    reset();
    navigate("/");
  }, [reset, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0] px-4">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d3af37] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-[#0a0a0a]">
          Redirecting...
        </h1>
        <p className="mt-2 text-gray-600">
          Please wait while we redirect you to the home page.
        </p>
      </div>
    </div>
  );
}
