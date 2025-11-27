import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckSquare, Square, CheckCheck, X } from 'lucide-react';
import ImagePreview from './ImagePreview';

const ImageManagement = ({ 
  existingImages = [], 
  newFiles = [], 
  removedImageUrls = [], 
  onFileChange, 
  onRemoveExisting, 
  onRemoveNew, 
  enabled, 
  maxFiles = 8 
}) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectedNewFiles, setSelectedNewFiles] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleFileChange = (e) => {
    if (!enabled) return;
    const files = Array.from(e.target.files);
    const remainingSlots = maxFiles - (existingImages.length - removedImageUrls.length) - newFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    onFileChange(filesToAdd);
  };

  const totalImages = existingImages.length - removedImageUrls.length + newFiles.length;
  const canAddMore = totalImages < maxFiles;

  // Selection handlers
  const toggleImageSelection = (url) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(url)) {
      newSelection.delete(url);
    } else {
      newSelection.add(url);
    }
    setSelectedImages(newSelection);
  };

  const toggleNewFileSelection = (index) => {
    const newSelection = new Set(selectedNewFiles);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedNewFiles(newSelection);
  };

  const selectAllImages = () => {
    const allImageUrls = existingImages.map(img => img.url || img);
    setSelectedImages(new Set(allImageUrls));
  };

  const selectAllNewFiles = () => {
    setSelectedNewFiles(new Set(newFiles.map((_, index) => index)));
  };

  const clearAllSelections = () => {
    setSelectedImages(new Set());
    setSelectedNewFiles(new Set());
  };

  const bulkDeleteSelected = () => {
    const totalSelected = selectedImages.size + selectedNewFiles.size;
    
    if (totalSelected === 0) return;
    
    // Delete selected existing images
    selectedImages.forEach(url => {
      if (!removedImageUrls.includes(url)) {
        onRemoveExisting(url);
      }
    });
    
    // Delete selected new files (in reverse order to maintain indices)
    const sortedIndices = Array.from(selectedNewFiles).sort((a, b) => b - a);
    sortedIndices.forEach(index => {
      onRemoveNew(index);
    });
    
    clearAllSelections();
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      clearAllSelections();
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Image Management</span>
          </div>
          <div className="text-sm text-blue-700">
            {totalImages} / {maxFiles} images
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          {existingImages.length} existing, {newFiles.length} new, {removedImageUrls.length} marked for removal
        </p>
      </div>

      {/* Gallery Controls */}
      {existingImages.length > 0 && (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          isSelectionMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectionMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelectionMode 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isSelectionMode ? <X size={16} /> : <CheckSquare size={16} />}
              {isSelectionMode ? 'Exit Selection' : 'Select Images'}
            </button>
            
            {isSelectionMode && (
              <div className="text-xs text-blue-600 font-medium">
                Click checkboxes to select images
              </div>
            )}
            
            
            {isSelectionMode && (
              <>
                <button
                  type="button"
                  onClick={selectAllImages}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <CheckCheck size={14} />
                  Select All
                </button>
                <span className="text-xs text-gray-500">
                  {selectedImages.size + selectedNewFiles.size} selected
                </span>
              </>
            )}
          </div>
          
          {isSelectionMode && (selectedImages.size > 0 || selectedNewFiles.size > 0) && (
            <button
              type="button"
              onClick={bulkDeleteSelected}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedImages.size + selectedNewFiles.size})
            </button>
          )}
        </div>
      )}

      {/* Existing Images Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
          {existingImages.length > 0 && (
            <span className="text-xs text-gray-500">
              {existingImages.length - removedImageUrls.length} active, {removedImageUrls.length} marked for removal
            </span>
          )}
        </div>
        {existingImages.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No existing images</p>
          </div>
        ) : (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isSelectionMode ? 'bg-blue-50 p-4 rounded-lg border-2 border-blue-200' : ''}`}>
            {isSelectionMode && (
              <div className="col-span-full text-center text-sm text-blue-600 font-medium mb-2">
                🎯 Selection Mode Active - Click checkboxes to select images
              </div>
            )}
            {existingImages.map((img) => {
              const url = img.url || img;
              const isMarkedForRemoval = removedImageUrls.includes(url);
              const isSelected = selectedImages.has(url);
              return (
                <div 
                  key={url} 
                  className={`relative group ${isMarkedForRemoval ? 'opacity-50' : ''} ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleImageSelection(url);
                        }}
                        className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors shadow-lg ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-white border-gray-500 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                        title={isSelected ? 'Deselect image' : 'Select image'}
                        style={{ 
                          minWidth: '32px', 
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isSelected ? (
                          <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                            <span className="text-blue-500 font-bold text-lg">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded bg-white flex items-center justify-center">
                            <span className="text-gray-400 text-sm">☐</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                  
                  <div className="relative">
                  <ImagePreview
                    src={url}
                    alt="Existing image"
                    size="medium"
                    onRemove={() => onRemoveExisting(url)}
                      showActions={enabled && !isSelectionMode}
                    />
                    {/* Overlay to prevent ImagePreview actions when in selection mode */}
                    {isSelectionMode && (
                      <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }}></div>
                    )}
                  </div>
                  
                  {isMarkedForRemoval && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      To Remove
                    </div>
                  )}
                  
                  {isSelected && !isSelectionMode && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload New Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Add New Images</h4>
          {!canAddMore && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Maximum {maxFiles} images reached
            </span>
          )}
        </div>
        
        {canAddMore ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mb-4">
              PNG, JPG, GIF up to 10MB each ({maxFiles - totalImages} slots remaining)
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={!enabled}
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Choose Images
          </label>
        </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Maximum images reached</p>
            <p className="text-xs text-gray-400">
              Remove some images to add new ones
            </p>
          </div>
        )}
        
        {/* New Images Preview */}
        {newFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-700">
                New Images ({newFiles.length} pending upload)
              </h5>
              <div className="flex items-center gap-2">
                {isSelectionMode && (
                <button
                  type="button"
                  onClick={selectAllNewFiles}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                >
                    <CheckCheck size={14} />
                    Select All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    // Clear all new files
                    newFiles.forEach((_, index) => onRemoveNew(index));
                  }}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newFiles.map((f, i) => {
                const isSelected = selectedNewFiles.has(i);
                return (
                  <div 
                    key={i} 
                    className={`relative group ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleNewFileSelection(i);
                          }}
                          className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors shadow-lg ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'bg-white border-gray-500 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                          title={isSelected ? 'Deselect image' : 'Select image'}
                          style={{ 
                            minWidth: '32px', 
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected ? (
                            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                              <span className="text-blue-500 font-bold text-lg">✓</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-400 rounded bg-white flex items-center justify-center">
                              <span className="text-gray-400 text-sm">☐</span>
                            </div>
                          )}
                        </button>
                      </div>
                    )}
                    
                <ImagePreview
                  src={URL.createObjectURL(f)}
                  alt="New image"
                  size="medium"
                  onRemove={() => onRemoveNew(i)}
                      showActions={enabled && !isSelectionMode}
                    />
                    
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                    
                    {isSelected && !isSelectionMode && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManagement;
