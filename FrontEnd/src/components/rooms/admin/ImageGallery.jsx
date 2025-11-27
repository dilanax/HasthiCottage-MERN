import React, { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageGallery = ({ images = [], title = "Room Images", maxDisplay = 6 }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle image loading states
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  }, [goToPrevious, goToNext]);

  // Download image
  const downloadImage = useCallback(async (imageUrl, index) => {
    try {
      // Handle different URL formats
      const url = imageUrl?.url || imageUrl;
      if (!url) {
        console.error('No image URL provided');
        return;
      }

      // For Azure blob URLs, try direct download first
      if (url.includes('blob.core.windows.net') || url.includes('azure')) {
        // Create a temporary link for direct download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}_image_${index + 1}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
        return;
      }

      // For other URLs, use fetch with proper error handling
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}_image_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Download failed. Opening image in new tab...');
      // Fallback: open image in new tab
      const url = imageUrl?.url || imageUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  }, [title]);

  // Get display images (limited by maxDisplay)
  const displayImages = images.slice(0, maxDisplay);
  const hasMoreImages = images.length > maxDisplay;

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{images.length} image{images.length !== 1 ? 's' : ''}</span>
          {hasMoreImages && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              +{images.length - maxDisplay} more
            </span>
          )}
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          )}
          
          <img
            src={displayImages[selectedIndex]?.url || displayImages[selectedIndex]}
            alt={`${title} ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="View fullscreen"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => downloadImage(displayImages[selectedIndex]?.url || displayImages[selectedIndex], selectedIndex)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Download image"
            >
              <Download size={16} />
            </button>
          </div>

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-sm rounded">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedIndex === index
                  ? 'border-yellow-500 ring-2 ring-yellow-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image?.url || image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Close fullscreen"
            >
              <X size={24} />
            </button>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <div className="max-w-7xl max-h-full">
              <img
                src={displayImages[selectedIndex]?.url || displayImages[selectedIndex]}
                alt={`${title} ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">
                {selectedIndex + 1} of {displayImages.length}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => downloadImage(displayImages[selectedIndex]?.url || displayImages[selectedIndex], selectedIndex)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Download image"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
