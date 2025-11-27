import React, { useEffect, useMemo, useState } from "react";
import SafariCard from "../../components/safaripakage/SafariCard.jsx";
import Header from "../../components/Header.jsx";
import AuthHeader from "../../components/AuthHeader.jsx";
import { getPackages } from "../../utils/api";

export default function VisitorPage() {
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("relevance");

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          JSON.parse(userData); // Validate JSON
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login/logout events
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setErr(""); setLoading(true);
        const res = await getPackages({ search }, { signal: ac.signal });
        const list = Array.isArray(res) ? res : res?.data || [];
        setAllPackages(list);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e?.message || "Failed to load packages");
      } finally { setLoading(false); }
    })();
    return () => ac.abort();
  }, []);

  const packages = useMemo(() => {
    let rows = [...allPackages];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((p) => {
        const t = `${p?.destination ?? ""} ${p?.description ?? ""} ${p?.type ?? ""}`.toLowerCase();
        return t.includes(q);
      });
    }
    if (type !== "all") {
      rows = rows.filter((p) => String(p?.type).toLowerCase() === String(type).toLowerCase());
    }
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    rows = rows.filter((p) => {
      const price = Number(p?.price ?? 0);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
    if (sort === "price_asc") rows.sort((a, b) => Number(a?.price ?? 0) - Number(b?.price ?? 0));
    else if (sort === "price_desc") rows.sort((a, b) => Number(b?.price ?? 0) - Number(a?.price ?? 0));
    else if (q) {
      const score = (p) => {
        const dest = String(p?.destination ?? "").toLowerCase();
        const desc = String(p?.description ?? "").toLowerCase();
        let s = 0;
        if (dest.includes(q)) s += 2;
        if (desc.includes(q)) s += 1;
        return -s;
      };
      rows.sort((a, b) => score(a) - score(b));
    }
    return rows;
  }, [allPackages, search, type, minPrice, maxPrice, sort]);

  const clearFilters = () => { setSearch(""); setType("all"); setMinPrice(""); setMaxPrice(""); setSort("relevance"); };
  const input = "h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? <AuthHeader /> : <Header />}
      <div className="pt-16 mx-auto max-w-[1200px] px-4 py-6">
        <h1 className="mb-1 text-center text-3xl font-semibold text-[#0a0a0a]">Amazing Safari Adventures</h1>
        <p className="mb-4 text-center text-gray-500">Discover breathtaking wildlife experiences</p>

      <div className="mb-3 rounded-xl bg-[#f0f0f0] p-3 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input className={`${input} min-w-[260px]`} placeholder="Search destination or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              <option value="Luxury">Luxury</option>
              <option value="Semi-Luxury">Semi-Luxury</option>
              <option value="Budget">Budget</option>
            </select>
            <input className={input} type="number" min="0" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: 120 }} />
            <input className={input} type="number" min="0" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: 120 }} />
            <select className={input} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Sort: Price (Low → High)</option>
              <option value="price_desc">Sort: Price (High → Low)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="h-10 rounded-xl border border-[#d3af37] bg-[#d3af37] px-4 font-semibold text-[#0a0a0a] hover:bg-[#b89d2e] transition-colors" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {err && <div className="my-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Error: {err}</div>}

      {loading ? (
        <div className="text-center text-gray-500">Loading packages…</div>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-500">
            Showing <b className="text-gray-900">{packages.length}</b> package{packages.length !== 1 ? "s" : ""}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (<SafariCard key={pkg._id} pkg={pkg} />))}
          </div>

          {packages.length === 0 && (
            <div className="mt-6 text-center text-gray-400">No packages match your filters.</div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
