export default function Confirm({ open, title, body, onOK, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-[#f0f0f0] rounded-lg shadow-lg w-full max-w-lg p-6">
        <header className="text-xl font-semibold mb-4 text-[#0a0a0a]">{title}</header>
        <div className="mb-6">
          <p className="text-[#0a0a0a]">{body}</p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#d3af37] text-[#0a0a0a] px-4 py-2 rounded-md hover:bg-[#b89d2e] transition"
            onClick={() => {
              onOK();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
