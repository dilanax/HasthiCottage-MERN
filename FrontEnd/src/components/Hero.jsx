import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Calendar, MapPin, Star, Volume2, VolumeX, Leaf, Heart } from "lucide-react";

const Hero = () => {
  // Creative wildlife and forest imagery with elephants and diverse animals
  const slides = [
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&h=900&fit=crop&q=80", // Majestic elephant in golden sunset
      title: "Gentle Giants",
      subtitle: "Walk alongside magnificent elephants in their natural habitat",
      category: "Wildlife"
    },
    {
      type: "video",
      src: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69fabf10c8f6ef8130b9a970c&profile_id=139&oauth2_token_id=57447761",
      title: "Forest Symphony",
      subtitle: "Experience the living, breathing heart of the wilderness",
      fallbackImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&h=900&fit=crop&q=80", // Dense green forest
      category: "Nature"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=900&fit=crop&q=80", // Elephant family crossing river
      title: "Family Bonds",
      subtitle: "Witness the incredible social bonds of elephant families",
      category: "Wildlife"
    },
    {
      type: "image", 
      src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&h=900&fit=crop&q=80", // Leopard in tree canopy
      title: "Elusive Predators",
      subtitle: "Spot the magnificent leopards hidden in ancient trees",
      category: "Wildlife"
    },
    {
      type: "video",
      src: "https://player.vimeo.com/external/370467425.sd.mp4?s=96b1ad0ca8a8e48ae2e0d15723cb22a3&profile_id=139&oauth2_token_id=57447761",
      title: "Misty Dawn",
      subtitle: "Early morning encounters in the mystical forest mist",
      fallbackImage: "https://images.unsplash.com/photo-1502780402662-acc01917106e?w=1600&h=900&fit=crop&q=80", // Misty forest at dawn
      category: "Nature"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=1600&h=900&fit=crop&q=80", // Colorful birds in forest
      title: "Winged Wonders", 
      subtitle: "Discover exotic birds painting the forest with color",
      category: "Wildlife"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop&q=80", // Baby elephant with mother
      title: "New Beginnings",
      subtitle: "Precious moments with elephant calves learning life's lessons",
      category: "Wildlife"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1516641396327-8609fdbab937?w=1600&h=900&fit=crop&q=80", // Monkey families in trees
      title: "Playful Primates",
      subtitle: "Watch animated monkey families swing through emerald canopies",
      category: "Wildlife"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1600&h=900&fit=crop&q=80", // Water buffalo at watering hole
      title: "Watering Holes",
      subtitle: "Gather where all forest creatures come to drink and socialize",
      category: "Wildlife"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&h=900&fit=crop&q=80", // Stunning forest landscape
      title: "Ancient Wilderness",
      subtitle: "Step into untouched forests where time stands still",
      category: "Nature"
    }
  ];

  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState({});

  // Auto-advance with nature-inspired timing
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const currentSlide = slides[current];
    const duration = currentSlide.type === 'video' ? 4000 : 3000; // 4s for videos, 3s for images
    
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, duration);
    
    return () => clearInterval(id);
  }, [current, slides.length, isAutoPlaying]);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  const handleVideoError = (index) => {
    setVideoError(prev => ({ ...prev, [index]: true }));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Slides with enhanced transitions */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            {slide.type === 'video' && !videoError[i] ? (
              <video
                src={slide.src}
                className="w-full h-full object-cover"
                autoPlay={i === current}
                muted={isMuted}
                loop
                playsInline
                onError={() => handleVideoError(i)}
              />
            ) : (
              <img
                src={slide.type === 'video' ? slide.fallbackImage : slide.src}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[5000ms] ${
                  i === current ? "scale-110" : "scale-100"
                }`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            
            {/* Enhanced overlay with brand colors */}
            <div className={`absolute inset-0 ${
              slide.type === 'video' 
                ? "bg-gradient-to-r from-black/70 via-black/40 to-black/60"
                : "bg-gradient-to-r from-black/75 via-black/35 to-black/55"
            }`} />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" 
              style={{ 
                background: `linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, transparent 50%, rgba(211, 175, 55, 0.1) 100%)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Animated nature particles */}
      {slides[current].category === 'Nature' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 right-10 w-32 h-32 rounded-full blur-3xl animate-pulse"
            style={{ backgroundColor: 'rgba(211, 175, 55, 0.08)' }}
          ></div>
          <div 
            className="absolute bottom-32 left-16 w-40 h-40 rounded-full blur-3xl animate-pulse delay-1000"
            style={{ backgroundColor: 'rgba(240, 240, 240, 0.05)' }}
          ></div>
          <div 
            className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full blur-2xl animate-pulse delay-500"
            style={{ backgroundColor: 'rgba(211, 175, 55, 0.06)' }}
          ></div>
        </div>
      )}

      {/* Video Controls with brand styling */}
      {slides[current].type === 'video' && (
        <div className="absolute top-6 right-6 z-30 flex gap-2">
          <button
            onClick={toggleMute}
            className="w-12 h-12 rounded-2xl backdrop-blur-md hover:backdrop-blur-lg border flex items-center justify-center group transition-all duration-300"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.3)',
              borderColor: 'rgba(211, 175, 55, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.2)';
              e.target.style.borderColor = 'rgba(211, 175, 55, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(10, 10, 10, 0.3)';
              e.target.style.borderColor = 'rgba(211, 175, 55, 0.3)';
            }}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: '#f0f0f0' }} />
            ) : (
              <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: '#f0f0f0' }} />
            )}
          </button>
          
          <div 
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-2xl border text-sm"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.3)',
              borderColor: 'rgba(211, 175, 55, 0.3)',
              color: '#f0f0f0'
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#d3af37' }}></div>
            <span>LIVE</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Dynamic Badge with brand colors */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md text-sm font-medium rounded-full mb-6 border"
              style={{
                backgroundColor: 'rgba(240, 240, 240, 0.15)',
                borderColor: 'rgba(211, 175, 55, 0.3)',
                color: '#f0f0f0'
              }}
            >
              {slides[current].category === 'Wildlife' ? (
                <Heart className="w-4 h-4 fill-current" style={{ color: '#d3af37' }} />
              ) : (
                <Leaf className="w-4 h-4" style={{ color: '#d3af37' }} />
              )}
              {slides[current].category === 'video' ? 'Live Nature Experience' : `${slides[current].category} Safari Experience`}
              <div 
                className={`w-2 h-2 rounded-full animate-pulse`}
                style={{ 
                  backgroundColor: slides[current].type === 'video' ? '#d3af37' : '#d3af37'
                }}
              ></div>
            </div>

            {/* Dynamic content based on current slide */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight" style={{ color: '#f0f0f0' }}>
                <span className="block">{slides[current].title}</span>
                <span 
                  className="block bg-clip-text text-transparent"
                  style={{ 
                    background: `linear-gradient(135deg, #d3af37 0%, #f0f0f0 100%)`,
                    WebkitBackgroundClip: 'text'
                  }}
                >
                  Safari Cottage
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl max-w-2xl leading-relaxed" style={{ color: 'rgba(240, 240, 240, 0.9)' }}>
                {slides[current].subtitle}
              </p>

              {/* Enhanced Stats with dynamic content */}
              <div className="flex flex-wrap gap-8 py-4">
                <div className="flex items-center gap-2" style={{ color: 'rgba(240, 240, 240, 0.8)' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#d3af37' }} />
                  <span className="font-medium">Prime {slides[current].category} Location</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'rgba(240, 240, 240, 0.8)' }}>
                  <Star className="w-5 h-5 fill-current" style={{ color: '#d3af37' }} />
                  <span className="font-medium">5-Star Eco-Luxury</span>
                </div>
                {slides[current].type === 'video' && (
                  <div className="flex items-center gap-2" style={{ color: 'rgba(240, 240, 240, 0.8)' }}>
                    <Play className="w-5 h-5" style={{ color: '#d3af37' }} />
                    <span className="font-medium">Live Experience</span>
                  </div>
                )}
              </div>

              {/* Enhanced CTA Buttons with brand colors */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className="group relative overflow-hidden px-8 py-4 font-semibold text-lg rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    backgroundColor: '#d3af37',
                    color: '#0a0a0a'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 25px 50px rgba(211, 175, 55, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Book Your Safari</span>
                  </div>
                </button>
                
                <button 
                  className="group px-8 py-4 font-semibold text-lg rounded-2xl border-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(240, 240, 240, 0.1)',
                    borderColor: 'rgba(211, 175, 55, 0.4)',
                    color: '#f0f0f0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.1)';
                    e.target.style.borderColor = 'rgba(211, 175, 55, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(240, 240, 240, 0.1)';
                    e.target.style.borderColor = 'rgba(211, 175, 55, 0.4)';
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>{slides[current].type === 'video' ? 'Watch Full Tour' : 'Virtual Experience'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls with brand styling */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-2xl backdrop-blur-md border flex items-center justify-center group transition-all duration-300"
        style={{
          backgroundColor: 'rgba(240, 240, 240, 0.1)',
          borderColor: 'rgba(211, 175, 55, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.2)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(240, 240, 240, 0.1)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.3)';
        }}
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" style={{ color: '#f0f0f0' }} />
      </button>
      
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-2xl backdrop-blur-md border flex items-center justify-center group transition-all duration-300"
        style={{
          backgroundColor: 'rgba(240, 240, 240, 0.1)',
          borderColor: 'rgba(211, 175, 55, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(211, 175, 55, 0.2)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(240, 240, 240, 0.1)';
          e.target.style.borderColor = 'rgba(211, 175, 55, 0.3)';
        }}
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" style={{ color: '#f0f0f0' }} />
      </button>

      {/* Enhanced Indicators with Content Type Icons and brand styling */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div 
          className="flex items-center gap-3 px-4 py-3 backdrop-blur-md rounded-2xl border"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.3)',
            borderColor: 'rgba(211, 175, 55, 0.3)'
          }}
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-medium ${
                i === current ? "text-black" : ""
              }`}
              style={{
                backgroundColor: i === current ? '#d3af37' : 'transparent',
                color: i === current ? '#0a0a0a' : 'rgba(240, 240, 240, 0.6)'
              }}
              onMouseEnter={(e) => {
                if (i !== current) {
                  e.target.style.color = 'rgba(240, 240, 240, 0.8)';
                  e.target.style.backgroundColor = 'rgba(240, 240, 240, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (i !== current) {
                  e.target.style.color = 'rgba(240, 240, 240, 0.6)';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {slide.type === 'video' ? (
                <Play className="w-3 h-3" />
              ) : slide.category === 'Wildlife' ? (
                <Heart className="w-3 h-3" />
              ) : (
                <Leaf className="w-3 h-3" />
              )}
              {i === current && <span className="text-xs">{slide.type === 'video' ? 'LIVE' : slide.category.toUpperCase()}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Progress Bar with brand colors */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div style={{ height: '6px', backgroundColor: 'rgba(240, 240, 240, 0.1)' }}>
          <div 
            className="h-full transition-all duration-300 ease-linear"
            style={{ 
              width: `${((current + 1) / slides.length) * 100}%`,
              backgroundColor: slides[current].type === 'video' ? '#d3af37' : '#d3af37'
            }}
          >
            <div 
              className="h-full animate-pulse"
              style={{ backgroundColor: 'rgba(240, 240, 240, 0.3)' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator with brand colors */}
      <div className="absolute bottom-8 right-8 z-20 animate-bounce">
        <div 
          className="w-6 h-10 border-2 rounded-full flex justify-center"
          style={{ borderColor: 'rgba(211, 175, 55, 0.5)' }}
        >
          <div 
            className="w-1 h-3 rounded-full mt-2 animate-pulse"
            style={{ backgroundColor: 'rgba(211, 175, 55, 0.7)' }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;