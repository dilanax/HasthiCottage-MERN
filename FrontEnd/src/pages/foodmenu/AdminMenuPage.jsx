import React, { useEffect, useMemo, useState } from "react";
import { createMenu, listMenu, removeMenu, updateMenu } from "../../api/menuApi.js";
import MenuStatsCard from "../../components/foodmenu/admin/MenuStatsCard.jsx";
import MenuCard from "../../components/foodmenu/admin/MenuCard.jsx";
import MenuItemModal from "../../components/foodmenu/admin/MenuItemModal.jsx";
import Confirm from "../../components/foodmenu/common/Confirm.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";
import FoodBookingAdmin from "../admin/FoodBookingAdmin.jsx";
import { useNavigate } from "react-router-dom";

export default function AdminMenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");
  const [activeSection, setActiveSection] = useState("menu"); // "menu" or "bookings"

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const txt = (i.name + " " + i.description).toLowerCase();
        const okQ = !q || txt.includes(q.toLowerCase());
        const okC = !category || i.category === category;
        return okQ && okC;
      }),
    [items, q, category]
  );

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await listMenu();
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (form) => {
    try {
      setErr("");
      setLoading(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("spicyLevel", form.spicyLevel);
      if (form.tags) fd.append("tags", form.tags);
      fd.append("available", JSON.stringify({ isAvailable: form.status === "Available" }));
      if (form.image) fd.append("image", form.image);

      if (editing) await updateMenu(editing._id, fd);
      else await createMenu(fd);

      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    try {
      setLoading(true);
      await removeMenu(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-[#0a0a0a]">
            {activeSection === "menu" ? "Food Menu Management" : "Food Booking Management"}
          </h1>
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => setActiveSection(activeSection === "menu" ? "bookings" : "menu")}
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {activeSection === "menu" ? "Bookings" : "Menu"}
            </button>
          </div>
        </div>

        {err && (
          <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
            {err}
          </div>
        )}

        {activeSection === "menu" ? (
          <>
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Left side - Stats Card */}
        <div className="lg:w-1/3">
          <MenuStatsCard items={items} />
        </div>

        {/* Right side - Search and Add Button */}
        <div className="lg:w-2/3">
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200"
                    placeholder="Search menu items..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 bg-white min-w-[150px]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "BEVERAGE", "DESSERT", "OTHER"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                className="group relative inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#d3af37] to-[#b89d2e] text-[#0a0a0a] font-semibold rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Menu Item
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Menu Items Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0a0a0a]">Menu Items</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                </span>
                {q && (
                  <span className="bg-[#d3af37] text-white px-2 py-1 rounded-full">
                    "{q}"
                  </span>
                )}
                {category && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {category}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d3af37]"></div>
                  <p className="text-gray-600">Loading menu items...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No menu items found</h3>
                <p className="text-gray-500 mb-4">
                  {q || category ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first menu item.'}
                </p>
                {!q && !category && (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-[#d3af37] text-[#0a0a0a] font-semibold rounded-md hover:bg-[#b89d2e] transition-colors"
                    onClick={() => {
                      setEditing(null);
                      setOpen(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add First Menu Item
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((it) => (
                  <MenuCard
                    key={it._id}
                    item={it}
                    onEdit={(x) => {
                      setEditing(x);
                      setOpen(true);
                    }}
                    onDelete={(x) => setConfirm(x)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </>
        ) : (
          <div className="mt-6">
            <FoodBookingAdmin />
          </div>
        )}

        {/* Modals */}
        <MenuItemModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={submit}
          initial={editing}
        />
        <Confirm
          open={!!confirm}
          title="Delete Menu Item?"
          body={`Are you sure you want to delete "${confirm?.name}"? This action cannot be undone.`}
          onOK={() => del(confirm._id)}
          onClose={() => setConfirm(null)}
        />
      </div>
    </div>
  );
}
