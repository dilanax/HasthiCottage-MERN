import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit,
  RefreshCcw,
  BarChart3,
  Filter,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Home,
  DollarSign,
} from "lucide-react";
import ReservationAnalytics from "../../../components/admin/ReservationAnalytics";
import CreateReservationModal from "../../../components/reservations/CreateReservationModal";
import RoomTypeDropdownWithCRUD from "../../../components/common/RoomTypeDropdownWithCRUD";

/** Adjust if your API is different */
const API_BASE = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/reservations`;

const C_BG = "#f0f0f0";
const C_TEXT = "#0a0a0a";
const C_ACCENT = "#d3af37";
const C_HEADER = "#d3af37";
const C_SUCCESS = "#10b981";
const C_DANGER = "#ef4444";
const C_WARNING = "#f59e0b";
const C_INFO = "#3b82f6";

export default function ReservationsAdmin() {
  const [sp, setSp] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(sp.get("page") || 1));
  const [limit, setLimit] = useState(Number(sp.get("limit") || 10));
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // reservation being edited
  const [confirm, setConfirm] = useState(null); // id for delete confirm
  const [showAnalytics, setShowAnalytics] = useState(false); // analytics view toggle
  const [showFilters, setShowFilters] = useState(false); // filters panel toggle
  const [selectedRows, setSelectedRows] = useState([]); // bulk selection
  const [viewMode, setViewMode] = useState('table'); // table or card view
  const [showCreateModal, setShowCreateModal] = useState(false); // create reservation modal toggle
  const [showDetailsModal, setShowDetailsModal] = useState(false); // reservation details modal toggle
  const [selectedReservation, setSelectedReservation] = useState(null); // selected reservation for details
  const [roomIds, setRoomIds] = useState([]); // available room IDs
  const [globalSearch, setGlobalSearch] = useState(""); // global search term
  const [itemsPerPage, setItemsPerPage] = useState(Number(sp.get("limit") || 10)); // items per page

  const [filters, setFilters] = useState({
    email: sp.get("email") || "",
    reservationNumber: sp.get("reservationNumber") || "",
    from: sp.get("from") || "",
    to: sp.get("to") || "",
    status: sp.get("status") || "",
    paymentStatus: sp.get("paymentStatus") || "",
    roomId: sp.get("roomId") || "",
    amountMin: sp.get("amountMin") || "",
    amountMax: sp.get("amountMax") || "",
    sort: sp.get("sort") || "createdAt:desc",
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Fetch available room IDs
  const fetchRoomIds = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/room/ids`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRoomIds(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching room IDs:", error);
      setRoomIds([]);
    }
  };

  // Update token when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case token was updated in same tab
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  // Fetch room IDs on component mount
  useEffect(() => {
    fetchRoomIds();
  }, [token]);

  // Sync itemsPerPage with limit and update URL
  useEffect(() => {
    setLimit(itemsPerPage);
    setPage(1); // Reset to first page when changing items per page
    applySearchParams({ limit: String(itemsPerPage), page: "1" });
  }, [itemsPerPage]);

  // Debounced global search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalSearch !== "") {
        setPage(1); // Reset to first page when searching
        applySearchParams({ page: "1" });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [globalSearch]);

  const applySearchParams = (obj) => {
    const next = new URLSearchParams({
      ...Object.fromEntries(sp.entries()),
      ...obj,
      page: String(page),
    });
    setSp(next, { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        for (const k of ["email", "reservationNumber", "from", "to", "status", "paymentStatus", "roomId", "amountMin", "amountMax", "sort"]) {
          if (filters[k]) qs.set(k, filters[k]);
        }
        if (globalSearch) qs.set("email", globalSearch);
        const { data } = await axios.get(`${API_BASE}/admin?${qs.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const list = data?.data || data?.reservations || [];
        setRows(Array.isArray(list) ? list : []);
        setTotal(Number(data?.total || list.length));
      } catch (e) {
        console.error(e);
        if (e.response?.status === 403) {
          alert("Access denied. Please login with admin credentials.");
          // Redirect to login or clear token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          window.location.href = "/login";
        } else if (e.response?.status === 401) {
          alert("Authentication required. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          window.location.href = "/login";
        } else {
          alert("Failed to load reservations: " + (e.response?.data?.error || e.message));
        }
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.email, filters.reservationNumber, filters.from, filters.to, filters.status, filters.paymentStatus, filters.roomId, filters.amountMin, filters.amountMax, filters.sort, globalSearch, token]);

  const onChange = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const resetFilters = () => {
    setFilters({
      email: "",
      reservationNumber: "",
      from: "",
      to: "",
      status: "",
      paymentStatus: "",
      roomId: "",
      amountMin: "",
      amountMax: "",
      sort: "createdAt:desc",
    });
    setPage(1);
    setSp({});
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const deleteOne = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${API_BASE}/admin/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setConfirm(null);
      // refresh
      const newRows = rows.filter((r) => r._id !== id);
      setRows(newRows);
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Delete failed");
    }
  };

  const saveEdit = async (id, patch) => {
    try {
      const { data } = await axios.put(`${API_BASE}/admin/${id}`, patch, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const updated = data?.reservation || data;
      setRows((rs) => rs.map((r) => (r._id === id ? updated : r)));
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Update failed");
    }
  };

  const handleReservationCreated = (newReservation) => {
    // Refresh the reservations list
    window.location.reload();
  };

  // Handle edit function
  const handleEdit = (item) => {
    setEditing(item);
  };

  // Handle view details function
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  // Load function to refresh data (adapted from your example)
  const load = () => {
    // Refresh the reservations list
    window.location.reload();
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedRows.length} reservation(s)?`);
    if (!confirmed) return;
    
    try {
      await Promise.all(
        selectedRows.map(id => 
          axios.delete(`${API_BASE}/admin/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
        )
      );
      setSelectedRows([]);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Some deletions failed");
    }
  };

  // Bulk status change function
  const handleBulkStatusChange = async () => {
    if (selectedRows.length === 0) return;
    
    const newStatus = prompt("Enter new status (booked, pending, cancelled):");
    if (!newStatus || !['booked', 'pending', 'cancelled'].includes(newStatus)) {
      alert("Invalid status");
      return;
    }
    
    try {
      await Promise.all(
        selectedRows.map(id => 
          axios.put(`${API_BASE}/admin/${id}`, { status: newStatus }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
        )
      );
      setSelectedRows([]);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Some updates failed");
    }
  };

  // Show analytics view if toggled
  if (showAnalytics) {
    return (
      <div className="min-h-screen" style={{ background: C_BG, color: C_TEXT }}>
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold md:text-3xl">Reservation Analytics</h1>
            <button
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-xl"
              style={{ backgroundColor: C_ACCENT, color: C_TEXT }}
              onClick={() => setShowAnalytics(false)}
            >
              <BarChart3 className="w-4 h-4" /> Back to Reservations
            </button>
          </header>
          <ReservationAnalytics />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C_BG, color: C_TEXT }}>
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showDetailsModal ? 'mr-96' : ''}`}>
          <div className="px-4 py-6 mx-auto max-w-[95%] xl:max-w-[90%] 2xl:max-w-[85%]">
        {/* Header matching Safari Package UI */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: C_TEXT }}>RESERVATION MANAGEMENT - ADMIN</h1>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <button
              className="px-4 py-2 font-medium rounded-lg"
              style={{ backgroundColor: C_ACCENT, color: C_TEXT }}
            >
              Table View
            </button>
            <button
              className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              Create Reservation
            </button>
            <button
              className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowAnalytics(true)}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Simple Filter Bar */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: C_ACCENT }}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
          
          {/* Basic Filters - Always Visible */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Guest</label>
              <input
                value={filters.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="Email or name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reservation Number</label>
              <input
                value={filters.reservationNumber}
                onChange={(e) => onChange("reservationNumber", e.target.value)}
                placeholder="Reservation #"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Check-in From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onChange("from", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Check-in To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onChange("to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <div className="flex space-x-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-3 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                  style={{ backgroundColor: C_ACCENT }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters - Toggleable */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Advanced Filters</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Room ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Room ID</label>
                  <select
                    value={filters.roomId}
                    onChange={(e) => onChange("roomId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Room IDs</option>
                    {roomIds.map((roomId) => (
                      <option key={roomId} value={roomId}>
                        {roomId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reservation Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => onChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="booked">Booked</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => onChange("paymentStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Min Amount</label>
                  <input
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => onChange("amountMin", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Max Amount</label>
                  <input
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => onChange("amountMax", e.target.value)}
                    placeholder="No limit"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => onChange("sort", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt:desc">Newest First</option>
                    <option value="createdAt:asc">Oldest First</option>
                    <option value="checkIn:asc">Check-in ↑</option>
                    <option value="checkIn:desc">Check-in ↓</option>
                    <option value="totalAmount:desc">Amount ↓</option>
                    <option value="totalAmount:asc">Amount ↑</option>
                    <option value="status:asc">Status A-Z</option>
                    <option value="status:desc">Status Z-A</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {rows.length} of {total} reservations
        </div>

        {/* Enhanced Table with Advanced Features */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Enhanced Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-lg font-semibold text-gray-900">
                  Reservations ({total})
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {rows.filter(r => r.status === 'booked').length} Booked
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {rows.filter(r => r.status === 'pending').length} Pending
                  </div>
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {rows.filter(r => r.status === 'cancelled').length} Cancelled
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedRows([])}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
                 <button
                   onClick={() => window.location.reload()}
                   className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center space-x-2"
                 >
                   <RefreshCcw className="w-4 h-4" />
                   <span>Refresh</span>
                 </button>
              </div>
            </div>
            
            {/* Global Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={globalSearch}
                    placeholder="Search reservations, guests, emails, amounts..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setGlobalSearch(e.target.value)}
                  />
                  {globalSearch && (
                    <button
                      onClick={() => setGlobalSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: C_HEADER }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === rows.length && rows.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(rows.map(r => r._id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Select</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>Reservation #</span>
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3" />
                        <ChevronDown className="w-3 h-3 -mt-1" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>Guest</span>
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3" />
                        <ChevronDown className="w-3 h-3 -mt-1" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>Check-in</span>
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3" />
                        <ChevronDown className="w-3 h-3 -mt-1" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>Check-out</span>
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3" />
                        <ChevronDown className="w-3 h-3 -mt-1" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-yellow-600 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3" />
                        <ChevronDown className="w-3 h-3 -mt-1" />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: C_ACCENT }}></div>
                        <span className="ml-3 text-gray-500">Loading reservations...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((r) => (
                    <tr key={r._id} className={`hover:bg-gray-50 transition-colors ${selectedRows.includes(r._id) ? 'bg-blue-50' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(r._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, r._id]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== r._id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      {/* Reservation Number */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">
                            #{r.reservationNumber || "—"}
                          </div>
                          {r.adminReservation && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {iso(r.createdAt)}
                        </div>
                      </td>
                      
                      {/* Guest Info */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {r.guest?.firstName?.charAt(0)}{r.guest?.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {r.guest?.firstName} {r.guest?.lastName}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {r.guest?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Check-in */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {iso(r.checkIn)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.checkIn).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </td>
                      
                      {/* Check-out */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {iso(r.checkOut)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.checkOut).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </td>
                      
                      {/* Rooms */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {r.roomsWanted} room{r.roomsWanted > 1 ? 's' : ''}
                        </div>
                        {r.adminReservation && (
                          <div className="text-xs text-yellow-600 font-medium">
                            🏨 {r.adminReservation.roomId}
                          </div>
                        )}
                      </td>
                      
                      {/* Guests */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {r.adults} adult{r.adults > 1 ? 's' : ''}
                        </div>
                        {r.children > 0 && (
                          <div className="text-xs text-gray-500">
                            {r.children} child{(r.children || 0) > 1 ? 'ren' : ''}
                          </div>
                        )}
                      </td>
                      
                      {/* Amount */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {r.currency || "USD"} {fmt(r.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.paymentStatus || 'pending'}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      
                      {/* Payment Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <PaymentStatusBadge status={r.paymentStatus} />
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            onClick={() => handleViewDetails(r)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                            onClick={() => handleEdit(r)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            onClick={() => setConfirm(r)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search criteria or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} reservations
                </div>
                {selectedRows.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedRows.length} selected
                    </span>
                    <button
                      onClick={() => handleBulkDelete()}
                      className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange()}
                      className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Change Status
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          accent={C_ACCENT}
          text={C_TEXT}
        />
      )}

      {/* Delete confirm */}
      {confirm && (
        <ConfirmDialog
          title="Delete reservation?"
          message={`This will permanently delete reservation #${confirm.reservationNumber}.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => deleteOne(confirm._id)}
          accent={C_ACCENT}
          text={C_TEXT}
        />
      )}
        </div>

        {/* Right Sidebar for Reservation Details */}
        {showDetailsModal && selectedReservation && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="bg-gray-50 border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Reservation #{selectedReservation.reservationNumber}
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Guest Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Guest Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Full Name</label>
                      <p className="text-sm text-gray-900">{selectedReservation.guest?.firstName} {selectedReservation.guest?.lastName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900 break-all">{selectedReservation.guest?.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedReservation.guest?.phone || "Not provided"}</p>
                    </div>
                    {selectedReservation.guest?.countryCode && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Country Code</label>
                        <p className="text-sm text-gray-900">{selectedReservation.guest.countryCode}</p>
                      </div>
                    )}
                    {selectedReservation.guest?.phoneNumber && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Phone Number</label>
                        <p className="text-sm text-gray-900">{selectedReservation.guest.phoneNumber}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-600">Country</label>
                      <p className="text-sm text-gray-900">{selectedReservation.guest?.country || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Reservation Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Check-in</label>
                      <p className="text-sm text-gray-900">{iso(selectedReservation.checkIn)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Check-out</label>
                      <p className="text-sm text-gray-900">{iso(selectedReservation.checkOut)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Rooms</label>
                      <p className="text-sm text-gray-900">{selectedReservation.roomsWanted} room{selectedReservation.roomsWanted > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Guests</label>
                      <p className="text-sm text-gray-900">{selectedReservation.adults} adult{selectedReservation.adults > 1 ? 's' : ''}, {selectedReservation.children || 0} child{(selectedReservation.children || 0) > 1 ? 'ren' : ''}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <StatusBadge status={selectedReservation.status} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Created</label>
                      <p className="text-sm text-gray-900">{iso(selectedReservation.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Reserved Rooms */}
                {selectedReservation.reservedRooms && selectedReservation.reservedRooms.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Reserved Rooms</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Room Count</label>
                        <p className="text-sm text-gray-900">{selectedReservation.reservedRooms.length} room{selectedReservation.reservedRooms.length > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Room IDs</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedReservation.reservedRooms.map((room, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {room}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Package Information */}
                {selectedReservation.package && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Room ID</label>
                        <p className="text-sm text-gray-900">{selectedReservation.package.roomId}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Adults Included</label>
                        <p className="text-sm text-gray-900">{selectedReservation.package.adultsIncluded}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Price (USD)</label>
                        <p className="text-sm text-gray-900">${selectedReservation.package.priceUSD}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Price (LKR)</label>
                        <p className="text-sm text-gray-900">LKR {selectedReservation.package.priceLKR}</p>
                      </div>
                      {selectedReservation.package.wasPriceUSD && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">Was Price (USD)</label>
                          <p className="text-sm text-gray-900 line-through">${selectedReservation.package.wasPriceUSD}</p>
                        </div>
                      )}
                      {selectedReservation.package.taxesAndChargesUSD && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">Taxes & Charges (USD)</label>
                          <p className="text-sm text-gray-900">${selectedReservation.package.taxesAndChargesUSD}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Reservation Details */}
                {selectedReservation.adminReservation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-3">🏨 Admin Reservation</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-yellow-700">Custom Room ID</label>
                        <p className="text-sm text-yellow-900">{selectedReservation.adminReservation.roomId}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-yellow-700">Custom Price/Night</label>
                        <p className="text-sm text-yellow-900">{selectedReservation.adminReservation.pricePerNight}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-yellow-700">Adults Included</label>
                        <p className="text-sm text-yellow-900">{selectedReservation.adminReservation.adultsIncluded}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Payment Status</label>
                      <div className="mt-1">
                        <PaymentStatusBadge status={selectedReservation.paymentStatus} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Payment Intent ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedReservation.paymentIntentId || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Arrival Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Arrival Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Expected Arrival Window</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedReservation.arrivalWindow || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Options</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Travelling with Pet</label>
                      <p className="text-sm text-gray-900">{selectedReservation.travellingWithPet ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Safari Requested</label>
                      <p className="text-sm text-gray-900">{selectedReservation.safariRequested ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">System Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Reservation ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedReservation._id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Created At</label>
                      <p className="text-sm text-gray-900">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Updated At</label>
                      <p className="text-sm text-gray-900">{new Date(selectedReservation.updatedAt).toLocaleString()}</p>
                    </div>
                    {selectedReservation.idempotencyKey && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Idempotency Key</label>
                        <p className="text-sm text-gray-900 font-mono text-xs">{selectedReservation.idempotencyKey}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Total Amount</label>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedReservation.currency || "USD"} {fmt(selectedReservation.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Currency</label>
                      <p className="text-sm text-gray-900">{selectedReservation.currency || "USD"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="bg-gray-50 border-t px-6 py-4">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(selectedReservation);
                    }}
                    className="w-full px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                    style={{ backgroundColor: C_ACCENT }}
                  >
                    Edit Reservation
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleReservationCreated}
      />
    </div>
  );
}

// Enhanced StatCard Component
function StatCard({ title, value, subtitle, icon: Icon, color = C_ACCENT }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color }}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// StatusBadge Component matching Safari Package type badges
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return {
          bgColor: '#3b82f6', // Blue like Semi-Luxury
          textColor: '#ffffff',
          label: 'Booked'
        };
      case 'pending':
        return {
          bgColor: '#f59e0b', // Yellow like Luxury
          textColor: '#ffffff',
          label: 'Pending'
        };
      case 'cancelled':
        return {
          bgColor: '#ef4444', // Red
          textColor: '#ffffff',
          label: 'Cancelled'
        };
      default:
        return {
          bgColor: '#6b7280', // Gray
          textColor: '#ffffff',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor 
      }}
    >
      {config.label}
    </span>
  );
}

// Helper functions
const iso = (d) => (d ? String(d).slice(0, 10) : "—");
const fmt = (n) => Intl.NumberFormat().format(Number(n || 0));

function EditModal({ row, onClose, onSave, accent, text }) {
  const [form, setForm] = useState({
    // Basic reservation fields
    status: row.status || "booked",
    checkIn: iso(row.checkIn),
    checkOut: iso(row.checkOut),
    adults: row.adults ?? 1,
    children: row.children ?? 0,
    roomsWanted: row.roomsWanted ?? 1,
    
    // Guest information
    guest: {
      firstName: row.guest?.firstName || "",
      lastName: row.guest?.lastName || "",
      email: row.guest?.email || "",
      phone: row.guest?.phone || "",
      country: row.guest?.country || "",
      countryCode: row.guest?.countryCode || "LK",
      phoneNumber: row.guest?.phoneNumber || "",
    },
    
    // Additional options
    travellingWithPet: row.travellingWithPet || false,
    safariRequested: row.safariRequested || false,
    arrivalWindow: row.arrivalWindow || "unknown",
    roomType: row.roomType || "",
    
    // Pricing
    totalAmount: row.totalAmount || 0,
    currency: row.currency || "LKR",
    paymentStatus: row.paymentStatus || "pending",
    
    // Admin reservation
    adminReservation: {
      roomId: row.adminReservation?.roomId || "",
      customPricePerNight: row.adminReservation?.customPricePerNight || 0,
      adultsIncluded: row.adminReservation?.adultsIncluded || 2,
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setGuest = (k, v) => setForm((f) => ({ 
    ...f, 
    guest: { ...f.guest, [k]: v } 
  }));
  const setAdmin = (k, v) => setForm((f) => ({ 
    ...f, 
    adminReservation: { ...f.adminReservation, [k]: v } 
  }));

  // Handle phone number changes
  const handlePhoneChange = (value) => {
    setGuest("phone", value || "");
    if (value) {
      const countryCode = value.split(' ')[0] || '';
      const phoneNumber = value.replace(countryCode, '').trim();
      setGuest("countryCode", countryCode);
      setGuest("phoneNumber", phoneNumber);
    } else {
      setGuest("countryCode", "");
      setGuest("phoneNumber", "");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Guest validation
    if (!form.guest.firstName.trim()) newErrors.guestFirstName = "First name is required";
    if (!form.guest.lastName.trim()) newErrors.guestLastName = "Last name is required";
    if (!form.guest.email.trim()) newErrors.guestEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest.email)) newErrors.guestEmail = "Invalid email format";
    
    // Date validation
    if (form.checkIn && form.checkOut && new Date(form.checkIn) >= new Date(form.checkOut)) {
      newErrors.checkOut = "Check-out must be after check-in";
    }
    
    // Number validation
    if (form.adults < 1) newErrors.adults = "At least 1 adult required";
    if (form.children < 0) newErrors.children = "Children cannot be negative";
    if (form.roomsWanted < 1) newErrors.roomsWanted = "At least 1 room required";
    if (form.totalAmount < 0) newErrors.totalAmount = "Amount cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const patch = {
        // Basic fields
        status: form.status,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        roomsWanted: form.roomsWanted,
        
        // Guest information
        guest: form.guest,
        
        // Additional options
        travellingWithPet: form.travellingWithPet,
        safariRequested: form.safariRequested,
        arrivalWindow: form.arrivalWindow,
        roomType: form.roomType,
        
        // Pricing
        totalAmount: form.totalAmount,
        currency: form.currency,
        paymentStatus: form.paymentStatus,
        
        // Admin reservation
        adminReservation: form.adminReservation,
      };
      
      await onSave(row._id, patch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Reservation #{row.reservationNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-8">
          <style jsx>{`
            .phone-input-container .PhoneInputInput {
              border: none;
              outline: none;
              padding: 0.5rem;
              font-size: 0.875rem;
              width: 100%;
            }
            .phone-input-container .PhoneInputCountrySelect {
              border: none;
              outline: none;
              padding: 0.5rem;
              background: transparent;
            }
            .phone-input-container {
              border: 1px solid #d1d5db;
              border-radius: 0.5rem;
              padding: 0.5rem;
              display: flex;
              align-items: center;
              background: white;
            }
            .phone-input-container:focus-within {
              border-color: #d3af37;
              box-shadow: 0 0 0 2px rgba(211, 175, 55, 0.2);
            }
          `}</style>
          
          {/* Guest Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name *</label>
                <input 
                  type="text" 
                  value={form.guest.firstName} 
                  onChange={(e) => setGuest("firstName", e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.guestFirstName ? "border-red-500" : ""
                  }`}
                />
                {errors.guestFirstName && <p className="text-sm text-red-600">{errors.guestFirstName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name *</label>
                <input 
                  type="text" 
                  value={form.guest.lastName} 
                  onChange={(e) => setGuest("lastName", e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.guestLastName ? "border-red-500" : ""
                  }`}
                />
                {errors.guestLastName && <p className="text-sm text-red-600">{errors.guestLastName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input 
                  type="email" 
                  value={form.guest.email} 
                  onChange={(e) => setGuest("email", e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.guestEmail ? "border-red-500" : ""
                  }`}
                />
                {errors.guestEmail && <p className="text-sm text-red-600">{errors.guestEmail}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input 
                  type="text" 
                  value={form.guest.country} 
                  onChange={(e) => setGuest("country", e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <PhoneInput
                  value={form.guest.phone}
                  onChange={handlePhoneChange}
                  defaultCountry="LK"
                  international
                  countryCallingCodeEditable={false}
                  className="phone-input-container"
                  placeholder="Enter phone number (optional)"
                  style={{
                    '--PhoneInputCountryFlag-height': '1.2em',
                    '--PhoneInputCountrySelectArrow-color': '#6b7280',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reservation Details Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={form.status} 
                  onChange={(e) => set("status", e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="booked">Booked</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rooms *</label>
                <input 
                  type="number" 
                  min={1} 
                  value={form.roomsWanted} 
                  onChange={(e) => set("roomsWanted", Number(e.target.value))} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.roomsWanted ? "border-red-500" : ""
                  }`}
                />
                {errors.roomsWanted && <p className="text-sm text-red-600">{errors.roomsWanted}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Adults *</label>
                <input 
                  type="number" 
                  min={1} 
                  value={form.adults} 
                  onChange={(e) => set("adults", Number(e.target.value))} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.adults ? "border-red-500" : ""
                  }`}
                />
                {errors.adults && <p className="text-sm text-red-600">{errors.adults}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Children</label>
                <input 
                  type="number" 
                  min={0} 
                  value={form.children} 
                  onChange={(e) => set("children", Number(e.target.value))} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.children ? "border-red-500" : ""
                  }`}
                />
                {errors.children && <p className="text-sm text-red-600">{errors.children}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Check-in Date *</label>
                <input 
                  type="date" 
                  value={form.checkIn} 
                  onChange={(e) => set("checkIn", e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Check-out Date *</label>
                <input 
                  type="date" 
                  value={form.checkOut} 
                  onChange={(e) => set("checkOut", e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.checkOut ? "border-red-500" : ""
                  }`}
                />
                {errors.checkOut && <p className="text-sm text-red-600">{errors.checkOut}</p>}
              </div>
            </div>
          </div>

          {/* Additional Options Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Arrival Window</label>
                <select 
                  value={form.arrivalWindow} 
                  onChange={(e) => set("arrivalWindow", e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="unknown">Unknown</option>
                  <option value="morning">Morning (6AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-6PM)</option>
                  <option value="evening">Evening (6PM-12AM)</option>
                  <option value="night">Night (12AM-6AM)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Room Type</label>
                <RoomTypeDropdownWithCRUD
                  selectedRoomType={form.roomType}
                  onSelectRoomType={(roomType) => set("roomType", roomType)}
                  placeholder="-- Select Room Type --"
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="travellingWithPet"
                    checked={form.travellingWithPet} 
                    onChange={(e) => set("travellingWithPet", e.target.checked)} 
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="travellingWithPet" className="text-sm font-medium text-gray-700">
                    Travelling with Pet
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="safariRequested"
                    checked={form.safariRequested} 
                    onChange={(e) => set("safariRequested", e.target.checked)} 
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="safariRequested" className="text-sm font-medium text-gray-700">
                    Safari Requested
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total Amount</label>
                <input 
                  type="number" 
                  min={0} 
                  step="0.01"
                  value={form.totalAmount} 
                  onChange={(e) => set("totalAmount", Number(e.target.value))} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.totalAmount ? "border-red-500" : ""
                  }`}
                />
                {errors.totalAmount && <p className="text-sm text-red-600">{errors.totalAmount}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <select 
                  value={form.currency} 
                  onChange={(e) => set("currency", e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Status</label>
                <select 
                  value={form.paymentStatus} 
                  onChange={(e) => set("paymentStatus", e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin Reservation Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">🏨 Admin Reservation Details</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-700">Custom Room ID</label>
                <input 
                  type="text" 
                  value={form.adminReservation.roomId} 
                  onChange={(e) => setAdmin("roomId", e.target.value)} 
                  placeholder="e.g., ROOM-001"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-700">Custom Price/Night</label>
                <input 
                  type="number" 
                  min={0} 
                  step="0.01"
                  value={form.adminReservation.customPricePerNight} 
                  onChange={(e) => setAdmin("customPricePerNight", Number(e.target.value))} 
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-700">Adults Included</label>
                <input 
                  type="number" 
                  min={1} 
                  value={form.adminReservation.adultsIncluded} 
                  onChange={(e) => setAdmin("adultsIncluded", Number(e.target.value))} 
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: C_ACCENT }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm, accent, text }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={onCancel} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Payment Status Badge Component
function PaymentStatusBadge({ status }) {
  const getPaymentStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⏳' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' };
      case 'refunded':
        return { bg: 'bg-purple-100', text: 'text-purple-800', icon: '↩' };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✗' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
    }
  };

  const config = getPaymentStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className="mr-1">{config.icon}</span>
      {status || 'pending'}
    </span>
  );
}
