// src/components/AuthHeader.jsx
import React, { useState, useEffect } from "react";
import { CalendarCheck2, Bell, User, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import NotificationModal from "./NotificationModal";
import NotificationBell from "./NotificationBell";

const BRAND = { gold: "#D3AF37", ink: "#0A0A0A" };

export default function AuthHeader() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setShowUserMenu(false);
  };

  const confirmLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    setShowLogoutConfirm(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    // Navigate to home page
    navigate("/", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleNotificationClick = () => {
    setShowNotificationPopup(true);
  };

  const links = [
    { href: "#cottages", label: "Cottages" },
    { href: "/food", label: "Restaurant" },
    { href: "/safari", label: "Safari" },
    { href: "#gallery", label: "Gallery" },
    { href: "#artisanal", label: "Artisanal" },
    { href: "/offers", label: "Offers" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur bg-[#0A0A0A]/70">
      <div className="px-4 mx-auto max-w-7xl md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <img
              src={logo}
              alt="Hotel Logo"
              className="object-cover rounded-full h-9 w-9 ring-2 ring-white/20"
            />
            <div className="leading-tight">
              <p className="font-semibold tracking-wide text-white">Hasthi</p>
              <p className="text-xs text-white/60">Safari &amp; Stay</p>
            </div>
          </button>

          {/* Links */}
          <nav className="items-center hidden gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm transition text-white/80 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="items-center hidden gap-3 md:flex">
            {/* Book Now Button */}
            <a
              href="/reserve/start"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
              style={{
                background: BRAND.gold,
                color: BRAND.ink,
                boxShadow: "0 8px 20px rgba(211,175,55,0.2)",
              }}
            >
              <CalendarCheck2 className="w-4 h-4" /> Book Now
            </a>

            {/* Conditional rendering based on authentication status */}
            {isLoggedIn ? (
              <>
                {/* User Account Dropdown */}
                <div className="relative user-dropdown">
                  <button 
                    className="flex items-center gap-2 p-2 text-white transition border rounded-xl border-white/20 hover:bg-white/10"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="object-cover rounded-full w-7 h-7"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.name || 'User'
                      }
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white rounded-lg shadow-xl border border-gray-200">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/guest/bookings');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <CalendarCheck2 className="w-4 h-4" />
                        My Bookings
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin');
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                        >
                          <User className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button 
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Notification Bell - Show to the right of user name when logged in */}
                <NotificationBell />
              </>
            ) : (
              /* Login Button for non-authenticated users */
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border rounded-xl border-white/20 hover:bg-white/10"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button with Notification */}
          <div className="flex items-center gap-2 md:hidden">
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
            {isLoggedIn ? (
              <>
                <button 
                  className="flex items-center gap-1 p-2 text-white transition border rounded-lg border-white/20 hover:bg-white/10"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="object-cover rounded-full w-6 h-6"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>
                {/* Notification Bell - Show to the right of user when logged in */}
                <NotificationBell />
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="p-2 text-white border rounded-lg border-white/20 hover:bg-white/10"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationPopup} 
        onClose={() => setShowNotificationPopup(false)} 
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={cancelLogout}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md transform transition-all duration-300 ease-out">
            {/* Centered Modal */}
            <div className="bg-white rounded-3xl shadow-2xl">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: BRAND.gold }}>
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                    <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="px-6 py-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="object-cover rounded-full w-8 h-8"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user?.name || 'User'
                        }
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${BRAND.gold}10` }}>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: `${BRAND.gold}20` }}>
                      <svg className="w-3 h-3" style={{ color: BRAND.gold }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">You'll need to sign in again</p>
                      <p className="text-xs text-gray-600 mt-1">Your session will end and you'll be redirected to the home page.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors"
                    style={{ backgroundColor: BRAND.gold }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b8941f'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = BRAND.gold}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
