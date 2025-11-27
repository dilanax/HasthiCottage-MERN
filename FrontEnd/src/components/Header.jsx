// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { CalendarCheck2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";

const BRAND = { gold: "#d3af37", ink: "#0A0A0A" };

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      setIsLoggedIn(!!token && !!userData);
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

  const links = [
    { href: "#cottages", label: "Cottages" },
    { href: "/food", label: "Restaurant" }, // Updated to navigate to PublicMenuPage
    { href: "/safari", label: "Safari" }, // Updated to navigate to VisitorPage
    { href: "#gallery", label: "Gallery" },
    { href: "#artisanal", label: "Artisanal" },
    { href: "/offers", label: "Offers", isRoute: true },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur bg-[#0A0A0A]/70">
      <div className="px-4 mx-auto max-w-7xl md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Hotel Logo"
              className="object-cover rounded-full h-9 w-9 ring-2 ring-white/20"
            />
            <div className="leading-tight">
              <p className="font-semibold tracking-wide text-white">Hasthi</p>
              <p className="text-xs text-white/60">Safari &amp; Stay</p>
            </div>
          </Link>

          {/* Links */}
          <nav className="items-center hidden gap-8 md:flex">
            {links.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-sm transition text-white/80 hover:text-white"
                >
                  {l.label}
                </Link>
              ) : l.href.startsWith("#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm transition text-white/80 hover:text-white"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-sm transition text-white/80 hover:text-white"
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>

          {/* Buttons */}
          <div className="items-center hidden gap-3 md:flex">
            {/* Notification Bell - Only show when logged in */}
            {isLoggedIn && <NotificationBell />}
            
            <a
              href="/reserve"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
              style={{
                background: BRAND.gold,
                color: BRAND.ink,
                boxShadow: "0 8px 20px rgba(211,175,55,0.2)",
              }}
            >
              <CalendarCheck2 className="w-4 h-4" /> Book Now
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border rounded-xl border-white/20 hover:bg-white/10"
            >
              <LogIn className="w-4 h-4" /> Login
            </a>
          </div>

          {/* Mobile Menu Button with Notification */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Bell - Only show when logged in */}
            {isLoggedIn && <NotificationBell />}
            <a
              href="/reserve/start"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg"
              style={{
                background: BRAND.gold,
                color: BRAND.ink,
              }}
            >
              <CalendarCheck2 className="w-3 h-3" /> Book
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
