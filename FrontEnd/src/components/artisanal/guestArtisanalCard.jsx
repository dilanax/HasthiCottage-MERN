// src/components/artisanal/guestArtisanalCard.jsx
import React from 'react';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Tag } from 'lucide-react';

const ACCENT = '#d3af37';
const BG = '#f0f0f0';
const DARK = '#0a0a0a';

const GuestArtisanalCard = ({ artisanal }) => {
  console.log('GuestArtisanalCard - artisanal data:', artisanal); // Debug log
  console.log('GuestArtisanalCard - images:', artisanal.images); // Debug log
  
  const priceLabel = artisanal.price ? `$ ${artisanal.price}` : 'Price on request';
  const imageSrc = artisanal.images && artisanal.images.length ? artisanal.images[0] : '/placeholder-art.jpg';

  return (
    <motion.article
      layout
      whileHover={{ 
        translateY: -6, 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        scale: 1.02
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group bg-white rounded-3xl overflow-hidden relative border-0"
      style={{ 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden rounded-t-3xl">
        <img
          src={imageSrc}
          alt={artisanal.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/placeholder-art.jpg';
          }}
        />
        {/* Dark gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        {artisanal.category && (
          <div className="absolute top-4 left-4">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg"
              style={{ background: ACCENT, color: DARK, fontFamily: "'Amatic SC', cursive" }}
            >
              <Tag className="w-3 h-3" />
              {artisanal.category}
            </span>
          </div>
        )}

        
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3 gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className="text-2xl leading-tight truncate font-bold"
              style={{ color: DARK }}
            >
              {artisanal.name}
            </h3>
            <p
              className="mt-1 text-sm truncate opacity-70"
              style={{ color: DARK }}
            >
              {artisanal.subtitle || artisanal.shortDesc || ''}
            </p>
          </div>

          <div className="ml-4 flex-shrink-0">
            <div
              className="px-3 py-1 rounded-full text-sm font-bold shadow-md"
              style={{ background: BG, color: DARK }}
            >
              {priceLabel}
            </div>
          </div>
        </div>

        <p
          className="text-sm leading-relaxed mb-6 line-clamp-3 opacity-80"
          style={{ color: DARK }}
        >
          {artisanal.description || 'No description provided.'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            style={{ color: DARK }}
          >
            ♡
          </button>
        </div>

      </div>

      {/* Enhanced Accent Border on Hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl border-3 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ 
          borderColor: ACCENT,
          boxShadow: `0 0 0 1px ${ACCENT}20, 0 0 30px ${ACCENT}10` 
        }}
      />

      {/* Glow Effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `0 0 60px ${ACCENT}15`,
          zIndex: -1
        }}
      />
    </motion.article>
  );
};

export default GuestArtisanalCard;
