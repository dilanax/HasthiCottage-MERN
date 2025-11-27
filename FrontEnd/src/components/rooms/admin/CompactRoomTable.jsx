import React, { useState } from 'react';
import { Eye, Edit, Trash2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

const CompactRoomTable = ({ rooms, onView, onEdit, onDelete, getImageCount }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (roomId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const getRoomThumbnail = (room) => {
    const images = room?.imageGallery || [];
    return images.length > 0 ? images[0]?.url || images[0] : null;
  };

  const formatRoomType = (roomType) => {
    return roomType?.replace(/-/g, ' ').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase()) || 'Unknown Room';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-4">Room</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Capacity</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-1">Images</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {rooms.map((room) => {
          const isExpanded = expandedRows.has(room.room_id);
          const thumbnail = getRoomThumbnail(room);
          const imageCount = getImageCount(room);
          
          return (
            <div key={room.room_id} className="group">
              {/* Main Row */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Room Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={formatRoomType(room.roomType)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Room Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {formatRoomType(room.roomType)}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {room.bedLabel || 'No bed type'}
                      </p>
                      {room.room_id && (
                        <p className="text-xs text-gray-400 font-mono">
                          {room.room_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.active ? 'Active' : 'Inactive'}
                    </span>
                    {room.availableCount !== undefined && (
                      <div className="mt-1 text-xs text-gray-500">
                        Available: {room.availableCount}
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="col-span-2 text-sm text-gray-600">
                    <div>{room.capacityAdults || 0} adults</div>
                    <div className="text-xs text-gray-500">
                      {room.capacityChildren || 0} children
                    </div>
                  </div>

                  {/* Size */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {room.sizeSqm || '—'} m²
                  </div>

                  {/* Images */}
                  <div className="col-span-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>{imageCount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-1">
                    <button
                      onClick={() => onView(room)}
                      className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onEdit(room.room_id)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Edit room"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(room.room_id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Row - Additional Details */}
              {isExpanded && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Features */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(room.features || {})
                          .filter(([, enabled]) => enabled)
                          .map(([feature]) => (
                            <span
                              key={feature}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {feature.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                        {Object.values(room.features || {}).every(v => !v) && (
                          <span className="text-gray-500 text-xs">No features</span>
                        )}
                      </div>
                    </div>

                    {/* Perks */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Perks</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(room.perks || {})
                          .filter(([, enabled]) => enabled)
                          .map(([perk]) => (
                            <span
                              key={perk}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {perk.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                        {Object.values(room.perks || {}).every(v => !v) && (
                          <span className="text-gray-500 text-xs">No perks</span>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Room ID: {room.room_id}</div>
                        <div>Available: {room.availableCount || 0} rooms</div>
                        <div>Images: {imageCount} photos</div>
                        {room.createdAt && (
                          <div>Created: {new Date(room.createdAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <div className="px-6 py-2 border-t border-gray-100">
                <button
                  onClick={() => toggleRowExpansion(room.room_id)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Show more
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactRoomTable;
