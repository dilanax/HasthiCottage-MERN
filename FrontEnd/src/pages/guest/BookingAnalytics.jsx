import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Download, BarChart3, Calendar, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export default function BookingAnalytics() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await api.get('/reservations/guest');
      const data = res.data.data || res.data.reservations || res.data;
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // Simple analytics calculations
  const analytics = useMemo(() => {
    const totalBookings = reservations.length;
    return {
      totalBookings
    };
  }, [reservations]);

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc = new jsPDF();
      
      // Add hotel logo to header with professional styling
      try {
        const logoResponse = await fetch('/logo.png');
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Create a professional logo background
        doc.setFillColor(211, 175, 55); // Golden background
        doc.rect(15, 10, 25, 25, 'F');
        doc.addImage(logoDataUrl, 'PNG', 17, 12, 21, 21);
      } catch (logoError) {
        console.warn('Could not load logo:', logoError);
        // Fallback: Create a simple golden square
        doc.setFillColor(211, 175, 55);
        doc.rect(15, 10, 25, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('HASTHI', 20, 20);
        doc.text('SAFARI', 20, 25);
        doc.text('COTTAGE', 20, 30);
      }

      // Professional Header Styling
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Hasthi Safari Cottage', 50, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Booking Analytics Report', 50, 28);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 35);
      doc.text(`Total Bookings: ${analytics.totalBookings}`, 50, 40);

      // Summary Statistics with professional styling
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Summary Statistics', 15, 55);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 57, 60, 57);
      
      const stats = [
        ['Total Bookings', analytics.totalBookings || 0],
        ['Total Revenue', `$${reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toFixed(2)}`],
        ['Average Booking Value', `$${analytics.totalBookings > 0 ? (reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / analytics.totalBookings).toFixed(2) : 0}`],
        ['Date Range', `${new Date(Math.min(...reservations.map(r => new Date(r.createdAt)))).toLocaleDateString()} - ${new Date(Math.max(...reservations.map(r => new Date(r.createdAt)))).toLocaleDateString()}`]
      ];
      
      autoTable(doc, {
        body: stats,
        startY: 62,
        theme: 'plain',
        styles: { 
          fontSize: 10,
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 60, halign: 'left' },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Professional Bookings Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Booking Details', 15, 100);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 102, 60, 102);
      
      const tableData = reservations.map(reservation => [
        reservation.reservationNumber || 'N/A',
        new Date(reservation.checkIn).toLocaleDateString(),
        new Date(reservation.checkOut).toLocaleDateString(),
        `${Math.round((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24))} nights`,
        `$${(reservation.totalAmount || 0).toFixed(2)}`,
        reservation.status || 'N/A',
        new Date(reservation.createdAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        head: [['Reservation #', 'Check-in', 'Check-out', 'Duration', 'Amount', 'Status', 'Booked Date']],
        body: tableData,
        startY: 107,
        theme: 'plain',
        styles: { 
          fontSize: 8,
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [211, 175, 55],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },   // Reservation #
          1: { cellWidth: 18, halign: 'left' },   // Check-in
          2: { cellWidth: 18, halign: 'left' },   // Check-out
          3: { cellWidth: 15, halign: 'center' }, // Duration
          4: { cellWidth: 15, halign: 'right' },  // Amount
          5: { cellWidth: 15, halign: 'left' },   // Status
          6: { cellWidth: 18, halign: 'left' }    // Booked Date
        },
        margin: { left: 15, right: 15 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Add footer with company info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Hasthi Safari Cottage - Professional Safari Experience', 15, pageHeight - 10);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 15, pageHeight - 5);

      // Save the PDF
      doc.save(`booking-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
      
      await Swal.fire({
        title: 'PDF Generated!',
        text: 'Professional booking analytics report has been downloaded successfully.',
        icon: 'success',
        confirmButtonColor: '#d3af37',
        timer: 3000
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      await Swal.fire({
        title: 'Export Failed',
        text: 'Failed to generate PDF report. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa', color: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-d3af37 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold mb-2">Loading Analytics...</div>
                <div className="text-sm opacity-75">Please wait while we fetch your booking data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa', color: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#fecaca' }}>
                <AlertCircle className="w-8 h-8" style={{ color: '#dc2626' }} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2" style={{ color: '#dc2626' }}>Error Loading Analytics</h4>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadReservations}
                  className="px-6 py-3 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa', color: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/guest/bookings')}
                className="p-3 rounded-xl hover:brightness-95 transition-all"
                style={{ backgroundColor: '#6b7280' }}
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#ffffff' }} />
              </button>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#d3af37' }}>
                <BarChart3 className="w-8 h-8" style={{ color: '#0a0a0a' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#0a0a0a' }}>Booking Analytics</h1>
                <p className="text-lg opacity-75">Detailed insights into your booking patterns and spending</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex items-center gap-2 px-4 py-3 rounded-xl hover:brightness-95 transition-all font-medium"
              style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0' }}
              onClick={loadReservations}
              disabled={loading}
              title="Refresh analytics"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-xl hover:brightness-95 transition-all font-medium shadow-lg"
              style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
            >
              <Download className="w-5 h-5" />
              Export Analytics
            </button>
          </div>
        </div>

        {/* Empty State */}
        {reservations.length === 0 && (
          <div className="p-16 text-center rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff', border: '2px solid #d3af37' }}>
            <div className="mb-8">
              <div className="text-8xl mb-6">📊</div>
              <h3 className="text-3xl font-bold mb-4">No Analytics Available</h3>
              <p className="text-xl opacity-75 mb-8 max-w-2xl mx-auto">
                You haven't made any reservations yet. Start booking to see your analytics and insights!
              </p>
            </div>
            <button
              onClick={() => navigate('/reserve/start')}
              className="flex items-center gap-3 px-8 py-4 text-xl font-semibold rounded-xl hover:brightness-95 transition-all shadow-lg mx-auto"
              style={{ 
                background: 'linear-gradient(135deg, #d3af37 0%, #f4d03f 100%)',
                color: '#0a0a0a'
              }}
            >
              <Calendar className="w-6 h-6" />
              Make Your First Booking
            </button>
          </div>
        )}

        {/* Analytics Content */}
        {reservations.length > 0 && (
          <div className="space-y-8">
            {/* Simple Analytics Info */}
            <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#ffffff', border: '2px solid #d3af37' }}>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#0a0a0a' }}>Your Booking History</h3>
                <p className="text-lg opacity-75 mb-6">
                  You have {analytics.totalBookings} total bookings with Hasthi Safari Cottage
                </p>
                <div className="text-center">
                  <p className="text-sm opacity-60">
                    Use the export button above to download detailed information about your reservations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
