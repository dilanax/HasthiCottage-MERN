import React from 'react';
import { Eye, Edit, Trash2, Image as ImageIcon, Users, Square, Bed, MapPin } from 'lucide-react';

const OptimizedRoomList = ({ rooms, onView, onEdit, onDelete, getImageCount }) => {
  const getRoomThumbnail = (room) => {
    const images = room?.imageGallery || [];
    return images.length > 0 ? images[0]?.url || images[0] : null;
  };

  const formatRoomType = (roomType) => {
    return roomType?.replace(/-/g, ' ').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase()) || 'Unknown Room';
  };

  const getCapacityText = (adults, children) => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} child${children > 1 ? 'ren' : ''}`);
    return parts.length > 0 ? parts.join(', ') : 'No capacity set';
  };

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const thumbnail = getRoomThumbnail(room);
        const imageCount = getImageCount(room);
        
        return (
          <div
            key={room.room_id}
            className="group bg-white rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="flex">
              {/* Image Preview */}
              <div className="w-32 h-24 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={formatRoomType(room.roomType)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Image Count Badge */}
                {imageCount > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {imageCount}
                  </div>
                )}
              </div>

              {/* Room Details */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Room Name and Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">
                        {formatRoomType(room.roomType)}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        room.active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {room.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Room Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Bed Information */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Bed className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-700">Bed:</span>
                          <span className="ml-1">{room.bedLabel || 'Not specified'}</span>
                        </div>
                      </div>

                      {/* Size Information */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-700">Size:</span>
                          <span className="ml-1">{room.sizeSqm || '—'} m²</span>
                        </div>
                      </div>

                      {/* Capacity Information */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-700">Capacity:</span>
                          <span className="ml-1">{getCapacityText(room.capacityAdults, room.capacityChildren)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info Row */}
                    <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                      {/* Room ID */}
                      {room.room_id && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-mono text-xs">{room.room_id}</span>
                        </div>
                      )}
                      
                      {/* Available Count */}
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Available:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          room.availableCount > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {room.availableCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => onView(room)}
                      className="p-2.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group/btn"
                      title="View room details"
                    >
                      <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => onEdit(room.room_id)}
                      className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group/btn"
                      title="Edit room"
                    >
                      <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(room.room_id)}
                      className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group/btn"
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-yellow-200 transition-colors pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

export default OptimizedRoomList;
