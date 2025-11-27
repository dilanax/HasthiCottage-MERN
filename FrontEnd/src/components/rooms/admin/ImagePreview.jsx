import React, { useState } from 'react';
import { X, ZoomIn, Download, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ImagePreview = ({ 
  src, 
  alt, 
  onRemove, 
  onReplace, 
  showActions = true, 
  className = "w-full h-24 object-cover rounded border",
  size = "small" // "small", "medium", "large"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleDownload = async () => {
    try {
      if (!src) {
        console.error('No image source provided');
        return;
      }

      // For Azure blob URLs, try direct download first
      if (src.includes('blob.core.windows.net') || src.includes('azure')) {
        const link = document.createElement('a');
        link.href = src;
        link.download = alt || 'image.jpg';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
        return;
      }

      // For other URLs, use fetch with proper error handling
      const response = await fetch(src, {
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
      link.download = alt || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Download failed. Opening image in new tab...');
      // Fallback: open image in new tab
      if (src) {
        window.open(src, '_blank');
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-20 h-16';
      case 'medium':
        return 'w-32 h-24';
      case 'large':
        return 'w-48 h-36';
      default:
        return 'w-full h-24';
    }
  };

  if (error) {
    return (
      <div className={`${getSizeClasses()} bg-gray-100 rounded border flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="w-6 h-6 mx-auto mb-1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-xs">Error</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group ${getSizeClasses()}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Hover Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFullscreen(true)}
                className="p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors"
                title="View fullscreen"
              >
                <ZoomIn size={14} />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors"
                title="Download"
              >
                <Download size={14} />
              </button>
              
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-1 right-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-7xl max-h-full p-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
            
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Download image"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
