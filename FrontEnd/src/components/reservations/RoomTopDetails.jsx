import React, { useMemo } from "react";
import {
  Users, Square, BedDouble, BadgeCheck, Info, Wifi, AirVent, Coffee, Heart, Car, Shield,
} from "lucide-react";

const ICONS = {
  freeWifi: Wifi,
  airConditioning: AirVent,
  patio: Coffee,
  balcony: Heart,
  dishwasher: Car,
  privateBathroom: Shield,
  gardenView: Heart,
  landmarkView: Info,
  innerCourtyardView: Heart,
  privatePool: BadgeCheck,
};

function Chip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-[#0a0a0a]/80">
      {Icon && <Icon className="h-3.5 w-3.5" />} {label}
    </span>
  );
}

export default function RoomTopDetails({ roomTypeSlug = "", room = {} }) {
  const title = useMemo(
    () => roomTypeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    [roomTypeSlug]
  );

  const featureChips = Object.entries(room.features || {})
    .filter(([, v]) => !!v)
    .map(([k]) => ({
      key: `f:${k}`,
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      icon: ICONS[k] || null,
    }));

  const perkChips = Object.entries(room.perks || {})
    .filter(([, v]) => !!v)
    .map(([k]) => ({
      key: `p:${k}`,
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      icon: ICONS[k] || null,
    }));

  return (
    <header className="w-full p-5 bg-white border border-gray-200 rounded-xl">
      {/* Title + quick facts */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0a0a0a]">{title}</h2>
          <p className="text-sm text-[#0a0a0a]/60">Room ID: {room.room_id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {room.bedLabel && (
            <div className="flex items-center gap-2 text-sm text-[#0a0a0a]/80">
              <BedDouble className="w-4 h-4" />
              <span>{room.bedLabel}</span>
            </div>
          )}
          {room.sizeSqm && (
            <div className="flex items-center gap-2 text-sm text-[#0a0a0a]/80">
              <Square className="w-4 h-4" />
              <span>{room.sizeSqm} m²</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[#0a0a0a]/80">
            <Users className="w-4 h-4" />
            <span>
              {room.capacityAdults ?? 2} adults
              {room.capacityChildren ? `, ${room.capacityChildren} children` : ""}
            </span>
          </div>
          <div className="text-sm">
            <span
              className={`rounded-md px-2 py-1 ${
                room.availableCount > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {room.availableCount > 0 ? `${room.availableCount} available` : "Not available"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-px my-4 bg-gray-100" />

      {/* Features & Perks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#0a0a0a]">Features</h3>
          <div className="flex flex-wrap gap-2">
            {featureChips.length ? (
              featureChips.map((c) => <Chip key={c.key} icon={c.icon} label={c.label} />)
            ) : (
              <p className="text-sm text-[#0a0a0a]/60">No special features listed.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#0a0a0a]">Perks</h3>
          <div className="flex flex-wrap gap-2">
            {perkChips.length ? (
              perkChips.map((c) => <Chip key={c.key} icon={c.icon} label={c.label} />)
            ) : (
              <p className="text-sm text-[#0a0a0a]/60">No extra perks listed.</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
