import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- DATA CONFIGURATION (Moved outside component for performance) ---
const NAV_LINKS = [
  { 
    id: 'men', 
    label: 'Men', 
    path: '/men', 
    subItems: [
      { name: 'Shirts', path: '/men/shirt' },
      { name: 'T-Shirts', path: '/men/tshirt' },
      { name: 'Trousers', path: '/men/trousers' },
      { name: 'Shoes', path: '/men/shoes' },
    ] 
  },
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
      { name: "Men's Watches", path: '/watches?gender=men' },
      { name: "Women's Watches", path: '/watches?gender=women' },
      { name: 'Smart Watches', path: '/watches?type=smart' },
    ] 
  },
  { 
    id: 'lenses', 
    label: 'Eyewear', 
    path: '/lenses', 
    subItems: [
      { name: "Men's Eyewear", path: '/lenses?gender=men' },
      { name: "Women's Eyewear", path: '/lenses?gender=women' },
      { name: 'Sunglasses', path: '/lenses?type=sun' },
    ] 
  },
  { 
    id: 'accessories', 
    label: 'Accessories', 
    path: '/accessories', 
    subItems: [
      { name: "Men's Accessories", path: '/accessories?gender=men' },
      { name: "Women's Accessories", path: '/accessories?gender=women' },
      { name: 'Wallets & Belts', path: '/accessories?type=general' },
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
          TOP ANNOUNCEMENT BAR
      ======================== */}
      <div className="bg-primary text-white text-[10px] md:text-xs font-bold tracking-widest text-center uppercase py-2">
        Free Shipping on Orders Over ₹1,000 - Returns within 30 Days
      </div>

      {/* =======================
               MAIN NAVBAR
          ======================= */}
      <nav 
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b py-1 transform
        ${isNavHidden ? '-translate-y-full' : 'translate-y-0'}
        ${isScrolled 
          ? 'bg-background border-primary/30 shadow-sm' 
          : 'bg-background border-primary/20'}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-0.5">
          <div className="flex items-center justify-between h-10">

            {/* LEFT: Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex-shrink-0 group relative z-10">
                 <img
                   src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765969744/ef93f9f5-0469-413a-a0d3-24df2b70f27b.png"
                   alt="Shopzy logo"
                   className="h-8 w-auto"
                 />
              </Link>
            </div>

            {/* CENTER: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/"
                className={`text-xs font-bold uppercase tracking-[0.15em] hover:text-primary transition-all relative group
                ${activeCategory === 'home' ? 'text-text' : 'text-text-muted'}`}
              >
                Home
                <span className={`absolute -bottom-2 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 -translate-x-1/2 group-hover:w-full ${activeCategory === 'home' ? 'w-full' : ''}`}></span>
              </Link>

              {NAV_LINKS.map((link) => (
                 <div key={link.id} className="relative group h-12 flex items-center">
                    <Link 
                      to={link.path}
                      className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors relative
                      ${activeCategory === link.id ? 'text-text' : 'text-text-muted hover:text-primary'}`}
                    >
                      {link.label}
                      <span className={`absolute -bottom-2 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 -translate-x-1/2 group-hover:w-full ${activeCategory === link.id ? 'w-full' : ''}`}></span>
                    </Link>
                    
                    {/* Refined Dropdown */}
                    {link.subItems && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:-translate-y-1">
                        <div className="bg-background rounded-none shadow-xl border border-primary/20 p-6 w-64 grid gap-1">
                          {/* Triangle Pointer */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-t border-l border-primary/20 transform rotate-45"></div>
                          
                          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 border-b border-primary/20 pb-2">
                            {link.label} Collection
                          </h3>
                          
                          {link.subItems.map((sub, idx) => (
                            <Link 
                              key={idx} 
                              to={sub.path}
                              className="block px-3 py-2 text-sm text-text hover:bg-primary/10 hover:text-primary hover:pl-5 transition-all duration-200"
                            >
                              {sub.name}
                            </Link>
                          ))}
                          <div className="mt-2 pt-2 border-t border-primary/20">
                            <Link to={link.path} className="block px-3 text-xs font-bold text-text underline decoration-primary/30 hover:decoration-primary underline-offset-4">
                              View All
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                 </div>
              ))}
              
              <Link to="/sale" className="text-xs font-bold text-cta uppercase tracking-[0.15em] hover:text-cta-dark relative group">
                Sale
                <span className="absolute -bottom-2 left-1/2 w-0 h-0.5 bg-cta transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
              </Link>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1 md:gap-4">

              {/* Expandable Desktop Search */}
              <div className="hidden md:flex items-center justify-end" ref={searchInputRef}>
                <form 
                  onSubmit={handleSearch} 
                  className={`flex items-center transition-all duration-500 ease-out border rounded-full
                  ${isDesktopSearchExpanded ? 'w-64 px-4 py-1.5 border-primary/30 bg-primary/5' : 'w-10 h-10 border-transparent bg-transparent justify-center cursor-pointer hover:bg-primary/10'}`}
                  onClick={() => !isDesktopSearchExpanded && setIsDesktopSearchExpanded(true)}
                >
                  <button type="submit" className="text-text">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`bg-transparent border-none outline-none text-sm ml-2 w-full transition-all duration-300 ${isDesktopSearchExpanded ? 'opacity-100 visible' : 'opacity-0 invisible w-0'}`}
                  />
                  {isDesktopSearchExpanded && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setIsDesktopSearchExpanded(false); }} className="text-text-muted hover:text-text">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </form>
              </div>
              
              {/* Mobile Search Icon */}
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="md:hidden p-2 text-text">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>


              {/* Account */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <Link to="/profile" className="p-2 text-text hover:bg-primary/10 rounded-full transition-colors block">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </Link>
                ) : (
                  <Link to="/login" className="text-xs font-bold text-text uppercase tracking-wider border border-primary/30 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">
                    Login
                  </Link>
                )}
              </div>
              
              {/* Cart */}
              <Link to="/cart" className="p-2 text-text hover:bg-primary/10 rounded-full transition-colors relative">
                 <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 {getCartItemsCount() > 0 && (
                   <span className="absolute top-1 right-0.5 md:top-0 md:right-0 bg-cta text-white text-[10px] w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full font-bold">
                     {getCartItemsCount()}
                   </span>
                 )}
              </Link>

              {/* Mobile Menu Toggle (rightmost) */}
              <button 
                className="md:hidden p-2 text-text hover:bg-primary/10 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
              </button>

            </div>
          </div>

          {/* Mobile Search Drawer (Slide Down) */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'max-h-20 opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
             <form onSubmit={handleSearch} className="relative">
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search products..."
                 className="w-full bg-primary/10 backdrop-blur-sm border-none rounded-full px-5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none placeholder-text-muted"
               />
               <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </button>
             </form>
          </div>
        </div>
      </nav>


      {/* =======================
          MOBILE FLOATING DOCK
          (More modern than fixed bottom bar)
      ======================== */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-background/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary/20 p-2 flex justify-around items-center">
           <Link to="/" className={`p-3 rounded-xl transition-all ${activeCategory === 'home' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}>
              <svg className="w-5 h-5" fill={activeCategory === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
           </Link>
           
           <button onClick={() => setIsMobileMenuOpen(true)} className={`p-3 rounded-xl text-text-muted ${isMobileMenuOpen ? 'bg-primary/10 text-text' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>


           <Link to={isAuthenticated ? "/profile" : "/login"} className="p-3 rounded-xl text-text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           </Link>
        </div>
      </div>


      {/* =======================
          MOBILE SIDE DRAWER
      ======================== */}
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-text/60 backdrop-blur-sm transition-opacity duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-[61] w-[80%] max-w-xs bg-background transform transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) flex flex-col md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
            <div className="flex flex-col h-full">
           {/* Header with brand logo (matches navbar) */}
          <div className="p-6 pt-10 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765969744/ef93f9f5-0469-413a-a0d3-24df2b70f27b.png"
                alt="Shopzy logo"
                className="h-10 w-auto"
              />
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
             
             {/* Main Links */}
             <div className="space-y-4">
               <Link to="/" className="block text-2xl font-light tracking-tight text-text" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
               <Link to="/new-arrival" className="block text-2xl font-light tracking-tight text-text" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
               <Link to="/sale" className="block text-2xl font-bold tracking-tight text-cta" onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
             </div>

             <div className="w-12 h-px bg-primary/20"></div>

             {/* Categories */}
             <div className="space-y-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Shop Categories</p>
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