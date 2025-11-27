import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#d3af37' }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: color }}>
            <Icon className="w-6 h-6" style={{ color: '#0a0a0a' }} />
          </div>
        )}
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: '#0a0a0a' }}>{value}</div>
          <div className="text-sm opacity-75" style={{ color: '#0a0a0a' }}>{title}</div>
        </div>
      </div>
      {subtitle && <div className="text-xs opacity-75" style={{ color: '#0a0a0a' }}>{subtitle}</div>}
    </div>
  );
}
