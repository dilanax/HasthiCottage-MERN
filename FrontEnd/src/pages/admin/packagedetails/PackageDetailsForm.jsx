import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/** Axios instance (self-contained) */
const RAW_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const clean = (s) => (s || "").replace(/\/+$/, "");
const API_BASE = `${clean(RAW_BASE)}/api`;
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/** Helpers */
const currency = (n) =>
  n === undefined || n === null
    ? "-"
    : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

function getRoomImage(room) {
  if (!room) return "";
  if (room.imageUrl) return room.imageUrl;
  if (Array.isArray(room.images) && room.images[0]) return room.images[0];
  if (room.photo) return room.photo;
  if (room.cover) return room.cover;
  if (room.thumbnail) return room.thumbnail;
  return "";
}

const emptyForm = {
  adultsIncluded: 2,

  // perks
  perks_freeCancellationAnytime: false,
  perks_noPrepaymentNeeded: false,
  perks_noCreditCardNeeded: false,

  // meals
  meals_breakfastIncluded: false,
  meals_lunchPriceUSD: 0,
  meals_dinnerPriceUSD: 0,

  // discounts / ribbons
  geniusDiscountPercent: 0,
  geniusFreeBreakfast: false,
  ribbonsInput: "",

  // price
  wasPriceUSD: 0,
  priceUSD: 0,
  taxesAndChargesUSD: 0,

  // optional dates
  startDate: "",
  endDate: "",

  isActive: true,
};

export default function AddPackage() {
  // Rooms
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsErr, setRoomsErr] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [roomId, setRoomId] = useState("");

  // Form
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Debug (to diagnose 404s)
  const [lastUrl, setLastUrl] = useState("");
  const [lastError, setLastError] = useState("");

  async function loadRooms() {
    setRoomsLoading(true);
    setRoomsErr("");
    try {
      // IMPORTANT: This calls http://localhost:5000/api/rooms
      const url = "/rooms";
      setLastUrl(`${API_BASE}${url}`);
      const { data } = await api.get(url);
      const list = Array.isArray(data) ? data : (data?.items || []);
      setRooms(list);
    } catch (e) {
      setRoomsErr(e?.response?.data?.message || e.message || "Failed to load rooms");
      setLastError(e?.message || "Rooms request error");
    } finally {
      setRoomsLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r._id === roomId),
    [rooms, roomId]
  );

  const filteredRooms = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) =>
      [r.name, r.type, r.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rooms, roomSearch]);

  function buildPayload() {
    const ribbons =
      (form.ribbonsInput || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    return {
      roomId, // REQUIRED
      adultsIncluded: Number(form.adultsIncluded) || 2,
      perks: {
        freeCancellationAnytime: !!form.perks_freeCancellationAnytime,
        noPrepaymentNeeded: !!form.perks_noPrepaymentNeeded,
        noCreditCardNeeded: !!form.perks_noCreditCardNeeded,
      },
      meals: {
        breakfastIncluded: !!form.meals_breakfastIncluded,
        lunchPriceUSD: Number(form.meals_lunchPriceUSD) || 0,
        dinnerPriceUSD: Number(form.meals_dinnerPriceUSD) || 0,
      },
      geniusDiscountPercent: Number(form.geniusDiscountPercent) || 0,
      geniusFreeBreakfast: !!form.geniusFreeBreakfast,
      ribbons,
      wasPriceUSD: Number(form.wasPriceUSD) || 0,
      priceUSD: Number(form.priceUSD) || 0,
      taxesAndChargesUSD: Number(form.taxesAndChargesUSD) || 0,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      isActive: !!form.isActive,
    };
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setMsg("");
    setLastError("");
    if (!roomId) {
      setMsg("❌ Please select a room first.");
      return;
    }
    try {
      setSaving(true);
      // IMPORTANT: This calls http://localhost:5000/api/packages
      const url = "/packages";
      setLastUrl(`${API_BASE}${url}`);
      const payload = buildPayload();
      const { data } = await api.post(url, payload);
      setMsg("✅ Package created.");
      setForm(emptyForm);
    } catch (e) {
      const detail = e?.response?.data?.message || e.message || "Save failed";
      setMsg(`❌ ${detail}`);
      setLastError(detail);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ marginTop: 0 }}>Add Package (linked to Room)</h2>

      {/* tiny debug panel */}
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
        <div>API_BASE: <code>{API_BASE}</code></div>
        {lastUrl ? <div>Last URL: <code>{lastUrl}</code></div> : null}
        {lastError ? <div style={{ color: "#991b1b" }}>Last Error: {lastError}</div> : null}
      </div>

      {/* 1) Select Room */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>1) Pick Room</h3>

        {roomsErr && (
          <div style={{ padding: 10, background: "#fff1f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, marginBottom: 10 }}>
            {roomsErr}
          </div>
        )}

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <input
              placeholder="Search by name/type/description"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", maxHeight: 240, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
            {roomsLoading ? (
              <p style={{ margin: 0, color: "#64748b" }}>Loading rooms…</p>
            ) : filteredRooms.length === 0 ? (
              <p style={{ margin: 0, color: "#64748b" }}>No rooms found.</p>
            ) : (
              filteredRooms.map((r) => (
                <label
                  key={r._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: roomId === r._id ? "#f3f4f6" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="room"
                    value={r._id}
                    checked={roomId === r._id}
                    onChange={() => setRoomId(r._id)}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {getRoomImage(r) ? (
                      <img
                        src={getRoomImage(r)}
                        alt={r.name || "Room"}
                        style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : null}
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name || "Room"}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {r.type ? `${r.type} • ` : ""}Cap: {r.capacity ?? "-"}
                        {r.price ? ` • ${currency(r.price)}/night` : ""}
                      </div>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {roomId && (
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
              <div>
                {selectedRoom && getRoomImage(selectedRoom) ? (
                  <img
                    src={getRoomImage(selectedRoom)}
                    alt={selectedRoom?.name || "Room"}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 140,
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      display: "grid",
                      placeItems: "center",
                      color: "#94a3b8",
                      fontSize: 12,
                    }}
                  >
                    No image
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                  {selectedRoom?.name || "Room"}
                </div>
                <div style={{ color: "#475569" }}>
                  {selectedRoom?.type ? <div>Type: {selectedRoom.type}</div> : null}
                  <div>Capacity: {selectedRoom?.capacity ?? "-"}</div>
                  {selectedRoom?.price ? <div>Base Price: {currency(selectedRoom.price)}</div> : null}
                  {selectedRoom?.description ? (
                    <div style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>{selectedRoom.description}</div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2) Package form */}
      <form
        onSubmit={handleSubmit}
        style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}
      >
        <h3 style={{ marginTop: 0 }}>2) Package Details</h3>

        {!roomId && (
          <div style={{ marginBottom: 12, color: "#991b1b", fontSize: 14 }}>
            Select a room first — the package will save with that room’s <code>_id</code>.
          </div>
        )}

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <label>Adults Included</label>
            <input
              type="number"
              min={1}
              value={form.adultsIncluded}
              onChange={(e) => setForm({ ...form, adultsIncluded: e.target.value })}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label>Price (USD)</label>
            <input
              type="number"
              min={0}
              value={form.priceUSD}
              onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label>Was Price (USD)</label>
            <input
              type="number"
              min={0}
              value={form.wasPriceUSD}
              onChange={(e) => setForm({ ...form, wasPriceUSD: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Taxes & Charges (USD)</label>
            <input
              type="number"
              min={0}
              value={form.taxesAndChargesUSD}
              onChange={(e) => setForm({ ...form, taxesAndChargesUSD: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Ribbons (comma separated)</label>
            <input
              value={form.ribbonsInput}
              onChange={(e) => setForm({ ...form, ribbonsInput: e.target.value })}
              placeholder="e.g. 38% off, Mobile-only price"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Genius Discount %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.geniusDiscountPercent}
              onChange={(e) => setForm({ ...form, geniusDiscountPercent: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Active</label>
            <select
              value={String(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
              style={{ width: "100%" }}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Perks */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: 6 }}>Perks</label>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label>
                <input
                  type="checkbox"
                  checked={form.perks_freeCancellationAnytime}
                  onChange={(e) => setForm({ ...form, perks_freeCancellationAnytime: e.target.checked })}
                />{" "}
                Free cancellation anytime
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.perks_noPrepaymentNeeded}
                  onChange={(e) => setForm({ ...form, perks_noPrepaymentNeeded: e.target.checked })}
                />{" "}
                No prepayment needed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.perks_noCreditCardNeeded}
                  onChange={(e) => setForm({ ...form, perks_noCreditCardNeeded: e.target.checked })}
                />{" "}
                No credit card needed
              </label>
            </div>
          </div>

          {/* Meals */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: 6 }}>Meals</label>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <label>
                <input
                  type="checkbox"
                  checked={form.meals_breakfastIncluded}
                  onChange={(e) => setForm({ ...form, meals_breakfastIncluded: e.target.checked })}
                />{" "}
                Breakfast included
              </label>
              <div>
                <label>Lunch Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={form.meals_lunchPriceUSD}
                  onChange={(e) => setForm({ ...form, meals_lunchPriceUSD: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label>Dinner Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={form.meals_dinnerPriceUSD}
                  onChange={(e) => setForm({ ...form, meals_dinnerPriceUSD: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !roomId}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: roomId ? "#111827" : "#9ca3af",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: roomId ? "pointer" : "not-allowed",
          }}
        >
          {saving ? "Saving…" : "Save Package"}
        </button>

        {msg && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              background: msg.startsWith("✅") ? "#ecfdf5" : "#fff1f2",
              color: msg.startsWith("✅") ? "#065f46" : "#991b1b",
              border: `1px solid ${msg.startsWith("✅") ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
