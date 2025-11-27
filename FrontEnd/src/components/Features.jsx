import React from "react";

const Features = () => {
  const features = [
    {
      image:
        "https://images.unsplash.com/photo-1501117716987-c8e1ecb210a4?w=400&h=400&fit=crop",
      title: "Premium Service",
      description:
        "Our dedicated staff ensures your stay is comfortable and memorable with personalized attention.",
      icon: "🏆"
    },
    {
      image:
        "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=400&h=400&fit=crop",
      title: "Perfect Location",
      description:
        "Nestled in a pristine natural setting with easy access to wildlife reserves and scenic spots.",
      icon: "📍"
    },
    {
      image:
        "https://images.unsplash.com/photo-1555992336-03a23c8bf8a0?w=400&h=400&fit=crop",
      title: "Gourmet Dining",
      description:
        "Enjoy exquisite local and international cuisine prepared by our award-winning chefs.",
      icon: "🍽️"
    },
  ];

  return (
    <section 
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: '#f0f0f0' }}
    >
      {/* Subtle background elements with brand colors */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(211, 175, 55, 0.1)' }}
        ></div>
        <div 
          className="absolute bottom-32 right-16 w-40 h-40 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(211, 175, 55, 0.08)' }}
        ></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full mb-6"
            style={{
              backgroundColor: 'rgba(211, 175, 55, 0.15)',
              color: '#0a0a0a'
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#d3af37' }}
            ></span>
            Why Choose Us
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ color: '#0a0a0a' }}
          >
            Experience the Extraordinary at
            <span 
              className="block bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, #d3af37 0%, #d3af37 100%)`,
                WebkitBackgroundClip: 'text'
              }}
            >
              Safari Cottage
            </span>
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(10, 10, 10, 0.7)' }}
          >
            Where luxury meets wilderness. Thoughtfully curated experiences that redefine 
            your connection with nature.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative"
            >
              {/* Card */}
              <div 
                className="relative h-full backdrop-blur-sm border rounded-3xl shadow-lg transition-all duration-500 overflow-hidden hover:shadow-2xl"
                style={{
                  backgroundColor: 'rgba(240, 240, 240, 0.9)',
                  borderColor: 'rgba(211, 175, 55, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(211, 175, 55, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(10, 10, 10, 0.1)';
                }}
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, rgba(211, 175, 55, 0.05) 100%)`
                  }}
                ></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Image with modern styling */}
                  <div className="relative mb-8">
                    <div className="w-full h-48 overflow-hidden rounded-2xl shadow-lg">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    
                    {/* Icon badge */}
                    <div 
                      className="absolute -bottom-4 left-6 w-12 h-12 shadow-lg rounded-xl flex items-center justify-center text-xl border group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: '#f0f0f0',
                        borderColor: 'rgba(211, 175, 55, 0.3)'
                      }}
                    >
                      {feature.icon}
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="space-y-4">
                    <h3 
                      className="text-2xl font-bold transition-colors duration-300"
                      style={{ 
                        color: '#0a0a0a',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#d3af37'}
                      onMouseLeave={(e) => e.target.style.color = '#0a0a0a'}
                    >
                      {feature.title}
                    </h3>
                    
                    {/* Animated underline */}
                    <div className="relative">
                      <div 
                        className="h-1 w-16 rounded-full group-hover:w-24 transition-all duration-500"
                        style={{ backgroundColor: '#d3af37' }}
                      ></div>
                    </div>
                    
                    <p 
                      className="leading-relaxed text-base"
                      style={{ color: 'rgba(10, 10, 10, 0.7)' }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover effect arrow */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: '#d3af37',
                        color: '#0a0a0a'
                      }}
                    >
                      →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="mt-20 text-center">
          <button 
            className="inline-flex items-center gap-3 px-6 py-3 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: '#d3af37',
              color: '#0a0a0a'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 20px 40px rgba(211, 175, 55, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 10px 25px rgba(211, 175, 55, 0.2)';
            }}
          >
            <span>Discover More</span>
            <div 
              className="w-5 h-5 border-2 rounded-full flex items-center justify-center"
              style={{ borderColor: '#0a0a0a' }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#0a0a0a' }}
              ></div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;