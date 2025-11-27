import React, { useEffect, useState, useMemo } from "react";

// Adjust this to your backend URL or set VITE_API_URL in .env
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchAllUsers(signal) {
  const res = await fetch(`${API_BASE}/api/user/all`, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Expected an array of users");
  return data;
}

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    fetchAllUsers(ctrl.signal)
      .then(setUsers)
      .catch((e) => setError(e.message || "Failed to load users"))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return users;
    const s = q.toLowerCase();
    return users.filter((u) =>
      [u.email, u.firstName, u.lastName, u.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, users]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-sm text-gray-500">Fetched from MongoDB via /api/user/all</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, role..."
            className="w-full sm:w-72 px-3 py-2 border rounded-lg bg-white"
          />
        </header>

        {loading && (
          <div className="p-4 bg-white border rounded-lg shadow-sm">Loading users…</div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            Failed to load users: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-100 text-left text-sm">
                  <th className="p-3 w-64">Email</th>
                  <th className="p-3 w-40">First Name</th>
                  <th className="p-3 w-40">Last Name</th>
                  <th className="p-3 w-28">Role</th>
                  <th className="p-3 w-28">Verified</th>
                  <th className="p-3 w-28">Disabled</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u._id} className="border-t text-sm">
                      <td className="p-3 truncate">{u.email}</td>
                      <td className="p-3 truncate">{u.firstName}</td>
                      <td className="p-3 truncate">{u.lastName}</td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">{String(u.isEmailVerified ?? false)}</td>
                      <td className="p-3">{String(u.isDisabled ?? false)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-3 py-2 text-xs text-gray-500 border-t">
              Showing {filtered.length} of {users.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*
Usage:
1) Ensure backend route exists and returns an array:
   GET http://localhost:5000/api/user/all -> [{ _id, email, firstName, lastName, role, isEmailVerified, isDisabled }]

2) In your frontend (Vite React):
   - Add this file as src/components/UsersTable.jsx
   - Import and render: <UsersTable />

3) Optional: Set VITE_API_URL in your .env file (frontend root):
   VITE_API_URL=http://localhost:5000

4) If you prefer proxy instead of env var, set Vite dev proxy:
   // vite.config.ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   export default defineConfig({
     plugins: [react()],
     server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } }
   })
   Then change API_BASE above to just "" and call "/api/user/all".
*/
