import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, Calendar, Phone } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Accommodations", href: "#rooms" },
    { name: "Experiences", href: "#services" },
    { name: "Dining", href: "#dining" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "shadow-xl border-b border-white/10"
            : "shadow-lg"
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.90)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer group"
            >
              <div className="relative">
                <img
                  src="/assets/logo.png"
                  alt="Hotel Logo"
                  className="object-cover rounded-full h-9 w-9 ring-2 ring-white/20 group-hover:ring-[#d3af37]/50 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML =
                      `<div class="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold ring-2 ring-white/20" style="background-color: #d3af37; color: #0a0a0a;">H</div>`;
                  }}
                />
              </div>
              
              <div className="ml-3 leading-tight">
                <p className="font-semibold tracking-wide text-white group-hover:text-[#d3af37] transition-colors duration-300">Hasthi</p>
                <p className="text-xs text-white/60 group-hover:text-[#d3af37]/80 transition-colors duration-300">Safari & Stay</p>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="items-center hidden space-x-8 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm transition text-white/80 hover:text-white relative group"
                >
                  <span className="relative z-10">{link.name}</span>
                  <div 
                    className="absolute bottom-0 left-1/2 w-0 h-0.5 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2 transition-all duration-300"
                    style={{ backgroundColor: '#d3af37' }}
                  ></div>
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="items-center hidden space-x-3 lg:flex">
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 group"
                style={{
                  background: '#d3af37',
                  color: '#0a0a0a',
                  boxShadow: '0 8px 20px rgba(211,175,55,0.2)',
                }}
                onClick={() => navigate("/reserve/start")}
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white border rounded-xl border-white/20 hover:bg-white/10 transition-all duration-300 group"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 transition-colors duration-200 lg:hidden rounded-xl text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div 
            className="px-6 py-4 border-t border-white/10"
            style={{ 
              backgroundColor: 'rgba(10, 10, 10, 0.98)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="mt-6 space-y-3">
              <button
                className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold rounded-xl"
                style={{
                  background: '#d3af37',
                  color: '#0a0a0a',
                  boxShadow: '0 8px 20px rgba(211,175,55,0.2)',
                }}
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/reserve/start");
                }}
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </button>

              <button
                className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white border rounded-xl border-white/20 hover:bg-white/10 transition-all duration-300"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/login");
                }}
              >
                <User className="w-4 h-4" />
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer so content isn't hidden under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;