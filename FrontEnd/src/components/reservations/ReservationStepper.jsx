// src/components/reservations/ReservationStepper.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, Users, PawPrint, CheckCircle2 } from "lucide-react";
import { useReservation } from "./reservationContext.js"; // <- hook file

export default function ReservationStepper() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { reservation } = useReservation();

  const steps = [
    { label: "Start", path: "/reserve/start", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Rooms", path: "/reserve/rooms", icon: <Users className="w-4 h-4" /> },
    { label: "Guest", path: "/reserve/guest", icon: <PawPrint className="w-4 h-4" /> },
    { label: "Summary", path: "/reserve/summary", icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "payment", path: "/reserve/payment", icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const isStepCompleted = (step) => {
    switch (step.path) {
      case "/reserve/start":
        return !!(reservation?.checkIn && reservation?.checkOut);
      case "/reserve/rooms":
        return !!reservation?.packageId;
      case "/reserve/guest":
        return !!reservation?.guest?.firstName;
      case "/reserve/summary":
        return !!(reservation?.checkIn && reservation?.checkOut && reservation?.guest);
      case "/reserve/payment":
        return !!(reservation?.checkIn && reservation?.checkOut && reservation?.guest);
      default:
        return false;
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-[#d3af37] transition-all duration-500 ease-out"
            style={{ 
              width: `${((steps.findIndex(s => s.path === pathname || (s.path === "/reserve/start" && pathname === "/reserve")) + 1) / steps.length) * 100}%` 
            }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            // Handle both /reserve and /reserve/start as active for Start step
            const active = step.path === "/reserve/start" 
              ? (pathname === "/reserve" || pathname === "/reserve/start")
              : pathname === step.path;
            const completed = isStepCompleted(step);
            const disabled = !completed && !active && step.path !== "/reserve/start";
            const currentStepIndex = steps.findIndex(s => s.path === pathname || (s.path === "/reserve/start" && pathname === "/reserve"));
            const isPastStep = index < currentStepIndex;
            
            // Only show as completed if the step is actually completed AND it's before the current step
            const shouldShowCompleted = completed && isPastStep;

            return (
              <div key={step.path} className="flex flex-col items-center">
                <button
                  onClick={() => !disabled && navigate(step.path)}
                  disabled={disabled}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    active 
                      ? "bg-[#d3af37] border-[#d3af37] text-white shadow-lg scale-110" 
                      : shouldShowCompleted
                      ? "bg-green-500 border-green-500 text-white shadow-md"
                      : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
                  } ${disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
                >
                  {shouldShowCompleted && !active ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6">{step.icon}</div>
                  )}
                </button>
                
                {/* Step label */}
                <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                  active ? "text-[#d3af37]" : shouldShowCompleted ? "text-green-600" : "text-gray-500"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
