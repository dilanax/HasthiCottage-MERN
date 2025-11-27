import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

export default function RevenueByCategoryBar({ data = [] }) {
  const money = (v) => convertAndFormatLKRToUSD(v);

  const rows = data.map(d => ({ category: d._id, revenue: Number(d.revenue.toFixed?.(2) ?? d.revenue) }));
  
  // Debug logging
  console.log('RevenueByCategoryBar - Raw data:', data);
  console.log('RevenueByCategoryBar - Processed rows:', rows);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">No Category Data Available</div>
          <div className="text-sm text-center">
            Revenue data by category will appear here once food orders are placed.
            <br />
            Make sure food items have proper categories assigned.
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
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
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
