import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const base = "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";
  const active = "bg-[#f0f0f0] text-[#0a0a0a]";
  const normal = "text-[#0a0a0a] hover:bg-[#f0f0f0]/60";

  return (
    <nav className="bg-[#d3af37]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
        <Link className="font-bold text-[#0a0a0a] no-underline" to="/">
          Safari
        </Link>
        <div className="flex gap-2">
          <Link
            className={`${base} ${pathname === "/" ? active : normal}`}
            to="/"
          >
            Visitor
          </Link>
          <Link
            className={`${base} ${pathname.startsWith("/admin") ? active : normal}`}
            to="/admin"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
