import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, User, Menu, LogOut, Settings } from 'lucide-react';

function LinkItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-white shadow-lg font-semibold transform scale-105' 
            : 'hover:bg-white/60 hover:transform hover:scale-105'
        }`
      }
    >
      <Icon className={`w-5 h-5 ${collapsed ? '' : ''}`} />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className={`bg-white transition-all duration-300 h-full ${collapsed ? 'w-16' : 'w-72'} shadow-xl border-r flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full text-white" style={{ backgroundColor: '#d3af37' }}>
            HS
          </div>
          {!collapsed && (
            <div>
              <div className="text-lg font-bold" style={{ color: '#0a0a0a' }}>Hasthi Safari</div>
              <div className="text-xs opacity-75" style={{ color: '#0a0a0a' }}>Guest Portal</div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(v => !v)} 
          className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-2 flex-1">
        <LinkItem to="/guest" icon={Home} label="Overview" collapsed={collapsed} />
        <LinkItem to="/guest/bookings" icon={Calendar} label="My Bookings" collapsed={collapsed} />
        <LinkItem to="/guest/profile" icon={User} label="Profile" collapsed={collapsed} />
      </nav>

      {/* Quick Actions */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={() => navigate('/reserve/start')}
          className={`w-full py-3 font-semibold rounded-lg transition-all hover:brightness-95 ${
            collapsed ? 'px-2' : 'px-4'
          }`}
          style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
          title={collapsed ? 'New Booking' : ''}
        >
          {collapsed ? '+' : 'New Booking'}
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all ${
              collapsed ? 'px-2' : ''
            }`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
