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
      { name: 'Sneakers', path: '/shoes?subCategory=Sneakers' },
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
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  
  // Refs for click outside
  const searchInputRef = useRef(null);
  const lastScrollY = useRef(0);

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

  // Handle Scroll Styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      const currentY = window.scrollY;
      const isScrollingDown = currentY > lastScrollY.current;

      // Hide on scroll down, show only when scrolling up; avoid hiding when menus are open
      if (!isMobileMenuOpen && !isSearchOpen) {
        if (isScrollingDown && currentY > 80) {
          setIsNavHidden(true);
        } else if (!isScrollingDown) {
          setIsNavHidden(false);
        }
      }

      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen, isSearchOpen]);

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
               MAIN NAVBAR (Dribbble Style)
          ======================= */}
      <nav 
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 transform glass-effect        ${isNavHidden ? '-translate-y-full' : 'translate-y-0'}`}
        style={{ backgroundColor: 'rgba(250, 248, 245, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-3 sm:gap-4 lg:gap-6">

            {/* LEFT: Logo - Luxury styling */}
            <div className="flex-shrink-0 bg-transparent">
              <Link to="/" className="flex items-center bg-transparent">
                <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                  alt="Shopzy Logo"
                  className="h-7 sm:h-8 lg:h-10 w-auto object-contain lg:ml-4 sm:pl-6"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                />
              </Link>
            </div>

            {/* CENTER: Search Bar (Rounded with black border) */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-2 lg:mx-6">
                <form 
                  onSubmit={handleSearch} 
                ref={searchInputRef}
                className="flex items-center w-full bg-white/60 backdrop-blur-sm border border-[#3D2817]/20 rounded-full overflow-hidden focus-within:border-[#8B4513] focus-within:ring-2 focus-within:ring-[#8B4513]/20 transition-all luxury-shadow"
                >
                  <button 
                    type="submit" 
                    className="p-2 sm:p-2.5 text-[#3D2817] hover:text-[#8B4513] transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <input 
                    type="text" 
                  className="flex-1 bg-transparent border-none outline-none px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-[#3D2817] placeholder-[#3D2817]/50"
                  placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDesktopSearchExpanded(true)}
                  />
                </form>
              </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* User Icon - Hidden on mobile, shown on desktop */}
                {isAuthenticated ? (
                <Link to="/profile" className="hidden sm:block relative p-1 sm:p-1.5 text-[#3D2817] hover:text-[#8B4513] transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  </Link>
                ) : (
                <Link to="/get-started" className="hidden sm:block relative p-1 sm:p-1.5 text-[#3D2817] hover:text-[#8B4513] transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  </Link>
                )}
              
              {/* Shopping Bag Icon */}
              <button 
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-1 sm:p-1.5 text-[#3D2817] hover:text-[#8B4513] transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                 {getCartItemsCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#8B4513] text-white text-[8px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold rounded-full luxury-shadow">
                     {getCartItemsCount()}
                   </span>
                 )}
              </button>

              {/* Hamburger Menu - After Cart */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 sm:p-1.5 text-[#3D2817] hover:text-[#8B4513] transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer - Opens from right like cart sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAF8F5] z-[61] flex flex-col border-l border-[#3D2817]/20 overflow-hidden transition-transform duration-300 ease-out luxury-shadow-lg ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3D2817]/20 bg-white/60 backdrop-blur-sm">
          <h2 className="text-lg font-serif font-bold text-[#3D2817]">
            MENU
          </h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-[#3D2817] hover:text-[#8B4513] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info */}
          {isAuthenticated && (
            <div className="p-4 border-b border-[#3D2817]/20">
              <p className="text-sm text-[#3D2817]/70">Hello, <span className="font-bold text-[#3D2817]">{user?.name}</span></p>
            </div>
          )}

          {/* Auth quick actions */}
          <div className="p-4 flex items-center gap-3 border-b border-[#3D2817]/20">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm font-bold text-white bg-[#3D2817] hover:bg-[#8B4513] transition-colors luxury-shadow rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm font-bold text-[#3D2817] border border-[#3D2817]/30 bg-white/60 hover:bg-[#3D2817] hover:text-white transition-colors rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/get-started"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 sm:py-3 text-center text-sm font-bold text-white bg-[#3D2817] hover:bg-[#8B4513] transition-colors rounded luxury-shadow"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Categories */}
          <div className="p-4 space-y-1">
            <p className="text-xs font-bold text-[#3D2817]/70 uppercase tracking-widest mb-3">Categories</p>
            <Link to="/" className="block py-3 text-sm font-bold text-[#3D2817] border-b border-[#3D2817]/20 hover:text-[#8B4513] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {NAV_LINKS.map((link) => (
              <div key={link.id} className="border-b border-[#3D2817]/20 last:border-0">
                <button 
                  onClick={() => toggleMobileAccordion(link.id)}
                  className="w-full flex items-center justify-between py-3 text-sm font-bold text-[#3D2817] hover:text-[#8B4513] transition-colors"
                >
                  <span>{link.label}</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${expandedMobileCategory === link.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobileCategory === link.id ? 'max-h-96 opacity-100 pb-3' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-4 space-y-2">
                    {link.subItems.map((sub, idx) => (
                      <Link 
                        key={idx} 
                        to={sub.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xs text-[#3D2817]/70 hover:text-[#8B4513] font-medium transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-[#3D2817] hover:text-[#8B4513] pt-2 transition-colors">Shop All</Link>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/sale" className="block py-3 text-sm font-bold text-[#8B4513] border-b border-[#3D2817]/20 hover:text-[#A0522D] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Sale
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#3D2817]/20 bg-white/60 backdrop-blur-sm p-4">
          {isAuthenticated ? (
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-sm font-bold text-[#3D2817] border border-[#3D2817]/30 bg-white/60 hover:bg-[#3D2817] hover:text-white transition-colors rounded"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/get-started" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="w-full py-3 text-center text-sm font-bold text-white bg-[#3D2817] hover:bg-[#8B4513] transition-colors rounded luxury-shadow"
            >
              Get Started
            </Link>
          )}
        </div>
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