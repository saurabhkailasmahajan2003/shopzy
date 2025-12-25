import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';

// --- DATA CONFIGURATION (Moved outside component for performance) ---
const NAV_LINKS = [
  { 
    id: 'women', 
    label: 'Women', 
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
      { name: "Women's Watches", path: '/watches?gender=women' },
      { name: 'Smart Watches', path: '/watches?type=smart' },
    ] 
  },
  { 
    id: 'lenses', 
    label: 'Eyewear', 
    path: '/lenses', 
    subItems: [
      { name: "Women's Eyewear", path: '/lenses?gender=women' },
      { name: 'Sunglasses', path: '/lenses?type=sun' },
    ] 
  },
  { 
    id: 'accessories', 
    label: 'Accessories', 
    path: '/accessories', 
    subItems: [
      { name: "Women's Accessories", path: '/accessories?gender=women' },
      { name: 'Wallets & Belts', path: '/accessories?type=general' },
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
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 transform bg-[#fefcfb] border-b-2 border-[#120e0f]
        ${isNavHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-3 sm:gap-4 lg:gap-6">

            {/* LEFT: Logo - Reddish color */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: '#c41e3a', fontFamily: "'Dancing Script', cursive" }}>
                  Shopzy
                </span>
              </Link>
            </div>

            {/* CENTER: Search Bar (Rounded with black border) */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-2 lg:mx-6">
                <form 
                  onSubmit={handleSearch} 
                ref={searchInputRef}
                className="flex items-center w-full bg-[#fefcfb] border-2 border-[#120e0f] rounded-full overflow-hidden focus-within:border-[#bb3435] transition-colors"
                >
                  <button 
                    type="submit" 
                    className="p-2 sm:p-2.5 text-[#120e0f] hover:opacity-70 transition-opacity flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <input 
                    type="text" 
                  className="flex-1 bg-transparent border-none outline-none px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-[#120e0f] placeholder-[#120e0f]/40"
                  placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDesktopSearchExpanded(true)}
                  />
                </form>
              </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Mobile Search Button - Before Cart */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="sm:hidden p-1.5 text-[#120e0f] hover:opacity-70 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* User Icon - Hidden on mobile, shown on desktop */}
                {isAuthenticated ? (
                <Link to="/profile" className="hidden sm:block relative p-1 sm:p-1.5 text-[#120e0f] hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  </Link>
                ) : (
                <Link to="/login" className="hidden sm:block relative p-1 sm:p-1.5 text-[#120e0f] hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  </Link>
                )}
              
              {/* Shopping Bag Icon */}
              <button 
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-1 sm:p-1.5 text-[#120e0f] hover:opacity-70 transition-opacity"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                 {getCartItemsCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#bb3435] text-[#fefcfb] text-[8px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold border-2 border-[#120e0f]">
                     {getCartItemsCount()}
                   </span>
                 )}
              </button>

              {/* Hamburger Menu - After Cart */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 sm:p-1.5 text-[#120e0f] hover:opacity-70 transition-opacity"
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#fefcfb] z-[61] flex flex-col border-l-2 border-[#120e0f] overflow-hidden transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#120e0f] bg-[#fefcfb]">
          <h2 className="text-lg font-bold text-[#120e0f]">
            MENU
          </h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-[#120e0f] hover:opacity-70 transition-opacity"
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
            <div className="p-4 border-b-2 border-[#120e0f]">
              <p className="text-sm text-[#120e0f]/70">Hello, <span className="font-bold text-[#120e0f]">{user?.name}</span></p>
            </div>
          )}

          {/* Auth quick actions */}
          <div className="p-4 flex items-center gap-3 border-b-2 border-[#120e0f]">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm font-bold text-[#fefcfb] bg-[#120e0f] hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm font-bold text-[#120e0f] border-2 border-[#120e0f] bg-[#fefcfb] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2.5 sm:py-3 text-center text-sm font-bold text-[#120e0f] bg-[#fefcfb] border-2 border-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2.5 sm:py-3 text-center text-sm font-bold text-[#fefcfb] bg-[#120e0f] hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Categories */}
          <div className="p-4 space-y-1">
            <p className="text-xs font-bold text-[#120e0f]/70 uppercase tracking-widest mb-3">Categories</p>
            <Link to="/" className="block py-3 text-sm font-bold text-[#120e0f] border-b-2 border-[#120e0f]" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {NAV_LINKS.map((link) => (
              <div key={link.id} className="border-b-2 border-[#120e0f] last:border-0">
                <button 
                  onClick={() => toggleMobileAccordion(link.id)}
                  className="w-full flex items-center justify-between py-3 text-sm font-bold text-[#120e0f]"
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
                        className="block text-xs text-[#120e0f]/70 hover:text-[#120e0f] font-medium"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-[#120e0f] pt-2">Shop All</Link>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/sale" className="block py-3 text-sm font-bold text-[#bb3435] border-b-2 border-[#120e0f]" onClick={() => setIsMobileMenuOpen(false)}>
              Sale
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-[#120e0f] bg-[#fefcfb] p-4">
          {isAuthenticated ? (
            <button 
              onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
              className="w-full py-3 text-sm font-bold text-[#120e0f] border-2 border-[#120e0f] bg-[#fefcfb] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 text-center text-sm font-bold text-[#120e0f] bg-[#fefcfb] border-2 border-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 text-center text-sm font-bold text-[#fefcfb] bg-[#120e0f] hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Search Modal */}
          <div className="fixed top-0 left-0 right-0 z-[61] bg-[#fefcfb] border-b-2 border-[#120e0f] p-4">
            <form 
              onSubmit={(e) => {
                handleSearch(e);
                setIsSearchOpen(false);
              }}
              className="flex items-center gap-3"
            >
              <input 
                type="text" 
                className="flex-1 bg-[#fefcfb] border-2 border-[#120e0f] rounded-full px-4 py-2.5 text-sm text-[#120e0f] placeholder-gray-400 focus:outline-none focus:border-[#bb3435]"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                type="submit"
                className="p-2.5 text-[#120e0f] hover:opacity-70 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 text-[#120e0f] hover:opacity-70 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartSidebarOpen} 
        onClose={() => setIsCartSidebarOpen(false)} 
      />
    </>
  );
};

export default Navbar;