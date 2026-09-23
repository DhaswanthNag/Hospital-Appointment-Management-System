import React, { useState, useEffect } from 'react';
import homeImg from "../assets/home.png";

// Function to handle smooth scrolling
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const MediCare = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // Function to check scroll position and show/hide the button
  const checkScrollTop = () => {
    if (!showScroll && window.scrollY > 400) {
      setShowScroll(true);
    } else if (showScroll && window.scrollY <= 400) {
      setShowScroll(false);
    }
  };

  // Function to handle scrolling to the top
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [showScroll]);

  // Handler for navigation links
  const handleNavLinkClick = (e, id) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close mobile menu after clicking a link
    scrollToSection(id);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="bg-white py-4 px-6 top-0 z-50"> {/* Added sticky and z-50 */}
        <div className="container mx-auto flex justify-between items-center">
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 py-3 w-full justify-center items-center">
            <a
              href="#services"
              onClick={(e) => handleNavLinkClick(e, 'services')}
              className="text-gray-700 hover:text-lime-600 transition-colors"
            >
              Services
            </a>

            <a
              href="#features"
              onClick={(e) => handleNavLinkClick(e, 'features')}
              className="text-gray-700 hover:text-lime-600 transition-colors"
            >
              Features
            </a>

            <a
              href="#contact"
              onClick={(e) => handleNavLinkClick(e, 'contact')}
              className="text-gray-700 hover:text-lime-600 transition-colors"
            >
              Contact
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 px-6 shadow-lg absolute w-full left-0 z-40"> {/* Added absolute positioning */}
            <div className="flex flex-col space-y-4">
              <a href="#services" onClick={(e) => handleNavLinkClick(e, 'services')} className="text-gray-700 hover:text-lime-900 rounded-lg transition-colors">Services</a>
              <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="text-gray-700 hover:text-lime-900 rounded-lg transition-colors">Features</a>
              <a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="text-gray-700 hover:text-lime-900 rounded-lg transition-colors">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - This is the top of the home page */}
      <section id="home" className="py-12 px-6 bg-gradient-to-r from-lime-50 to-lime-50">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-6xl md:text-6xl text-center font-bold text-lime-600 mb-6">
              Q<span className="text-lime-700">-</span>
              <span className="text-gray-800">Medico</span>
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 text-center">
              Schedule Your Health, <span className="text-lime-600">Manage Your Time</span>
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Welcome to Q-Medico, your trusted hospital appointment management system. Book appointments, track your medical visits, and stay connected with our healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-lime-600 text-white text-center px-6 py-3 rounded-md hover:bg-lime-700 transition-colors font-medium">
                Book Appointment→
              </button>
              <button className="border border-lime-600 text-lime-600 text-center px-6 py-3 rounded-md hover:bg-lime-50 transition-colors font-medium">
                Learn More
              </button>
            </div>
          </div>
        <div className="md:w-1/2 flex justify-center ml-2">
          {/* Increased max-width to max-w-lg and height to h-96 */}
          <div className="bg-gradient-to-br from-lime-100 to-lime-200 rounded-3xl p-4 w-full max-w-lg h-96 flex items-center justify-center">
            <div className="text-center">
              
              {/* Replaced SVG container with an <img> tag */}
                      <img src={homeImg} alt="home" className="w-full max-w-2xl h-80" />
              {/* <p className="text-gray-700 font-medium">Healthcare Management System</p> */}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 px-6 bg-lime-600 text-white mt-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold mb-2">50K+</h3>
              <p className="text-lime-100">Patients Served</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">200+</h3>
              <p className="text-lime-100">Healthcare Professionals</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">98%</h3>
              <p className="text-lime-100">Satisfaction Rate</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-lime-100">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-6 bg-white mt-24">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 mt-16">Our Services</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Comprehensive healthcare solutions for your needs
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "General Checkup", description: "Routine health examination" },
              { name: "Dental Care", description: "Professional dental services" },
              { name: "Eye Care", description: "Vision and eye health services" },
              { name: "Cardiology", description: "Heart and cardiovascular care" },
              { name: "Neurology", description: "Brain and nervous system care" },
              { name: "Pediatrics", description: "Children's healthcare services" },
              { name: "Orthopedics", description: "Bone and joint treatment" },
              { name: "Laboratory", description: "Advanced diagnostic testing" }
            ].map((service, index) => (
              <div key={index} className="bg-white border border-lime-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-lime-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mt-16 mb-4">Why Choose MediCare?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Advanced features designed for your convenience
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Easy Booking", 
                description: "Book appointments in just a few clicks. Choose your preferred date, time, and healthcare professional.",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              },
              { 
                title: "Real-time Updates", 
                description: "Get instant notifications about appointment confirmations, reminders, and any schedule changes.",
                icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              },
              { 
                title: "Secure & Private", 
                description: "Your medical information is protected with hospital-grade encryption and privacy standards.",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              },
              { 
                title: "Expert Doctors", 
                description: "Access to highly qualified and experienced medical professionals across various specialties.",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              },
              { 
                title: "24/7 Support", 
                description: "Round-the-clock customer service to assist with any questions or concerns you may have.",
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              { 
                title: "Multiple Locations", 
                description: "Convenient access to healthcare services through our network of hospitals and clinics.",
                icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-lime-400">Q-Medico</h3>
              <p className="text-gray-400">
                Your trusted partner in healthcare management.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Gallet Labs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-lime-400 transition-colors">Home</a></li>
                <li><a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-lime-400 transition-colors">About</a></li>
                <li><a href="#services" onClick={(e) => handleNavLinkClick(e, 'services')} className="hover:text-lime-400 transition-colors">Services</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="hover:text-lime-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Get In Touch</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91-8464930415</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>dhaswanth31@gmail.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Perupalem,Narsapur</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">© 2025 Q-Medico. All rights reserved.</p>
            </div>
            <div>
              <ul className="flex space-x-6 text-gray-400">
                <li><a href="#" className="hover:text-lime-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showScroll && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-lime-600 text-white rounded-full shadow-lg hover:bg-lime-700 transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-50"
          aria-label="Scroll to Top"
        >
          {/* Up arrow icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MediCare;