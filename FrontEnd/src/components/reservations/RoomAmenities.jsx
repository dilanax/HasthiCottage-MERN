// components/reservations/RoomAmenities.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function RoomAmenities({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="mb-2 text-sm font-semibold text-[#0a0a0a]">Amenities</h3>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((t, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-[#0a0a0a]/80">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
