import React, { useEffect, useMemo, useState } from "react";

import {
  LayoutGrid,
  Users as UsersIcon,
  BedDouble,
  CalendarCheck2,
  ReceiptIndianRupee,
  Bell,
  Tag,
  PawPrint,
  Bot,
  MessageSquareMore,
  PackageSearch,
  Salad,
  Download,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCcw,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------------------------- BRAND --------------------------------- */
const BRAND = {
  primary: "#D4AF37",
  primaryDark: "#A8841A",
  primarySoft: "#FFF4CF",
  ink: "#0F172A",
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function authHeaders(json = true) {
  const token = localStorage.getItem("token");
  const h = { Accept: "application/json" };
  if (json) h["Content-Type"] = "application/json";
    if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

/* -------------------------------- MODULES --------------------------------- */
const MODULES = [
  {
    key: "users",
    name: "User Management",
    icon: UsersIcon,
    endpoints: {
      list: "/api/user/all",
      create: "/api/user/register",
        update: (id) => `/api/user/${id}`,
        delete: (id) => `/api/user/${id}`,
    },
    columns: [
      { key: "firstName", label: "First" },
      { key: "lastName", label: "Last" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "isEmailVerified", label: "Verified", render: (v) => String(!!v) },
      { key: "isDisabled", label: "Disabled", render: (v) => String(!!v) },
    ],
    fields: [
      { name: "firstName", label: "First name", type: "text", required: true },
      { name: "lastName", label: "Last name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "role", label: "Role", type: "select", options: ["user", "admin"], default: "user" },
      { name: "isEmailVerified", label: "Email verified", type: "checkbox" },
      { name: "isDisabled", label: "Disabled", type: "checkbox" },
      { name: "password", label: "Password", type: "password", requiredOnCreate: true },
    ],
  },
  {
    key: "rooms",
    name: "Room Management",
    icon: BedDouble,
    // UPDATED: align to your backend routes
    endpoints: {
      list: "/api/rooms/list",
      create: "/api/rooms/create",
        update: (id) => `/api/rooms/${id}`, // PATCH
        delete: (id) => `/api/rooms/${id}`, // PATCH {isDeleted:true}
    },
    columns: [
      { key: "code", label: "Code" },
      { key: "type", label: "Type", render: (v) => String(v || "-").toUpperCase() },
      { key: "capacity", label: "Capacity" },
      { key: "basePriceRupees", label: "Base Price (LKR)", render: (v) => fmt.money(v) },
      { key: "status", label: "Status" },
      { key: "floor", label: "Floor" },
    ],
    // Use friendly field names then transform before submit
    fields: [
      { name: "code", label: "Room code", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["standard", "deluxe", "suite"], default: "standard" },
      { name: "capacity", label: "Capacity", type: "number", default: 2 },
      { name: "basePriceRupees", label: "Base price (LKR)", type: "number", default: 0 },
      { name: "status", label: "Status", type: "select", options: ["available", "occupied", "maintenance"], default: "available" },
      { name: "floor", label: "Floor", type: "number", default: 1 },
      { name: "amenitiesCsv", label: "Amenities (comma separated)", type: "text" },
      { name: "imagesCsv", label: "Image URLs (comma separated)", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "reservations",
    name: "Reservations",
    icon: CalendarCheck2,
    endpoints: {
      list: "/api/reservations",
      create: "/api/reservations",
        update: (id) => `/api/reservations/${id}`,
        delete: (id) => `/api/reservations/${id}`,
    },
    columns: [
      { key: "guestName", label: "Guest" },
      { key: "room", label: "Room", render: (v) => v?.name || v },
      { key: "status", label: "Status" },
      { key: "total", label: "Total (LKR)" },
      { key: "checkIn", label: "Check-in", render: (v) => fmt.date(v) },
    ],
    fields: [
      { name: "guestName", label: "Guest name", type: "text", required: true },
      { name: "room", label: "Room", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["pending", "confirmed", "cancelled"] },
      { name: "total", label: "Total (LKR)", type: "number" },
      { name: "checkIn", label: "Check-in", type: "date" },
      { name: "checkOut", label: "Check-out", type: "date" },
    ],
  },
  {
    key: "payments",
    name: "Payments",
    icon: ReceiptIndianRupee,
    endpoints: {
      list: "/api/payments",
      create: "/api/payments",
        update: (id) => `/api/payments/${id}`,
        delete: (id) => `/api/payments/${id}`,
    },
    columns: [
      { key: "payer", label: "Payer" },
      { key: "amount", label: "Amount (LKR)" },
      { key: "method", label: "Method" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Date", render: (v) => fmt.date(v) },
    ],
    fields: [
      { name: "payer", label: "Payer", type: "text" },
      { name: "amount", label: "Amount (LKR)", type: "number" },
      { name: "method", label: "Method", type: "select", options: ["cash", "card", "bank"] },
      { name: "status", label: "Status", type: "select", options: ["pending", "paid", "refunded"] },
    ],
  },
  {
    key: "promotions",
    name: "Offers & Promotions",
    icon: Tag,
    endpoints: {
      list: "/api/offers",
      create: "/api/offers",
        update: (id) => `/api/offers/${id}`,
        delete: (id) => `/api/offers/${id}`,
    },
    columns: [
      { key: "title", label: "Title" },
      { key: "discountPercent", label: "% Off" },
      { key: "validFrom", label: "From", render: (v) => fmt.date(v) },
      { key: "validTo", label: "To", render: (v) => fmt.date(v) },
      { key: "active", label: "Active", render: (v) => String(!!v) },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "discountPercent", label: "Discount %", type: "number" },
      { name: "validFrom", label: "Valid from", type: "date" },
      { name: "validTo", label: "Valid to", type: "date" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "notifications",
    name: "Notifications",
    icon: Bell,
    endpoints: {
      list: "/api/notifications",
      create: "/api/notifications",
        update: (id) => `/api/notifications/${id}`,
        delete: (id) => `/api/notifications/${id}`,
    },
    columns: [
      { key: "notification_id", label: "ID" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created", render: (v) => fmt.date(v) },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "channel", label: "Channel", type: "select", options: ["email", "sms", "push"] },
      { name: "message", label: "Message", type: "textarea" },
    ],
  },
  {
    key: "animals",
    name: "Animal Tracking",
    icon: PawPrint,
    endpoints: {
      list: "/api/animals",
      create: "/api/animals",
      update: (id) => /api/animals/${id},
      delete: (id) => /api/animals/${id},
    },
    columns: [
      { key: "name", label: "Name" },
      { key: "species", label: "Species" },
      { key: "status", label: "Status" },
      { key: "lastSeenAt", label: "Last seen", render: (v) => fmt.date(v) },
      { key: "location", label: "Location" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "species", label: "Species", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["active", "missing", "relocated"] },
      { name: "lastSeenAt", label: "Last seen", type: "date" },
      { name: "location", label: "Location", type: "text" },
    ],
  },
  {
    key: "chatbot",
    name: "Chatbot",
    icon: Bot,
    endpoints: { list: "/api/chatbot/logs", create: "/api/chatbot/config" },
    columns: [
      { key: "prompt", label: "Prompt" },
      { key: "response", label: "Response" },
      { key: "createdAt", label: "Time", render: (v) => fmt.date(v) },
    ],
    fields: [
      { name: "apiKey", label: "AI API Key", type: "password" },
      { name: "welcome", label: "Welcome message", type: "textarea" },
    ],
  },
  {
    key: "reviews",
    name: "Reviews & Ratings",
    icon: MessageSquareMore,
    endpoints: {
      list: "/api/reviews",
      create: "/api/reviews",
      update: (id) => /api/reviews/${id},
      delete: (id) => /api/reviews/${id},
    },
    columns: [
      { key: "userEmail", label: "User" },
      { key: "rating", label: "Rating" },
      { key: "comment", label: "Comment" },
      { key: "createdAt", label: "Date", render: (v) => fmt.date(v) },
    ],
    fields: [
      { name: "userEmail", label: "User email", type: "email" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "comment", label: "Comment", type: "textarea" },
    ],
  },
  {
    key: "merch",
    name: "Merchandise",
    icon: PackageSearch,
    endpoints: {
      list: "/api/merch",
      create: "/api/merch",
      update: (id) => /api/merch/${id},
      delete: (id) => /api/merch/${id},
    },
    columns: [
      { key: "name", label: "Item" },
      { key: "sku", label: "SKU" },
      { key: "price", label: "Price" },
      { key: "stock", label: "Stock" },
      { key: "active", label: "Active", render: (v) => String(!!v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "sku", label: "SKU", type: "text" },
      { name: "price", label: "Price (LKR)", type: "number" },
      { name: "stock", label: "Stock", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "packages",
    name: "Safari Packages",
    icon: PawPrint,
    endpoints: {
      list: "/api/packages",
      create: "/api/packages",
      update: (id) => /api/packages/${id},
      delete: (id) => /api/packages/${id},
    },
    columns: [
      { key: "name", label: "Package" },
      { key: "durationDays", label: "Days" },
      { key: "price", label: "Price" },
      { key: "active", label: "Active", render: (v) => String(!!v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "durationDays", label: "Duration (days)", type: "number" },
      { name: "price", label: "Price (LKR)", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "menu",
    name: "Food Menu",
    icon: Salad,
    endpoints: {
      list: "/api/menu",
      create: "/api/menu",
      update: (id) => /api/menu/${id},
      delete: (id) => /api/menu/${id},
    },
    columns: [
      { key: "name", label: "Dish" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "available", label: "Available", render: (v) => String(!!v) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "price", label: "Price (LKR)", type: "number" },
      { name: "available", label: "Available", type: "checkbox" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
];

/* ------------------------------ Helper: fmt ------------------------------- */
const fmt = {
  money(n) {
    const num = Number(n);
    if (!isFinite(num)) return "-";
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(num);
    } catch {
      return Rs ${num.toLocaleString()};
    }
  },
  date(s) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  },
};

/* -------------------------- payload transformers ------------------------- */
function transformOut(moduleKey, payload) {
  // before sending to API
  if (moduleKey === "rooms") {
    const toCsvArr = (v) => String(v || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      code: payload.code?.trim(),
      type: payload.type,
      capacity: Number(payload.capacity) || 1,
      basePriceCents: Math.max(0, Math.round((Number(payload.basePriceRupees) || 0) * 100)),
      status: payload.status,
      floor: Number(payload.floor) || 1,
      amenities: toCsvArr(payload.amenitiesCsv),
      images: toCsvArr(payload.imagesCsv),
      notes: payload.notes || "",
    };
  }
  return payload;
}

function transformIn(moduleKey, item) {
  // after fetching from API, shape for UI
  if (moduleKey === "rooms") {
    return {
      ...item,
      basePriceRupees: Math.round(((item.basePriceCents || 0) / 100) * 100) / 100,
      amenitiesCsv: Array.isArray(item.amenities) ? item.amenities.join(", ") : "",
      imagesCsv: Array.isArray(item.images) ? item.images.join(", ") : "",
    };
  }
  return item;
}

/* ------------------------------ CRUD HOOK -------------------------------- */
function useCrud(module) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchList() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(${API_BASE}${module.endpoints.list}, { headers: authHeaders(false) });
      let data = [];
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        const raw = Array.isArray(j)
          ? j
          : (Array.isArray(j?.data) ? j.data
          : (Array.isArray(j?.results) ? j.results
          : (Array.isArray(j?.[module.key]) ? j[module.key] : [])));
        data = raw.map((it) => transformIn(module.key, it));
      }
      if (!res.ok) throw new Error(HTTP ${res.status});
      setItems(data);
    } catch (e) {
      console.warn([${module.key}] list fallback demo, e);
      const demo = [{ _id: "demo-1", name: ${module.name} demo item }];
      setItems(demo);
      setError("API unavailable — showing demo data");
    } finally {
      setLoading(false);
    }
  }

  async function createItem(payload) {
    const body = JSON.stringify(transformOut(module.key, payload));
    const res = await fetch(${API_BASE}${module.endpoints.create}, {
      method: "POST",
      headers: authHeaders(true),
      body,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j?.success === false) throw new Error(j?.message || j?.error || Create failed (${res.status}));
    await fetchList();
  }

  async function updateItem(id, payload) {
    const url = typeof module.endpoints.update === "function" ? module.endpoints.update(id) : module.endpoints.update;
    const body = JSON.stringify(transformOut(module.key, payload));
    const res = await fetch(${API_BASE}${url}, {
      method: module.key === "rooms" ? "PATCH" : "PUT",
      headers: authHeaders(true),
      body,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j?.success === false) throw new Error(j?.message || j?.error || Update failed (${res.status}));
    await fetchList();
  }

  async function deleteItem(id) {
    const url = typeof module.endpoints.delete === "function" ? module.endpoints.delete(id) : module.endpoints.delete;

    if (module.key === "rooms") {
      // Soft delete rooms by setting isDeleted: true (since no DELETE route in backend)
      const res = await fetch(${API_BASE}${url}, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ isDeleted: true }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.success === false) throw new Error(j?.message || j?.error || Delete failed (${res.status}));
      await fetchList();
      return;
    }

    const res = await fetch(${API_BASE}${url}, { method: "DELETE", headers: authHeaders(false) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.message || Delete failed (${res.status}));
    }
    await fetchList();
  }

  useEffect(() => { fetchList(); /eslint-disable-next-line/ }, [module.key]);

  return { items, loading, error, fetchList, createItem, updateItem, deleteItem };
}

/* ----------------------------- MAIN LAYOUT ------------------------------- */
export default function AdminSuite() {
  const [activeKey, setActiveKey] = useState("users");
  const activeModule = useMemo(() => MODULES.find((m) => m.key === activeKey) || MODULES[0], [activeKey]);

  return (
    <div className="min-h-screen bg-gray-50 grid md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white">
        <div className="p-4 flex items-center gap-3 border-b">
          <div className="h-10 w-10 rounded-full ring-4 ring-white/80 grid place-items-center overflow-hidden shadow" style={{ background: BRAND.primary }}>
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-cover" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Hasthi Safari</div>
            <div className="text-base font-semibold" style={{ color: BRAND.ink }}>Admin</div>
          </div>
        </div>

        <nav className="p-2">
          <NavItem icon={LayoutGrid} label="Overview" active={activeKey === "overview"} onClick={() => setActiveKey("overview")} />
          {MODULES.map((m) => (
            <NavItem key={m.key} icon={m.icon} label={m.name} active={activeKey === m.key} onClick={() => setActiveKey(m.key)} />
          ))}
        </nav>

        {/* Team assignments quick reference */}
        <div className="m-3 rounded-2xl border bg-white p-3">
          <div className="text-xs font-semibold mb-2" style={{ color: BRAND.ink }}>Team (quick ref)</div>
          <ul className="space-y-1 text-xs text-gray-600">
            <li><b>Dilan</b> — Users & Rooms</li>
            <li><b>Yomal</b> — Notifications & Promotions</li>
            <li><b>Menuka</b> — Reviews & Merchandise</li>
            <li><b>Chanuka</b> — Reservations & Payments</li>
            <li><b>Akila</b> — Safari Packages & Food Menu</li>
            <li><b>Common</b> — Animal Tracking, Chatbot API</li>
          </ul>
        </div>
      </aside>

      {/* Content */}
      <section className="min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/90 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold" style={{ color: BRAND.ink }}>
                {activeKey === "overview" ? "Overview" : activeModule.name}
              </h1>
              {activeKey !== "overview" && (
                <span className="text-[10px] rounded-full border px-2 py-0.5 text-gray-600 bg-gray-50">CRUD</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Filter size={16} className="text-gray-500" />
                <select className="border rounded-xl px-3 py-1.5 bg-white">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 12 months</option>
                </select>
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border shadow-sm bg-white hover:bg-gray-50" title="Reload" onClick={() => window.location.reload()}>
                <RefreshCcw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {activeKey === "overview" ? (
            <Overview />
          ) : (
            <ModuleView module={activeModule} />
          )}
        </main>
      </section>
    </div>
  );
}

/* ------------------------------- OVERVIEW -------------------------------- */
// Fetch and show counts (Users, Rooms, Bookings)
function Overview() {
  const [counts, setCounts] = useState({ users: null, rooms: null, bookings: null });

  useEffect(() => {
    let alive = true;
    const arrify = (j, alt) =>
      Array.isArray(j) ? j
        : Array.isArray(j?.data) ? j.data
        : Array.isArray(j?.results) ? j.results
        : Array.isArray(j?.rooms) ? j.rooms
        : Array.isArray(j?.reservations) ? j.reservations
        : alt || [];

    (async () => {
      try {
        const [uRes, rRes, bRes] = await Promise.allSettled([
          fetch(${API_BASE}/api/user/all, { headers: authHeaders(false) }),
          // UPDATED: your backend lists rooms at /api/rooms/list
          fetch(${API_BASE}/api/rooms/list, { headers: authHeaders(false) }),
          fetch(${API_BASE}/api/reservations, { headers: authHeaders(false) }),
        ]);

        const users = uRes.status === "fulfilled" && uRes.value.ok ? arrify(await uRes.value.json().catch(()=>[]), []) : [];
        const rooms = rRes.status === "fulfilled" && rRes.value.ok ? arrify(await rRes.value.json().catch(()=>[]), []) : [];
        const bookings = bRes.status === "fulfilled" && bRes.value.ok ? arrify(await bRes.value.json().catch(()=>[]), []) : [];

        if (alive) setCounts({ users: users.length, rooms: rooms.length, bookings: bookings.length });
      } catch {
        if (alive) setCounts((c) => c);
      }
    })();

    return () => { alive = false; };
  }, []);

  const demoData = [
    { m: "Jan", v: 8 }, { m: "Feb", v: 10 }, { m: "Mar", v: 7 }, { m: "Apr", v: 12 }, { m: "May", v: 9 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI title="Users" value={counts.users ?? "—"} icon={<UsersIcon size={18} className="text-white/90" />} />
        <KPI title="Rooms" value={counts.rooms ?? "—"} icon={<BedDouble size={18} className="text-white/90" />} />
        <KPI title="Bookings" value={counts.bookings ?? "—"} icon={<CalendarCheck2 size={18} className="text-white/90" />} />
      </div>

      <Card title="Activity (demo)">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke={BRAND.primaryDark} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Modules (CRUD at a glance)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((m) => (
            <div key={m.key} className="rounded-2xl border bg-white p-3">
              <div className="flex items-center gap-2">
                <m.icon size={16} />
                <div className="font-semibold text-sm">{m.name}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                <Badge ok>CREATE</Badge>
                <Badge ok>READ</Badge>
                <Badge ok>UPDATE</Badge>
                <Badge ok>DELETE</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------ MODULE VIEW ------------------------------ */
function ModuleView({ module }) {
  const { items, loading, error, createItem, updateItem, deleteItem } = useCrud(module);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return (items || []).filter((row) => JSON.stringify(row).toLowerCase().includes(s));
  }, [q, items]);

  async function handleCreateOrUpdate(form) {
    try {
      setMessage("");
      if (editing) await updateItem(editing._id || editing.id, form);
      else await createItem(form);
      setModalOpen(false);
      setEditing(null);
      setMessage(editing ? "Saved changes." : "Item created.");
    } catch (e) {
      setMessage(e?.message || "Action failed");
    }
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(row) {
    setEditing(row);
    setModalOpen(true);
  }

  function exportCSV() {
    const rows = [
      [...module.columns.map((c) => c.label)],
      ...filtered.map((r) => module.columns.map((c) => safeCell(r[c.key], c)))
    ];
    const esc = (v) => "${String(v).replace(/"/g, '""')}";
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = ${module.key}_${Date.now()}.csv; a.click(); URL.revokeObjectURL(url);
  }

  // ---------- Users → Export to PDF ----------
  async function exportUsersPDF() {
    try {
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("User List", 14, 16);

      const head = [module.columns.map((c) => c.label)];
      const body = filtered.map((r) =>
        module.columns.map((c) => {
          const raw = r[c.key];
          const val = c.render ? c.render(raw) : (typeof raw === "boolean" ? String(raw) : (raw ?? ""));
          return String(val);
        })
      );

      autoTable(doc, { head, body, startY: 22, styles: { fontSize: 9 } });
      doc.save(users_${Date.now()}.pdf);
    } catch (e) {
      alert("PDF export failed: " + (e?.message || e));
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-emerald-800 text-sm">{message}</div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={Search in ${module.name}…}
            className="w-full sm:w-64 border rounded-xl px-3 py-2 bg-white"
          />
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border bg-white hover:bg-gray-50">
            <Download size={16} /> Export CSV
          </button>

          {module.key === "users" && (
            <button onClick={exportUsersPDF} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border bg-white hover:bg-gray-50">
              <Download size={16} /> Export PDF
            </button>
          )}
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow" style={{ background: BRAND.primary }}>
          <Plus size={16} /> Add {module.key}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {module.columns.map((c) => (
                <th key={c.key} className="p-2 text-left">{c.label}</th>
              ))}
              <th className="p-2 w-28 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={module.columns.length + 1} className="p-4 text-center text-gray-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={module.columns.length + 1} className="p-4 text-center text-gray-500">No data</td></tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={row?._id || row?.id || idx} className="border-t">
                  {module.columns.map((c) => (
                    <td key={c.key} className="p-2">
                      {renderCell(row[c.key], c)}
                    </td>
                  ))}
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(row)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 border">
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this item?")) return;
                          try { await deleteItem(row._id || row.id); } catch (e) { alert(e.message || "Delete failed"); }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 border text-rose-700"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={${editing ? "Edit" : "Add"} ${module.name}}>
        <DynamicForm
          module={module}
          initial={editing}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

/* ---------------------------- DYNAMIC FORM ------------------------------- */
function DynamicForm({ module, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => seedInitial(module.fields, initial));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function onChange(name, value, type) {
    setForm((s) => ({ ...s, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  }

  function validate() {
    for (const f of module.fields) {
      const required = f.required || (f.requiredOnCreate && !initial);
      if (required && (form[f.name] == null || String(form[f.name]).trim() === "")) {
        return ${f.label} is required;
      }
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    try {
      setSaving(true);
      setErr("");
      await onSubmit(form);
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {err && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-700 text-sm">{err}</div>
      )}
      {module.fields.map((f) => (
        <div key={f.name} className="grid gap-1">
          <label className="text-sm font-medium" style={{ color: BRAND.ink }}>
            {f.label} {f.required || (f.requiredOnCreate && !initial) ? <span className="text-rose-600">*</span> : null}
          </label>
          {renderField(f, form[f.name], (v) => onChange(f.name, v, f.type), !!initial)}
        </div>
      ))}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 border bg-white">Cancel</button>
        <button type="submit" disabled={saving} className="rounded-xl px-3 py-2 text-white shadow disabled:opacity-60" style={{ background: BRAND.primary }}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

function seedInitial(fields, row) {
  const init = {};
  for (const f of fields) {
    if (row && row[f.name] != null) init[f.name] = row[f.name];
    else if (f.default != null) init[f.name] = f.default;
    else init[f.name] = f.type === "checkbox" ? false : "";
  }
  return init;
}

function renderField(f, value, setValue, isEdit) {
  const common = {
    className: "w-full border rounded-xl px-3 py-2 bg-white",
    value: value ?? "",
    onChange: (e) => setValue(e.target.value),
  };
  if (f.type === "textarea") {
    return <textarea {...common} rows={3} />;
  }
  if (f.type === "select") {
    return (
      <select {...common}>
        {(f.options || []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (f.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => setValue(e.target.checked)} /> {f.label}
      </label>
    );
  }
  const type = f.type === "password" && isEdit ? "text" : f.type || "text";
  const disabled = isEdit && (f.name === "email");
  return <input {...common} type={type} disabled={disabled} />;
}

function renderCell(v, col) {
  if (col.render) return col.render(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return v.toLocaleString();
  if (v == null || v === "") return "-";
  return String(v);
}

function safeCell(v, col) {
  try { return renderCell(v, col); } catch { return String(v ?? "-"); }
}

/* --------------------------------- UI ------------------------------------ */
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-1 ${active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}}>
      <Icon size={16} /> <span className="truncate">{label}</span>
    </button>
  );
}

function KPI({ title, value, icon }) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl grid place-items-center shadow text-white" style={{ background: BRAND.primary }}>{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl bg-white border shadow-sm">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Badge({ ok, children }) {
  return (
    <span className={inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600"}}>
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {children}
    </span>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-sm bg-black text-white">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}