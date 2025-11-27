import React, { useEffect, useState } from "react";
import { 
  getAllFoodBookings, 
  updateBookingStatus, 
  getPendingBookingsCount,
  getFoodBookingAnalytics
} from "../../api/foodBookingApi.js";
import Swal from "sweetalert2";
import OrdersByStatusPie from "../../components/charts/OrdersByStatusPie.jsx";
import RevenueByCategoryBar from "../../components/charts/RevenueByCategoryBar.jsx";
import SalesOverTimeLine from "../../components/charts/SalesOverTimeLine.jsx";
import TopSellingItemsBar from "../../components/charts/TopSellingItemsBar.jsx";
import { convertAndFormatLKRToUSD } from "../../utils/currencyUtils.js";

const money = (v) => convertAndFormatLKRToUSD(v);

// Helper function to get the best available phone number
const getDisplayPhone = (booking) => {
  // Priority 1: Phone from user profile (if customerId is populated and has valid phone)
  if (booking.customerId?.phone && 
      booking.customerId.phone !== 'not given' && 
      booking.customerId.phone !== '000-000-0000' &&
      booking.customerId.phone !== '') {
    return booking.customerId.phone;
  }
  
  // Priority 2: Phone from booking form (customerPhone) - but not if it's "not given" or placeholder
  if (booking.customerPhone && 
      booking.customerPhone !== '000-000-0000' && 
      booking.customerPhone !== 'not given' &&
      booking.customerPhone !== '') {
    return booking.customerPhone;
  }
  
  // Priority 3: If customerPhone is "not given" but we have a valid customerId phone, use that
  if (booking.customerPhone === 'not given' && 
      booking.customerId?.phone && 
      booking.customerId.phone !== 'not given' && 
      booking.customerId.phone !== '000-000-0000' &&
      booking.customerId.phone !== '') {
    return booking.customerId.phone;
  }
  
  // Fallback: N/A
  return 'N/A';
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800", 
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function FoodBookingAdmin() {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 50,  // Increased limit to show more items
    dateFilter: "all", // "all", "weekly", "monthly", "custom"
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });

  // Helper functions for date filtering
  const getDateRange = (filterType) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (filterType) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        // Only return custom dates if they are valid
        if (filters.startDate && filters.endDate) {
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            return {
              startDate: filters.startDate,
              endDate: filters.endDate
            };
          }
        }
        return null;
      default:
        return null;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const getFilterDescription = () => {
    switch (filters.dateFilter) {
      case 'weekly':
        return 'Last 7 days';
      case 'monthly':
        return 'Last 30 days';
      case 'custom':
        if (filters.startDate && filters.endDate) {
          return `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`;
        }
        return 'Custom date range';
      default:
        return 'All time';
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to access booking data");
        setLoading(false);
        return;
      }

      // Prepare date filters for API calls
      const dateRange = getDateRange(filters.dateFilter);
      const apiFilters = { ...filters };
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        apiFilters.startDate = dateRange.startDate;
        apiFilters.endDate = dateRange.endDate;
        console.log('Date range applied:', dateRange);
      } else {
        // Remove date filters if they are invalid
        delete apiFilters.startDate;
        delete apiFilters.endDate;
        console.log('No valid date range, using all data');
      }

      const [bookingsResponse, analyticsResponse, pendingResponse] = await Promise.all([
        getAllFoodBookings(apiFilters),
        getFoodBookingAnalytics({ 
          timeframe: filters.dateFilter === 'all' ? 'monthly' : filters.dateFilter,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        }),
        getPendingBookingsCount()
      ]);

      // Debug logging (can be removed in production)
      console.log('Bookings loaded:', bookingsResponse.bookings?.length || 0);
      console.log('Analytics data:', {
        totalOrders: analyticsResponse?.totalOrders,
        pendingOrders: analyticsResponse?.pendingOrders,
        ordersByStatus: analyticsResponse?.ordersByStatus
      });

      setBookings(bookingsResponse.bookings || []);
      setAnalytics(analyticsResponse);
      setPendingCount(pendingResponse.pendingCount || 0);
      
      // Update pagination info
      setPagination({
        totalPages: bookingsResponse.totalPages || 1,
        currentPage: bookingsResponse.currentPage || 1,
        total: bookingsResponse.total || 0
      });
      
      // Debug: Log analytics data to see category revenue
      console.log("Analytics data:", analyticsResponse);
      console.log("Category revenue data:", analyticsResponse?.categoryRevenue);
      console.log("Debug info:", analyticsResponse?.debug);
      
      // Debug: Log booking data to see image paths and user details
      console.log("=== BOOKINGS DATA RECEIVED ===");
      console.log("Bookings data:", bookingsResponse.bookings);
      console.log("Number of bookings:", bookingsResponse.bookings?.length || 0);
      
      // Debug: Log phone number data for each booking (can be removed in production)
      if (bookingsResponse.bookings && bookingsResponse.bookings.length > 0) {
        console.log("=== PHONE NUMBER DEBUG ===");
        bookingsResponse.bookings.forEach((booking, index) => {
          console.log(`Booking ${index + 1}:`, {
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerId: booking.customerId,
            customerIdPhone: booking.customerId?.phone,
            displayPhone: getDisplayPhone(booking)
          });
        });
      }
      
      if (bookingsResponse.bookings && bookingsResponse.bookings.length > 0) {
        console.log("First booking details:", {
          id: bookingsResponse.bookings[0]._id,
          itemName: bookingsResponse.bookings[0].itemName,
          customerName: bookingsResponse.bookings[0].customerName,
          customerEmail: bookingsResponse.bookings[0].customerEmail,
          customerPhone: bookingsResponse.bookings[0].customerPhone,
          quantity: bookingsResponse.bookings[0].quantity,
          totalAmount: bookingsResponse.bookings[0].totalAmount,
          status: bookingsResponse.bookings[0].status,
          specialRequests: bookingsResponse.bookings[0].specialRequests,
          itemImage: bookingsResponse.bookings[0].itemImage
        });
        console.log("API Base URL:", import.meta.env.VITE_API_BASE);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const statusMessages = {
        preparing: 'Start preparing this food order?',
        completed: 'Mark this order as completed?',
        cancelled: 'Cancel this food order?'
      };

      const result = await Swal.fire({
        title: 'Update Booking Status?',
        text: statusMessages[newStatus] || `Are you sure you want to change this booking status to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'cancelled' ? '#d33' : '#d3af37',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Update!',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      let adminNotes = "";
      if (newStatus === "preparing" || newStatus === "completed") {
        const { value: notes } = await Swal.fire({
          title: 'Admin Notes (Optional)',
          html: `
            <div class="text-left">
              <p class="text-sm text-gray-600 mb-3">
                Add any notes about this booking (preparation time, special instructions, etc.)
              </p>
              <textarea id="adminNotes" rows="3" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent" 
                        placeholder="Enter admin notes..."></textarea>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#d3af37',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Update Status',
          cancelButtonText: 'Cancel',
          preConfirm: () => {
            return document.getElementById('adminNotes').value;
          }
        });
        adminNotes = notes || "";
      }

      await updateBookingStatus(bookingId, newStatus, adminNotes);
      
      const successMessages = {
        preparing: 'Order is now being prepared! 🍳',
        completed: 'Order completed successfully! ✅',
        cancelled: 'Order has been cancelled! ❌'
      };

      await Swal.fire({
        title: 'Status Updated!',
        text: successMessages[newStatus] || `Booking status has been updated to ${newStatus}`,
        icon: 'success',
        confirmButtonColor: '#d3af37',
        timer: 2000,
        timerProgressBar: true
      });

      // Show loading while refreshing analytics
      const refreshToast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      refreshToast.fire({
        icon: 'info',
        title: 'Updating analytics...'
      });

      // Refresh data to update analytics
      await loadData();
    } catch (err) {
      console.error("Error updating status:", err);
      await Swal.fire({
        title: 'Update Failed',
        text: err.message || 'Failed to update booking status',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  const getStatusActions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { label: 'Start Preparing', status: 'preparing', color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'preparing':
        return [
          { label: 'Mark Complete', status: 'completed', color: 'bg-green-500 hover:bg-green-600' },
          { label: 'Cancel', status: 'cancelled', color: 'bg-red-500 hover:bg-red-600' }
        ];
      case 'completed':
        return []; // No actions for completed bookings
      case 'cancelled':
        return []; // No actions for cancelled bookings
      default:
        return [];
    }
  };

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
      doc.text('Food Booking Report', 50, 28);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 35);
      doc.text(`Total Bookings: ${bookings.length}`, 50, 40);
      doc.text(`Filter Applied: ${getFilterDescription()}`, 50, 45);
      if (filters.status) {
        doc.text(`Status Filter: ${filters.status.toUpperCase()}`, 50, 50);
      }

      // Summary Statistics with professional styling
      if (analytics) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', 15, 55);
        
        // Draw underline
        doc.setDrawColor(211, 175, 55);
        doc.setLineWidth(0.5);
        doc.line(15, 57, 60, 57);
        
        const stats = [
          ['Total Bookings', analytics.totalOrders || 0],
          ['Total Revenue', money(analytics.totalRevenue || 0)],
          ['Average Order Value', money(analytics.averageOrderValue || 0)],
          ['Pending Orders', analytics.pendingOrders || 0]
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
      }

      // Professional Bookings Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Food Orders Details', 15, 100);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 102, 60, 102);
      
      const tableData = bookings.map(booking => [
        booking.itemName || 'N/A',
        booking.customerName || 'N/A',
        booking.customerEmail || 'N/A',
        getDisplayPhone(booking),
        booking.quantity || 0,
        booking.itemPrice ? money(booking.itemPrice) : 'N/A',
        booking.totalAmount ? money(booking.totalAmount) : 'N/A',
        booking.specialRequests || 'No special requests',
        booking.status || 'N/A',
        new Date(booking.bookingDate).toLocaleDateString()
      ]);

      autoTable(doc, {
        head: [['Item Name', 'Customer Name', 'Email', 'Phone', 'Qty', 'Unit Price', 'Total', 'Special Requests', 'Status', 'Date']],
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
          0: { cellWidth: 25, halign: 'left' },   // Item Name
          1: { cellWidth: 18, halign: 'left' },   // Customer Name
          2: { cellWidth: 22, halign: 'left' },   // Email
          3: { cellWidth: 18, halign: 'left' },   // Phone
          4: { cellWidth: 8, halign: 'center' },  // Qty
          5: { cellWidth: 12, halign: 'right' },  // Unit Price
          6: { cellWidth: 12, halign: 'right' },  // Total
          7: { cellWidth: 20, halign: 'left' },   // Special Requests
          8: { cellWidth: 10, halign: 'left' },   // Status
          9: { cellWidth: 12, halign: 'left' }    // Date
        },
        margin: { left: 15, right: 15 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Professional Status Breakdown
      if (analytics && analytics.ordersByStatus && analytics.ordersByStatus.length > 0) {
        const pageHeight = doc.internal.pageSize.height;
        let currentY = pageHeight - 50;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Status Breakdown', 15, currentY);
        currentY += 10;
        
        analytics.ordersByStatus.forEach(({ status, count }) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`${status.toUpperCase()}: ${count} orders`, 20, currentY);
          currentY += 5;
        });
      }

      // Add footer with company info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Hasthi Safari Cottage - Professional Safari Experience', 15, pageHeight - 10);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 15, pageHeight - 5);

      // Save the PDF
      doc.save(`food-bookings-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      await Swal.fire({
        title: 'PDF Generated!',
        text: 'Professional food booking report has been downloaded successfully.',
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
      <div className="h-full bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d3af37]"></div>
              <p className="text-gray-600">Loading food bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#0a0a0a] mb-2">
                Food Booking Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage food orders and track preparation status
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                <span className="font-semibold">{pendingCount}</span> pending orders
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? 'border-[#d3af37] text-[#d3af37]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? 'border-[#d3af37] text-[#d3af37]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Date Range:</label>
                    <select
                      value={filters.dateFilter}
                      onChange={(e) => setFilters({ ...filters, dateFilter: e.target.value, page: 1 })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="weekly">Last 7 Days</option>
                      <option value="monthly">Last 30 Days</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  {filters.dateFilter === 'custom' && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Show:</label>
                    <select
                      value={filters.limit}
                      onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent"
                    >
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                      <option value={500}>500 per page</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={exportToPDF}
                    className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#d3af37] text-[#0a0a0a] hover:bg-[#b89d2e] transition-all duration-300 shadow-lg flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={loadData}
                    className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>


            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Special Requests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.itemName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(booking.bookingDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                          <div className="text-sm text-gray-500">{getDisplayPhone(booking)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Qty: {booking.quantity}
                          </div>
                          <div className="text-sm text-gray-500">
                            Unit: {money(booking.itemPrice)}
                          </div>
                          <div className="text-sm font-semibold text-[#d3af37]">
                            Total: {money(booking.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {booking.specialRequests ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                                <div className="text-xs text-yellow-700 font-medium mb-1">Special Requests:</div>
                                <div className="text-xs text-yellow-800">{booking.specialRequests}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">No special requests</span>
                            )}
                            {booking.adminNotes && (
                              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-2">
                                <div className="text-xs text-blue-700 font-medium mb-1">Admin Notes:</div>
                                <div className="text-xs text-blue-800">{booking.adminNotes}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                            {booking.preparedAt && (
                              <div className="text-xs text-gray-500">
                                Started: {new Date(booking.preparedAt).toLocaleTimeString()}
                              </div>
                            )}
                            {booking.completedAt && (
                              <div className="text-xs text-gray-500">
                                Completed: {new Date(booking.completedAt).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            {getStatusActions(booking.status).map((action) => (
                              <button
                                key={action.status}
                                onClick={() => handleStatusUpdate(booking._id, action.status)}
                                className={`px-3 py-1 text-xs font-medium text-white rounded-md transition-colors ${action.color}`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Food Bookings Found</h3>
                <p className="text-gray-500">There are no food bookings to display for the selected filters.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {bookings.length > 0 && pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.currentPage - 1) })}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages, pagination.currentPage - 2 + i));
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setFilters({ ...filters, page: pageNum })}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNum === pagination.currentPage
                                ? 'bg-[#d3af37] text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#d3af37] rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📦</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-semibold text-[#0a0a0a]">{analytics.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-[#0a0a0a]">{money(analytics.totalRevenue || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                    <p className="text-2xl font-semibold text-[#0a0a0a]">{money(analytics.averageOrderValue || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                    <p className="text-2xl font-semibold text-[#0a0a0a]">{analytics.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Orders By Status Pie Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <OrdersByStatusPie data={analytics.ordersByStatus || []} />
              </div>

              {/* Revenue By Category Bar Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <RevenueByCategoryBar data={analytics.categoryRevenue || []} />
              </div>

              {/* Sales Over Time Line Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <SalesOverTimeLine data={analytics.revenueTrend || []} />
              </div>

              {/* Top Selling Items Bar Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <TopSellingItemsBar data={analytics.popularItems || []} />
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-[#0a0a0a] mb-4">Order Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(analytics.ordersByStatus || []).map(({ status, count }) => (
                  <div key={status} className="text-center">
                    <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[status]} mb-2`}>
                      {status}
                    </div>
                    <div className="text-2xl font-bold text-[#0a0a0a]">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-[#0a0a0a] mb-4">Popular Food Items</h3>
              <div className="space-y-3">
                {analytics.popularItems?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.count} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#d3af37]">{money(item.revenue)}</div>
                      <div className="text-sm text-gray-500">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
