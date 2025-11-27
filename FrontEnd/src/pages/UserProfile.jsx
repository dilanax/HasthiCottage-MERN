// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, LogOut } from 'lucide-react';
import AuthHeader from '../components/AuthHeader';
import profileApi from '../api/profileApi';

const BRAND = { gold: "#D3AF37", ink: "#0A0A0A" };

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // User not logged in, redirect to login
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        // Fetch fresh user data from database
        const response = await profileApi.getProfile();
        
        if (response.success && response.user) {
          const userData = response.user;
          setUser(userData);
          setEditData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
            email: userData.email || '',
            phone: userData.phone || '',
            address: '' // Address not in current user model
          });
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (error.message.includes('Authentication required')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        } else {
          alert('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edit data to original user data
    setEditData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: user.name || `${user.firstName} ${user.lastName}`.trim(),
      email: user.email || '',
      phone: user.phone || '',
      address: '' // Address not in current user model
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editData.firstName || !editData.lastName) {
        alert('First name and last name are required.');
        return;
      }

      // Prepare data for API
      const updateData = {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        phone: editData.phone.trim() || null
      };

      // Call API to update user data in database
      const response = await profileApi.updateProfile(updateData);
      
      if (response.success && response.user) {
        const updatedUser = response.user;
        setUser(updatedUser);
        setEditData({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          name: updatedUser.name || `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          address: ''
        });
        setIsEditing(false);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch auth change event to update header
        window.dispatchEvent(new Event('authChange'));
        
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        alert(`Failed to update profile: ${error.response.data.message}`);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND.gold }}></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      
      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div 
              className="h-32 relative"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.gold} 0%, #b8971f 100%)` 
              }}
            >
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12" style={{ color: BRAND.gold }} />
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                    <p className="text-white/80">{user.role === 'admin' ? 'Administrator' : 'Guest User'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8 pt-16">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                      style={{ backgroundColor: BRAND.gold }}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      style={{ focusRingColor: BRAND.gold }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user.firstName || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      style={{ focusRingColor: BRAND.gold }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user.lastName || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.email || 'Not provided'}</span>
                    <span className="text-xs text-gray-500 ml-auto">(Cannot be changed)</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      style={{ focusRingColor: BRAND.gold }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.employeeId || 'Not assigned'}</span>
                  </div>
                </div>

                {/* Account Info (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 capitalize">{user.role || 'user'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/guest/bookings')}
                      className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Bookings
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ backgroundColor: BRAND.gold }}
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
