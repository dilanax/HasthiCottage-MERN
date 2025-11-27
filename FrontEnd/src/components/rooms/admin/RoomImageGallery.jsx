import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import ImageGallery from './ImageGallery';

const RoomImageGallery = ({ room, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = room?.imageGallery?.map(i => i.url) || room?.imageUrl || [];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsFullscreen(false);
      onClose?.();
    }
  };

  if (!images.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Available</h3>
            <p className="text-gray-600 mb-4">This room doesn't have any images yet.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {room?.roomType?.replace(/-/g, ' ').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase())} Gallery
            </h2>
            <p className="text-sm text-gray-600">{images.length} image{images.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Gallery Content */}
        <div className="p-6">
          <ImageGallery
            images={images}
            title={`${room?.roomType || 'Room'} Images`}
            maxDisplay={8}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Use arrow keys to navigate • Click images to view fullscreen
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomImageGallery;
