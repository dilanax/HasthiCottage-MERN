import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Check, ChevronDown, Loader2, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BedLabelDropdownWithCRUD = ({ 
  selectedBedLabel, 
  onSelectBedLabel, 
  error, 
  placeholder = "-- Select Bed Label --",
  className = "",
  disabled = false 
}) => {
  const [bedLabels, setBedLabels] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBedLabelName, setNewBedLabelName] = useState('');
  const [newBedLabelDescription, setNewBedLabelDescription] = useState('');
  const [editingBedLabel, setEditingBedLabel] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('token');

  const fetchBedLabels = async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/bed-labels`);
      setBedLabels(response.data.data || []);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to fetch bed labels.');
      console.error('Error fetching bed labels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedLabels();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowAddForm(false);
        setEditingBedLabel(null);
        setApiError('');
        setSuccessMessage('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateBedLabel = async () => {
    if (!newBedLabelName.trim()) {
      setApiError('Bed label name is required.');
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bed-labels`,
        { name: newBedLabelName.trim(), description: newBedLabelDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBedLabels((prev) => [...prev, response.data.data]);
      setNewBedLabelName('');
      setNewBedLabelDescription('');
      setShowAddForm(false);
      setSuccessMessage('Bed label created successfully!');
      onSelectBedLabel(response.data.data.name);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create bed label.');
      console.error('Error creating bed label:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBedLabel = async (id) => {
    if (!editName.trim()) {
      setApiError('Bed label name is required.');
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/bed-labels/${id}`,
        { name: editName.trim(), description: editDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBedLabels((prev) =>
        prev.map((bl) => (bl._id === id ? response.data.data : bl))
      );
      setEditingBedLabel(null);
      setSuccessMessage('Bed label updated successfully!');
      if (selectedBedLabel === editingBedLabel.name) {
        onSelectBedLabel(response.data.data.name);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update bed label.');
      console.error('Error updating bed label:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBedLabel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bed label?')) {
      return;
    }
    setLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      await axios.delete(`${API_BASE_URL}/bed-labels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBedLabels((prev) => prev.filter((bl) => bl._id !== id));
      if (selectedBedLabel === editingBedLabel?.name) {
        onSelectBedLabel('');
      }
      setEditingBedLabel(null);
      setSuccessMessage('Bed label deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to delete bed label.');
      console.error('Error deleting bed label:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (bedLabel) => {
    setEditingBedLabel(bedLabel);
    setEditName(bedLabel.name);
    setEditDescription(bedLabel.description || '');
    setShowAddForm(false);
  };

  const cancelEditing = () => {
    setEditingBedLabel(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSelect = (name) => {
    onSelectBedLabel(name);
    setShowDropdown(false);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setEditingBedLabel(null);
    setNewBedLabelName('');
    setNewBedLabelDescription('');
    setApiError('');
    setSuccessMessage('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer flex justify-between items-center ${
          error ? 'border-red-500 bg-red-50' : 
          selectedBedLabel ? 'border-green-500 bg-green-50' : 
          'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <span className={selectedBedLabel ? 'text-gray-900' : 'text-gray-500'}>
          {selectedBedLabel || placeholder}
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

          {/* Bed Labels List */}
          {!loading && bedLabels.length > 0 && (
            <div className="max-h-48 overflow-y-auto">
              {bedLabels.map((bl) => (
                <div key={bl._id} className="flex items-center justify-between p-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0">
                  {editingBedLabel?._id === bl._id ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Bed Label Name"
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
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelect(bl.name)}>
                      <div className="text-sm text-gray-800 font-medium">{bl.name}</div>
                      {bl.description && (
                        <div className="text-xs text-gray-500">{bl.description}</div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    {editingBedLabel?._id === bl._id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateBedLabel(bl._id)}
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
                          onClick={() => startEditing(bl)}
                          className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                          disabled={loading}
                          title="Edit bed label"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBedLabel(bl._id)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                          disabled={loading}
                          title="Delete bed label"
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

          {/* No Bed Labels Message */}
          {!loading && bedLabels.length === 0 && (
            <div className="p-4 text-gray-500 text-sm text-center">
              No bed labels found.
            </div>
          )}

          {/* Add New Bed Label Section */}
          <div className="border-t border-gray-200">
            {!showAddForm ? (
              <button
                type="button"
                onClick={toggleAddForm}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add New Bed Label
              </button>
            ) : (
              <div className="p-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-700 mb-2">Add New Bed Label</div>
                <input
                  type="text"
                  value={newBedLabelName}
                  onChange={(e) => setNewBedLabelName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Bed Label Name *"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={newBedLabelDescription}
                  onChange={(e) => setNewBedLabelDescription(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Description (optional)"
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateBedLabel}
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

export default BedLabelDropdownWithCRUD;













