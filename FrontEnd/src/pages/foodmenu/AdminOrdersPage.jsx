// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import {
//   listOrders,
//   updateOrder,
//   removeOrder,
//   exportOrdersPdf,
// } from "../../api/analyticsApi.js";

// const fmt = (d) => new Date(d).toLocaleString();
// const money = (v) =>
//   new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(v || 0));

// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [q, setQ] = useState("");
//   const [status, setStatus] = useState("");
//   const [type, setType] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErr("");
//       const { data } = await listOrders({ q, status, type, dateFrom, dateTo });
//       setOrders(data);
//     } catch (e) {
//       setErr(e?.response?.data?.message || e.message || "Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   }, [q, status, type, dateFrom, dateTo]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const filtered = useMemo(() => orders, [orders]);

//   const changeStatus = async (id, st) => {
//     try {
//       setLoading(true);
//       await updateOrder(id, { status: st });
//       await load();
//     } catch (e) {
//       alert("Update failed: " + (e?.response?.data?.message || e.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteOrder = async (id) => {
//     if (!window.confirm("Delete this order?")) return;
//     try {
//       setLoading(true);
//       await removeOrder(id);
//       await load();
//     } catch (e) {
//       alert("Delete failed: " + (e?.response?.data?.message || e.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadPdf = async () => {
//     try {
//       const { data } = await exportOrdersPdf({ q, status, type, dateFrom, dateTo });
//       const base = import.meta.env.VITE_API_BASE || "";
//       const url = `${base}/${data.file}`;
//       window.open(url, "_blank");
//     } catch (e) {
//       alert("Export failed: " + (e?.response?.data?.message || e.message));
//     }
//   };

//   return (
//     <div>
//       <h1>Orders – Analysis</h1>

//       {err && (
//         <div className="card" style={{ borderColor: "#ef4444", color: "#b91c1c" }}>
//           {err}
//         </div>
//       )}

//       <div
//         className="card"
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(5,1fr) auto",
//           gap: 8,
//           alignItems: "end",
//         }}
//       >
//         <input
//           className="input"
//           placeholder="Search name/phone/address"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />

//         <select value={status} onChange={(e) => setStatus(e.target.value)}>
//           <option value="">Any status</option>
//           {["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((s) => (
//             <option key={s} value={s}>
//               {s}
//             </option>
//           ))}
//         </select>

//         <select value={type} onChange={(e) => setType(e.target.value)}>
//           <option value="">Any type</option>
//           {["TAKEAWAY", "DINE_IN", "DELIVERY"].map((t) => (
//             <option key={t} value={t}>
//               {t}
//             </option>
//           ))}
//         </select>

//         <input
//           className="input"
//           type="date"
//           value={dateFrom}
//           onChange={(e) => setDateFrom(e.target.value)}
//         />
//         <input
//           className="input"
//           type="date"
//           value={dateTo}
//           onChange={(e) => setDateTo(e.target.value)}
//         />

//         <div style={{ justifySelf: "end" }}>
//           <button className="btn" onClick={load} disabled={loading}>
//             {loading ? "Loading..." : "Filter"}
//           </button>{" "}
//           <button className="btn primary" onClick={downloadPdf} disabled={loading}>
//             Download PDF
//           </button>
//         </div>
//       </div>

//       <div className="card" style={{ marginTop: 12 }}>
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Customer</th>
//               <th>Phone</th>
//               <th>Type</th>
//               <th>Status</th>
//               <th>Items</th>
//               <th>Total</th>
//               <th />
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((o) => (
//               <tr key={o._id}>
//                 <td>{fmt(o.createdAt)}</td>
//                 <td>{o.customer.fullName}</td>
//                 <td>{o.customer.phone}</td>
//                 <td>{o.type}</td>
//                 <td>
//                   <select
//                     value={o.status}
//                     onChange={(e) => changeStatus(o._id, e.target.value)}
//                     disabled={loading}
//                   >
//                     {["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map(
//                       (s) => (
//                         <option key={s} value={s}>
//                           {s}
//                         </option>
//                       )
//                     )}
//                   </select>
//                 </td>
//                 <td>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
//                 <td>{money(o.total)}</td>
//                 <td>
//                   <button
//                     className="btn ghost"
//                     onClick={() => deleteOrder(o._id)}
//                     disabled={loading}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="8" style={{ textAlign: "center", padding: 12 }}>
//                   No orders found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


// src/pages/admin/AnalyticsPage.jsx
import React, { useEffect, useState } from "react";
import { getOverview, exportAnalyticsPdf } from "../../api/analyticsApi.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const money = (v) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(v || 0));

export default function AnalyticsPage() {
  const [range, setRange] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);
    return { start, end };
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await getOverview(range);
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end]);

  const downloadPdf = async () => {
    try {
      const { data: r } = await exportAnalyticsPdf(range);
      if (r?.url)
        window.open((import.meta.env.VITE_API_BASE || "") + r.url, "_blank");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Export failed");
    }
  };

  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  if (err)
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
        {err}
      </div>
    );
  if (!data) return null;

  const COLORS = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#0ea5e9",
    "#9333ea",
    "#f43f5e",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#0a0a0a]">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Comprehensive overview of your business performance
          </p>
        </div>
        <button
          onClick={downloadPdf}
          className="inline-flex items-center rounded-lg bg-[#d3af37] px-4 py-2 text-sm font-medium text-[#0a0a0a] shadow-sm transition hover:bg-[#b89d2e] focus:outline-none focus:ring-2 focus:ring-[#d3af37] focus:ring-offset-2"
        >
          <span className="mr-2">⬇️</span> Download PDF Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-[#f0f0f0] p-4 shadow-sm">
        <span className="text-sm text-gray-600">From</span>
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange((s) => ({ ...s, start: e.target.value }))}
          className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 transition-colors"
        />
        <span className="text-sm text-gray-600">to</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange((s) => ({ ...s, end: e.target.value }))}
          className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 transition-colors"
        />
        <button
          onClick={load}
          className="ml-auto inline-flex items-center rounded-lg border border-[#d3af37] bg-[#d3af37] px-3 py-2 text-sm font-medium text-[#0a0a0a] shadow-sm transition hover:bg-[#b89d2e] focus:outline-none focus:ring-2 focus:ring-[#d3af37]"
        >
          Apply
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-[#f0f0f0] p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
            {money(data.totals.totalSales)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-[#f0f0f0] p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
            {data.totals.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-[#f0f0f0] p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg. Order Value</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
            {money(data.totals.avgOrderValue)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-[#f0f0f0] p-4 shadow-sm">
          <p className="text-sm text-gray-500">Unique Customers</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
            {data.totals.uniqueCustomers}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Sales Over Time</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(v, n) => (n === "sales" ? money(v) : v)} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Top Products</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v, n) => (n === "revenue" ? money(v) : v)} />
                <Bar dataKey="qty" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Orders by Status</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="count" data={data.byStatus} outerRadius={90} label>
                  {data.byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Revenue by Category</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Top Customers</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Address</th>
                  <th className="px-3 py-2 font-medium">Orders</th>
                  <th className="px-3 py-2 font-medium">Spend</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{c.name}</td>
                    <td className="px-3 py-2 text-gray-900">{c.email}</td>
                    <td className="px-3 py-2 text-gray-900">{c.phone}</td>
                    <td className="px-3 py-2 text-gray-900">{c.address}</td>
                    <td className="px-3 py-2 text-gray-900">{c.orders}</td>
                    <td className="px-3 py-2 text-gray-900">{money(c.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-medium text-gray-900">Recent Orders</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Address</th>
                  <th className="px-3 py-2 font-medium">Items</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">
                      {new Date(o.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 text-gray-900">{o.status}</td>
                    <td className="px-3 py-2 text-gray-900">{o.customer?.name}</td>
                    <td className="px-3 py-2 text-gray-900">
                      {[o.customer?.email, o.customer?.phone]
                        .filter(Boolean)
                        .join(" / ")}
                    </td>
                    <td className="px-3 py-2 text-gray-900">{o.customer?.address}</td>
                    <td className="px-3 py-2 text-gray-900">
                      {(o.items || [])
                        .slice(0, 3)
                        .map((it) => `${it.name}×${it.qty}`)
                        .join(", ")}
                      {(o.items || []).length > 3 ? "…" : ""}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900">
                      {money(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
