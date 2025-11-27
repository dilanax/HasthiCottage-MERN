import React from 'react';

const Rooms = () => {
  const rooms = [
    {
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      name: 'Deluxe Suite',
      description: 'Spacious suite with panoramic views, king-sized bed, and luxury amenities.',
      price: '$299/night',
      amenities: ['King Bed', 'Panoramic Views', 'Luxury Bath']
    },
    {
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
      name: 'Safari View Room',
      description: 'Comfortable room with direct views of the wildlife reserve and modern comforts.',
      price: '$199/night',
      amenities: ['Wildlife Views', 'Modern Comfort', 'Private Balcony']
    },
    {
      image: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      name: 'Family Cottage',
      description: 'Perfect for families with separate bedrooms, living area, and private garden.',
      price: '$399/night',
      amenities: ['Separate Bedrooms', 'Living Area', 'Private Garden']
    }
  ];

  const handleBookNow = (roomName) => {
    alert(`Booking functionality for ${roomName} would be implemented in a full application.`);
  };

  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#f0f0f0' }}
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(211, 175, 55, 0.08)' }}
        ></div>
        <div 
          className="absolute bottom-32 right-16 w-40 h-40 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(211, 175, 55, 0.06)' }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
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
            Our Accommodations
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: '#0a0a0a' }}
          >
            Luxury Meets
            <span 
              className="block bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, #d3af37 0%, #d3af37 100%)`,
                WebkitBackgroundClip: 'text'
              }}
            >
              Wilderness
            </span>
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(10, 10, 10, 0.7)' }}
          >
            Each room is thoughtfully designed to provide comfort while maintaining 
            your connection with the natural world around you.
          </p>
        </div>
        
        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {rooms.map((room, index) => (
            <div 
              key={index} 
              className="group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl"
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid rgba(211, 175, 55, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(211, 175, 55, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(10, 10, 10, 0.1)';
              }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                
                {/* Price badge */}
                <div 
                  className="absolute top-4 right-4 px-3 py-2 rounded-xl backdrop-blur-md font-semibold text-sm"
                  style={{
                    backgroundColor: 'rgba(211, 175, 55, 0.9)',
                    color: '#0a0a0a'
                  }}
                >
                  {room.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 
                  className="text-2xl font-bold mb-3 transition-colors duration-300"
                  style={{ color: '#0a0a0a' }}
                >
                  {room.name}
                </h3>
                
                <p 
                  className="mb-4 leading-relaxed"
                  style={{ color: 'rgba(10, 10, 10, 0.7)' }}
                >
                  {room.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.map((amenity, amenityIndex) => (
                    <span 
                      key={amenityIndex}
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: 'rgba(211, 175, 55, 0.1)',
                        color: '#0a0a0a',
                        border: '1px solid rgba(211, 175, 55, 0.3)'
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Book button */}
                <button 
                  onClick={() => handleBookNow(room.name)}
                  className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  style={{
                    backgroundColor: '#d3af37',
                    color: '#0a0a0a'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 10px 25px rgba(211, 175, 55, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Rooms CTA */}
        <div className="text-center">
          <button 
            className="inline-flex items-center gap-3 px-8 py-4 border-2 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
            style={{
              borderColor: '#d3af37',
              color: '#d3af37',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d3af37';
              e.target.style.color = '#0a0a0a';
              e.target.style.boxShadow = '0 10px 25px rgba(211, 175, 55, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#d3af37';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>View All Rooms</span>
            <div 
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform duration-300"
              style={{ borderColor: 'currentColor' }}
            >
              <span className="text-sm">→</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Rooms;