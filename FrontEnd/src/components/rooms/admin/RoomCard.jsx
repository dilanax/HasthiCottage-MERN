// src/components/admin/RoomCard.jsx
import React from 'react';

const toTitleCase = (str = '') =>
  str.replace(/-/g, ' ').replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());
const formatKey = (key = '') =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

const Chip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs border border-[#d3af37]/40 bg-white/70 text-[#0a0a0a]">
    {children}
  </span>
);

const RoomCard = ({ room, onClick, onDelete, onUpdate, onToggleStatus }) => {
  const thumbnail =
    room?.imageGallery?.[0]?.url ||
    (Array.isArray(room?.imageUrl) ? room.imageUrl[0] : null) ||
    null;

  // prepare features -> chips (max 4 + "+N more")
  const enabledFeatures = Object.entries(room?.features || {})
    .filter(([, v]) => v)
    .map(([k]) => formatKey(k));

  const shown = enabledFeatures.slice(0, 4);
  const remaining = Math.max(0, enabledFeatures.length - shown.length);

  return (
    <div
      className="relative flex flex-col overflow-hidden transition-shadow bg-white border shadow-md cursor-pointer group rounded-2xl border-black/5 hover:shadow-lg"
      onClick={() => onClick?.(room)}
    >
      {/* Image / placeholder */}
      <div className="relative h-40 w-full bg-[#f0f0f0]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${room?.roomType} thumbnail`}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#0a0a0a]/50 text-sm">
            No image
          </div>
        )}

        {/* status badge with toggle */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium
              ${room?.active
                ? 'bg-green-50 text-green-700 border border-green-600/30'
                : 'bg-red-50 text-red-700 border border-red-600/30'}`}
          >
            {room?.active ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.(room?.room_id, !room?.active);
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              room?.active
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
            }`}
            title={room?.active ? 'Deactivate room' : 'Activate room'}
          >
            {room?.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-[#0a0a0a]">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold leading-tight">
            {toTitleCase(room?.roomType || '')}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {room?.room_id && (
            <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-black/10 text-[#0a0a0a]/70">
              {room.room_id}
            </code>
          )}
        </div>

        <div className="mt-1 text-sm">
          <p className="truncate">{room?.bedLabel}</p>
          <p className="text-[#0a0a0a]/80">
            Size: <strong>{room?.sizeSqm ?? '—'}</strong> m²
          </p>
          <p className="text-[#0a0a0a]/80">
            Capacity: <strong>{room?.capacityAdults ?? 0}</strong> adults,&nbsp;
            <strong>{room?.capacityChildren ?? 0}</strong> children
          </p>
        </div>

        {/* Features chips */}
        <div className="mt-3">
          <h3 className="mb-1 text-sm font-medium">Key Features</h3>
          {shown.length ? (
            <div className="flex flex-wrap gap-1.5">
              {shown.map((f) => (
                <Chip key={f}>{f}</Chip>
              ))}
              {remaining > 0 && (
                <Chip>+{remaining} more</Chip>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#0a0a0a]/60">No features selected.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate?.(room?.room_id); }}
            className="flex-1 px-3 py-2 rounded-xl font-semibold text-[#0a0a0a] bg-[#d3af37] hover:brightness-95 active:brightness-90 transition shadow-sm"
          >
            Update
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(room?.room_id); }}
            className="flex-1 px-3 py-2 font-semibold text-white transition bg-red-500 rounded-xl hover:bg-red-600 active:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* subtle hover border accent */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 group-hover:ring-[#d3af37]/50 transition"></div>
    </div>
  );
};

export default RoomCard;
