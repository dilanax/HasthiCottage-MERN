import React from "react";
import { imageURL, deletePackage } from "../../utils/api";
import Swal from "sweetalert2";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

export default function SafariPackageTable({ packages, onRefresh, onEdit }) {
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Safari Package?',
      text: "Are you sure you want to delete this safari package? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#d3af37',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#0a0a0a'
    });

    if (result.isConfirmed) {
      try {
        await deletePackage(id);
        await Swal.fire({
          title: 'Deleted!',
          text: 'Safari package has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#d3af37',
          background: '#ffffff',
          color: '#0a0a0a'
        });
        onRefresh?.();
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete safari package. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          background: '#ffffff',
          color: '#0a0a0a'
        });
      }
    }
  };

  return (
    <div className="rounded-2xl bg-[#f0f0f0] p-3 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Total: <b className="text-gray-900">{packages.length}</b>
        </div>
        <button
          className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
          onClick={() => onRefresh?.()}
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#d3af37] text-[#0a0a0a] rounded-t-xl">
              {[
                "Image","Type","Description","Destination","Date","Period","Visitors","Price","Actions",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2 text-center font-semibold text-[#0a0a0a]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p._id} className="even:bg-gray-50">
                <td className="border border-gray-100 px-3 py-2">
                  {p.image ? (
                    <img 
                      className="h-12 w-16 rounded object-cover" 
                      src={imageURL(p.image)} 
                      alt="safari package"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span className="text-gray-400 text-xs" style={{display: p.image ? 'none' : 'block'}}>
                    {p.image ? 'Failed to load' : 'No image'}
                  </span>
                </td>
                <td className="border border-gray-100 px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.type === "Luxury"
                        ? "bg-amber-100 text-amber-800"
                        : p.type === "Semi-Luxury"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {p.type}
                  </span>
                </td>
                <td className="max-w-[280px] truncate border border-gray-100 px-3 py-2">
                  {p.description}
                </td>
                <td className="border border-gray-100 px-3 py-2">{p.destination}</td>
                <td className="border border-gray-100 px-3 py-2">
                  {new Date(p.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-100 px-3 py-2">{p.period}</td>
                <td className="border border-gray-100 px-3 py-2">{p.visitors}</td>
                <td className="border border-gray-100 px-3 py-2">
                  {convertAndFormatLKRToUSD(p.price)}
                </td>
                <td className="border border-gray-100 px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-[#d3af37] px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] shadow hover:bg-[#b89d2e] transition-colors"
                      onClick={() => onEdit?.(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {packages.length === 0 && (
              <tr>
                <td colSpan="9" className="px-3 py-6 text-center text-gray-400">
                  No packages
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
