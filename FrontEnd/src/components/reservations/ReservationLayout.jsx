// src/components/reservations/ReservationLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ReservationStepper from "./ReservationStepper.jsx";
import AuthHeader from "../../components/AuthHeader.jsx";
/**
 * ReservationLayout
 * Wrap reservation steps in a consistent centered container.
 * Props:
 *  - children: page content (form / room cards / summary / payment)
 *  - containerClass: allows overriding container width (defaults to max-w-7xl)
 */

export default function ReservationLayout({ children, containerClass }) {
  const location = useLocation();
  
  // Dynamic container width based on route
  const getContainerClass = () => {
    if (containerClass) return containerClass; // Allow manual override
    
    // Enhanced width for room selection page
    if (location.pathname.includes('/reserve/rooms')) {
      return "max-w-[90rem]"; // Even wider for room selection (1440px)
    }
    
    // Default width for other pages
    return "max-w-7xl";
  };
  return (
    <div className="relative min-h-screen flex flex-col">
      <AuthHeader />
      
      {/* Modern background with gradient - now fills full height */}
      <div className="flex-1 pt-16 relative z-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className={`${getContainerClass()} px-4 sm:px-6 lg:px-8 py-8 mx-auto h-full flex flex-col`}>
          {/* Modern stepper with better spacing */}
          <div className="mb-8">
            <ReservationStepper />
          </div>
          
          {/* Content area with modern card styling - now expands to fill remaining space */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
