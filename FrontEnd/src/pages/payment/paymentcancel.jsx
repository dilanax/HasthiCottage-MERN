import React from "react";
import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-hasthi-bg">
      <div className="max-w-md p-8 text-center bg-white shadow-lg rounded-xl">
        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-hasthi-text">
          Payment Cancelled
        </h1>
        <p className="mb-6 text-gray-600">
          Your payment was not completed. If this was a mistake, you can try
          again.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/guest/bookings"
            className="px-5 py-2 font-semibold rounded bg-hasthi-yellow text-hasthi-text hover:brightness-95"
          >
            Go to Bookings
          </Link>
          <Link
            to="/guest"
            className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
