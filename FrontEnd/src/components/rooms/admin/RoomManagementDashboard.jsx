import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Table, Plus, Edit, Trash2, Eye, Image as ImageIcon, X } from 'lucide-react';
import RoomCard from './RoomCard';
import OptimizedRoomList from './OptimizedRoomList';
import CompactRoomTable from './CompactRoomTable';
import RoomDetailsModal from './RoomDetailsModal';
import OptimizedRoomEdit from './OptimizedRoomEdit';
import { getAllRooms, deleteRoom, updateRoom } from '../../../api/rooms';
import toast from 'react-hot-toast';

const RoomManagementDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'grid', 'list', or 'table'
  const [sortBy, setSortBy] = useState('roomType');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Modal states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterAndSortRooms();
  }, [rooms, searchTerm, filterStatus, sortBy, sortOrder]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await getAllRooms();
      setRooms(data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRooms = () => {
    let filtered = rooms.filter(room => {
      const matchesSearch = room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.bedLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.room_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'active' && room.active) ||
                           (filterStatus === 'inactive' && !room.active);
      
      return matchesSearch && matchesFilter;
    });

    // Sort rooms
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredRooms(filtered);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteRoom(roomId);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const handleToggleStatus = async (roomId, newStatus) => {
    try {
      const response = await updateRoom(roomId, { active: newStatus });
      if (response.data?.ok) {
        // Update the room in the local state
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.room_id === roomId 
              ? { ...room, active: newStatus }
              : room
          )
        );
        toast.success(`Room ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling room status:', error);
      toast.error('Failed to update room status');
    }
  };

  const handleEdit = (roomId) => {
    setEditingRoomId(roomId);
  };

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleView = (room) => {
    setSelectedRoom(room);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
    setEditingRoomId(null);
    setIsAdding(false);
    fetchRooms();
  };

  const getImageCount = (room) => {
    return room?.imageGallery?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">
            Manage {filteredRooms.length} of {rooms.length} rooms
          </p>
        </div>
        
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus size={20} />
          Add New Room
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rooms by type, bed, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Rooms</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="roomType-asc">Room Type A-Z</option>
            <option value="roomType-desc">Room Type Z-A</option>
            <option value="sizeSqm-asc">Size Small-Large</option>
            <option value="sizeSqm-desc">Size Large-Small</option>
            <option value="capacityAdults-asc">Capacity Low-High</option>
            <option value="capacityAdults-desc">Capacity High-Low</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="List view"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-yellow-500 text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Table view"
            >
              <Table size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Display */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first room'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : ''
        }>
          {viewMode === 'grid' ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.room_id}
                room={room}
                onClick={handleView}
                onDelete={handleDelete}
                onUpdate={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ))
          ) : viewMode === 'list' ? (
            <OptimizedRoomList
              rooms={filteredRooms}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getImageCount={getImageCount}
            />
          ) : (
            <CompactRoomTable
              rooms={filteredRooms}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getImageCount={getImageCount}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}

      {(editingRoomId || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg m-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
            <OptimizedRoomEdit
              id={editingRoomId || null}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagementDashboard;
