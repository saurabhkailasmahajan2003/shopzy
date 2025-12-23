import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

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
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 transform bg-white border-b border-gray-200
        ${isNavHidden ? '-translate-y-full' : 'translate-y-0'}
        ${isScrolled 
          ? 'shadow-md' 
          : 'shadow-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-4">

            {/* LEFT: Hamburger Menu & Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-text hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex-shrink-0">
                 <span className="text-xl font-bold text-primary tracking-tight" style={{ fontFamily: 'cursive, sans-serif' }}>
                   Shopzy
                 </span>
              </Link>
            </div>

            {/* CENTER: Search Bar (Dribbble Style) */}
            <div className="flex-1 max-w-2xl mx-4">
              <form 
                onSubmit={handleSearch} 
                className="flex items-center bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-primary transition-all"
              >
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-text placeholder-gray-500"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center border-l border-gray-300 px-3">
                  <select className="bg-transparent border-none outline-none text-sm text-text cursor-pointer pr-6">
                    <option>All</option>
                    <option>Women</option>
                    <option>Watches</option>
                    <option>Eyewear</option>
                    <option>Accessories</option>
                    <option>Skincare</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="bg-primary text-white p-2.5 hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* RIGHT: Sign Up & Log In */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="relative p-1.5 text-text hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    {getCartItemsCount() > 0 && (
                      <span className="absolute top-0 right-0 bg-cta text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" className="p-1.5 text-text hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="text-sm font-medium text-text hover:text-primary transition-colors">
                    Sign up
                  </Link>
                  <Link to="/login" className="bg-text text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-text/90 transition-colors">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>





      {/* =======================
          SIDE DRAWER (Desktop & Mobile)
      ======================== */}
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-text/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Drawer - Opens from left on all screen sizes */}
      <div 
        className={`fixed inset-y-0 left-0 z-[61] w-[85%] sm:w-[70%] md:w-[400px] lg:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
            <div className="flex flex-col h-full">
           {/* Header with brand logo (matches navbar) */}
          <div className="p-6 pt-10 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-text tracking-tight">
                Shopzy
              </span>
              {isAuthenticated && <p className="text-xs text-text-muted mt-1">Hello, {user?.name}</p>}
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-text-muted hover:text-text">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Auth quick actions */}
          <div className="px-6 pb-4 flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-text border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center text-sm font-bold text-text bg-background border border-primary/30 rounded-lg hover:border-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
             
             {/* Categories */}
             <div className="space-y-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Categories</p>
                <Link to="/" className="block py-3 text-base font-medium text-text border-b border-primary/20" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                {NAV_LINKS.map((link) => (
                  <div key={link.id} className="border-b border-primary/20 last:border-0">
                    <button 
                      onClick={() => toggleMobileAccordion(link.id)}
                      className="w-full flex items-center justify-between py-4 text-base font-medium text-text"
                    >
                      <span>{link.label}</span>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${expandedMobileCategory === link.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobileCategory === link.id ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                       <div className="pl-4 space-y-3">
                         {link.subItems.map((sub, idx) => (
                            <Link 
                              key={idx} 
                              to={sub.path} 
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block text-sm text-text-muted hover:text-primary"
                            >
                              {sub.name}
                            </Link>
                         ))}
                         <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-text pt-2">Shop All</Link>
                       </div>
                    </div>
                  </div>
                ))}
                <Link to="/sale" className="block py-3 text-base font-bold text-cta border-b border-primary/20" onClick={() => setIsMobileMenuOpen(false)}>
                  Sale
                </Link>
             </div>
           </div>

           {/* Footer Actions */}
           <div className="p-6 border-t border-primary/20 bg-primary/5">
             {isAuthenticated ? (
               <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full py-3 text-sm font-bold text-cta border border-cta/30 bg-background rounded-lg hover:bg-cta/10 transition-colors">
                 Sign Out
               </button>
             ) : (
               <div className="grid grid-cols-2 gap-3">
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center text-sm font-bold text-text bg-background border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">Login</Link>
                 <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">Sign Up</Link>
               </div>
             )}
           </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;