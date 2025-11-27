import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      initials: 'JS',
      name: 'John Smith',
      rating: 5,
      comment: '"Our stay at Safari Cottage was absolutely magical. The attention to detail and personalized service made our safari experience unforgettable."'
    },
    {
      initials: 'MJ',
      name: 'Maria Johnson',
      rating: 4.5,
      comment: '"The perfect blend of luxury and nature. Waking up to the sounds of the wild while enjoying five-star amenities was a unique experience."'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Guests Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-custom-yellow rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <div className="flex text-custom-yellow">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;