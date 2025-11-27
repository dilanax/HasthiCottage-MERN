import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import Header from '../components/Header';
import AuthHeader from '../components/AuthHeader';
import HeroCarousel from '../components/HeroCarousel';
import ArtDisplay from './artisanal/guest/ArtDisplay';
import ReviewSection from './review/guest/ReviewSection';
import Footer from "../components/Footer";

const asset = (path) => new URL(`../assets/${path}`, import.meta.url).href;

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAdventureIndex, setCurrentAdventureIndex] = useState(0);
  const [currentSafariIndex, setCurrentSafariIndex] = useState(0);
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const heroVideo = asset('hero-video.mp4');
  const heroFallback = asset('main.jpg');

  const cottages = [
    {
      title: 'Gajaga',
      subtitle: 'Escape the chaos with luxurious sleeping space',
      image: asset('cot1.jpg')
    },
    {
      title: 'Raja Cottage',
      subtitle: 'Wake up by the lake in our cozy retreat',
      image: asset('cot2.jpg')
    },
    {
      title: 'King Kandula',
      subtitle: 'Luxury grounded in nature wilderness',
      image: asset('cot3.jpg')
    },
    {
      title: 'Skyleaf',
      subtitle: 'Float among leaves and sunlight — your serene wooden treehouse with a view',
      image: asset('cot4.jpg')
    }
  ];

  const galleryImages = [
    asset('gallery/IMG-20250819-WA0029.jpg'),
    asset('gallery/IMG-20251011-WA0003.jpg'),
    asset('gallery/IMG-20251011-WA0016.jpg'),
    asset('gallery/IMG-20251011-WA0024.jpg'),
    asset('gallery/IMG-20251011-WA0027.jpg'),
    asset('gallery/IMG-20251011-WA0035.jpg'),
    asset('gallery/IMG-20251011-WA0043.jpg'),
    asset('gallery/IMG-20251011-WA0047.jpg'),
    asset('gallery/IMG-20251011-WA0051.jpg'),
    asset('gallery/IMG-20251011-WA0052.jpg')
  ];

  // safari section images
  const adventureImages = [
    asset('adventure/adams-peak.jpg'),
    asset('safari/tiger.jpg'),
    asset('adventure/udawalawe.jpeg'),
    asset('adventure/ali.JPG'),
    asset('safari-baby-ele.jpg')
  ];

  // adventure section images
  const safariImages = [
    asset('safari-couple.jpg'),
    asset('safari/cheeta.jpg'),
    asset('safari-deer.jpg'),
    asset('safari-pelican.jpg'),
    asset('safari-iguana.jpg'),
    asset('safari/IMG-20250819-WA0001.jpg')
  ];

  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        try {
          JSON.parse(userData); // Validate JSON
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
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

  // Photo shuffling effect for adventure section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdventureIndex((prevIndex) => 
        (prevIndex + 1) % adventureImages.length
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [adventureImages.length]);

  // Photo shuffling effect for safari section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSafariIndex((prevIndex) => 
        (prevIndex + 1) % safariImages.length
      );
    }, 3500); // Change image every 3.5 seconds

    return () => clearInterval(interval);
  }, [safariImages.length]);

  // Gallery scrolling functions
  const scrollGallery = (direction) => {
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
      const scrollAmount = 400; // Scroll by 400px
      const newPosition = direction === 'left' 
        ? galleryScrollPosition - scrollAmount 
        : galleryScrollPosition + scrollAmount;
      
      const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
      const finalPosition = Math.max(0, Math.min(newPosition, maxScroll));
      
      setGalleryScrollPosition(finalPosition);
      galleryContainer.scrollTo({
        left: finalPosition,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll position on scroll
  useEffect(() => {
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
      const handleScroll = () => {
        setGalleryScrollPosition(galleryContainer.scrollLeft);
      };
      
      galleryContainer.addEventListener('scroll', handleScroll);
      return () => galleryContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Toggle story expansion
  const toggleStory = () => {
    setIsStoryExpanded(!isStoryExpanded);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f0f0' }}>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {isLoggedIn ? <AuthHeader /> : <Header />}
       {/* Hero Section */}
       <section className="relative h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
         {/* Video Background */}
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay 
          muted 
          loop 
          playsInline
          poster={heroFallback}
          preload="auto"
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
         
         {/* Overlay for better text readability */}
         <div className="absolute inset-0 bg-black bg-opacity-40"></div>
         
         <div className="relative z-10 text-center max-w-4xl mx-auto px-4" style={{ color: '#f0f0f0' }}>
           <h1 className="text-9xl md:text-10xl font-bold mb-6 tracking-wide">
             WELCOME
             <br />
             <span style={{ color: '#d3af37' }}>HASTHI SAFARI COTTAGE</span>
           </h1>
           <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#ffffffff', opacity: 0.8 }}>
             Experience luxury in the heart of wilderness. Where comfort meets adventure in an unforgettable safari experience.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <button 
               className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
               onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
             >
               BOOK NOW
             </button>
             <button 
               className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/30"
             >
               EXPLORE MORE
             </button>
           </div>
         </div>
         <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
           <div className="animate-bounce">
             <div className="w-6 h-10 rounded-full flex justify-center" style={{ border: '2px solid #f0f0f0' }}>
               <div className="w-1 h-3 rounded-full mt-2 animate-pulse" style={{ backgroundColor: '#f0f0f0' }}></div>
             </div>
           </div>
         </div>
       </section>

      {/* Reservation Section */}
      <section id="booking" className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-12" style={{ color: '#0a0a0a' }}>MAKE A RESERVATION</h2>
          <div className="rounded-2xl shadow-xl p-8 max-w-4xl mx-auto" style={{ backgroundColor: '#f0f0f0', border: '1px solid #d3af37' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0a0a0a' }}>Check In</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #0a0a0a', 
                      color: '#0a0a0a',
                      '--tw-ring-color': '#d3af37'
                    }}
                  />
                  <Calendar className="absolute right-3 top-3 h-5 w-5" style={{ color: '#0a0a0a' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0a0a0a' }}>Check Out</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #0a0a0a', 
                      color: '#0a0a0a',
                      '--tw-ring-color': '#d3af37'
                    }}
                  />
                  <Calendar className="absolute right-3 top-3 h-5 w-5" style={{ color: '#0a0a0a' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#0a0a0a' }}>Guests</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 appearance-none"
                    style={{ 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #0a0a0a', 
                      color: '#0a0a0a',
                      '--tw-ring-color': '#d3af37'
                    }}
                  >
                    <option>2 Guests</option>
                    <option>4 Guests</option>
                    <option>6 Guests</option>
                  </select>
                  <Users className="absolute right-3 top-3 h-5 w-5" style={{ color: '#0a0a0a' }} />
                </div>
              </div>
              <div>
                <button 
                  className="w-full py-3 px-6 rounded-lg transition-colors font-medium"
                  style={{ 
                    backgroundColor: '#d3af37', 
                    color: '#0a0a0a',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b8971f'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#d3af37'}
                >
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cottages Section */}
      <section id="cottages" className="py-16" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16" style={{ color: '#0a0a0a' }}>OUR COTTAGES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cottages.map((cottage, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-6 h-80">
                  <img 
                    src={cottage.image} 
                    alt={cottage.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.5), transparent)' }}></div>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#0a0a0a' }}>{cottage.title}</h3>
                <p className="leading-relaxed" style={{ color: '#0a0a0a', opacity: 0.7 }}>{cottage.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Section */}
      <section id="restaurant" className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" 
                alt="Restaurant Interior"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl font-bold mb-6" style={{ color: '#0a0a0a' }}>CULINARY EXCELLENCE</h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#0a0a0a', opacity: 0.7 }}>
                Indulge in a gastronomic journey featuring authentic Sri Lankan cuisine and international delicacies. 
                Our expert chefs craft each dish with locally sourced ingredients, creating unforgettable dining experiences 
                that celebrate the rich flavors of our region.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d3af37' }}></div>
                  <span style={{ color: '#0a0a0a' }}>Traditional Sri Lankan Cuisine</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d3af37' }}></div>
                  <span style={{ color: '#0a0a0a' }}>Fresh Local Ingredients</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d3af37' }}></div>
                  <span style={{ color: '#0a0a0a' }}>International Menu Options</span>
                </div>
              </div>
              <button 
                className="px-8 py-3 rounded-full transition-colors font-medium"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b8971f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d3af37'}
              >
                View Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* adventure Section */}
      <section id="safari" className="py-16" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6" style={{ color: '#0a0a0a' }}>Your Gateway to
                Wild Adventures</h2>
              <p className="text-lg leading-relaxed" style={{ color: '#0a0a0a', opacity: 0.7 }}>
              Explore Udawalawe National Park's majestic elephant herds and diverse wildlife. Visit the Elephant Transit Home, discover the ancient Waulpane Cave with its historical rock formations, enjoy scenic nature trails, and marvel at stunning reservoir views.
              </p>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                <img 
                  src={safariImages[currentSafariIndex]} 
                  alt="Safari Adventures"
                  className="w-full h-96 object-cover transition-all duration-1000 group-hover:scale-105"
                  key={currentSafariIndex} // Force re-render for smooth transition
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                
                {/* Navigation arrows */}
                <button 
                  onClick={() => setCurrentSafariIndex((prev) => prev === 0 ? safariImages.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => setCurrentSafariIndex((prev) => (prev + 1) % safariImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {safariImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSafariIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSafariIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* safari Section */}
      <section id="adventure" className="py-16" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img 
                  src={adventureImages[currentAdventureIndex]} 
                alt="Adventure Activities"
                  className="w-full h-96 object-cover transition-all duration-1000 group-hover:scale-105"
                  key={currentAdventureIndex} // Force re-render for smooth transition
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                
                {/* Navigation arrows */}
                <button 
                  onClick={() => setCurrentAdventureIndex((prev) => prev === 0 ? adventureImages.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => setCurrentAdventureIndex((prev) => (prev + 1) % adventureImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {adventureImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentAdventureIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentAdventureIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl font-bold mb-6" style={{ color: '#0a0a0a' }}>SAFARI AWAITS</h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#0a0a0a', opacity: 0.7 }}>
                Your Udawalawe safari adventure begins right from our doorstep. Just minutes away, one of Sri Lanka's greatest wildlife sanctuaries awaits with its famous elephant herds and untamed landscapes.<br/>
                Join an exciting jeep safari and let experienced guides take you deep into the wilderness. Watch majestic elephants roam freely, spot diverse wildlife, and immerse yourself in nature's raw beauty.
                The wild is calling. Your adventure starts here.
              </p>
              <button 
                className="px-8 py-3 rounded-full transition-colors font-medium"
                style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b8971f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d3af37'}
              >
                Explore Packages
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Exclusive Packages Section */}
      <section id="offers" className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6" style={{ color: '#0a0a0a' }}>EXCLUSIVE PACKAGES</h2>
          <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed" style={{ color: '#0a0a0a', opacity: 0.7 }}>
            Take advantage of our special offers and packages, designed to enhance your stay and 
            provide exceptional value.
          </p>
          <button 
            className="px-8 py-3 rounded-full transition-colors font-medium"
            style={{ backgroundColor: '#d3af37', color: '#0a0a0a' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b8971f'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#d3af37'}
          >
            View Packages
          </button>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16" style={{ color: '#0a0a0a' }}>GALLERY</h2>
          
          {/* Gallery Container with Navigation */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button 
              onClick={() => scrollGallery('left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={() => scrollGallery('right')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Horizontal Scrolling Gallery */}
            <div 
              id="gallery-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            {galleryImages.map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl group cursor-pointer flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                    className="w-80 h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.3), transparent)' }}></div>
                  
                  {/* Image overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
              </div>
            ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(galleryImages.length / 3) }).map((_, index) => (
                <div 
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-400"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* Local Art Section */}
      <div id="artisanal">
        <ArtDisplay />
      </div>

      {/* About Section */}
      <section id="about" className="py-16" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
          <h2 className="text-5xl font-bold mb-8" style={{ color: '#0a0a0a' }}>ABOUT US</h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#0a0a0a', opacity: 0.7 }}>
            Nestled at the heart of a pristine forest, our luxury resort offers an unparalleled 
            experience of serenity that embodies the perfect balance between rustic charm and 
                modern sophistication.
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#0a0a0a', opacity: 0.7 }}>
                Our unwavering commitment to exceptional service sets us apart, creating unforgettable 
                memories for every guest who walks through our doors.
              </p>
              
              {/* Expanding Story Content */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isStoryExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#0a0a0a' }}>Our Journey</h3>
                  <p className="text-base leading-relaxed mb-4" style={{ color: '#0a0a0a', opacity: 0.8 }}>
                    Founded in 2015, Hasthi Safari Cottage began as a dream to create a sanctuary where 
                    luxury meets wilderness. Our founders, inspired by the majestic elephants of Udawalawe, 
                    envisioned a place where guests could experience the raw beauty of nature without 
                    compromising on comfort.
                  </p>
                  <p className="text-base leading-relaxed mb-4" style={{ color: '#0a0a0a', opacity: 0.8 }}>
                    Over the years, we've welcomed thousands of guests from around the world, each leaving 
                    with stories of unforgettable encounters with wildlife, moments of pure serenity, and 
                    memories that last a lifetime. Our commitment to sustainable tourism and conservation 
                    has made us a beacon of responsible hospitality in the region.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: '#0a0a0a', opacity: 0.8 }}>
                    Today, we continue to evolve while staying true to our core values: respect for nature, 
                    exceptional service, and creating magical experiences that connect our guests with the 
                    incredible wildlife and landscapes of Sri Lanka.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={toggleStory}
                  className="px-8 py-3 rounded-full transition-colors font-medium border-2"
                  style={{ 
                    borderColor: '#d3af37', 
                    color: '#0a0a0a',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d3af37';
                    e.target.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#0a0a0a';
                  }}
                >
                  {isStoryExpanded ? 'Read Less' : 'Our Story'}
                </button>
              </div>
            </div>
            
            {/* Photo Content */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=500&fit=crop" 
                  alt="Hasthi Safari Cottage - About Us"
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                
                {/* Overlay content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center text-white">
                    <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
                      <h3 className="text-2xl font-bold mb-2">Experience Luxury</h3>
                      <p className="text-sm opacity-90">Where nature meets comfort</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#d3af37' }}></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-30" style={{ backgroundColor: '#d3af37' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Reviews */}
      <div id="review">
        <ReviewSection/>
      </div>


      <div id="contact">
        <Footer />
      </div>
    </main>
  );
};

export default Home;