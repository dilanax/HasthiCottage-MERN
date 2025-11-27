import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Star } from 'lucide-react';
import ProfileCard from '../../components/guest/ProfileCard';

const user = { 
  name: 'Guest User', 
  email: 'guest@example.com',
  role: 'guest',
  createdAt: new Date().toISOString()
};

export default function Profile(){
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    // Navigate to full profile page or open edit modal
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Mock booking history data
  const bookingHistory = [
    {
      id: 1,
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      roomType: 'Deluxe Cottage',
      status: 'completed',
      totalAmount: 450
    },
    {
      id: 2,
      checkIn: '2024-02-20',
      checkOut: '2024-02-22',
      roomType: 'Standard Cottage',
      status: 'completed',
      totalAmount: 300
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your booking history</p>
        </div>

        {/* Profile Card */}
        <ProfileCard user={user} onEdit={handleEdit} onLogout={handleLogout} />

        {/* Booking History */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking History
            </h3>
            <p className="text-gray-600 mt-1">Your recent stays and reservations</p>
          </div>
          
          <div className="p-6">
            {bookingHistory.length > 0 ? (
              <div className="space-y-4">
                {bookingHistory.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{booking.roomType}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.checkIn} - {booking.checkOut}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${booking.totalAmount}</div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h4>
                <p className="text-gray-600 mb-6">Start your adventure by making your first reservation!</p>
                <button 
                  onClick={() => navigate('/reserve/start')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{bookingHistory.length}</h4>
                <p className="text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">5.0</h4>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">2</h4>
                <p className="text-gray-600">Nights Stayed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
