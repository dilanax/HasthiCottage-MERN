// src/pages/artisanal/CreateArtisanal.jsx
import React, { useState } from 'react';
import axios from '../../../api/axios';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';

const CreateArtisanal = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Color variables following 60-30-10 rule
  const colors = {
    primary: '#f0f0f0',    // 60% - Background
    secondary: '#d3af37',  // 30% - Accent
    tertiary: '#0a0a0a'    // 10% - Text/Details
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files);
    
    // Check if adding new images would exceed the limit
    if (images.length + newImages.length > 4) {
      alert('Maximum 4 images allowed. Please remove some images first.');
      return;
    }
    
    newImages.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
        setImages(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToAzure = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `artisanal/${timestamp}-${randomString}.${fileExtension}`;
        
        // Create FormData for Azure upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        formData.append('containerName', 'hasthi-safari-cottage');
        
        // Upload to Azure via your backend API
        const response = await axios.post('/upload/azure', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.url) {
          uploadedUrls.push(response.data.url);
        } else {
          throw new Error('Upload failed: No URL returned');
        }
      } catch (error) {
        console.error('Error uploading image to Azure:', error);
        throw new Error(`Failed to upload image to Azure: ${error.message}`);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setUploadingImages(true);

    try {
      const imageUrls = await uploadImagesToAzure(images);
      console.log('Uploaded image URLs:', imageUrls); // Debug log
      setUploadingImages(false);
      setLoading(true);
      
      const response = await axios.post('/artisanal/create', {
        ...formData,
        images: imageUrls
      });
      
      console.log('Created artisanal item:', response.data); // Debug log
      alert('Artisanal item created successfully!');
      setFormData({ name: '', price: '', description: '', category: '' });
      setImages([]);
      setImagePreviews([]);
      
    } catch (error) {
      console.error('Error creating artisanal item:', error);
      alert(`Error creating artisanal item: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.primary }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-3"
            style={{ color: colors.tertiary }}
          >
            Create New Artisanal Item
          </h1>
          <p className="text-lg" style={{ color: colors.tertiary, opacity: 0.7 }}>
            Showcase your unique handmade creations
          </p>
        </div>

        {/* Form Card */}
        <div 
          className="rounded-2xl shadow-lg p-6 sm:p-8 border"
          style={{ 
            backgroundColor: 'white',
            borderColor: colors.secondary + '20'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h2 
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{ 
                  color: colors.tertiary,
                  borderColor: colors.secondary + '40'
                }}
              >
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.tertiary }}>
                    Item Name <span style={{ color: colors.secondary }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ 
                      borderColor: colors.secondary + '40',
                      backgroundColor: colors.primary,
                      color: colors.tertiary
                    }}
                    placeholder="Enter item name"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.tertiary }}>
                    Price ($) <span style={{ color: colors.secondary }}>*</span>
                  </label>
                  <div className="relative">
                    <span 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.secondary }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent"
                      style={{ 
                        borderColor: colors.secondary + '40',
                        backgroundColor: colors.primary,
                        color: colors.tertiary
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>


                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.tertiary }}>
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent"
                    style={{ 
                      borderColor: colors.secondary + '40',
                      backgroundColor: colors.primary,
                      color: colors.tertiary
                    }}
                    placeholder="e.g., Pottery, Jewelry, Woodwork"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.tertiary }}>
                Description <span style={{ color: colors.secondary }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent resize-none"
                style={{ 
                  borderColor: colors.secondary + '40',
                  backgroundColor: colors.primary,
                  color: colors.tertiary
                }}
                placeholder="Describe your item, materials used, dimensions, special features..."
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <h2 
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{ 
                  color: colors.tertiary,
                  borderColor: colors.secondary + '40'
                }}
              >
                Product Images
              </h2>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  dragActive ? 'bg-' + colors.secondary + '10' : ''
                }`}
                style={{ 
                  borderColor: dragActive ? colors.secondary : colors.secondary + '40',
                  backgroundColor: dragActive ? colors.secondary + '10' : 'transparent'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: colors.secondary + '20' }}
                  >
                    <Upload style={{ color: colors.secondary }} className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span 
                        className="font-medium hover:opacity-80 transition-opacity"
                        style={{ color: colors.secondary }}
                      >
                        Click to upload
                      </span>
                    </label>
                    <span style={{ color: colors.tertiary, opacity: 0.7 }}> or drag and drop</span>
                  </div>
                  
                  <p className="text-sm" style={{ color: colors.tertiary, opacity: 0.6 }}>
                    PNG, JPG, GIF up to 5MB (max 4 images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3" style={{ color: colors.tertiary }}>
                    Uploaded Images ({imagePreviews.length}/4)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          <X className="w-3 h-3" style={{ color: 'white' }} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add more button */}
                    {imagePreviews.length < 4 && (
                      <label
                        htmlFor="image-upload"
                        className="border-2 border-dashed rounded-lg h-24 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all"
                        style={{ borderColor: colors.secondary + '40' }}
                      >
                        <Plus style={{ color: colors.secondary }} className="w-6 h-6" />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full py-4 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                style={{ backgroundColor: colors.secondary, color: 'white' }}
              >
                {uploadingImages ? (
                  <span className="flex items-center justify-center">
                    <div 
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-2"
                      style={{ borderColor: 'white' }}
                    ></div>
                    Uploading Images...
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center">
                    <div 
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-2"
                      style={{ borderColor: 'white' }}
                    ></div>
                    Creating Item...
                  </span>
                ) : (
                  'Create Artisanal Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArtisanal;