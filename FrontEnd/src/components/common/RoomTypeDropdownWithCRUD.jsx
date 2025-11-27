import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Check, ChevronDown, Loader2, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const RoomTypeDropdownWithCRUD = ({ 
  selectedRoomType, 
  onSelectRoomType, 
  error, 
  placeholder = "-- Select Room Type --",
  className = "",
  disabled = false 
}) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [newRoomTypeDescription, setNewRoomTypeDescription] = useState('');
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('token');

  const fetchRoomTypes = async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/room-types`);
      setRoomTypes(response.data.data || []);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to fetch room types.');
      console.error('Error fetching room types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowAddForm(false);
        setEditingRoomType(null);
        setApiError('');
        setSuccessMessage('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateRoomType = async () => {
    if (!newRoomTypeName.trim()) {
      setApiError('Room type name is required.');
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/room-types`,
        { name: newRoomTypeName.trim(), description: newRoomTypeDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomTypes((prev) => [...prev, response.data.data]);
      setNewRoomTypeName('');
      setNewRoomTypeDescription('');
      setShowAddForm(false);
      setSuccessMessage('Room type created successfully!');
      onSelectRoomType(response.data.data.name);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create room type.');
      console.error('Error creating room type:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomType = async (id) => {
    if (!editName.trim()) {
      setApiError('Room type name is required.');
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/room-types/${id}`,
        { name: editName.trim(), description: editDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomTypes((prev) =>
        prev.map((rt) => (rt._id === id ? response.data.data : rt))
      );
      setEditingRoomType(null);
      setSuccessMessage('Room type updated successfully!');
      if (selectedRoomType === editingRoomType.name) {
        onSelectRoomType(response.data.data.name);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update room type.');
      console.error('Error updating room type:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoomType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) {
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      await axios.delete(`${API_BASE_URL}/room-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoomTypes((prev) => prev.filter((rt) => rt._id !== id));
      if (selectedRoomType === editingRoomType?.name) {
        onSelectRoomType('');
      }
      setEditingRoomType(null);
      setSuccessMessage('Room type deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to delete room type.');
      console.error('Error deleting room type:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (roomType) => {
    setEditingRoomType(roomType);
    setEditName(roomType.name);
    setEditDescription(roomType.description || '');
    setShowAddForm(false);
  };

  const cancelEditing = () => {
    setEditingRoomType(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSelect = (name) => {
    onSelectRoomType(name);
    setShowDropdown(false);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setEditingRoomType(null);
    setNewRoomTypeName('');
    setNewRoomTypeDescription('');
    setApiError('');
    setSuccessMessage('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer flex justify-between items-center ${
          error ? 'border-red-500 bg-red-50' : 
          selectedRoomType ? 'border-green-500 bg-green-50' : 
          'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <span className={selectedRoomType ? 'text-gray-900' : 'text-gray-500'}>
          {selectedRoomType || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 ${showDropdown ? 'rotate-180' : ''} transition-transform`} />
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-2 text-green-600 text-sm border-b border-green-200 bg-green-50">
              {successMessage}
            </div>
          )}
          {apiError && (
            <div className="p-2 text-red-600 text-sm border-b border-red-200 bg-red-50">
              {apiError}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-2 flex items-center justify-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </div>
          )}

          {/* Room Types List */}
          {!loading && roomTypes.length > 0 && (
            <div className="max-h-48 overflow-y-auto">
              {roomTypes.map((rt) => (
                <div key={rt._id} className="flex items-center justify-between p-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0">
                  {editingRoomType?._id === rt._id ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Room Type Name"
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Description (optional)"
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelect(rt.name)}>
                      <div className="text-sm text-gray-800 font-medium">{rt.name}</div>
                      {rt.description && (
                        <div className="text-xs text-gray-500">{rt.description}</div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    {editingRoomType?._id === rt._id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateRoomType(rt._id)}
                          className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                          disabled={loading}
                          title="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                          disabled={loading}
                          title="Cancel editing"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(rt)}
                          className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                          disabled={loading}
                          title="Edit room type"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoomType(rt._id)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                          disabled={loading}
                          title="Delete room type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Room Types Message */}
          {!loading && roomTypes.length === 0 && (
            <div className="p-4 text-gray-500 text-sm text-center">
              No room types found.
            </div>
          )}

          {/* Add New Room Type Section */}
          <div className="border-t border-gray-200">
            {!showAddForm ? (
              <button
                type="button"
                onClick={toggleAddForm}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add New Room Type
              </button>
            ) : (
              <div className="p-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-700 mb-2">Add New Room Type</div>
                <input
                  type="text"
                  value={newRoomTypeName}
                  onChange={(e) => setNewRoomTypeName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Room Type Name *"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={newRoomTypeDescription}
                  onChange={(e) => setNewRoomTypeDescription(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Description (optional)"
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateRoomType}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={toggleAddForm}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeDropdownWithCRUD;

