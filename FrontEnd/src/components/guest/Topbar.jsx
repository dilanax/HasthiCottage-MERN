import React, { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // read from localStorage when component mounts
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid user in storage", e);
      }
    }
  }, []);

  // Fallback initials (first letter of firstName)
  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : "G";

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0a0a0a' }}>Guest Portal</h1>
            <p className="text-sm opacity-75" style={{ color: '#0a0a0a' }}>
              Welcome back, {user?.firstName || 'Guest'}!
            </p>
          </div>

          <div className="items-center hidden p-2 bg-white rounded-lg shadow-md border sm:flex">
            <Search className="w-4 h-4 mx-2" style={{ color: '#d3af37' }} />
            <input
              className="px-2 py-1 text-sm bg-transparent outline-none"
              placeholder="Search bookings, dates..."
              style={{ color: '#0a0a0a' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="p-3 rounded-lg hover:brightness-95 transition-all"
            style={{ backgroundColor: '#f0f0f0' }}
            title="Notifications"
          >
            <Bell className="w-5 h-5" style={{ color: '#0a0a0a' }} />
          </button>

          <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-md border">
            <div 
              className="flex items-center justify-center rounded-full h-10 w-10 font-bold text-white"
              style={{ backgroundColor: '#d3af37' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold" style={{ color: '#0a0a0a' }}>
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </div>
              <div className="text-xs opacity-75" style={{ color: '#0a0a0a' }}>
                {user?.email || "guest@example.com"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
