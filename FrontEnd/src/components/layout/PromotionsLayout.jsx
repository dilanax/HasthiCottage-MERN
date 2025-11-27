import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function PromotionsLayout() {
  return (
    <div className="App">
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Admin Promotions</Link>
        <Link to="/user-promotions">User Promotions</Link>
      </nav>
      <Outlet /> {/* Nested routes will render here */}
    </div>
  );
}
