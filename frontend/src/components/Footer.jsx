import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#2a1a0f] to-[#1a0f08] text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="md:col-span-1">
            <div className="mb-5 bg-transparent">
              <img 
                src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                alt="Shopzy Logo"
                className="h-12 w-auto object-contain mb-5 filter brightness-110"
                style={{ backgroundColor: 'transparent', background: 'transparent' }}
              />
            </div>
            <h3 className="text-white text-lg font-bold mb-3 tracking-wide">About Shopzy</h3>
            <p className="text-sm text-gray-300 mb-5 leading-relaxed">
              Your one-stop destination for fashion, watches, and accessories. Shop the latest trends with the best prices.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/50"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 tracking-wide relative pb-2">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/women" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link 
                  to="/watches" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Watches
                </Link>
              </li>
              <li>
                <Link 
                  to="/lenses" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Lenses & Spectacles
                </Link>
              </li>
              <li>
                <Link 
                  to="/skincare" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Skincare
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 tracking-wide relative pb-2">
              Customer Service
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/track-order" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link 
                  to="/size-guide" 
                  className="text-gray-300 hover:text-white transition-all duration-300 inline-block hover:translate-x-1 hover:underline hover:underline-offset-4 decoration-amber-400"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 tracking-wide relative pb-2">
              Contact Us
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-amber-500/20 transition-all duration-300">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">support@shopzy.com</span>
              </li>
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-amber-500/20 transition-all duration-300">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">+91 1800-123-4567</span>
              </li>
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-amber-500/20 transition-all duration-300">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">123 Shopping Street,<br />Mumbai, India 400001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2024 Shopzy. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-sm">
              <Link 
                to="/privacy-policy" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookie-policy" 
                className="text-gray-400 hover:text-amber-400 transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

