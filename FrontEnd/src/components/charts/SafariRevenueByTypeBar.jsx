import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

export default function SafariRevenueByTypeBar({ data = [] }) {
  const money = (v) => convertAndFormatLKRToUSD(v);

  const rows = data.map(d => ({ type: d.type, revenue: Number(d.revenue.toFixed?.(2) ?? d.revenue) }));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Package Type</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="type" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value, name) => [money(value), name]}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#d3af37"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

