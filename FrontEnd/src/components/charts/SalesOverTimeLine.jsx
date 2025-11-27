import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

export default function SalesOverTimeLine({ data = [] }) {
  const money = (v) => convertAndFormatLKRToUSD(v);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="_id" 
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
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
