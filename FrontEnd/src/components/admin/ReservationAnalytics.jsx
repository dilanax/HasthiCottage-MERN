import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { generateAnalyticsPDF } from '../../utils/generateAnalyticsPDF';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ReservationAnalytics() {
  const [analytics, setAnalytics] = useState({
    today: { reservations: 0, revenue: 0, guests: 0 },
    weekly: { reservations: 0, revenue: 0, guests: 0 },
    monthly: { reservations: 0, revenue: 0, guests: 0 }
  });
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/reservations/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics || {});
      setChartData(data.chartData || []);
      setStatusData(data.statusData || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (period) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/reservations/admin/analytics/${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${period} data`);
      }

      const data = await response.json();
      await generateAnalyticsPDF(data, period);
    } catch (err) {
      console.error(`Error exporting ${period} PDF:`, err);
      alert(`Error exporting ${period} data: ${err.message}`);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = '#d3af37' }) => (
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

  const COLORS = ['#d3af37', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d3af37' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: '#d3af37' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: '#f0f0f0', color: '#0a0a0a' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reservation Analytics</h1>
        <p className="opacity-75">Comprehensive insights into your reservation data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today's Reservations"
          value={analytics.today.reservations}
          subtitle={`${analytics.today.guests} guests • $${analytics.today.revenue}`}
          icon={Calendar}
          color="#d3af37"
        />
        <StatCard
          title="This Week"
          value={analytics.weekly.reservations}
          subtitle={`${analytics.weekly.guests} guests • $${analytics.weekly.revenue}`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          title="This Month"
          value={analytics.monthly.reservations}
          subtitle={`${analytics.monthly.guests} guests • $${analytics.monthly.revenue}`}
          icon={Users}
          color="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reservations Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Reservations Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reservations" fill="#d3af37" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Reservation Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportPDF('today')}
            className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
            style={{ borderColor: '#d3af37', color: '#d3af37' }}
          >
            <Download className="w-5 h-5" />
            <span>Today's Report</span>
          </button>
          <button
            onClick={() => handleExportPDF('weekly')}
            className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
            style={{ borderColor: '#10b981', color: '#10b981' }}
          >
            <Download className="w-5 h-5" />
            <span>Weekly Report</span>
          </button>
          <button
            onClick={() => handleExportPDF('monthly')}
            className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
            style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
          >
            <Download className="w-5 h-5" />
            <span>Monthly Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
