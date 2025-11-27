import React from 'react';
import RoomManagementDashboard from '../../../components/rooms/admin/RoomManagementDashboard';
import { Toaster } from 'react-hot-toast';

const RoomAdmin = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" />
      <RoomManagementDashboard />
    </div>
  );
};

export default RoomAdmin;
