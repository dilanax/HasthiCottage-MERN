import React from 'react';

export default function ConfirmModal({ open, title = 'Confirm', description, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{description}</p>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 font-semibold rounded bg-hasthi-yellow text-hasthi-text hover:brightness-95">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
