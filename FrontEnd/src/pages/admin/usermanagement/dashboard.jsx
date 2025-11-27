// src/pages/admin/usermanagement/AdminDashboard.jsx
import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaUsers, FaBed, FaBell, FaTags, FaStar, FaStore, FaCalendarCheck,
  FaCreditCard, FaTree, FaUtensils, FaSignOutAlt,
} from "react-icons/fa";
 // default export (see step #1)
import RoomAdmin from "../../admin/Room/roomadmin"; // default export (see step #1)
import PackagesList from "../../admin/packagedetails/packageList"; // default export (see step #1)
import ReservationsAdmin from "../reservation_admin/ReservationsAdmin.jsx"; // default export (see step #1) 

import PromotionsPage from "../../promotion/PromotionsPage";

import NotificationsPage from "../../notification/NotificationsPage"
import Swal from "sweetalert2";
import UserManagementPage from "./alldetails"; // default export (see step #1)
//import RoomAdmin from "../../admin/Room/roomadmin"; // default export (see step #1)
import SAdminDashboard from "../../safaripackage/SAdminDashboard";
import AdminMenuPage from "../../foodmenu/AdminMenuPage";
import NotificationBell from "../../../components/NotificationBell.jsx";
import ManageReview from "../../review/admin/manageReview.jsx";
import ManageArtisanal from "../../artisanal/admin/manageArtisanal.jsx";

// --- simple placeholders so nothing is undefined ---
function RoomsPage() { return <h1 className="text-2xl font-semibold">🛏️ Room Management</h1>; }
//function NotificationsPage() { return <h1 className="text-2xl font-semibold">🔔 Notifications</h1>; }
function DiscountsPage() { return <h1 className="text-2xl font-semibold">🏷️ Discounts & Promotions</h1>; }
function ReviewsPage() { return <h1 className="text-2xl font-semibold">⭐ Reviews & Ratings</h1>; }
function MerchandisePage() { return <h1 className="text-2xl font-semibold">🛍️ Merchandise Management</h1>; }
function ReservationsPage() { return <h1 className="text-2xl font-semibold">📅 Reservation System</h1>; }
function PaymentsPage() { return <h1 className="text-2xl font-semibold">💳 Payments</h1>; }
function SafariPage() { return <h1 className="text-2xl font-semibold">🌴 Safari Package Management</h1>; }
function FoodMenuPage() { return <h1 className="text-2xl font-semibold">🍽️ Food Menu Management</h1>; }

function Topbar() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleLogoutClick() {
    setConfirmOpen(true);
  }

  function cancelLogout() {
    setConfirmOpen(false);
  }

  function confirmLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setConfirmOpen(false);
    navigate("/login");
  }

  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <h2 className="text-xl font-bold text-[#0a0a0a]">Hasthi Safari Admin</h2>
          <div className="flex items-center gap-3">
            <input
              className="w-56 rounded-xl border px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d3af37]"
              placeholder="Search..."
            />
            <NotificationBell onNotificationClick={() => {
              // Show a modal or dropdown to choose between food and safari bookings
              Swal.fire({
                title: 'New Bookings Available!',
                text: 'You have new pending bookings. Which would you like to view?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Food Bookings',
                cancelButtonText: 'Safari Bookings',
                confirmButtonColor: '#d3af37',
                cancelButtonColor: '#000000'
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate('/admin/foodmenu/bookings');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  navigate('/admin/safari-bookings');
                }
              });
            }} />
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
            >
              <FaSignOutAlt /> Logout
            </button>
            <div className="h-9 w-9 rounded-full bg-[#d3af37] grid place-items-center text-white font-semibold">A</div>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelLogout} />
          <div className="relative bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 border rounded-xl" onClick={cancelLogout}>Cancel</button>
              <button className="px-4 py-2 text-white rounded-xl bg-rose-600" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-[#f0f0f0]">
      <aside className="flex flex-col bg-white border-r shadow-lg w-72">
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="h-12 w-12 rounded-xl grid place-items-center bg-[#d3af37]">
            <img src="/logo.png" alt="logo" className="object-contain h-9 w-9" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Hasthi Safari</div>
            <div className="text-lg font-semibold text-[#0a0a0a]">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/admin/users" icon={<FaUsers />}>User Management</SidebarLink>
          <SidebarLink to="/admin/rooms" icon={<FaBed />}>Room Management</SidebarLink>
          <SidebarLink to="/admin/rooms_packages" icon={<FaBed />}>Room packages</SidebarLink>
          <SidebarLink to="/admin/notifications" icon={<FaBell />}>Notifications</SidebarLink>
          <SidebarLink to="/admin/discounts" icon={<FaTags />}>Discounts & Promotions</SidebarLink>
          <SidebarLink to="/admin/reviews" icon={<FaStar />}>Reviews & Ratings</SidebarLink>
          <SidebarLink to="/admin/merchandise" icon={<FaStore />}>Merchandise</SidebarLink>
          <SidebarLink to="/admin/reservations" icon={<FaCalendarCheck />}>Reservations</SidebarLink>
          <SidebarLink to="/admin/payments" icon={<FaCreditCard />}>Payments</SidebarLink>
          <SidebarLink to="/admin/safari" icon={<FaTree />}>Safari Packages</SidebarLink>
          <SidebarLink to="/admin/food" icon={<FaUtensils />}>Food Menu</SidebarLink>
        </nav>

        <div className="p-4 text-xs text-gray-500 border-t">
          <div className="font-semibold text-[#0a0a0a] mb-1">Team</div>
          <ul className="space-y-1">
            <li><b>Dilan</b> — Users & Rooms</li>
            <li><b>Yomal</b> — Notifications & Promotions</li>
          </ul>
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="rooms" element={<RoomAdmin />} />
            <Route path="rooms_packages" element={<PackagesList />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="discounts" element={<PromotionsPage />} />
            <Route path="reviews" element={<ManageReview />} />
            <Route path="merchandise" element={<ManageArtisanal />} />
           
            
            <Route path="reservations" element={<ReservationsAdmin />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="safari" element={<SAdminDashboard />} />
            <Route path="food" element={<AdminMenuPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, children, icon }) {
  const loc = useLocation();
  const current = loc.pathname.replace(/\/+$/, "");
  const target = to.replace(/\/+$/, "");
  const active = current === target;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
        ${active ? "bg-gray-100 text-[#d3af37] font-semibold" : "text-[#0a0a0a] hover:bg-[#f9f6ef]"}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
