// src/components/admin/RoomDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import ImageGallery from './ImageGallery';
import RoomImageGallery from './RoomImageGallery';

const toTitleCase = (str = '') =>
  str.replace(/-/g, ' ').replace(/\w\S*/g, txt => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
const formatKey = (key = '') =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

const Chip = ({ children }) => (
  <span className="px-2.5 py-1 rounded-full text-sm border border-[#d3af37]/50 bg-white/60 text-[#0a0a0a]">
    {children}
  </span>
);

const Section = ({ title, children }) => (
  <section className="mt-5">
    <h3 className="text-sm font-semibold tracking-wide text-[#0a0a0a]/80">{title}</h3>
    <div className="mt-2">{children}</div>
  </section>
);

const RoomDetailsModal = ({ room, onClose }) => {
  const [showGallery, setShowGallery] = useState(false);
  const images = room?.imageGallery?.map(i => i.url) || room?.imageUrl || [];

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={onBackdrop}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-2xl w-full bg-[#f0f0f0] rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <header className="sticky top-0 z-10 bg-[#f0f0f0] border-b border-black/5">
          <div className="flex items-start gap-3 p-5">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold leading-tight text-[#0a0a0a]">
                {toTitleCase(room?.roomType)}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#0a0a0a]/70">
                {room?.room_id && <code className="px-2 py-0.5 rounded bg-white/80 border border-black/10">{room.room_id}</code>}
                <span className={`px-2 py-0.5 rounded-full border ${room?.active ? 'border-green-600/40 bg-green-50' : 'border-red-600/40 bg-red-50'}`}>
                  {room?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[#0a0a0a] hover:bg-white transition"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="p-3 border rounded-xl bg-white/80 border-black/5">
              <div className="text-xs text-[#0a0a0a]/60">Bed</div>
              <div className="font-semibold text-[#0a0a0a]">{room?.bedLabel || '—'}</div>
            </div>
            <div className="p-3 border rounded-xl bg-white/80 border-black/5">
              <div className="text-xs text-[#0a0a0a]/60">Size</div>
              <div className="font-semibold text-[#0a0a0a]">{room?.sizeSqm ?? '—'} m²</div>
            </div>
            <div className="p-3 border rounded-xl bg-white/80 border-black/5">
              <div className="text-xs text-[#0a0a0a]/60">Adults</div>
              <div className="font-semibold text-[#0a0a0a]">{room?.capacityAdults ?? 0}</div>
            </div>
            <div className="p-3 border rounded-xl bg-white/80 border-black/5">
              <div className="text-xs text-[#0a0a0a]/60">Children</div>
              <div className="font-semibold text-[#0a0a0a]">{room?.capacityChildren ?? 0}</div>
            </div>
          </div>

          {/* Features */}
          <Section title="Features">
            {Object.entries(room?.features || {}).filter(([, v]) => v).length ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(room.features)
                  .filter(([, v]) => v)
                  .map(([k]) => <Chip key={k}>{formatKey(k)}</Chip>)
                }
              </div>
            ) : (
              <p className="text-[#0a0a0a]/70">No features selected.</p>
            )}
          </Section>

          {/* Perks */}
          <Section title="Perks">
            {Object.entries(room?.perks || {}).filter(([, v]) => v).length ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(room.perks)
                  .filter(([, v]) => v)
                  .map(([k]) => <Chip key={k}>{formatKey(k)}</Chip>)
                }
              </div>
            ) : (
              <p className="text-[#0a0a0a]/70">No perks selected.</p>
            )}
          </Section>

          {/* Images */}
          <Section title="Images">
            <div className="space-y-4">
              <ImageGallery 
                images={images} 
                title={`${toTitleCase(room?.roomType)} Images`}
                maxDisplay={8}
              />
              {images.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    View Full Gallery
                  </button>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Sticky footer */}
        <footer className="sticky bottom-0 bg-[#f0f0f0] border-t border-black/5 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl font-semibold text-[#0a0a0a] bg-[#d3af37] hover:brightness-95 active:brightness-90 transition shadow-sm"
          >
            Close
          </button>
        </footer>
      </div>

      {/* Full Gallery Modal */}
      {showGallery && (
        <RoomImageGallery
          room={room}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default RoomDetailsModal;
