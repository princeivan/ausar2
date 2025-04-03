
import React from 'react';

const testimonials = [
  {
    quote: "Working with BrandifyShop was a game-changer for our company. Their branded products helped us leave a lasting impression on clients and at trade shows.",
    name: "Sarah Johnson",
    title: "Marketing Director, TechSolutions Inc.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    quote: "The quality of the custom branded products exceeded our expectations. Our team loves their new gear, and our clients have been impressed with the promotional items.",
    name: "Michael Chen",
    title: "CEO, Innovative Startup",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    quote: "The attention to detail on our branded merchandise was impressive. The colors matched our brand perfectly, and the products have held up well over time.",
    name: "Jessica Miller",
    title: "Brand Manager, Retail Giant",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg"
  }
];

const Testimonials = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Clients Say</h2>
          <div className="h-1 w-20 bg-brand-blue mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className="inline-block w-5 h-5 text-yellow-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
