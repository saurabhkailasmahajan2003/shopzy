import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';

// --- DATA CONFIGURATION (Moved outside component for performance) ---
const NAV_LINKS = [
  { 
    id: 'women', 
    label: 'Fashion', 
    path: '/women', 
    subItems: [
      { name: 'Shirts', path: '/women/shirt' },
      { name: 'T-Shirts', path: '/women/tshirt' },
      { name: 'Jeans', path: '/women/jeans' },
      { name: 'Trousers', path: '/women/trousers' },
      { name: 'Saree', path: '/women/saree' },
    ] 
  },
  { 
    id: 'watches', 
    label: 'Watches', 
    path: '/watches', 
    subItems: [
      { name: 'Classic Watches', path: '/watches?gender=women' },
      { name: 'Smart Watches', path: '/watches?type=smart' },
    ] 
  },
  { 
    id: 'lenses', 
    label: 'Eyewear', 
    path: '/lenses', 
    subItems: [
      { name: 'Eyewear Collection', path: '/lenses?gender=women' },
      { name: 'Sunglasses', path: '/lenses?type=sun' },
    ] 
  },
  { 
    id: 'accessories', 
    label: 'Accessories', 
    path: '/accessories', 
    subItems: [
      { name: 'Accessories Collection', path: '/accessories?gender=women' },
      { name: 'Wallets & Belts', path: '/accessories?type=general' },
      { name: 'Earrings', path: '/accessories?subCategory=earrings' },
    ] 
  },
  { 
    id: 'shoes', 
    label: 'Shoes', 
    path: '/shoes', 
    subItems: [
      { name: 'All Shoes', path: '/shoes' },
      { name: 'Heels', path: '/shoes?subCategory=Heels' },
      { name: 'Flats', path: '/shoes?subCategory=Flats' },
      { name: 'Boots', path: '/shoes?subCategory=Boots' },
      { name: 'Sandals', path: '/shoes?subCategory=Sandals' },
    ] 
  },
  { 
    id: 'skincare', 
    label: 'Skincare', 
    path: '/skincare', 
    subItems: [
      { name: 'Serum', path: '/skincare?category=serum' },
      { name: 'Facewash', path: '/skincare?category=facewash' },
      { name: 'Sunscreen', path: '/skincare?category=sunscreen' },
      { name: 'Moisturizer', path: '/skincare?category=moisturizer' },
      { name: 'Cleanser', path: '/skincare?category=cleanser' },
    ] 
  },
];

const Navbar = () => {
  // Context
  const { getCartItemsCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Router
  const location = useLocation();
  const navigate = useNavigate();
  
  // States
  const [activeCategory, setActiveCategory] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile search
  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(false); // Desktop search animation
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  
  // Refs for click outside
  const searchInputRef = useRef(null);

  // --- EFFECTS ---

  // Handle Active Category Highlighting
  useEffect(() => {
    const path = location.pathname;
    const foundLink = NAV_LINKS.find(link => path.includes(link.path));
    
    if (path === '/') setActiveCategory('home');
    else if (path.includes('/sale')) setActiveCategory('sale');
    else if (foundLink) setActiveCategory(foundLink.id);
    else setActiveCategory('');
    
    // Close menus on route change
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle Scroll Styling - Simple shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Body Lock
  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || isCartSidebarOpen || isSearchOpen) ? 'hidden' : 'unset';
  }, [isMobileMenuOpen, isCartSidebarOpen, isSearchOpen]);

  // Handle Click Outside for Desktop Search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        if (!searchQuery) setIsDesktopSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // --- HANDLERS ---

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsDesktopSearchExpanded(false);
    }
  };

  const toggleMobileAccordion = (id) => {
    setExpandedMobileCategory(expandedMobileCategory === id ? null : id);
  };

  return (
    <>
      {/* =======================
               MAIN NAVBAR
          ======================= */}
      <nav 
        className={`sticky top-0 left-0 right-0 z-50 bg-white border-b ${
          isScrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'
        } transition-colors duration-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4 lg:gap-6">

            {/* LEFT: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                  alt="Shopzy Logo"
                  className="h-7 lg:h-8 w-auto object-contain"
                />
              </Link>
            </div>

            {/* CENTER: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6">
              <form 
                onSubmit={handleSearch} 
                ref={searchInputRef}
                className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-full overflow-hidden focus-within:border-[#3D2817] focus-within:ring-1 focus-within:ring-[#3D2817] transition-colors"
              >
                <button 
                  type="submit" 
                  className="p-2 text-gray-500 hover:text-[#3D2817] transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none outline-none px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDesktopSearchExpanded(true)}
                />
              </form>
            </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* User Icon */}
              {isAuthenticated ? (
                <Link to="/profile" className="hidden md:block p-1.5 text-gray-600 hover:text-[#3D2817] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              ) : (
                <Link to="/get-started" className="hidden md:block p-1.5 text-gray-600 hover:text-[#3D2817] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
              
              {/* Shopping Bag Icon */}
              <button 
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-1.5 text-gray-600 hover:text-[#3D2817] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#3D2817] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {getCartItemsCount() > 99 ? '99+' : getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* Hamburger Menu - Visible on all screens */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-gray-600 hover:text-[#3D2817] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>





      {/* =======================
          SIDE DRAWER (Desktop & Mobile) - Cart Sidebar Style
      ======================== */}
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[61] flex flex-col border-l border-gray-200 overflow-hidden shadow-xl transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Menu
          </h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info */}
          {isAuthenticated && (
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">Hello, <span className="font-semibold text-gray-900">{user?.name}</span></p>
            </div>
          )}

          {/* Auth quick actions */}
          <div className="p-5 flex items-center gap-3 border-b border-gray-200">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#3D2817] hover:bg-[#2C1F14] transition-colors rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/get-started"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-semibold text-white bg-[#3D2817] hover:bg-[#2C1F14] transition-colors rounded-lg"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Categories */}
          <div className="p-5 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</p>
            <Link to="/" className="block py-2.5 text-sm font-medium text-gray-900 hover:text-[#3D2817] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {NAV_LINKS.map((link) => (
              <div key={link.id} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => toggleMobileAccordion(link.id)}
                  className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-gray-900 hover:text-[#3D2817] transition-colors"
                >
                  <span>{link.label}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedMobileCategory === link.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all ${expandedMobileCategory === link.id ? 'max-h-96 opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-4 space-y-2 pt-1">
                    {link.subItems.map((sub, idx) => (
                      <Link 
                        key={idx} 
                        to={sub.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm text-gray-600 hover:text-[#3D2817] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-[#3D2817] hover:text-[#2C1F14] pt-2 transition-colors">Shop All</Link>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/sale" className="block py-2.5 text-sm font-medium text-[#3D2817] hover:text-[#2C1F14] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Sale
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        {!isAuthenticated && (
          <div className="border-t border-gray-200 bg-white p-4">
            <Link
              to="/get-started" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#3D2817] hover:bg-[#2C1F14] transition-colors rounded-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartSidebarOpen} 
        onClose={() => setIsCartSidebarOpen(false)} 
      />
    </>
  );
};

export default Navbar;