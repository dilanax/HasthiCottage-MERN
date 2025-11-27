import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Badge from "../common/Badge";
import Swal from "sweetalert2";
import { convertAndFormatLKRToUSD } from "../../../utils/currencyUtils.js";

const money = (v) => convertAndFormatLKRToUSD(v);

export default function MenuCard({ item, onEdit, onDelete }) {
  const img = item.image
    ? item.image // Azure URL is already complete
    : "https://picsum.photos/400/700?blur=3";

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Menu Item?',
      text: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#d3af37',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await onDelete(item);
        await Swal.fire({
          title: 'Deleted!',
          text: 'Menu item has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#d3af37'
        });
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete menu item. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
  };
  const available = item.available?.isAvailable !== false;

  return (
    <div className="bg-[#f0f0f0] border border-gray-200 rounded-lg shadow-lg p-3 space-y-2 h-full flex flex-col">
      {/* Header with title and availability */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-[#0a0a0a] leading-tight flex-1">
          {item.name}
        </h3>
        {available ? (
          <Badge>available</Badge>
        ) : (
          <Badge tone="warn">unavailable</Badge>
        )}
      </div>

      {/* Description - truncated */}
      <p className="text-sm text-[#0a0a0a] leading-tight overflow-hidden" style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {item.description}
      </p>

      {/* Image - smaller height */}
      <img
        alt={item.name}
        src={img}
        className="w-full h-32 object-cover rounded-md"
      />

      {/* Details - more compact */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-[#0a0a0a]">
          <span>Price:</span>
          <span className="font-semibold">{money(item.price)}</span>
        </div>

        <div className="flex justify-between text-[#0a0a0a]">
          <span>Category:</span>
          <span className="font-semibold">{item.category}</span>
        </div>

        <div className="flex justify-between text-[#0a0a0a]">
          <span>Spice:</span>
          <span className="font-semibold">
            {["None", "Mild", "Medium", "Hot"][item.spicyLevel ?? 0]}
          </span>
        </div>
      </div>

      {/* Tags - smaller and more compact */}
      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs"
            >
              {t}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Action buttons - smaller */}
      <div className="flex justify-between items-center mt-auto pt-2">
        <button
          className="bg-[#d3af37] text-[#0a0a0a] p-1.5 rounded-md hover:bg-[#b89d2e] transition text-sm"
          title="Edit"
          onClick={() => onEdit(item)}
        >
          <FaEdit />
        </button>
        <button
          className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition text-sm"
          title="Delete"
          onClick={handleDelete}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
