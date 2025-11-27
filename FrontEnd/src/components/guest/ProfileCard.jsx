import React from 'react';
import { User, Mail, Edit, LogOut, Shield, Calendar } from 'lucide-react';

export default function ProfileCard({ user, onEdit, onLogout }) {
  // Generate user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Generate random background gradient based on name
  const getGradientStyle = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #d3af37 0%, #f4d03f 100%)', // Hasthi brand colors
    ];
    const index = (name?.length || 0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
          <div className="w-full h-full rounded-full" style={{ background: getGradientStyle(user?.name) }}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-12 translate-y-12">
          <div className="w-full h-full rounded-full" style={{ background: getGradientStyle(user?.name) }}></div>
        </div>
      </div>

      {/* Header Section */}
      <div 
        className="relative h-24 px-6 pt-4"
        style={{ 
          background: getGradientStyle(user?.name),
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Profile Avatar */}
        <div className="relative z-10 flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-xl font-bold" style={{ color: '#667eea' }}>
                {getInitials(user?.name)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="text-white">
            <h2 className="text-xl font-bold">{user?.name || 'Guest User'}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {user?.role === 'admin' ? 'Administrator' : 'Guest User'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 pt-8">
        {/* User Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{user?.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
          
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
