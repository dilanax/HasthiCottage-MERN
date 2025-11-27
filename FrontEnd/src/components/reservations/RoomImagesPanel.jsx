import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Grid3X3 } from "lucide-react";
import ImageGalleryModal from "./ImageGalleryModal";

export default function RoomImagesPanel({ title = "", images = [], onOpenGallery }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const big = images?.[currentImageIndex]?.url;

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const openGallery = (index = 0) => {
    console.log('Opening gallery with index:', index, 'Images:', images);
    if (images && images.length > 0) {
      setGalleryIndex(index);
      setIsGalleryOpen(true);
    } else {
      console.log('No images available or images array is empty');
    }
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  return (
    <aside className="border-r border-gray-200 bg-white">
      {/* Main image with modern styling */}
      <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100" style={{ aspectRatio: "4 / 3" }}>
        {big ? (
          <>
            <img 
              src={big} 
              alt={`${title} photo`} 
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 cursor-pointer" 
              loading="lazy"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Main image clicked, currentImageIndex:', currentImageIndex);
                openGallery(currentImageIndex);
              }}
            />
            
            {/* Image overlay with controls */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 group pointer-events-none">
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 pointer-events-auto"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 pointer-events-auto"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {/* Zoom button */}
              <button
                onClick={() => openGallery(currentImageIndex)}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 pointer-events-auto"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                <Grid3X3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium">No images available</p>
              <p className="text-xs text-gray-500 mt-1">Images will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern thumbnail grid */}
      <div className="p-6 bg-gray-50/50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => {
            const img = images?.[i + 1]?.url;
            const isActive = i + 1 === currentImageIndex;
            return (
              <button
                key={i}
                className={`relative w-full h-28 md:h-32 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  img ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                } ${
                  isActive 
                    ? 'border-[#d3af37] ring-2 ring-[#d3af37]/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (img) {
                    setCurrentImageIndex(i + 1);
                    openGallery(i + 1);
                  }
                }}
                aria-label={`View image ${i + 2}`}
              >
                {img ? (
                  <img 
                    src={img} 
                    alt="" 
                    className="object-cover w-full h-full transition-transform duration-200 hover:scale-110" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#d3af37]/10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#d3af37] rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
          
          {/* See more button with modern styling */}
          <button
            onClick={() => openGallery(0)}
            className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#d3af37] hover:bg-[#d3af37]/5 transition-all duration-200 group"
          >
            <Grid3X3 className="w-6 h-6 text-gray-400 group-hover:text-[#d3af37] mb-2" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-[#d3af37]">See all</span>
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={closeGallery}
        images={images}
        initialIndex={galleryIndex}
      />
    </aside>
  );
}
