import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getBookings, getAnalytics, downloadReport } from "../../utils/api";

const toISO = (d) => new Date(d).toISOString().slice(0, 10);
const today = toISO(new Date());
const firstOfMonth = toISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

export default function AdminBookingsDashboard() {
  const [rows, setRows] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [a, b] = await Promise.all([
        getAnalytics({ period, from, to }),
        getBookings({ from, to, page, limit, search }),
      ]);
      setAnalytics(Array.isArray(a) ? a : (a?.data || []));
      setRows(Array.isArray(b) ? b : (b?.rows || b?.data || []));
    } catch (e) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [period, from, to, page, limit, search]);

  useEffect(() => { load(); }, [load]);

  const totalSales = useMemo(
    () => rows.reduce((s, r) => s + Number(r.price || 0), 0), [rows]
  );
  const totalVisitors = useMemo(
    () => rows.reduce((s, r) => s + Number(r.visitors || 0), 0), [rows]
  );

  const input = "h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 transition-colors";
  const btn = "h-10 rounded-xl px-4 font-semibold text-white shadow transition active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed";
  const btnAmber = `${btn} bg-[#d3af37] hover:bg-[#b89d2e] text-[#0a0a0a]`;
  const btnOutline = "h-10 rounded-xl border border-[#d3af37] bg-[#d3af37] px-4 font-semibold text-[#0a0a0a] shadow-sm hover:bg-[#b89d2e]";

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-[#f0f0f0] p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={input} />
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={input} />
            <label className="text-xs text-gray-500">Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className={input}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <input
              className={`${input} min-w-[240px]`}
              placeholder="name, email, destination…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <label className="text-xs text-gray-500">Page size</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className={input}>
              {[20, 50, 100].map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
            <button className={btnAmber} onClick={load} disabled={loading}>{loading ? "…" : "Refresh"}</button>
            <button className={btnOutline} onClick={() => downloadReport({ period, from, to })}>Download PDF</button>
          </div>

          <div className="inline-flex items-center gap-2">
            <button className={btnAmber} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>Prev</button>
            <span className="text-sm">Page {page}</span>
            <button className={btnAmber} onClick={() => setPage((p) => p + 1)} disabled={loading}>Next</button>
          </div>
        </div>
      </div>

      {err && <div className="my-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Error: {err}</div>}

      <div className="rounded-2xl bg-[#f0f0f0] p-4 shadow">
        <h4 className="mb-2 text-base font-semibold text-[#0a0a0a]">Analytics ({period})</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#d3af37] text-[#0a0a0a]">
                {["Period Start","Total Bookings","Total Visitors","Total Sales (Rs.)"].map((h)=>(
                  <th key={h} className="border border-gray-100 px-3 py-2 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.length === 0 && (
                <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-400">No data</td></tr>
              )}
              {analytics.map((a, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-100 px-3 py-2">{new Date(a.periodStart).toISOString().slice(0, 10)}</td>
                  <td className="border border-gray-100 px-3 py-2">{a.count}</td>
                  <td className="border border-gray-100 px-3 py-2">{a.totalVisitors}</td>
                  <td className="border border-gray-100 px-3 py-2">{Number(a.totalSales).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-[#f0f0f0] p-4 shadow">
        <h4 className="mb-2 text-base font-semibold text-[#0a0a0a]">Bookings</h4>
        <div className="mb-2 flex gap-6 text-sm">
          <span className="text-gray-600">Total Visitors: <b className="text-gray-900">{totalVisitors}</b></span>
          <span className="text-gray-600">Total Sales: <b className="text-gray-900">Rs. {totalSales.toLocaleString()}</b></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#d3af37] text-[#0a0a0a]">
                {["Date","Name","Email","Phone","Destination","Type","Visitors","Price (Rs.)"].map((h)=>(
                  <th key={h} className="border border-gray-100 px-3 py-2 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan="8" className="px-3 py-6 text-center text-gray-400">No bookings</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="even:bg-gray-50">
                  <td className="border border-gray-100 px-3 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.name}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.email}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.phone}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.package?.destination ?? "-"}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.package?.type ?? "-"}</td>
                  <td className="border border-gray-100 px-3 py-2">{r.visitors}</td>
                  <td className="border border-gray-100 px-3 py-2">{Number(r.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
