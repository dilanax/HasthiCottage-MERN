import { useEffect, useRef, useState } from "react";

export default function HeroCarousel({
  images = [],
  intervalMs = 5000, // 5s per slide
  heightClass = "h-[56vh] md:h-[64vh]",
  children, // optional overlay content (title / search form)
}) {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const hovering = useRef(false);

  // advance slide
  const next = () => setI((p) => (p + 1) % images.length);
  const prev = () => setI((p) => (p - 1 + images.length) % images.length);
  const goto = (idx) => setI(idx % images.length);

  useEffect(() => {
    if (!images.length) return;
    timer.current = setInterval(() => {
      if (!hovering.current) next();
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, [images.length, intervalMs]);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!images.length) return null;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl ${heightClass}`}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      aria-label="Safari Cottage hero slideshow"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* slides */}
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
          loading={idx === 0 ? "eager" : "lazy"}
          draggable="false"
        />
      ))}

      {/* enhanced gradient wash with brand colors */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.2) 50%, rgba(211, 175, 55, 0.1) 100%)`
        }}
      />

      {/* overlay content (title, form, buttons, etc) */}
      <div className="relative z-10 h-full grid place-items-center px-4">
        <div className="w-full max-w-4xl text-center" style={{ color: '#f0f0f0' }}>
          {children}
        </div>
      </div>

      {/* enhanced dots with brand colors */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goto(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className="h-3 w-3 rounded-full transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: i === idx ? '#d3af37' : 'rgba(240, 240, 240, 0.6)',
              width: i === idx ? '24px' : '12px',
              boxShadow: i === idx ? '0 2px 8px rgba(211, 175, 55, 0.4)' : 'none'
            }}
          />
        ))}
      </div>

      {/* enhanced nav chevrons with brand styling */}
      <button
        onClick={prev}
        className="group absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 grid place-items-center rounded-full transition-all duration-300 backdrop-blur-sm border"
        aria-label="Previous slide"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.3)',
          borderColor: 'rgba(211, 175, 55, 0.3)',
          color: '#f0f0f0'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.2)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.6)';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(10, 10, 10, 0.3)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.3)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <span className="text-xl font-bold">‹</span>
      </button>
      
      <button
        onClick={next}
        className="group absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 grid place-items-center rounded-full transition-all duration-300 backdrop-blur-sm border"
        aria-label="Next slide"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.3)',
          borderColor: 'rgba(211, 175, 55, 0.3)',
          color: '#f0f0f0'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.2)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.6)';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(10, 10, 10, 0.3)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.3)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <span className="text-xl font-bold">›</span>
      </button>

      {/* progress bar with brand colors */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 z-10"
        style={{ backgroundColor: 'rgba(240, 240, 240, 0.2)' }}
      >
        <div 
          className="h-full transition-all duration-300 ease-linear"
          style={{ 
            width: `${((i + 1) / images.length) * 100}%`,
            backgroundColor: '#d3af37'
          }}
        >
          <div 
            className="h-full animate-pulse"
            style={{ backgroundColor: 'rgba(240, 240, 240, 0.3)' }}
          ></div>
        </div>
      </div>

      {/* enhanced CSS with brand color support */}
      <style>{`
        .transition-opacity{transition:opacity .7s}
        .opacity-0{opacity:0}.opacity-100{opacity:1}
        
        /* Custom scrollbar for better brand consistency */
        *::-webkit-scrollbar {
          width: 6px;
        }
        *::-webkit-scrollbar-track {
          background: rgba(240, 240, 240, 0.1);
        }
        *::-webkit-scrollbar-thumb {
          background: #d3af37;
          border-radius: 3px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(211, 175, 55, 0.8);
        }
      `}</style>
    </section>
  );
}