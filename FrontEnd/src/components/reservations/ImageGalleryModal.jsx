import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ImageGalleryModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          toggleZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToNext = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevious = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Zoom button */}
      <button
        onClick={toggleZoom}
        className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      >
        {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </button>

      {/* Main image container */}
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
        <div className={`relative transition-all duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
          <img
            src={currentImage.url}
            alt={`Gallery image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={toggleZoom}
          />
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-sm rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-[#d3af37] ring-2 ring-[#d3af37]/50' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white/70 text-xs">
        <div>← → Navigate</div>
        <div>Space: Zoom</div>
        <div>Esc: Close</div>
      </div>
    </div>
  );
}
