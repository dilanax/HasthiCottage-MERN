import React from "react";

export default function MenuStatsCard({ items }) {
  const total = items.length;
  const available = items.filter((i) => i.available?.isAvailable !== false).length;
  const categories = new Set(items.map((i) => i.category)).size;

  return (
    <div className="bg-[#f0f0f0] shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-[#0a0a0a]">Food Menu</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[#0a0a0a]">Total Items:</div>
          <div className="text-[#0a0a0a]">Available:</div>
          <div className="text-[#0a0a0a]">Categories:</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-[#0a0a0a]">{total}</div>
          <div className="text-lg font-semibold text-green-600">{available}</div>
          <div className="text-lg font-semibold text-[#0a0a0a]">{categories}</div>
        </div>
      </div>
    </div>
  );
}
