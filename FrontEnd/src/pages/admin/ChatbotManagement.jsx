import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock, Star, Eye, Search, Save, X, Globe, Phone } from 'lucide-react';
import { chatbotApi } from '../../api/chatbotApi';

const ChatbotManagement = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    distance: '',
    duration: '',
    rating: 4.0,
    description: '',
    activities: [''],
    bestTime: '',
    contact: '',
    website: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    entryFee: {
      adult: 0,
      child: 0,
      foreigner: 0
    },
    facilities: [''],
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    category: 'wildlife',
    featured: false
  });

  const categories = [
    'all', 'wildlife', 'nature', 'culture', 'adventure', 'religious', 'dining', 'shopping'
  ];

  const placeTypes = [
    'Wildlife Safari', 'Conservation Center', 'Scenic Viewpoint', 'Bird Sanctuary',
    'Religious Site', 'Cultural Site', 'Adventure Activity', 'Restaurant', 'Shopping'
  ];

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await chatbotApi.getAllPlaces();
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await chatbotApi.deletePlace(placeId);
        fetchPlaces();
      } catch (error) {
        console.error('Error deleting place:', error);
        alert('Failed to delete place. Please try again.');
      }
    }
  };

  const toggleFeatured = async (placeId, currentFeatured) => {
    try {
      await chatbotApi.updatePlace(placeId, { featured: !currentFeatured });
      fetchPlaces();
    } catch (error) {
      console.error('Error updating place:', error);
      alert('Failed to update place. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      distance: '',
      duration: '',
      rating: 4.0,
      description: '',
      activities: [''],
      bestTime: '',
      contact: '',
      website: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      entryFee: {
        adult: 0,
        child: 0,
        foreigner: 0
      },
      facilities: [''],
      openingHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      },
      category: 'wildlife',
      featured: false
    });
    setEditingPlace(null);
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form: Original form data:', formData);
    
    // Validate required fields (website and contact are optional)
    const requiredFields = ['name', 'type', 'distance', 'duration', 'description', 'bestTime', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Clean up empty array items
    const cleanedData = {
      ...formData,
      activities: formData.activities.filter(item => item.trim() !== ''),
      facilities: formData.facilities.filter(item => item.trim() !== '')
    };

    console.log('Form: Cleaned data before submission:', cleanedData);

    try {
      console.log('Form: Starting submission...');
      
      if (editingPlace) {
        console.log('Form: Updating existing place:', editingPlace._id);
        await chatbotApi.updatePlace(editingPlace._id, cleanedData);
        alert('Place updated successfully!');
      } else {
        console.log('Form: Adding new place');
        await chatbotApi.addNewPlace(cleanedData);
        alert('Place added successfully!');
      }
      
      console.log('Form: Submission successful, refreshing places list');
      fetchPlaces();
      resetForm();
    } catch (error) {
      console.error('Form: Error saving place:', error);
      console.error('Form: Error response:', error.response);
      console.error('Form: Error details:', error.response?.data);
      
      let errorMessage = 'Failed to save place. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (place) => {
    setFormData({
      ...place,
      activities: place.activities.length > 0 ? place.activities : [''],
      facilities: place.facilities.length > 0 ? place.facilities : ['']
    });
    setEditingPlace(place);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chatbot Places Management</h1>
          <p className="text-gray-600">Manage nearby attractions and places for the chatbot</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Add New Place Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Place
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div key={place._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Place Image/Icon */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-white" />
              </div>

              {/* Place Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{place.name}</h3>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {place.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{place.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{place.description}</p>

                {/* Place Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{place.distance} away</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{place.duration} visit</span>
                  </div>
                </div>

                {/* Activities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {place.activities.slice(0, 3).map((activity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {activity}
                      </span>
                    ))}
                    {place.activities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{place.activities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(place)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit place"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlace(place._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFeatured(place._id, place.featured)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      place.featured
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {place.featured ? 'Featured' : 'Feature'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first place'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Place
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingPlace) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlace ? 'Edit Place' : 'Add New Place'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {placeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Distance *</label>
                      <input
                        type="text"
                        name="distance"
                        value={formData.distance}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 km"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 3-4 hours"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Featured Place</label>
                  </div>
                </div>

                {/* Contact & Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Best Time to Visit *</label>
                    <input
                      type="text"
                      name="bestTime"
                      value={formData.bestTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 6:00 AM - 6:00 PM"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number (Optional)</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="e.g., +94 47 492 0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g., www.udawalawe.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        name="coordinates.latitude"
                        value={formData.coordinates.latitude}
                        onChange={handleInputChange}
                        step="0.000001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        name="coordinates.longitude"
                        value={formData.coordinates.longitude}
                        onChange={handleInputChange}
                        step="0.000001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
                <div className="space-y-2">
                  {formData.activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleArrayChange('activities', index, e.target.value)}
                        placeholder="Enter activity"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('activities', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('activities')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                </div>
              </div>

              {/* Facilities */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Facilities</h3>
                <div className="space-y-2">
                  {formData.facilities.map((facility, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={facility}
                        onChange={(e) => handleArrayChange('facilities', index, e.target.value)}
                        placeholder="Enter facility"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('facilities', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('facilities')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Facility
                  </button>
                </div>
              </div>

              {/* Entry Fees */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entry Fees</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adult (LKR)</label>
                    <input
                      type="number"
                      name="entryFee.adult"
                      value={formData.entryFee.adult}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Child (LKR)</label>
                    <input
                      type="number"
                      name="entryFee.child"
                      value={formData.entryFee.child}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foreigner (LKR)</label>
                    <input
                      type="number"
                      name="entryFee.foreigner"
                      value={formData.entryFee.foreigner}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingPlace ? 'Update Place' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotManagement;