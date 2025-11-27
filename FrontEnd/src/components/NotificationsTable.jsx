// src/components/NotificationsTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API = "http://localhost:5000/api/notifications";

const formatDT = (v) => (v ? new Date(v).toLocaleString() : "-");

const extractList = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.notifications)) return d.notifications;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

const toLocalInputValue = (val) => {
  if (!val) return "";
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return "";
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};

const nowLocalInputValue = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const StatusBadge = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-800",
    sent: "bg-emerald-50 text-emerald-800",
    failed: "bg-rose-50 text-rose-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full capitalize ${map[s] || map.pending}`}
    >
      {s}
    </span>
  );
};

const EditModal = ({ notification, onSave, onClose }) => {
  const [data, setData] = useState({ ...notification });
  const [errors, setErrors] = useState({});

  const validateScheduledAt = (value) => {
    if (!value) return "Scheduled date/time is required.";
    const now = new Date();
    const scheduled = new Date(value);
    if (scheduled < now) return "Scheduled time cannot be in the past.";
    return undefined;
  };

  const handleSave = async () => {
    // Validate scheduled_at
    const scheduledError = validateScheduledAt(data.scheduled_at);
    if (scheduledError) {
      setErrors({ scheduled_at: scheduledError });
      return;
    }

    const payload = {
      ...data,
      notification_id: data.notification_id === "" ? undefined : Number(data.notification_id),
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString() : null,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : null,
    };
    await onSave(payload);
  };

  const inputBase = "w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50";
  const labelCls = "block text-sm font-semibold mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold" style={{ color: "#d3af37" }}>Edit Notification</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">Update the notification details below</p>
        </div>
        
        <form className="p-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* ID */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Notification ID</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter notification ID"
              value={data.notification_id || ""}
              onChange={(e) => setData({ ...data, notification_id: e.target.value })}
              className={inputBase}
              style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Title</label>
            <input
              type="text"
              placeholder="Enter notification title"
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className={inputBase}
              style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Message</label>
            <textarea
              placeholder="Enter notification message"
              rows={4}
              value={data.message || ""}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              className={inputBase}
              style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
            />
          </div>

          {/* Type, Priority, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={labelCls} style={{ color: "#0a0a0a" }}>Type</label>
              <select
                value={data.type || ""}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className={inputBase}
                style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
              >
                <option value="booking">Booking</option>
                <option value="offer">Offer</option>
                <option value="promotion">Promotion</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div>
              <label className={labelCls} style={{ color: "#0a0a0a" }}>Priority</label>
              <select
                value={data.priority || ""}
                onChange={(e) => setData({ ...data, priority: e.target.value })}
                className={inputBase}
                style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={labelCls} style={{ color: "#0a0a0a" }}>Status</label>
              <select
                value={data.status || ""}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className={inputBase}
                style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: "#d3af37" }}
              >
                <option value="pending">🟡 Pending</option>
                <option value="sent">🟢 Sent</option>
                <option value="failed">🔴 Failed</option>
              </select>
            </div>
          </div>

          {/* Scheduled At */}
          <div className="mb-6">
            <label className={labelCls} style={{ color: "#0a0a0a" }}>Scheduled At</label>
            <input
              type="datetime-local"
              value={data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : ""}
              onChange={(e) => {
                setData({ ...data, scheduled_at: e.target.value });
                setErrors({ ...errors, scheduled_at: undefined });
              }}
              min={nowLocalInputValue()}
              className={`${inputBase} ${errors.scheduled_at ? "border-red-500 ring-1 ring-red-500" : ""}`}
              style={{ backgroundColor: "#f0f0f0", color: "#0a0a0a", borderColor: errors.scheduled_at ? "#ef4444" : "#d3af37" }}
            />
            {errors.scheduled_at && (
              <small className="text-red-600 text-xs mt-1 flex items-center">
                {errors.scheduled_at}
              </small>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Update Notification
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReadonlyRow = ({ row, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td style={{ color: "#0a0a0a" }}>{row.notification_id}</td>
    <td className="font-bold" style={{ color: "#d3af37" }}>{row.title}</td>
    <td className="max-w-[350px] whitespace-pre-wrap break-words" style={{ color: "#0a0a0a" }}>{row.message}</td>
    <td style={{ color: "#0a0a0a" }}>{row.type}</td>
    <td style={{ color: "#0a0a0a" }}>{row.priority}</td>
    <td style={{ color: "#0a0a0a" }}>{formatDT(row.scheduled_at)}</td>
    <td>
      <StatusBadge status={row.status} />
    </td>
    <td style={{ color: "#0a0a0a" }}>{formatDT(row.created_at)}</td>
    <td className="text-right whitespace-nowrap">
      <button 
        className="px-3 py-1 rounded-lg font-semibold text-sm mr-2 transition-all duration-200 hover:opacity-80"
        style={{ backgroundColor: "#d3af37", color: "#0a0a0a" }}
        onClick={() => onEdit(row)}
      >
        Edit
      </button>
      <button 
        className="px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-80"
        style={{ backgroundColor: "#dc2626", color: "#f0f0f0" }}
        onClick={() => onDelete(row)}
      >
        Delete
      </button>
    </td>
  </tr>
);

const NotificationsTable = ({ refreshKey, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
    status: '',
    searchTerm: ''
  });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      const list = extractList(res);
      setRows(list);
      setFilteredRows(list);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Load failed",
        text: err.response?.data?.message || "Error loading notifications",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  const applyFilters = (data, filterState = filters) => {
    return data.filter(row => {
      // Search term filter
      if (filterState.searchTerm) {
        const searchLower = filterState.searchTerm.toLowerCase();
        const searchableFields = [
          row.title || '',
          row.message || '',
          row.type || '',
          row.priority || '',
          row.status || ''
        ];
        const matchesSearch = searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      
      // Date filter - From Date
      if (filterState.dateFrom) {
        const rowDate = new Date(row.created_at);
        const fromDate = new Date(filterState.dateFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        if (rowDate < fromDate) return false;
      }
      
      // Date filter - To Date
      if (filterState.dateTo) {
        const rowDate = new Date(row.created_at);
        const toDate = new Date(filterState.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (rowDate > toDate) return false;
      }
      
      // Type filter
      if (filterState.type && row.type !== filterState.type) {
        return false;
      }
      
      // Status filter
      if (filterState.status && row.status !== filterState.status) {
        return false;
      }
      
      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters to current rows using the new filter state
    const filtered = applyFilters(rows, newFilters);
    setFilteredRows(filtered);
  };

  // Handle search with Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const filtered = applyFilters(rows);
      setFilteredRows(filtered);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      type: '',
      status: '',
      searchTerm: ''
    });
    setFilteredRows(rows);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Reapply filters when rows data changes
  useEffect(() => {
    if (rows.length > 0) {
      const filtered = applyFilters(rows);
      setFilteredRows(filtered);
    }
  }, [rows]);

  const startEdit = (row) => setEditingNotification(row);
  const cancelEdit = () => setEditingNotification(null);

  const saveEdit = async (data) => {
    try {
      const id = data.notification_id ?? editingNotification?.notification_id;
      await axios.put(`${API}/${encodeURIComponent(id)}`, data);
      Swal.fire({ icon: "success", title: "Saved", timer: 1200, showConfirmButton: false });
      setEditingNotification(null);
      await fetchRows();
      onChanged && onChanged();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.response?.data?.message || "Error updating notification",
      });
    }
  };

  const deleteRow = async (row) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete notification?",
      text: `ID: ${row.notification_id}`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API}/${encodeURIComponent(row.notification_id)}`);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      await fetchRows();
      onChanged && onChanged();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err.response?.data?.message || "Error deleting notification",
      });
    }
  };

  const body = (() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-8" style={{ color: "#0a0a0a" }}>
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </td>
        </tr>
      );
    }
    if (!filteredRows.length) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-8" style={{ color: "#0a0a0a" }}>
            {rows.length === 0 ? "No notifications yet." : "No notifications match the current filters."}
          </td>
        </tr>
      );
    }
    return filteredRows.map((r) => (
      <ReadonlyRow key={r.notification_id} row={r} onEdit={startEdit} onDelete={deleteRow} />
    ));
  })();

  return (
    <>
      {/* Edit Modal */}
      {editingNotification && (
        <EditModal
          notification={editingNotification}
          onSave={saveEdit}
          onClose={cancelEdit}
        />
      )}

      <div className="mx-auto max-w-6xl my-10 bg-white rounded-2xl shadow-lg p-6" style={{ backgroundColor: "#f0f0f0" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="m-0 text-2xl font-bold" style={{ color: "#d3af37" }}>Notifications</h3>
          <button
            className="px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "#0a0a0a", color: "#f0f0f0" }}
            onClick={fetchRows}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold" style={{ color: "#0a0a0a" }}>Filters</h4>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm rounded-lg border transition-all duration-200 hover:opacity-80"
              style={{ borderColor: "#d3af37", color: "#d3af37" }}
            >
              Clear All
            </button>
          </div>
          
          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: "#0a0a0a" }}>
              Search Notifications
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by title, message, type, priority, or status..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  style={{ backgroundColor: "#f9f9f9" }}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => {
                  const filtered = applyFilters(rows);
                  setFilteredRows(filtered);
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-80 flex items-center gap-2"
                style={{ backgroundColor: "#d3af37", color: "#0a0a0a" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#0a0a0a" }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: "#f9f9f9" }}
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#0a0a0a" }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: "#f9f9f9" }}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#0a0a0a" }}>
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <option value="">All Types</option>
                <option value="booking">Booking</option>
                <option value="offer">Offer</option>
                <option value="promotion">Promotion</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#0a0a0a" }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 text-sm" style={{ color: "#666" }}>
            Showing {filteredRows.length} of {rows.length} notifications
            {(filters.dateFrom || filters.dateTo || filters.type || filters.status || filters.searchTerm) && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#d3af37", color: "#0a0a0a" }}>
                Filtered
              </span>
            )}
          </div>

          {/* Active Filters Display */}
          {(filters.dateFrom || filters.dateTo || filters.type || filters.status || filters.searchTerm) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm font-medium" style={{ color: "#0a0a0a" }}>Active filters:</span>
              {filters.searchTerm && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Search: "{filters.searchTerm}"
                </span>
              )}
              {filters.dateFrom && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  From: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  To: {filters.dateTo}
                </span>
              )}
              {filters.type && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Type: {filters.type}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Status: {filters.status}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden">
            <thead>
              <tr className="sticky top-0 z-10" style={{ backgroundColor: "#d3af37" }}>
                {["ID", "Title", "Message", "Type", "Priority", "Scheduled", "Status", "Created", ""].map(
                  (h) => (
                    <th key={h} className="text-left text-sm p-4 font-bold" style={{ color: "#0a0a0a" }}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="[&>tr>td]:p-4 [&>tr>td]:text-sm [&>tr>td]:border-b [&>tr>td]:border-gray-200 [&>tr]:hover:bg-gray-50">
              {body}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NotificationsTable;

/* ---- Tailwind component-level utility classes (in-file) ---- */
// You can move these into a tw `@layer components` in index.css if preferred.
const Btn = ({ className = "", ...props }) => (
  <button
    className={
      "px-3 py-2 rounded-md font-bold transition " + className
    }
    {...props}
  />
);

// Global button styles via class names:
const _ = `
.btn-primary { @apply px-3 py-2 rounded-md font-bold bg-gold text-gun hover:brightness-110 transition; }
.btn-danger { @apply px-3 py-2 rounded-md font-bold bg-red-700 text-white hover:bg-red-600 transition; }
.btn-ghost  { @apply px-3 py-2 rounded-md font-bold border border-gold text-gold hover:bg-gold/10 transition; }
`;
