import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import Footer from '../components/Footer'; 
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';
import { handleImageError } from '../utils/imageFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPriceWithCurrency } from '../utils/formatUtils';
import { optimizeImageUrl } from '../utils/imageOptimizer';

// --- ICONS (Embedded directly so no install needed) ---
const IconChevronLeft = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const IconChevronRight = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const IconClose = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- API FETCH FUNCTIONS (Kept from previous version) ---
const fetchFreshDrops = async () => {
  try {
    const [womenShoes, accessories, watches, lenses] = await Promise.all([
      productAPI.getWomenItems({ limit: 10, category: 'shoes' }),
      productAPI.getAccessories({ limit: 10 }),
      productAPI.getWatches({ limit: 10 }),
      productAPI.getLenses({ limit: 10 })
    ]);
    
    // Get shoes from women, take exactly 12
    let allShoes = [];
    if (womenShoes.success && womenShoes.data.products) {
      allShoes = [...allShoes, ...womenShoes.data.products];
    }
    const shoes = allShoes.slice(0, 12);
    
    // Get exactly 10 accessories
    const acc = accessories.success && accessories.data.products 
      ? accessories.data.products.slice(0, 10) 
      : [];
    
    // Get exactly 10 watches
    const watch = watches.success && watches.data.products 
      ? watches.data.products.slice(0, 10) 
      : [];
    
    // Get exactly 10 lenses
    const lens = lenses.success && lenses.data.products 
      ? lenses.data.products.slice(0, 10) 
      : [];
    
    // Combine all: 12 shoes + 10 accessories + 10 watches + 10 lenses = 42 products total
    return [...shoes, ...acc, ...watch, ...lens];
  } catch (error) {
    console.error("Error fetching fresh drops:", error);
    return [];
  }
};

const fetchSaleItems = async () => {
  const res = await productAPI.getAllProducts({ limit: 4, onSale: true, sort: 'discountPercent', order: 'desc' });
  return res.success ? res.data.products : [];
};

const fetchWomen = async () => {
  const res = await productAPI.getWomenItems({ limit: 4 });
  return res.success ? res.data.products : [];
};

const fetchWatches = async () => {
  const res = await productAPI.getWatches({ limit: 4 });
  return res.success ? res.data.products : [];
};

const fetchAccessories = async () => {
  try {
    const [lenses, acc] = await Promise.all([
      productAPI.getLenses({ limit: 2 }),
      productAPI.getAccessories({ limit: 2 })
    ]);
    let combined = [];
    if (lenses.success) combined = [...combined, ...lenses.data.products];
    if (acc.success) combined = [...combined, ...acc.data.products];
    return combined.slice(0, 4);
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return [];
  }
};

const fetchSkincare = async () => {
  try {
    const res = await productAPI.getSkincareProducts({ limit: 16 });
    return res.success ? res.data.products : [];
  } catch (error) {
    console.error("Error fetching skincare:", error);
    return [];
  }
};  

const LuxeSection = () => {
  const scrollRef = useRef(null);

  // Sample data to match the image aesthetics
  const luxeProducts = [
    {
      id: 1,
      brand: "CLINIQUE",
      image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop",
      link: "/luxe/clinique"
    },
    {
      id: 2,
      brand: "RABANNE",
      image: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop",
      link: "/luxe/rabanne"
    },
    {
      id: 3,
      brand: "ISSEY MIYAKE",
      image: "https://images.unsplash.com/photo-1585232561025-aa543d3122c4?q=80&w=800&auto=format&fit=crop",
      link: "/luxe/issey"
    },
    {
      id: 4,
      brand: "VERSACE",
      image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=800&auto=format&fit=crop",
      link: "/luxe/versace"
    },
  ];
}

const scroll = (direction) => {
  if (scrollRef.current) {
    const { current } = scrollRef;
    const scrollAmount = 300; // Adjust scroll distance
    if (direction === 'left') {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  }
};



const Home = () => {
  // --- UI STATE ---
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentPromoBannerIndex, setCurrentPromoBannerIndex] = useState(0);
  const [currentMobilePromoBannerIndex, setCurrentMobilePromoBannerIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const categoryScrollRef = useRef(null);
  const lifestyleScrollRef = useRef(null);
  const bannerCarouselRef = useRef(null);
  const promoBannerCarouselRef = useRef(null);
  const mobilePromoBannerCarouselRef = useRef(null);

  // --- DATA STATE & FETCHING (Unchanged) ---
  const [freshDrops, setFreshDrops] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [womenItems, setWomenItems] = useState([]);
  const [watches, setWatches] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [skincareProducts, setSkincareProducts] = useState([]);
  
  // Mobile view specific products
  const [tshirts, setTshirts] = useState([]);
  const [watchesMobile, setWatchesMobile] = useState([]);
  const [eyewear, setEyewear] = useState([]);
  const [accessoriesMobile, setAccessoriesMobile] = useState([]);

  // Track window width for responsive product count
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [freshDropsData, saleData, womenData, watchesData, accessoriesData, skincareData, tshirtsData, watchesMobileData, eyewearData, accessoriesMobileData] = await Promise.all([
          fetchFreshDrops(), 
          fetchSaleItems(), 
          fetchWomen(), 
          fetchWatches(), 
          fetchAccessories(), 
          fetchSkincare(),
          // Fetch mobile-specific products
          productAPI.getWomenItems({ subCategory: 'tshirt', limit: 5 }).then(res => res.success ? res.data.products : []),
          productAPI.getWatches({ limit: 5 }).then(res => res.success ? res.data.products : []),
          productAPI.getLenses({ limit: 5 }).then(res => res.success ? res.data.products : []),
          productAPI.getAccessories({ limit: 5 }).then(res => res.success ? res.data.products : [])
        ]);
        setFreshDrops(freshDropsData);
        setSaleItems(saleData);
        setWomenItems(womenData);
        setWatches(watchesData);
        setAccessories(accessoriesData);
        setSkincareProducts(skincareData);
        setTshirts(tshirtsData);
        setWatchesMobile(watchesMobileData);
        setEyewear(eyewearData);
        setAccessoriesMobile(accessoriesMobileData);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);


  const stories = [
    { hashtag: 'Xmas', emoji: '🎄', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png', 50) },
    { hashtag: 'Desi', emoji: '😎', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png', 50) },
    { hashtag: 'Street', emoji: '🔥', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif', 50) },
    { hashtag: 'FitCheck', emoji: '✨', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg', 50) },
    { hashtag: 'Tees', emoji: '👕', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp', 50), link: '/women/tshirt' },
    { hashtag: 'Denim', emoji: '👖', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg', 50) },
    { hashtag: 'Scarf', emoji: '🧣', image: optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp', 50) }
  ];

  // Banner carousel images
  const banners = [
    optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476937/Brown_Modern_New_Arrival_Leaderboard_Ad_gzs4iv.svg', 50),
    optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476935/Cream_Brown_Minimalist_Fashion_Sale_Leaderboard_Ad_tpvvpj.svg', 50),
    optimizeImageUrl('https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476935/Women_Fashion_Leaderboard_Ad_trr3pe.svg', 50)
  ];

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate mobile banner carousel - Faster interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3500); // Change banner every 3.5 seconds (faster)

    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto-rotate desktop promo banner carousel - Infinite scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoBannerIndex((prev) => {
        const next = prev + 1;
        // Reset to 0 after 4 to maintain indicator sync, but scroll continues infinitely
        return next >= 4 ? 0 : next;
      });
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate mobile promo banner carousel - Infinite scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMobilePromoBannerIndex((prev) => {
        const next = prev + 1;
        // Reset to 0 after 4 to maintain indicator sync, but scroll continues infinitely
        return next >= 4 ? 0 : next;
      });
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll to current mobile banner
  useEffect(() => {
    if (bannerCarouselRef.current) {
      const bannerWidth = bannerCarouselRef.current.offsetWidth;
      bannerCarouselRef.current.scrollTo({
        left: currentBannerIndex * bannerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentBannerIndex]);

  // Infinite scroll for desktop promo banner
  useEffect(() => {
    if (promoBannerCarouselRef.current) {
      const carousel = promoBannerCarouselRef.current;
      const bannerWidth = carousel.offsetWidth;
      const scrollPosition = currentPromoBannerIndex * bannerWidth;
      
      carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentPromoBannerIndex]);

  // Infinite scroll for mobile promo banner
  useEffect(() => {
    if (mobilePromoBannerCarouselRef.current) {
      const carousel = mobilePromoBannerCarouselRef.current;
      const bannerWidth = carousel.offsetWidth;
      const scrollPosition = currentMobilePromoBannerIndex * bannerWidth;
      
      carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentMobilePromoBannerIndex]);

  // Handle infinite scroll on scroll event for desktop - seamless loop
  useEffect(() => {
    const carousel = promoBannerCarouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const bannerWidth = carousel.offsetWidth;
      const scrollLeft = carousel.scrollLeft;
      const totalBanners = 4;
      const totalWidth = bannerWidth * totalBanners;
      
      // If scrolled past the first set of banners, jump back seamlessly
      if (scrollLeft >= totalWidth) {
        carousel.scrollTo({
          left: scrollLeft - totalWidth,
          behavior: 'auto'
        });
      }
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle infinite scroll on scroll event for mobile - seamless loop
  useEffect(() => {
    const carousel = mobilePromoBannerCarouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const bannerWidth = carousel.offsetWidth;
      const scrollLeft = carousel.scrollLeft;
      const totalBanners = 4;
      const totalWidth = bannerWidth * totalBanners;
      
      // If scrolled past the first set of banners, jump back seamlessly
      if (scrollLeft >= totalWidth) {
        carousel.scrollTo({
          left: scrollLeft - totalWidth,
          behavior: 'auto'
        });
      }
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch swipe handlers for mobile hero banners
  const minSwipeDistance = 50;
  const [promoTouchStart, setPromoTouchStart] = useState(null);
  const [promoTouchEnd, setPromoTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentMobilePromoBannerIndex((prev) => {
        const next = prev + 1;
        return next >= 4 ? 0 : next;
      });
    }
    if (isRightSwipe) {
      setCurrentMobilePromoBannerIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? 3 : next;
      });
    }
  };

  // Touch handlers for desktop promo banner on mobile
  const onPromoTouchStart = (e) => {
    setPromoTouchEnd(null);
    setPromoTouchStart(e.targetTouches[0].clientX);
  };

  const onPromoTouchMove = (e) => {
    setPromoTouchEnd(e.targetTouches[0].clientX);
  };

  const onPromoTouchEnd = () => {
    if (!promoTouchStart || !promoTouchEnd) return;
    
    const distance = promoTouchStart - promoTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentPromoBannerIndex((prev) => {
        const next = prev + 1;
        return next >= 4 ? 0 : next;
      });
    }
    if (isRightSwipe) {
      setCurrentPromoBannerIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? 3 : next;
      });
    }
  };

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Categories from Navbar with subcategory paths
  const categories = [
    { id: 'All', label: 'All', path: '/' },
    { 
      id: 'women', 
      label: 'Fashion', 
      path: '/women', 
      subItems: [
        { name: 'Shirts', path: '/women/shirt' },
        { name: 'T-Shirts', path: '/women/tshirt' },
        { name: 'Jeans', path: '/women/jeans' },
        { name: 'Trousers', path: '/women/trousers' },
        { name: 'Saree', path: '/women/saree' }
      ] 
    },
    { 
      id: 'shoes', 
      label: 'Shoes', 
      path: '/shoes', 
      subItems: [
        { name: 'Heels', path: '/shoes?subCategory=Heels' },
        { name: 'Flats', path: '/shoes?subCategory=Flats' },
        { name: 'Boots', path: '/shoes?subCategory=Boots' },
        { name: 'Sandals', path: '/shoes?subCategory=Sandals' }
      ] 
    },
    { 
      id: 'watches', 
      label: 'Watches', 
      path: '/watches', 
      subItems: [
        { name: 'Classic Watches', path: '/watches?gender=women' },
        { name: 'Smart Watches', path: '/watches?type=smart' }
      ] 
    },
    { 
      id: 'lenses', 
      label: 'Eyewear', 
      path: '/lenses', 
      subItems: [
        { name: 'Eyewear Collection', path: '/lenses?gender=women' },
        { name: 'Sunglasses', path: '/lenses?type=sun' }
      ] 
    },
    { 
      id: 'accessories', 
      label: 'Accessories', 
      path: '/accessories', 
      subItems: [
        { name: 'Accessories Collection', path: '/accessories?gender=women' },
        { name: 'Wallets & Belts', path: '/accessories?type=general' },
        { name: 'Earrings', path: '/accessories?subCategory=earrings' }
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
        { name: 'Cleanser', path: '/skincare?category=cleanser' }
      ] 
    },
  ];

  // Helper function to filter products by search query
  const filterProductsBySearch = (products) => {
    if (!searchQuery.trim()) return products;
    return products.filter(product => {
      const name = (product.name || product.productName || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product, 1, product.sizes?.[0] || 'M', '');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {/* MOBILE HOME PAGE - New Design */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Desktop Banner Carousel - Original View */}
        <div className="relative w-full bg-white px-4 pt-4 pb-4">
          <div className="relative w-full flex items-center justify-center mx-auto">
            <div className="relative overflow-hidden w-full rounded-3xl">
              <div 
                ref={promoBannerCarouselRef}
                className="flex overflow-x-auto scroll-smooth scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
                onTouchStart={onPromoTouchStart}
                onTouchMove={onPromoTouchMove}
                onTouchEnd={onPromoTouchEnd}
              >
                {(() => {
                  const promoBanners = [
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656659/Pink_and_Gold_Simple_Diwali_Skincare_Cosmetic_Beauty_Offers_Instagram_Post_1_xzglzv.png', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656833/Purple_Women_Clothing_Promo_Instagram_Post_d2cxg9.png', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656392/Brown_White_Modern_Elegant_Sale_and_Discount_Instagram_Post_frmjoo.svg', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766655996/Red_and_White_Modern_Bridal_Shower_Social_Media_Graphic_1_v9pexp.svg', 50)
                  ];
                  // Duplicate banners for infinite scroll
                  return [...promoBanners, ...promoBanners].map((banner, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <img
                        src={banner}
                        alt={`Promo Banner ${(index % 4) + 1}`}
                        className="w-full h-auto object-contain"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-[#3D2817]/30/20">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromoBannerIndex(index)}
                  className={`h-1.5 transition-all rounded-full ${
                    index === currentPromoBannerIndex 
                      ? 'w-6 bg-[#3D2817]' 
                      : 'w-1.5 bg-[#3D2817]/30 hover:bg-[#3D2817]/50'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Categories</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'All') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown(openDropdown === cat.id ? null : cat.id);
                  }
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  openDropdown === cat.id
                    ? 'bg-[#3D2817] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.label}
                {cat.id !== 'All' && (
                  <svg 
                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === cat.id ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Subcategories Section */}
          {openDropdown && categories.find(cat => cat.id === openDropdown)?.subItems && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">
                  {categories.find(cat => cat.id === openDropdown)?.label}
                </h4>
                <button
                  onClick={() => setOpenDropdown(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.find(cat => cat.id === openDropdown)?.subItems.map((subItem, index) => (
                  <Link
                    key={index}
                    to={subItem.path}
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-[#3D2817] hover:text-white rounded-md transition-colors text-center border border-gray-200 hover:border-[#3D2817]"
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid - Mixed T-Shirts, Watches, Eyewear, and Accessories */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {filterProductsBySearch([...tshirts, ...watchesMobile, ...eyewear, ...accessoriesMobile]).map((product) => {
              const productId = product._id || product.id;
              const productImage = product.image || product.images?.[0] || product.thumbnail || 'https://via.placeholder.com/200';
              const productName = product.name || product.productName || 'Product';
              const productPrice = product.finalPrice || product.price || 0;
              const originalPrice = product.originalPrice || product.mrp || product.price || 0;
              const hasDiscount = originalPrice > productPrice && productPrice > 0;
              const discountPercent = hasDiscount && originalPrice > 0 
                ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) 
                : 0;
              
              // Determine product category for routing
              const productCategory = product.category?.toLowerCase().includes('watch') ? 'watches' :
                                    product.category?.toLowerCase().includes('lens') ? 'lenses' :
                                    product.category?.toLowerCase().includes('accessor') ? 'accessories' :
                                    product.category?.toLowerCase().includes('tshirt') || product.subCategory === 'tshirt' ? 'women' :
                                    'product';

              return (
                <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                  {/* Discount Badge */}
                  {hasDiscount && discountPercent > 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-[#8B4513] text-white px-2.5 py-1 rounded-full flex items-center">
                      <span className="text-xs font-bold">{discountPercent}% OFF</span>
                    </div>
                  )}

                  {/* Product Image */}
                  <Link to={`/product/${productCategory}/${productId}`}>
                    <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={optimizeImageUrl(productImage, 50)}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200';
                        }}
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-3">
                    <Link to={`/product/${productCategory}/${productId}`}>
                      <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{productName}</h4>
                    </Link>
                    <p className="text-base font-bold text-gray-900 mb-3">{formatPriceWithCurrency(productPrice)}</p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-[#3D2817] text-white rounded-full p-2 flex items-center justify-center hover:bg-[#8B4513] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- HERO SECTION (Desktop: Text Left, Banners Right | Mobile: Banners Only) --- */}
      <div className="hidden md:block relative w-full bg-[#FAF8F5]">
        
        {/* Desktop Hero Layout */}
        <div className="hidden md:block relative w-full pb-8 lg:pb-12 xl:pb-16">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch min-h-[500px] lg:min-h-[600px] xl:min-h-[650px]">
              
              {/* Left Side: Text Content - Takes 6 columns */}
              <div className="lg:col-span-6 text-left space-y-5 lg:space-y-6 xl:space-y-8 px-6 lg:px-10 xl:px-16 flex flex-col justify-center pt-6 lg:pt-8 pb-8 lg:pb-12">
                {/* NEW COLLECTION Label */}
                <div>
                  <span className="inline-block px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] border border-[#3D2817]/30" style={{ backgroundColor: '#8B4513', color: '#FAF8F5' }}>
                    NEW COLLECTION
                  </span>
                </div>
                
                {/* Main Headline */}
                <div className="space-y-1 md:space-y-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-serif font-bold leading-[1.05] tracking-tight" style={{ color: '#3D2817' }}>
                    Discover
                  </h1>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-serif font-bold leading-[1.05] tracking-tight" style={{ color: '#8B4513' }}>
                    Your Style
                  </h1>
                </div>
                
                {/* Subtitle */}
                <div>
                  <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed max-w-lg" style={{ color: '#3D2817', opacity: 0.85 }}>
                    Curated fashion, beauty essentials, and lifestyle products that reflect your unique personality
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-1 md:pt-2">
                  <Link
                    to="/women"
                    className="inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-2.5 md:py-3 lg:py-3.5 text-xs md:text-sm lg:text-base font-semibold text-center border border-[#3D2817]/30 transition-colors luxury-shadow rounded"
                    style={{ backgroundColor: '#8B4513', color: '#FAF8F5' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#3D2817';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#8B4513';
                    }}
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/sale"
                    className="inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-2.5 md:py-3 lg:py-3.5 text-xs md:text-sm lg:text-base font-semibold text-center border border-[#3D2817]/30 transition-colors luxury-shadow rounded"
                    style={{ backgroundColor: '#FAF8F5', color: '#3D2817' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#3D2817';
                      e.target.style.color = '#FAF8F5';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#FAF8F5';
                      e.target.style.color = '#3D2817';
                    }}
                  >
                    View Sale
                  </Link>
                </div>
              </div>

              {/* Right Side: Banner Carousel - Takes 6 columns, smaller size, no borders */}
              <div className="lg:col-span-6 relative w-full flex items-center justify-center pt-0 pb-6 lg:pb-8 xl:pb-10">
                <div className="relative overflow-hidden w-full max-w-md lg:max-w-xl xl:max-w-2xl">
                  <div 
                    ref={promoBannerCarouselRef}
                    className="flex overflow-x-hidden scroll-smooth scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {(() => {
                      const promoBanners = [
                        optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656659/Pink_and_Gold_Simple_Diwali_Skincare_Cosmetic_Beauty_Offers_Instagram_Post_1_xzglzv.png', 50),
                        optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656833/Purple_Women_Clothing_Promo_Instagram_Post_d2cxg9.png', 50),
                        optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656392/Brown_White_Modern_Elegant_Sale_and_Discount_Instagram_Post_frmjoo.svg', 50),
                        optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766655996/Red_and_White_Modern_Bridal_Shower_Social_Media_Graphic_1_v9pexp.svg', 50)
                      ];
                      // Duplicate banners for infinite scroll
                      return [...promoBanners, ...promoBanners].map((banner, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-full"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <img
                            src={banner}
                            alt={`Promo Banner ${(index % 4) + 1}`}
                            className="w-full h-auto object-contain"
                            loading={index < 4 ? 'eager' : 'lazy'}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-[#FAF8F5]/80 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-[#3D2817]/30/20">
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPromoBannerIndex(index)}
                      className={`h-1.5 md:h-2 transition-all rounded-full ${
                        index === currentPromoBannerIndex 
                          ? 'w-6 md:w-8 bg-[#3D2817]' 
                          : 'w-1.5 md:w-2 bg-[#3D2817]/30 hover:bg-[#3D2817]/50'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hero Layout: Banners First, Then Text */}
        <div className="md:hidden relative w-full bg-[#FAF8F5]">
          {/* Mobile Promotional Banners Carousel - Above Text */}
          <div className="relative w-full overflow-hidden bg-[#FAF8F5] border-b border-[#3D2817]/30 pt-0">
            <div 
              ref={mobilePromoBannerCarouselRef}
              className="flex overflow-x-hidden scroll-smooth scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {(() => {
                  const promoBanners = [
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656833/Purple_Women_Clothing_Promo_Instagram_Post_d2cxg9.png', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656659/Pink_and_Gold_Simple_Diwali_Skincare_Cosmetic_Beauty_Offers_Instagram_Post_1_xzglzv.png', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656392/Brown_White_Modern_Elegant_Sale_and_Discount_Instagram_Post_frmjoo.svg', 50),
                    optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766655996/Red_and_White_Modern_Bridal_Shower_Social_Media_Graphic_1_v9pexp.svg', 50)
                  ];
                // Duplicate banners for infinite scroll
                return [...promoBanners, ...promoBanners].map((banner, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <img
                      src={banner}
                      alt={`Promo Banner ${(index % 4) + 1}`}
                      className="w-full h-auto object-contain"
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                  </div>
                ));
              })()}
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-[#FAF8F5]/80 backdrop-blur-sm px-2 py-1 rounded-full border border-[#3D2817]/30/20">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMobilePromoBannerIndex(index)}
                  className={`h-1.5 transition-all rounded-full ${
                    index === currentMobilePromoBannerIndex 
                      ? 'w-6 bg-[#3D2817]' 
                      : 'w-1.5 bg-[#3D2817]/30'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Mobile Text Content - Below Banners */}
          <div className="px-4 py-6 space-y-4">
            {/* NEW COLLECTION Label */}
            <div>
              <span className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border border-[#3D2817]/30" style={{ backgroundColor: '#8B4513', color: '#FAF8F5' }}>
                NEW COLLECTION
              </span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight" style={{ color: '#3D2817' }}>
                Discover
              </h1>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight" style={{ color: '#8B4513' }}>
                Your Style
              </h1>
            </div>
            
            {/* Subtitle */}
            <div>
              <p className="text-sm leading-relaxed" style={{ color: '#3D2817', opacity: 0.85 }}>
                Curated fashion, beauty essentials, and lifestyle products that reflect your unique personality
              </p>
            </div>
            
            {/* CTA Buttons - In Same Row */}
            <div className="flex flex-row gap-3 pt-2">
              <Link
                to="/women"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-center border border-[#3D2817]/30"
                style={{ backgroundColor: '#8B4513', color: '#FAF8F5' }}
              >
                Shop Now
              </Link>
              <Link
                to="/sale"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-center border border-[#3D2817]/30"
                style={{ backgroundColor: '#FAF8F5', color: '#3D2817' }}
              >
                View Sale
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW FASHION SALE PROMOTIONAL BANNER --- */}
      <div className="relative w-full bg-[#FAF8F5] border-t border-[#3D2817]/30 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 lg:py-16 xl:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 items-stretch">
            
            {/* Left Model Section */}
            <div className="relative">
              <div className="relative h-full sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-[#FAF8F5] border border-[#3D2817]/30 overflow-hidden luxury-shadow">
                <img
                  src={optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766657960/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_ymve41.png', 50)}
                  alt="Women Bags Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Central Promotional Section */}
            <div className="relative col-span-1 md:col-span-1">
              <div className="relative bg-[#FAF8F5] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 border border-[#3D2817]/30 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] flex flex-col items-center justify-center luxury-shadow">
                
                {/* Abstract Brown Blob Shapes */}
                <div className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#a06a4e]/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 right-6 w-16 h-16 sm:w-20 sm:h-20 bg-[#a06a4e]/15 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/4 w-10 h-10 sm:w-12 sm:h-12 bg-[#a06a4e]/10 rounded-full blur-lg"></div>
                
                {/* Black Dotted Patterns */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex gap-1">
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                </div>
                <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-8 flex gap-1">
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#3D2817] rounded-full"></div>
                </div>
                
                {/* Black Starburst Icons */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#3D2817]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/>
                  </svg>
                </div>
                <div className="absolute bottom-10 left-8 sm:bottom-12 sm:left-10">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#3D2817]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/>
                  </svg>
                </div>
                
                {/* Main Content */}
                <div className="relative z-10 text-center px-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase tracking-tight mb-2 sm:mb-3 md:mb-4" style={{ color: '#a06a4e' }}>
                    NEW FASHION SALE
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium uppercase tracking-wide mb-4 sm:mb-6 md:mb-8" style={{ color: '#a06a4e', opacity: 0.8 }}>
                    SAVE UP TO 50% OFF
                  </p>
                  <Link
                    to="/sale"
                    className="inline-block px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border border-[#3D2817]/30 bg-[#3D2817] text-white hover:bg-[#FAF8F5] hover:text-[#3D2817] transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
                
                {/* Pagination Dots */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  <div className="w-2 h-2 bg-[#3D2817]"></div>
                  <div className="w-2 h-2 bg-[#3D2817]/30"></div>
                </div>
              </div>
            </div>

            {/* Right Model Section */}
            <div className="relative">
              <div className="relative h-full sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-[#FAF8F5] border border-[#3D2817]/30 overflow-hidden luxury-shadow">
                <img
                  src={optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766658151/Beige_Modern_Minimalist_Fashion_Clothing_Sale_Promotional_Instagram_Post_q8geu5.png', 50)}
                  alt="Fashion Sale Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- SHOP BY CATEGORY SECTION --- */}
      <div className="py-8 sm:py-12 lg:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Categories
            </h2>
          </div>

          {/* Category Carousel - Horizontal Scroll */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-3 sm:gap-4 lg:gap-5" style={{ width: 'max-content' }}>
                
                {/* Category 1 - Women's Fashion */}
                <Link 
                  to="/women" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', 50)}
                      alt="Fashion"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Fashion';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Fashion
                      </h3>
                      <p className="text-xs text-white/90">
                        Women's
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 2 - Sale */}
                <Link 
                  to="/sale" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border-2 border-red-200 rounded-lg overflow-hidden hover:border-red-400 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop', 50)}
                      alt="Sale"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Sale';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-red-500/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Sale
                      </h3>
                      <p className="text-xs text-white/90 font-medium">
                        Up to 60% OFF
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 3 - Shoes */}
                <Link 
                  to="/shoes" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 50)}
                      alt="Shoes"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Shoes';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Shoes
                      </h3>
                      <p className="text-xs text-white/90">
                        Footwear
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 4 - Watches */}
                <Link 
                  to="/watches" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', 50)}
                      alt="Watches"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Watches';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Watches
                      </h3>
                      <p className="text-xs text-white/90">
                        Timepieces
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 5 - Eyewear */}
                <Link 
                  to="/lenses" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', 50)}
                      alt="Eyewear"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Eyewear';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Eyewear
                      </h3>
                      <p className="text-xs text-white/90">
                        Lenses
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 6 - Skincare */}
                <Link 
                  to="/skincare" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', 50)}
                      alt="Skincare"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Skincare';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Skincare
                      </h3>
                      <p className="text-xs text-white/90">
                        Beauty
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Category 7 - Accessories */}
                <Link 
                  to="/accessories" 
                  className="group relative flex-shrink-0 w-32 sm:w-40 lg:w-48 bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#3D2817] hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-32 sm:h-40 lg:h-48">
                    <img
                      src={optimizeImageUrl('https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop', 50)}
                      alt="Accessories"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Accessories';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                        Accessories
                      </h3>
                      <p className="text-xs text-white/90">
                        Essentials
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- THREE BANNERS CAROUSEL (Visible on all devices) --- */}
      <div className="relative w-full bg-[#FAF8F5] border-t border-[#3D2817]/30 overflow-hidden">
        <div className="relative w-full">
          <div 
            ref={bannerCarouselRef}
            className="flex overflow-x-hidden scroll-smooth scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-auto object-contain"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- THREE COLUMN PRODUCT SECTIONS --- */}
      <div className="relative w-full bg-[#FAF8F5] border-t border-[#3D2817]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Column 1: Women's Fashion */}
            <Link to="/women" className="relative group overflow-hidden bg-[#FAF8F5] border border-[#3D2817]/30 luxury-shadow transition-all duration-300">
              {/* Content */}
              <div className="relative z-10 p-4 sm:p-5 lg:p-6">
                {/* Brand/Logo */}
                <div className="mb-4 bg-transparent">
                  <img 
                    src={optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png', 50)}
                    alt="Shopzy Logo"
                    className="h-8 sm:h-10 w-auto object-contain mb-2"
                    style={{ backgroundColor: 'transparent', background: 'transparent' }}
                  />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#3D2817' }}>
                    Women's Fashion
                  </h2>
                </div>
                
                {/* Products Display */}
                <div className="space-y-2.5 sm:space-y-3">
                  {womenItems.slice(0, isMobile ? 2 : 4).map((product, idx) => {
                    // Handle images - support array, object, or string formats
                    let imageUrl = null;
                    if (product.images) {
                      if (Array.isArray(product.images) && product.images.length > 0) {
                        imageUrl = product.images[0];
                      } else if (typeof product.images === 'object') {
                        imageUrl = product.images.image1 || product.images.image2 || product.images.image3 || product.images.image4;
                      } else if (typeof product.images === 'string') {
                        imageUrl = product.images;
                      }
                    }
                    if (!imageUrl) {
                      imageUrl = product.image || product.imageUrl || product.thumbnail;
                    }
                    
                    return (
                      <div key={product.id || product._id || idx} className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-[#3D2817]/20 hover:border-[#3D2817]/40 transition-colors" style={{ backgroundColor: '#FAF8F5' }}>
                        {/* Red accent line */}
                        <div className="absolute left-0 w-0.5 h-full" style={{ backgroundColor: '#8B4513' }}></div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#3D2817]/20">
                          {imageUrl ? (
                            <img
                              src={optimizeImageUrl(imageUrl, 50)}
                              alt={product.name || product.productName || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[9px]" style={{ display: imageUrl ? 'none' : 'flex', backgroundColor: '#FAF8F5', color: '#3D2817' }}>
                            No Image
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold mb-0.5 line-clamp-1" style={{ color: '#3D2817' }}>
                            {product.name || product.productName || 'Product'}
                          </p>
                          <p className="text-sm sm:text-base font-bold" style={{ color: '#8B4513' }}>
                            ₹{product.finalPrice || product.price || '0'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* CTA */}
                <div className="mt-4 pt-3 border-t border-[#3D2817]/20">
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide" style={{ color: '#3D2817' }}>
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>

          {/* Column 2: Skincare */}
          <Link to="/skincare" className="relative group overflow-hidden bg-[#FAF8F5] border border-[#3D2817]/30 luxury-shadow transition-all duration-300">
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-5 lg:p-6">
              {/* Brand/Logo */}
              <div className="mb-4 bg-transparent">
                <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                  alt="Shopzy Logo"
                  className="h-8 sm:h-10 w-auto object-contain mb-2"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#3D2817' }}>
                  Skincare Essentials
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#3D2817', opacity: 0.7 }}>Nourish & Glow</p>
              </div>
              
              {/* Products Display */}
              <div className="space-y-2.5 sm:space-y-3">
                {skincareProducts.slice(0, isMobile ? 2 : 4).map((product, idx) => (
                  <div key={product.id || product._id || idx} className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-[#3D2817]/20 hover:border-[#3D2817]/40 transition-colors" style={{ backgroundColor: '#FAF8F5' }}>
                    {/* Red accent line */}
                    <div className="absolute left-0 w-0.5 h-full" style={{ backgroundColor: '#8B4513' }}></div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#3D2817]/20">
                      <img
                        src={product.image || product.imageUrl || 'https://via.placeholder.com/80'}
                        alt={product.name || product.productName || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[9px]" style={{ display: 'none', backgroundColor: '#FAF8F5', color: '#3D2817' }}>
                        No Image
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold mb-0.5 line-clamp-1" style={{ color: '#3D2817' }}>
                        {product.name || product.productName || 'Product'}
                      </p>
                      <p className="text-sm sm:text-base font-bold" style={{ color: '#8B4513' }}>
                        ₹{product.finalPrice || product.price || '0'}
                      </p>
                    </div>
                  </div>
            ))}
          </div>
              
              {/* CTA */}
              <div className="mt-4 pt-3 border-t border-[#3D2817]/20">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide" style={{ color: '#3D2817' }}>
                  Explore →
                </span>
        </div>
            </div>
          </Link>

          {/* Column 3: Accessories & Watches */}
          <Link to="/watches" className="relative group overflow-hidden bg-[#FAF8F5] border border-[#3D2817]/30 luxury-shadow transition-all duration-300">
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-5 lg:p-6">
              {/* Brand/Logo */}
              <div className="mb-4 bg-transparent">
                <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                  alt="Shopzy Logo"
                  className="h-8 sm:h-10 w-auto object-contain mb-2"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#3D2817' }}>
                  Accessories
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#3D2817', opacity: 0.7 }}>Watches & More</p>
      </div>
              
              {/* Products Display */}
              <div className="space-y-2.5 sm:space-y-3">
                {(isMobile 
                  ? [...watches.slice(0, 1), ...accessories.slice(0, 1)]
                  : [...watches.slice(0, 2), ...accessories.slice(0, 2)]
                ).map((product, idx) => {
                  // Handle images - support array, object, or string formats
                  let imageUrl = null;
                  if (product.images) {
                    if (Array.isArray(product.images) && product.images.length > 0) {
                      imageUrl = product.images[0];
                    } else if (typeof product.images === 'object') {
                      imageUrl = product.images.image1 || product.images.image2 || product.images.image3 || product.images.image4;
                    } else if (typeof product.images === 'string') {
                      imageUrl = product.images;
                    }
                  }
                  if (!imageUrl) {
                    imageUrl = product.image || product.imageUrl || product.thumbnail;
                  }
                  
                  return (
                    <div key={product.id || product._id || idx} className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-[#3D2817]/20 hover:border-[#3D2817]/40 transition-colors" style={{ backgroundColor: '#FAF8F5' }}>
                      {/* Red accent line */}
                      <div className="absolute left-0 w-0.5 h-full" style={{ backgroundColor: '#8B4513' }}></div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex-shrink-0 overflow-hidden flex items-center justify-center border border-[#3D2817]/20">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name || product.productName || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[9px]" style={{ display: imageUrl ? 'none' : 'flex', backgroundColor: '#FAF8F5', color: '#3D2817' }}>
                          No Image
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold mb-0.5 line-clamp-1" style={{ color: '#3D2817' }}>
                          {product.name || product.productName || 'Product'}
                        </p>
                        <p className="text-sm sm:text-base font-bold" style={{ color: '#8B4513' }}>
                          ₹{product.finalPrice || product.price || '0'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* CTA */}
              <div className="mt-4 pt-3 border-t border-[#3D2817]/20">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide" style={{ color: '#3D2817' }}>
                  Discover →
                </span>
              </div>
            </div>
          </Link>
        </div>
        </div>
      </div>

      {/* --- BANNER IMAGES SECTION --- */}
      <div className="w-full bg-[#FAF8F5] border-t border-[#3D2817]/30">
        <div className="flex flex-col md:flex-row gap-0">
          {/* First Banner - Sale */}
          <Link 
            to="/sale" 
            className="flex-1 w-full md:w-1/2 overflow-hidden hover:opacity-95 transition-opacity"
          >
            <img
              src={optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767171485/Mobile_Banner_resize_7_gyz5xo.jpg', 50)}
              alt="Sale Banner"
              className="w-full h-auto object-cover"
            />
          </Link>
          
          {/* Second Banner - Shirts */}
          <Link 
            to="/women/shirt" 
            className="flex-1 w-full md:w-1/2 overflow-hidden hover:opacity-95 transition-opacity"
          >
            <img
              src={optimizeImageUrl('https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767171505/Mobile_Banner_resize_6_ybv1ud.jpg', 50)}
              alt="Shirts Banner"
              className="w-full h-auto object-cover"
            />
          </Link>
        </div>
      </div>

      {/* --- THE BEST OF SKINCARE SECTION (Luxury Style) --- */}
      <div className="bg-[#FAF8F5] py-8 sm:py-10 lg:py-12 xl:py-14 border-t border-[#3D2817]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2" style={{ color: '#3D2817' }}>THE BEST OF SKINCARE</h2>
            <p className="text-xs sm:text-sm lg:text-base" style={{ color: '#3D2817', opacity: 0.7 }}>Curated premium skincare collection</p>
          </div>

          {/* Skincare Products Grid */}
          {skincareProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {skincareProducts.slice(0, windowWidth < 640 ? 14 : 16).map((product, index) => {
                // Group products by brand for better display
                const brandName = product.brand || 'Skincare';
                const discount = product.discountPercent || 0;
                const offerText = discount > 0 
                  ? `Up to ${discount}% Off` 
                  : index % 3 === 0 
                    ? 'New Launch!' 
                    : index % 3 === 1 
                      ? 'Free Gift with Orders' 
                      : 'Limited Edition';
                
                // Luxury background styles
                const bgStyles = [
                  'bg-gradient-to-br from-[#FAF8F5] via-[#F5F1EB] to-[#FAF8F5]',
                  'bg-gradient-to-br from-[#F5F1EB] via-[#FAF8F5] to-[#E8E0D6]',
                  'bg-gradient-to-br from-[#FAF8F5] via-[#E8E0D6] to-[#F5F1EB]',
                  'bg-gradient-to-br from-[#E8E0D6] via-[#FAF8F5] to-[#F5F1EB]',
                  'bg-gradient-to-br from-[#F5F1EB] via-[#E8E0D6] to-[#FAF8F5]',
                ];
                const bgStyle = bgStyles[index % bgStyles.length];

                return (
                  <div
                    key={product.id || product._id || index}
                    className="group relative overflow-hidden rounded border border-[#3D2817]/30 luxury-shadow transition-all duration-300 bg-[#FAF8F5]"
                  >
                    {/* Card Background with Gradient */}
                    <div className={`relative ${bgStyle} p-3 sm:p-4 flex flex-col h-full`}>
                      {/* Brand Badge */}
                      <div className="absolute top-2 left-2 bg-[#FAF8F5]/95 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wide z-10 border border-[#3D2817]/20" style={{ color: '#3D2817' }}>
                        {brandName.length > 12 ? brandName.substring(0, 12) + '...' : brandName}
                      </div>

                      {/* Product Image - Clickable Link */}
                      <Link
                        to={`/skincare/${product.id || product._id}`}
                        className="flex-1 flex items-center justify-center mt-6 sm:mt-8 mb-3"
                      >
                        <img
                          src={optimizeImageUrl(product.image || product.imageUrl || product.images?.[0], 50)}
                          alt={product.name || product.productName}
                          className="max-w-full max-h-24 sm:max-h-28 md:max-h-32 lg:max-h-36 object-contain"
                          onError={(e) => handleImageError(e, 300, 300)}
                        />
                      </Link>

                      {/* Product Info - Clickable Link */}
                      <Link
                        to={`/skincare/${product.id || product._id}`}
                        className="mt-auto space-y-1"
                      >
                        <p className="text-xs sm:text-sm font-semibold line-clamp-2 min-h-[2.5em]" style={{ color: '#3D2817' }}>
                          {product.name || product.productName}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide" style={{ color: '#8B4513' }}>
                          {offerText}
                        </p>
                      </Link>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="mt-2 w-full py-1.5 sm:py-2 px-2 sm:px-3 text-[9px] sm:text-[10px] font-semibold rounded transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5"
                        style={{ 
                          backgroundColor: '#8B4513', 
                          color: '#FAF8F5' 
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#3D2817';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#8B4513';
                        }}
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add to Cart</span>
                      </button>

                      {/* Hover Overlay Effect */}
                    </div>
                  </div>
                );
              })}
        </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">Loading skincare products...</p>
      </div>
          )}

          {/* View All Button */}
          {skincareProducts.length > 0 && (
            <div className="text-center mt-6 sm:mt-8 lg:mt-10">
              <Link
                to="/skincare"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#3D2817]/30 text-sm font-semibold transition-colors luxury-shadow"
                style={{ backgroundColor: '#8B4513', color: '#FAF8F5' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3D2817';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8B4513';
                }}
              >
                View All Skincare
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      

      {/* --- PROFESSIONAL SKINCARE SECTIONS (Legends, Hot Sellers, Combos) --- */}
      <section className="relative py-8 sm:py-10 bg-[#FAF8F5] border-t border-[#3D2817]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Section: SKINCARE LEGENDS */}
            <div className="relative bg-white border border-[#3D2817]/20 rounded-lg p-4 sm:p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              {/* Badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wide bg-pink-500 text-white rounded-full">
                  ✨ NEW LAUNCH
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold mb-3 text-[#3D2817]">
                Introducing the SKINCARE LEGENDS!
              </h2>
              
              {/* Category Buttons - Compact */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Link 
                  to="/skincare?category=serum" 
                  className="px-2 py-1.5 text-[10px] sm:text-xs font-semibold border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors text-center rounded"
                >
                  Pigmentation Specialist
                </Link>
                <Link 
                  to="/skincare?category=serum" 
                  className="px-2 py-1.5 text-[10px] sm:text-xs font-semibold border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors text-center rounded"
                >
                  Acne Fighter
                </Link>
              </div>
              
              {/* Moisturizer Section */}
              <div className="mb-4">
                <Link 
                  to="/skincare?category=moisturizer"
                  className="block w-full px-3 py-2 text-xs sm:text-sm font-semibold border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors text-center rounded"
                >
                  Moisturizer - Skincare
                </Link>
              </div>
              
              {/* Skincare Products */}
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-semibold mb-3 text-[#3D2817]">
                  Premium Skincare Serums
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {skincareProducts.slice(0, 4).map((product, idx) => {
                    const imageUrl = product.image || product.imageUrl || product.images?.[0];
                    return (
                      <Link
                        key={product._id || product.id || idx}
                        to={`/skincare/${product._id || product.id}`}
                        className="w-full h-16 sm:h-20 bg-[#FAF8F5] border border-[#3D2817]/20 rounded overflow-hidden flex items-center justify-center hover:border-[#8B4513] transition-colors"
                      >
                        {imageUrl ? (
                          <img
                            src={optimizeImageUrl(imageUrl, 50)}
                            alt={product.name || product.productName}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-[#3D2817] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                          {product.name || product.productName || 'Product'}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/skincare"
                className="w-full py-2 text-xs sm:text-sm font-semibold text-center border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors rounded"
              >
                NEW LAUNCH
              </Link>
            </div>

            {/* Middle Section: HOT SELLERS */}
            <div className="relative bg-white border border-[#3D2817]/20 rounded-lg p-4 sm:p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              {/* Badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white rounded-full">
                  🔥 HOT SELLERS
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold mb-2 text-[#3D2817]">
                HOT SELLERS
              </h2>
              <p className="text-xs sm:text-sm mb-4 text-[#3D2817]/70">
                High In Demand Secure Yours Now!
              </p>
              
              {/* Hot Sellers Skincare Products */}
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-semibold mb-3 text-[#3D2817]">
                  Best Selling Products
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {skincareProducts.slice(4, 10).map((product, idx) => {
                    const imageUrl = product.image || product.imageUrl || product.images?.[0];
                    return (
                      <Link
                        key={product._id || product.id || idx}
                        to={`/skincare/${product._id || product.id}`}
                        className="w-full h-16 sm:h-20 bg-[#FAF8F5] border border-[#3D2817]/20 rounded overflow-hidden flex items-center justify-center hover:border-[#8B4513] transition-colors"
                      >
                        {imageUrl ? (
                          <img
                            src={optimizeImageUrl(imageUrl, 50)}
                            alt={product.name || product.productName}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-[#3D2817] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                          {product.name || product.productName || 'Product'}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/sale"
                className="w-full py-2 text-xs sm:text-sm font-semibold text-center border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors rounded"
              >
                Hot Sellers
              </Link>
            </div>

            {/* Right Section: Greatest Combos */}
            <div className="relative bg-white border border-[#3D2817]/20 rounded-lg p-4 sm:p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              {/* Discount Badge */}
              <div className="relative mb-3">
                <div className="absolute -left-2 -top-2 bg-[#8B4513] border border-white shadow-lg px-3 py-1.5 transform rotate-[-12deg] z-10 rounded">
                  <span className="text-[10px] sm:text-xs font-bold text-white">UP TO 60% OFF</span>
                </div>
              </div>
              
              <h2 className="text-base sm:text-lg font-bold mb-3 text-[#3D2817] mt-4">
                Grab your Biggest Savings with our Greatest Combos!
              </h2>
              
              {/* Combo Skincare Products */}
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-semibold mb-3 text-[#3D2817]">
                  Combo Products
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {skincareProducts.slice(0, 8).map((product, idx) => {
                    const imageUrl = product.image || product.imageUrl || product.images?.[0];
                    return (
                      <Link
                        key={product._id || product.id || idx}
                        to={`/skincare/${product._id || product.id}`}
                        className="w-full h-14 sm:h-16 bg-[#FAF8F5] border border-[#3D2817]/20 rounded overflow-hidden flex items-center justify-center hover:border-[#8B4513] transition-colors"
                      >
                        {imageUrl ? (
                          <img
                            src={optimizeImageUrl(imageUrl, 50)}
                            alt={product.name || product.productName}
                            className="w-full h-full object-contain p-1.5"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-[#3D2817] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                          {product.name || product.productName || 'Product'}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/sale"
                className="w-full py-2 text-xs sm:text-sm font-semibold text-center border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#8B4513] hover:text-white transition-colors rounded"
              >
                Combos
              </Link>
            </div>
          </div>
        </div>
      </section>

    


      
      <div className="w-fit m-0 p-0 leading-none overflow-visible h-auto w-auto hidden lg:block">
        <img
          src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765186240/d347cf32-1980-4355-9ac5-9168cf727263.png"
          alt="Full size"
          className="block w-auto h-auto m-0 p-0 border-none outline-none"
        />
      </div>



      {/* --- PRODUCT SECTIONS (Improved Headers and Buttons) --- */}

      <ProductSection
        title="Fresh Drops"
        subtitle="Be the first to wear the trend"
        products={freshDrops}
        viewAllLink="/women/shoes"
        isLoading={isLoading}
      />
      

      <div className="w-full overflow-hidden lg:hidden">
        <img
          src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765137210/Black_Elegant_Watch_Special_Offer_Instagram_Post_y3foz1.svg"
          alt="Full size"
          className="block w-full h-auto m-0 p-0 border-none outline-none"
        />
      </div>



      {/* <ProductSection
        title="Steal Deals"
        subtitle="Premium styles at unbeatable prices"
        products={saleItems}
        viewAllLink="/sale"
        bgColor="bg-gradient-to-br from-gray-50 to-white"
        isLoading={isLoading}
      /> */}

      {/* 3. Women - Enhanced "For Her" Section */}
      <div className="relative w-full bg-gradient-to-br from-[#FAF8F5] via-[#FFF8F0] to-[#FAF8F5] py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-100/10 to-pink-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block mb-4">
              <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg">
                ✨ Exclusive Collection
              </span>
            </div>
            <h2 className="text-2xl sm:text-5xl lg:text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              For Her
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of women's fashion, designed to elevate your style and celebrate your unique beauty
            </p>
          </div>

          {/* Products Grid */}
          <div className="relative mb-10 sm:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <SkeletonCard />
                  </div>
                ))
              ) : (
                womenItems.slice(0, 3).map((p, index) => (
                  <div 
                    key={p._id} 
                    className="group relative transform transition-all duration-500 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Decorative Border on Hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                    <div className="relative">
                      <ProductCard product={p} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="relative text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Link
                to="/women"
                className="group relative px-8 py-4 text-sm sm:text-base font-bold text-white rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-pink-500/50"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #ec4899 100%)',
                  backgroundSize: '200% 200%',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundPosition = 'right center';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundPosition = 'left center';
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Shop Women's Collection</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </Link>
              
              <Link
                to="/women"
                className="px-6 py-3 text-sm sm:text-base font-semibold text-pink-600 hover:text-rose-600 transition-colors border-2 border-pink-300 hover:border-rose-400 rounded-full hover:bg-pink-50"
              >
                View All →
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
              <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-6 sm:mb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Featured Collections</h2>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-2xl mx-auto">
          <Link to="/women/shirt" className="block w-full overflow-hidden rounded-xl duration-300 group">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png" alt="Women" className="w-full h-auto block" loading="lazy" />
          </Link>
        </div>
      </div>

     

      {/* --- STORY VIEWER MODAL (Unchanged) --- */}
      {isStoryViewerOpen && activeStoryIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setIsStoryViewerOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setIsStoryViewerOpen(false); }} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white transition bg-white/10 rounded-full p-2"><IconClose /></button>

          {activeStoryIndex > 0 && <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70 bg-white/10 rounded-full p-2"><IconChevronLeft /></button>}
          {activeStoryIndex < stories.length - 1 && <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70 bg-white/10 rounded-full p-2"><IconChevronRight /></button>}

          <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {stories.map((_, index) => (
                <div key={index} className={`h-1 rounded-full flex-1 transition-all duration-300 ${index <= activeStoryIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <img src={stories[activeStoryIndex].image} alt={stories[activeStoryIndex].hashtag} className="w-full h-full object-contain max-h-[85vh] rounded-lg" />
            <div className="absolute bottom-20 text-center bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
              <span className="text-xl font-bold text-white">{stories[activeStoryIndex].hashtag} {stories[activeStoryIndex].emoji}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- REUSABLE SUB-COMPONENTS ---

const SkeletonCard = () => <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>;

const ProductSection = ({ title, subtitle, products, viewAllLink, bgColor = 'bg-white', isLoading }) => {
  return (
    <section className={`py-8 sm:py-12 md:py-16 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 border-b pb-3 sm:pb-4 border-gray-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm sm:text-base text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="mt-3 sm:mt-0 inline-block px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full border border-gray-300 font-semibold text-white bg-gray-900 hover:bg-gray-900 hover:text-white hover:border-transparent transform"
            >
              View All
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500 py-10">No products found.</p>
            )}
          </div>
        )}

        {/* Mobile View All Button (Visible only on small screens) */}
        {viewAllLink && (
          <div className="mt-8 text-center sm:hidden">
            <Link to={viewAllLink} className="inline-block px-8 py-3 rounded-full bg-gray-900 text-white font-semibold shadow-lg">View All</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;