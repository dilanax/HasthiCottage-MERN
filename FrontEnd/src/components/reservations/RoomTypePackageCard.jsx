import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Users, Check, X, CreditCard, Utensils, Gift, Info, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Calendar, Clock, Tag, MapPin, Star, Coffee, Moon, Sun, Shield, Wifi, Car, Key
} from "lucide-react";
import RoomTopDetails from "./RoomTopDetails.jsx";
import RoomImagesPanel from "./RoomImagesPanel.jsx";

export default function RoomTypePackageCard({
  roomType,
  packages = [],
  onPackageSelect,
  selectedPackageId = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeDirection, setChangeDirection] = useState('next');
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const panelRef = useRef(null);
  const containerRef = useRef(null);

  // Sync selection from outside
  useEffect(() => {
    if (!selectedPackageId) return;
    const idx = packages.findIndex((p) => p._id === selectedPackageId);
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [selectedPackageId, packages, currentIndex]);

  const current = packages[currentIndex] || packages[0];
  if (!current || !current.roomDetails) return null;

  const hasPrev = packages.length > 1 && currentIndex > 0;
  const hasNext = packages.length > 1 && currentIndex < packages.length - 1;

  const goPrev = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!hasPrev || isAnimating) return;
    
    setChangeDirection('prev');
    setIsAnimating(true);
    setCurrentIndex((i) => Math.max(0, i - 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [hasPrev, isAnimating]);

  const goNext = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!hasNext || isAnimating) return;
    
    setChangeDirection('next');
    setIsAnimating(true);
    setCurrentIndex((i) => Math.min(packages.length - 1, i + 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [hasNext, packages.length, isAnimating]);

  // Improved keyboard navigation with focus management
  useEffect(() => {
    const onKey = (e) => {
      // Only handle arrow keys if the container is focused or if no input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
      );
      
      if (isInputFocused) return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Improved touch gestures with better detection
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    
    if (startX == null || startY == null || isAnimating) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goPrev();
      } else {
        goNext();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [goPrev, goNext, isAnimating]);

  const title = useMemo(
    () => roomType.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    [roomType]
  );

  const fmt = (n = 0) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const room = current.roomDetails;

  return (
    <>
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .slide-in-right {
          animation: slideInFromRight 0.4s ease-out;
        }
        .slide-in-left {
          animation: slideInFromLeft 0.4s ease-out;
        }
        .fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
        .bounce-in {
          animation: bounceIn 0.6s ease-out;
        }
      `}</style>
      
      <section 
        ref={containerRef}
        className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl focus-within:ring-2 focus-within:ring-[#d3af37] focus-within:ring-offset-2"
        tabIndex={0}
        role="region"
        aria-label={`${title} room packages`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
      {/* Top: full room details */}
      <RoomTopDetails roomTypeSlug={roomType} room={room} />

      {/* Body: images + packages */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[420px,1fr]">
        <RoomImagesPanel
          title={title}
          images={room.imageGallery || []}
          onOpenGallery={() => alert("Open gallery modal here")}
        />

        {/* Package panel */}
        <main
          ref={panelRef}
          className={`relative bg-white px-8 py-8 text-[#0a0a0a] transition-all duration-500 ${
            isAnimating ? 'opacity-70 scale-98' : 'opacity-100 scale-100'
          }`}
          role="region"
          aria-label={`${title} package ${currentIndex + 1} of ${packages.length}`}
        >
          {/* Navigation arrows - positioned outside content area */}
          {packages.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-10">
              <button
                type="button"
                onClick={goPrev}
                disabled={!hasPrev || isAnimating}
                aria-label="Previous package"
                className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto grid h-12 w-12 place-items-center rounded-full shadow-lg border-2 transition-all duration-300 ${
                  hasPrev && !isAnimating
                    ? "bg-white border-[#d3af37] text-[#d3af37] hover:bg-[#d3af37] hover:text-white hover:scale-110 hover:shadow-xl active:scale-95"
                    : "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext || isAnimating}
                aria-label="Next package"
                className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-auto grid h-12 w-12 place-items-center rounded-full shadow-lg border-2 transition-all duration-300 ${
                  hasNext && !isAnimating
                    ? "bg-white border-[#d3af37] text-[#d3af37] hover:bg-[#d3af37] hover:text-white hover:scale-110 hover:shadow-xl active:scale-95"
                    : "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Package counter */}
          {packages.length > 1 && (
            <div className="absolute right-6 top-6 z-20">
              <div className="rounded-full bg-black/70 text-white px-3 py-1 text-sm font-medium backdrop-blur-sm">
                {currentIndex + 1} / {packages.length}
              </div>
            </div>
          )}

          {/* Content with improved spacing for arrows */}
          <div className={`flex flex-col h-full gap-6 transition-all duration-500 ${
            isAnimating ? 'opacity-30 transform translate-y-2' : 'opacity-100 transform translate-y-0'
          } ${changeDirection === 'next' ? 'slide-in-right' : changeDirection === 'prev' ? 'slide-in-left' : ''}`}>
            {/* Package Header */}
            <div className="px-14">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#d3af37]" />
                <div>
                  <h3 className="text-xl font-semibold">
                    Price for {current.adultsIncluded || 2} adult{(current.adultsIncluded || 2) > 1 ? "s" : ""}
                  </h3>
                  {current.roomId && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-[#0a0a0a]/60" />
                      <span className="text-sm text-[#0a0a0a]/60">Room: {current.roomId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Package Details in Columns */}
            <div className="px-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column - Perks & Benefits */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#d3af37]" />
                    Perks & Benefits
                  </h4>
                  
                  <div className="space-y-3">
                    {current.perks?.freeCancellationAnytime && (
                      <div className="flex items-center gap-3 text-green-700">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Free cancellation anytime</span>
                      </div>
                    )}
                    {current.perks?.noPrepaymentNeeded && (
                      <div className="flex items-center gap-3 text-green-700">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">No prepayment needed</span>
                      </div>
                    )}
                    {current.perks?.noCreditCardNeeded && (
                      <div className="flex items-center gap-3 text-green-700">
                        <X className="w-4 h-4 flex-shrink-0" />
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">No credit card needed</span>
                      </div>
                    )}
                  </div>

                  {/* Standard Amenities */}
                  <div className="rounded-lg bg-gradient-to-r from-[#f0f0f0] to-[#f8f8f8] p-4 border border-gray-200">
                    <h5 className="text-sm font-semibold text-[#0a0a0a] mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#d3af37]" />
                      Standard Amenities
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#0a0a0a]/80">
                      <div className="flex items-center gap-2">
                        <Car className="w-3 h-3" />
                        <span>Parking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Late check-out</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        <span>Late check-in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="w-3 h-3" />
                        <span>High-speed internet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Meals & Pricing */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#d3af37]" />
                    Meals & Pricing
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Breakfast */}
                    <div className="flex items-center gap-3 text-[#0a0a0a]/80">
                      <Sun className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">
                        {current.meals?.breakfastIncluded ? "Breakfast included" : "Breakfast available (pay at property)"}
                      </span>
                    </div>
                    
                    {/* Lunch */}
                    {current.meals?.lunchPriceUSD > 0 && (
                      <div className="flex items-center gap-3 text-[#0a0a0a]/80">
                        <Coffee className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">Lunch: {fmt(current.meals.lunchPriceUSD)}</span>
                      </div>
                    )}
                    
                    {/* Dinner */}
                    {current.meals?.dinnerPriceUSD > 0 && (
                      <div className="flex items-center gap-3 text-[#0a0a0a]/80">
                        <Moon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">Dinner: {fmt(current.meals.dinnerPriceUSD)}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Promotional Ribbons */}
              {current.ribbons && current.ribbons.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-[#d3af37]" />
                    Special Offers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {current.ribbons.map((ribbon, index) => (
                      <span key={index} className="px-3 py-1 text-sm font-medium bg-[#d3af37] text-white rounded-full">
                        {ribbon}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Genius Benefits */}
              {(current.geniusDiscountPercent > 0 || current.geniusFreeBreakfast) && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-[#d3af37]" />
                    Genius Benefits
                  </h4>
                  <div className="rounded-lg bg-gradient-to-r from-[#d3af37]/10 to-[#b8941f]/10 p-4 border border-[#d3af37]/20">
                    <div className="space-y-2">
                      {current.geniusDiscountPercent > 0 && (
                        <div className="flex items-center gap-2 text-sm text-[#0a0a0a]">
                          <Gift className="w-4 h-4 text-[#d3af37]" />
                          <span className="font-medium">{current.geniusDiscountPercent}% discount</span>
                        </div>
                      )}
                      {current.geniusFreeBreakfast && (
                        <div className="flex items-center gap-2 text-sm text-[#0a0a0a]">
                          <Sun className="w-4 h-4 text-[#d3af37]" />
                          <span className="font-medium">Free breakfast</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#0a0a0a]/60 mt-2">Discounts apply before taxes and charges.</p>
                  </div>
                </div>
              )}

              {/* Package Validity */}
              {(current.startDate || current.endDate) && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[#d3af37]" />
                    Package Validity
                  </h4>
                  <div className="text-sm text-[#0a0a0a]/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Valid from: {current.startDate ? new Date(current.startDate).toLocaleDateString() : 'Now'} 
                        {current.endDate && ` to ${new Date(current.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-14 space-y-3">
              <p className="text-sm font-medium text-[#0a0a0a]/80">Price for 1 night</p>
              <div className="flex items-baseline gap-4">
                {current.wasPriceUSD > current.priceUSD ? (
                  <>
                    <span className="text-lg line-through text-[#0a0a0a]/60">{fmt(current.wasPriceUSD)}</span>
                    <span className="text-3xl font-bold text-[#0a0a0a]">{fmt(current.priceUSD)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#0a0a0a]">{fmt(current.priceUSD)}</span>
                )}
                <button 
                  type="button"
                  className="text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors"
                  aria-label="Price information"
                >
                  <Info className="h-5 w-5" />
                </button>
              </div>
              {current.taxesAndChargesUSD > 0 && (
                <p className="text-sm text-[#0a0a0a]/80">+ {fmt(current.taxesAndChargesUSD)} taxes &amp; charges</p>
              )}
            </div>

            {/* Package indicators */}
            {packages.length > 1 && (
              <div className="flex justify-center gap-2 px-14">
                {packages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to package ${i + 1}`}
                    disabled={isAnimating}
                    onClick={() => {
                      if (isAnimating) return;
                      
                      setChangeDirection(i > currentIndex ? 'next' : 'prev');
                      setIsAnimating(true);
                      setCurrentIndex(i);
                      setTimeout(() => setIsAnimating(false), 400);
                    }}
                    className={`h-2 w-8 rounded-full transition-all duration-200 ${
                      i === currentIndex 
                        ? "bg-[#d3af37] scale-110" 
                        : "bg-[#f0f0f0] hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="px-14 mt-auto">
              <button
                type="button"
                onClick={() => onPackageSelect(current)}
                disabled={room.availableCount < 1 || isAnimating}
                aria-label={`Select ${title} package`}
                className={`w-full rounded-lg border-2 px-6 py-4 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d3af37] focus:ring-offset-2 ${
                  room.availableCount > 0
                    ? (selectedPackageId === current._id
                        ? "border-[#d3af37] bg-[#d3af37] text-[#0a0a0a] shadow-lg"
                        : "border-[#d3af37] bg-[#d3af37] text-[#0a0a0a] hover:brightness-105 hover:shadow-md active:scale-98")
                    : "cursor-not-allowed border-gray-300 bg-gray-200 text-[#0a0a0a]/50"
                }`}
              >
                {selectedPackageId === current._id ? "✓ Selected" : room.availableCount > 0 ? "Select Package" : "Not Available"}
              </button>
              
              {/* Low availability warning */}
              {room.availableCount > 0 && room.availableCount <= 2 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-red-50 via-red-100 to-red-150 border-2 border-red-300 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-red-900">
                        Only {room.availableCount} left
                      </span>
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        </div>
      </section>
    </>
  );
}
