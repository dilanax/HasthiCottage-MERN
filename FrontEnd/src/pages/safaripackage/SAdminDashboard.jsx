import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminBookingsDashboard from "./AdminBookingsDashboard.jsx";
import CreatePackageForm from "./CreatePackageForm.jsx";
import SafariPackageTable from "../../components/safaripakage/SafariPackageTable.jsx";
import EditPackageModal from "../../components/safaripakage/EditPackageModal.jsx";
import SafariBookingAdmin from "../admin/SafariBookingAdmin.jsx";
import { getPackages } from "../../utils/api";

export default function SAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("table");
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("created_desc");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      console.log("Loading packages...");
      console.log("API Base URL:", import.meta?.env?.VITE_API_BASE || "http://localhost:5000");
      
      // Test basic connectivity first
      const testUrl = `${import.meta?.env?.VITE_API_BASE || "http://localhost:5000"}/api/packages`;
      console.log("Testing URL:", testUrl);
      
      const data = await getPackages();
      console.log("Packages loaded:", data);
      setPackages(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error("Error loading packages:", e);
      console.error("Error details:", e.message, e.stack);
      setErr(e?.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setErr(""); // Clear any existing errors
    load(); 
  }, []);

  const filtered = useMemo(() => {
    let rows = [...packages];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((p) => {
        const hay = `${p?.destination ?? ""} ${p?.description ?? ""} ${p?.type ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (type !== "all") {
      rows = rows.filter((p) => String(p?.type).toLowerCase() === String(type).toLowerCase());
    }
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    rows = rows.filter((p) => {
      const price = Number(p?.price ?? 0);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
    if (sort === "price_asc") rows.sort((a, b) => Number(a?.price ?? 0) - Number(b?.price ?? 0));
    else if (sort === "price_desc") rows.sort((a, b) => Number(b?.price ?? 0) - Number(a?.price ?? 0));
    else if (sort === "name_asc") rows.sort((a, b) => String(a?.destination ?? "").localeCompare(String(b?.destination ?? "")));
    else rows.sort((a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime());
    return rows;
  }, [packages, search, type, minPrice, maxPrice, sort]);

  const clearFilters = () => {
    setSearch(""); setType("all"); setMinPrice(""); setMaxPrice(""); setSort("created_desc");
  };

  const tab = (is) => `rounded-xl px-4 py-2 text-sm font-semibold ${is ? "bg-[#d3af37] text-[#0a0a0a]" : "bg-white text-[#0a0a0a] hover:bg-[#f0f0f0]"} shadow-sm transition-colors`;
  const input = "h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 transition-colors";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h2 className="mb-3 text-xl font-semibold text-[#0a0a0a]">Safari Package Management · Admin</h2>

      <div className="flex gap-2 rounded-2xl bg-gray-100 p-2">
        <button className={tab(activeTab === "table")} onClick={() => setActiveTab("table")}>Table View</button>
        <button className={tab(activeTab === "create")} onClick={() => setActiveTab("create")}>Create Package</button>
        <button 
          className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
          onClick={() => setActiveTab("food-bookings")}
        >
           Bookings
        </button>
      </div>

      <div className="mt-4">

        {activeTab === "table" && (
          <>
            {err && <div className="my-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Error: {err}</div>}
            {loading && <div className="my-2 text-center text-gray-500">Loading…</div>}

            <div className="mb-3 rounded-xl bg-[#f0f0f0] p-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className={`${input} min-w-[240px]`}
                    placeholder="Search (destination / description / type)…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="all">All types</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Semi-Luxury">Semi-Luxury</option>
                    <option value="Budget">Budget</option>
                  </select>
                  <input className={`${input} w-[120px]`} type="number" min="0" placeholder="Min price (USD)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <input className={`${input} w-[120px]`} type="number" min="0" placeholder="Max price (USD)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  <select className={input} value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="created_desc">Sort: Newest</option>
                    <option value="price_asc">Sort: Price (Low → High)</option>
                    <option value="price_desc">Sort: Price (High → Low)</option>
                    <option value="name_asc">Sort: Destination (A → Z)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  
                  <button className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg" onClick={clearFilters}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Showing <b className="text-gray-900">{filtered.length}</b> of <b className="text-gray-900">{packages.length}</b> package{packages.length !== 1 ? "s" : ""}
              </div>
            </div>

            <SafariPackageTable
              packages={filtered}
              onRefresh={load}
              onEdit={(pkg) => setEditingPackage(pkg)}
            />

            {editingPackage && (
              <EditPackageModal
                pkg={editingPackage}
                onClose={() => setEditingPackage(null)}
                onUpdated={() => { setEditingPackage(null); load(); }}
              />
            )}
          </>
        )}

        {activeTab === "create" && (
          <CreatePackageForm onCreated={load} onSuccessSwitchToTable={() => setActiveTab("table")} />
        )}

        {activeTab === "food-bookings" && (
          <SafariBookingAdmin />
        )}

      </div>
    </div>
  );
}
