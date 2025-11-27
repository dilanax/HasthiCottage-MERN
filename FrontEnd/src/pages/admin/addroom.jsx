import React, { useMemo, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";

/**
 * AddRoomPage.jsx — Modern single PAGE to add a Room
 *
 * Backend: POST /api/rooms/create (admin JWT in localStorage.token)
 * Env:     VITE_BACKEND_URL (fallback http://localhost:5000)
 */

const API_BASE = import.meta.env?.VITE_BACKEND_URL || "http://localhost:5000";

function authHeaders(json = true) {
  const token = localStorage.getItem("token");
  const h = { Accept: "application/json" };
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export default function AddRoomPage() {
  const [form, setForm] = useState({
    code: "",
    type: "standard",
    capacity: 2,
    basePriceRupees: 0,
    status: "available",
    floor: 1,
    amenitiesCsv: "WiFi, AC",
    imagesCsv: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const amenities = useMemo(() => splitCsv(form.amenitiesCsv), [form.amenitiesCsv]);
  const images = useMemo(() => splitCsv(form.imagesCsv), [form.imagesCsv]);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    if (!form.code.trim()) return "Room code is required";
    if (!/^[A-Za-z0-9\-_.]+(\s*[A-Za-z0-9\-_.]+)*$/.test(form.code)) return "Room code has invalid characters";
    if (!Number.isFinite(Number(form.capacity)) || Number(form.capacity) < 1) return "Capacity must be at least 1";
    if (!Number.isFinite(Number(form.basePriceRupees)) || Number(form.basePriceRupees) < 0) return "Base price must be ≥ 0";
    if (!["standard", "deluxe", "suite"].includes(form.type)) return "Type is invalid";
    if (!["available", "occupied", "maintenance"].includes(form.status)) return "Status is invalid";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }

    const payload = {
      code: form.code.trim(),
      type: form.type,
      capacity: Number(form.capacity) || 1,
      basePriceCents: Math.max(0, Math.round((Number(form.basePriceRupees) || 0) * 100)),
      status: form.status,
      floor: Number(form.floor) || 1,
      amenities,
      images,
      notes: form.notes || "",
    };

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/rooms/create`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.success === false) throw new Error(j?.message || j?.error || `HTTP ${res.status}`);
      setSuccess("Room created successfully");
      // keep some fields for quick add; clear id-specific ones
      setForm((f) => ({ ...f, code: "", imagesCsv: "", notes: "" }));
    } catch (err) {
      setError(err?.message || "Failed to create room");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Page header */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/75 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Rooms</div>
            <h1 className="text-xl font-bold">Add Room</h1>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">POST /api/rooms/create</div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          {/* Hero strip */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-amber-300 to-fuchsia-400" />

          <div className="p-4 md:p-6">
            {error && (
              <div className="flex items-start gap-2 mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-700 text-sm">
                <AlertCircle className="mt-0.5" size={16} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-emerald-800 text-sm">
                <CheckCircle2 className="mt-0.5" size={16} /> {success}
              </div>
            )}

            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Room Code<span className="text-rose-600">*</span></label>
                <input value={form.code} onChange={(e) => update("code", e.target.value)} placeholder="A-101" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Type</label>
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize">
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={(e) => update("capacity", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Base Price (LKR)</label>
                <input type="number" min={0} value={form.basePriceRupees} onChange={(e) => update("basePriceRupees", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="text-xs text-gray-500 mt-1">Stored as cents on the server.</div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize">
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Floor</label>
                <input type="number" min={0} value={form.floor} onChange={(e) => update("floor", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Amenities (comma separated)</label>
                <input value={form.amenitiesCsv} onChange={(e) => update("amenitiesCsv", e.target.value)} placeholder="WiFi, AC, TV, Mini-bar" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                {!!amenities.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenities.map((a, i) => (
                      <span key={i} className="text-xs bg-slate-100 rounded-full px-2 py-0.5">{a}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Image URLs (comma separated)</label>
                <input value={form.imagesCsv} onChange={(e) => update("imagesCsv", e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {images.slice(0, 6).map((src, i) => (
                    <div key={i} className="aspect-video bg-slate-100 rounded-xl overflow-hidden border grid place-items-center">
                      {src ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img src={src} alt={`image-${i}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = placeholderHtml(); }} />
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500"><ImageIcon size={14}/>preview</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="inline-flex items-center rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50">
                  {saving ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Saving…</>) : (<>Save Room</>)}
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, code: "", imagesCsv: "", notes: "" }))} className="px-4 py-2 rounded-xl border hover:bg-gray-50">Clear</button>
              </div>
            </form>
          </div>
        </section>

        <p className="text-xs text-gray-500 mt-4">Requires admin JWT in <code>localStorage.token</code>. API base: {API_BASE}</p>
      </main>
    </div>
  );
}

function splitCsv(v) {
  return String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function placeholderHtml() {
  return `<div class='flex items-center gap-1 text-xs text-gray-400'><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-image'><rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L7 20'/></svg> preview</div>`;
}
