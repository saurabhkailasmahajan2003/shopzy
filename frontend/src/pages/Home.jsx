import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// import Footer from '../components/Footer'; 
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';
import { handleImageError } from '../utils/imageFallback';

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
    const res = await productAPI.getSkincareProducts({ limit: 12 });
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

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [freshDropsData, saleData, womenData, watchesData, accessoriesData, skincareData] = await Promise.all([
          fetchFreshDrops(), fetchSaleItems(), fetchWomen(), fetchWatches(), fetchAccessories(), fetchSkincare()
        ]);
        setFreshDrops(freshDropsData);
        setSaleItems(saleData);
        setWomenItems(womenData);
        setWatches(watchesData);
        setAccessories(accessoriesData);
        setSkincareProducts(skincareData);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);


  const stories = [
    { hashtag: 'Xmas', emoji: '🎄', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png' },
    { hashtag: 'Desi', emoji: '😎', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: 'Street', emoji: '🔥', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: 'FitCheck', emoji: '✨', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: 'Tees', emoji: '👕', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp', link: '/women/tshirt' },
    { hashtag: 'Denim', emoji: '👖', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: 'Scarf', emoji: '🧣', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];

  // Banner carousel images
  const banners = [
    'https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476937/Brown_Modern_New_Arrival_Leaderboard_Ad_gzs4iv.svg',
    'https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476935/Cream_Brown_Minimalist_Fashion_Sale_Leaderboard_Ad_tpvvpj.svg',
    'https://res.cloudinary.com/de1bg8ivx/image/upload/v1766476935/Women_Fashion_Leaderboard_Ad_trr3pe.svg'
  ];

  // Auto-rotate mobile banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto-rotate desktop promo banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoBannerIndex((prev) => (prev + 1) % 4);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate mobile promo banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMobilePromoBannerIndex((prev) => (prev + 1) % 4);
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

  // Scroll to current desktop promo banner
  useEffect(() => {
    if (promoBannerCarouselRef.current) {
      const bannerWidth = promoBannerCarouselRef.current.offsetWidth;
      promoBannerCarouselRef.current.scrollTo({
        left: currentPromoBannerIndex * bannerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentPromoBannerIndex]);

  // Scroll to current mobile promo banner
  useEffect(() => {
    if (mobilePromoBannerCarouselRef.current) {
      const bannerWidth = mobilePromoBannerCarouselRef.current.offsetWidth;
      mobilePromoBannerCarouselRef.current.scrollTo({
        left: currentMobilePromoBannerIndex * bannerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentMobilePromoBannerIndex]);

  return (
    <div className="min-h-screen font-sans text-gray-800">
      
      {/* --- HERO SECTION (Desktop: Text Left, Banners Right | Mobile: Banners Only) --- */}
      <div className="relative w-full bg-[#fefcfb]">
        
        {/* Desktop Hero Layout */}
        <div className="hidden md:block relative w-full pb-8 lg:pb-12 xl:pb-16">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch min-h-[450px] md:min-h-[500px] lg:min-h-[550px] xl:min-h-[600px]">
              
              {/* Left Side: Text Content - Takes 6 columns */}
              <div className="lg:col-span-6 text-left space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8 px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col justify-center pt-3 lg:pt-4 pb-8 lg:pb-12">
                {/* NEW COLLECTION Label */}
                <div>
                  <span className="inline-block px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] border-2 border-[#120e0f]" style={{ backgroundColor: '#bb3435', color: '#fefcfb' }}>
                    NEW COLLECTION
                  </span>
                </div>
                
                {/* Main Headline */}
                <div className="space-y-1 md:space-y-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-serif font-bold leading-[1.05] tracking-tight" style={{ color: '#120e0f' }}>
                    Discover
                  </h1>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-serif font-bold leading-[1.05] tracking-tight" style={{ color: '#bb3435' }}>
                    Your Style
                  </h1>
                </div>
                
                {/* Subtitle */}
                <div>
                  <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed max-w-lg" style={{ color: '#120e0f', opacity: 0.85 }}>
                    Curated fashion, beauty essentials, and lifestyle products that reflect your unique personality
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-1 md:pt-2">
                  <Link
                    to="/women"
                    className="inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-2.5 md:py-3 lg:py-3.5 text-xs md:text-sm lg:text-base font-semibold text-center border-2 border-[#120e0f] transition-colors"
                    style={{ backgroundColor: '#bb3435', color: '#fefcfb' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#120e0f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#bb3435';
                    }}
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/sale"
                    className="inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-2.5 md:py-3 lg:py-3.5 text-xs md:text-sm lg:text-base font-semibold text-center border-2 border-[#120e0f] transition-colors"
                    style={{ backgroundColor: '#fefcfb', color: '#120e0f' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#120e0f';
                      e.target.style.color = '#fefcfb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fefcfb';
                      e.target.style.color = '#120e0f';
                    }}
                  >
                    View Sale
                  </Link>
                </div>
              </div>

              {/* Right Side: Banner Carousel - Takes 6 columns, smaller size, no borders */}
              <div className="lg:col-span-6 relative w-full flex items-center justify-center py-4 lg:py-6">
                <div className="relative overflow-hidden w-full max-w-sm md:max-w-md lg:max-w-lg">
                  <div 
                    ref={promoBannerCarouselRef}
                    className="flex overflow-x-hidden scroll-smooth scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {[
                      'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656833/Purple_Women_Clothing_Promo_Instagram_Post_d2cxg9.png',
                      'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656659/Pink_and_Gold_Simple_Diwali_Skincare_Cosmetic_Beauty_Offers_Instagram_Post_1_xzglzv.png',
                      'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656392/Brown_White_Modern_Elegant_Sale_and_Discount_Instagram_Post_frmjoo.svg',
                      'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766655996/Red_and_White_Modern_Bridal_Shower_Social_Media_Graphic_1_v9pexp.svg'
                    ].map((banner, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-full"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <img
                          src={banner}
                          alt={`Promo Banner ${index + 1}`}
                          className="w-full h-auto object-contain"
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-[#fefcfb]/80 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-[#120e0f]/20">
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPromoBannerIndex(index)}
                      className={`h-1.5 md:h-2 transition-all rounded-full ${
                        index === currentPromoBannerIndex 
                          ? 'w-6 md:w-8 bg-[#120e0f]' 
                          : 'w-1.5 md:w-2 bg-[#120e0f]/30 hover:bg-[#120e0f]/50'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentPromoBannerIndex((prev) => (prev - 1 + 4) % 4)}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 md:p-2 z-10 transition-colors"
                  aria-label="Previous banner"
                >
                  <IconChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentPromoBannerIndex((prev) => (prev + 1) % 4)}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 md:p-2 z-10 transition-colors"
                  aria-label="Next banner"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hero Layout: Banners First, Then Text */}
        <div className="md:hidden relative w-full bg-[#fefcfb]">
          {/* Mobile Promotional Banners Carousel - Above Text */}
          <div className="relative w-full overflow-hidden bg-[#fefcfb] border-b-2 border-[#120e0f]">
            <div 
              ref={mobilePromoBannerCarouselRef}
              className="flex overflow-x-hidden scroll-smooth scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {[
                'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656833/Purple_Women_Clothing_Promo_Instagram_Post_d2cxg9.png',
                'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656659/Pink_and_Gold_Simple_Diwali_Skincare_Cosmetic_Beauty_Offers_Instagram_Post_1_xzglzv.png',
                'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766656392/Brown_White_Modern_Elegant_Sale_and_Discount_Instagram_Post_frmjoo.svg',
                'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766655996/Red_and_White_Modern_Bridal_Shower_Social_Media_Graphic_1_v9pexp.svg'
              ].map((banner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <img
                    src={banner}
                    alt={`Promo Banner ${index + 1}`}
                    className="w-full h-auto object-contain"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-[#fefcfb]/80 backdrop-blur-sm px-2 py-1 rounded-full border border-[#120e0f]/20">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMobilePromoBannerIndex(index)}
                  className={`h-1.5 transition-all rounded-full ${
                    index === currentMobilePromoBannerIndex 
                      ? 'w-6 bg-[#120e0f]' 
                      : 'w-1.5 bg-[#120e0f]/30'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows - Positioned slightly above for mobile */}
            <button
              onClick={() => setCurrentMobilePromoBannerIndex((prev) => (prev - 1 + 4) % 4)}
              className="absolute left-2 top-[40%] -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 z-10 transition-colors"
              aria-label="Previous banner"
            >
              <IconChevronLeft />
            </button>
            <button
              onClick={() => setCurrentMobilePromoBannerIndex((prev) => (prev + 1) % 4)}
              className="absolute right-2 top-[40%] -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 z-10 transition-colors"
              aria-label="Next banner"
            >
              <IconChevronRight />
            </button>
          </div>

          {/* Mobile Text Content - Below Banners */}
          <div className="px-4 py-6 space-y-4">
            {/* NEW COLLECTION Label */}
            <div>
              <span className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border-2 border-[#120e0f]" style={{ backgroundColor: '#bb3435', color: '#fefcfb' }}>
                NEW COLLECTION
              </span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight" style={{ color: '#120e0f' }}>
                Discover
              </h1>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight" style={{ color: '#bb3435' }}>
                Your Style
              </h1>
            </div>
            
            {/* Subtitle */}
            <div>
              <p className="text-sm leading-relaxed" style={{ color: '#120e0f', opacity: 0.85 }}>
                Curated fashion, beauty essentials, and lifestyle products that reflect your unique personality
              </p>
            </div>
            
            {/* CTA Buttons - In Same Row */}
            <div className="flex flex-row gap-3 pt-2">
              <Link
                to="/women"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-center border-2 border-[#120e0f]"
                style={{ backgroundColor: '#bb3435', color: '#fefcfb' }}
              >
                Shop Now
              </Link>
              <Link
                to="/sale"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-center border-2 border-[#120e0f]"
                style={{ backgroundColor: '#fefcfb', color: '#120e0f' }}
              >
                View Sale
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW FASHION SALE PROMOTIONAL BANNER --- */}
      <div className="relative w-full bg-[#fefcfb] border-t-2 border-[#120e0f] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-center">
            
            {/* Left Model Section */}
            <div className="relative hidden md:block">
              <div className="relative h-64 sm:h-80 md:h-96 bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766657960/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_ymve41.png"
                  alt="Women Bags Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Central Promotional Section */}
            <div className="relative col-span-1 md:col-span-1">
              <div className="relative bg-[#fefcfb] p-4 sm:p-6 md:p-8 lg:p-10 border-2 border-[#120e0f] min-h-[250px] sm:min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center">
                
                {/* Abstract Brown Blob Shapes */}
                <div className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#a06a4e]/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 right-6 w-16 h-16 sm:w-20 sm:h-20 bg-[#a06a4e]/15 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/4 w-10 h-10 sm:w-12 sm:h-12 bg-[#a06a4e]/10 rounded-full blur-lg"></div>
                
                {/* Black Dotted Patterns */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex gap-1">
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                </div>
                <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-8 flex gap-1">
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#120e0f] rounded-full"></div>
                </div>
                
                {/* Black Starburst Icons */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#120e0f]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/>
                  </svg>
                </div>
                <div className="absolute bottom-10 left-8 sm:bottom-12 sm:left-10">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#120e0f]" fill="currentColor" viewBox="0 0 24 24">
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
                    className="inline-block px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold border-2 border-[#120e0f] bg-[#120e0f] text-[#fefcfb] hover:bg-[#fefcfb] hover:text-[#120e0f] transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
                
                {/* Pagination Dots */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  <div className="w-2 h-2 bg-[#120e0f]"></div>
                  <div className="w-2 h-2 bg-[#120e0f]/30"></div>
                </div>
              </div>
            </div>

            {/* Right Model Section */}
            <div className="relative hidden md:block">
              <div className="relative h-64 sm:h-80 md:h-96 bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766658151/Beige_Modern_Minimalist_Fashion_Clothing_Sale_Promotional_Instagram_Post_q8geu5.png"
                  alt="Fashion Sale Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- THREE BANNERS CAROUSEL (Moved from above hero) --- */}
      <div className="relative w-full bg-[#fefcfb] border-t-2 border-[#120e0f] overflow-hidden">
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

          {/* Carousel Indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`h-2 transition-all ${
                  index === currentBannerIndex 
                    ? 'w-8 bg-[#120e0f]' 
                    : 'w-2 bg-[#120e0f]/30'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 sm:p-2 z-10 transition-colors"
            aria-label="Previous banner"
          >
            <IconChevronLeft />
          </button>
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-[#fefcfb]/90 hover:bg-[#fefcfb] border-2 border-[#120e0f] p-1.5 sm:p-2 z-10 transition-colors"
            aria-label="Next banner"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      {/* --- THREE COLUMN PRODUCT SECTIONS --- */}
      <div className="relative w-full bg-[#e3e0df]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Column 1: Women's Fashion */}
          <Link to="/women" className="relative group overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full blur-2xl"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col h-full bg-[#fefcfb]">
              {/* Brand/Logo */}
              <div className="mb-3 sm:mb-4">
                <div className="inline-block bg-purple-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Shopzy
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text mt-2">
                  Women's Fashion
                </h2>
              </div>
              
              {/* Products Display */}
              <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                {womenItems.slice(0, 4).map((product, idx) => {
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
                    <div key={product.id || product._id || idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border" style={{ backgroundColor: '#fefcfb', borderColor: '#120e0f' }}>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ border: '1px solid #120e0f' }}>
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
                        <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ display: imageUrl ? 'none' : 'flex', backgroundColor: '#fefcfb', color: '#120e0f' }}>
                          No Image
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs md:text-sm font-semibold truncate" style={{ color: '#120e0f' }}>
                          {product.name || product.productName || 'Product'}
                        </p>
                        <p className="text-[10px] sm:text-xs" style={{ color: '#bb3435' }}>
                          ₹{product.finalPrice || product.price || '0'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* CTA */}
              <div className="mt-4 sm:mt-6">
                <span className="text-xs sm:text-sm font-bold text-text">
                  Shop Now →
                </span>
              </div>
            </div>
          </Link>

          {/* Column 2: Skincare */}
          <Link to="/skincare" className="relative group overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 right-20 w-36 h-36 bg-blue-300 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-28 h-28 bg-cyan-300 rounded-full blur-2xl"></div>
          </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col h-full bg-[#f3f3f3]">
              {/* Brand/Logo */}
              <div className="mb-3 sm:mb-4">
                <div className="inline-block bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Shopzy
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text mt-2">
                  Skincare Essentials
                </h2>
                <p className="text-xs sm:text-sm text-text/70 mt-1">Nourish & Glow</p>
              </div>
              
              {/* Products Display */}
              <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                {skincareProducts.slice(0, 4).map((product, idx) => (
                  <div key={product.id || product._id || idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border" style={{ backgroundColor: '#fefcfb', borderColor: '#120e0f' }}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ border: '1px solid #120e0f' }}>
                      <img
                        src={product.image || product.imageUrl || 'https://via.placeholder.com/80'}
                        alt={product.name || product.productName || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ display: 'none', backgroundColor: '#fefcfb', color: '#120e0f' }}>
                        No Image
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm font-semibold truncate" style={{ color: '#120e0f' }}>
                        {product.name || product.productName || 'Product'}
                      </p>
                      <p className="text-[10px] sm:text-xs" style={{ color: '#bb3435' }}>
                        ₹{product.finalPrice || product.price || '0'}
                      </p>
                    </div>
                  </div>
            ))}
          </div>
              
              {/* CTA */}
              <div className="mt-4 sm:mt-6">
                <span className="text-xs sm:text-sm font-bold text-text">
                  Explore →
                </span>
        </div>
            </div>
          </Link>

          {/* Column 3: Accessories & Watches */}
          <Link to="/watches" className="relative group overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-rose-300 rounded-full blur-2xl"></div>
        </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col h-full bg-[#fefcfb]">
              {/* Brand/Logo */}
              <div className="mb-3 sm:mb-4">
                <div className="inline-block bg-pink-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Shopzy
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text mt-2">
                  Accessories
                </h2>
                <p className="text-xs sm:text-sm text-text/70 mt-1">Watches & More</p>
      </div>

              {/* Products Display */}
              <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                {[...watches.slice(0, 2), ...accessories.slice(0, 2)].map((product, idx) => {
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
                    <div key={product.id || product._id || idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border" style={{ backgroundColor: '#fefcfb', borderColor: '#120e0f' }}>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ border: '1px solid #120e0f' }}>
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
                        <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ display: imageUrl ? 'none' : 'flex', backgroundColor: '#fefcfb', color: '#120e0f' }}>
                          No Image
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs md:text-sm font-semibold truncate" style={{ color: '#120e0f' }}>
                          {product.name || product.productName || 'Product'}
                        </p>
                        <p className="text-[10px] sm:text-xs" style={{ color: '#bb3435' }}>
                          ₹{product.finalPrice || product.price || '0'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* CTA */}
              <div className="mt-4 sm:mt-6">
                <span className="text-xs sm:text-sm font-bold text-text">
                  Discover →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* --- BRAND ADVERTISEMENT SECTION (Nykaa Style) --- */}
      <div className="bg-background py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Brand Card 1 - Sarees */}
            <Link to="/women/saree" className="group relative overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-primary/20 to-cta/20">
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-text">
                  SAREE
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-text mb-1">Elegant Collection</h3>
                  <p className="text-sm text-text-muted">Traditional & Modern</p>
                  <span className="text-sm font-semibold text-cta inline-block mt-2">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>

            {/* Brand Card 2 - Skincare */}
            <Link to="/skincare" className="group relative overflow-hidden rounded-lg bg-white shadow-md">
              <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-text/10 to-gray-700/10">
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-text">
                  SKINCARE
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-text mb-1">Glow & Shine</h3>
                  <p className="text-sm text-text-muted">Nourish Your Skin</p>
                  <span className="text-sm font-semibold text-cta inline-block mt-2">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>

            {/* Brand Card 3 - Sale */}
            <Link to="/sale" className="group relative overflow-hidden rounded-lg bg-white shadow-md sm:col-span-2 md:col-span-1">
              <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-cta/20 to-primary/20">
                <div className="absolute top-4 left-4 bg-cta text-white px-3 py-1 rounded text-xs font-bold">
                  SALE
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-text mb-1">Up to 50% Off</h3>
                  <p className="text-sm text-text-muted">Limited Time</p>
                  <span className="text-sm font-semibold text-cta inline-block mt-2">
                    Shop Sale →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* --- THE BEST OF SKINCARE SECTION (Luxury Style) --- */}
      <div className="bg-background py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">THE BEST OF SKINCARE</h2>
            <p className="text-text-muted text-xs sm:text-sm lg:text-base">Curated premium skincare collection</p>
          </div>

          {/* Skincare Products Grid */}
          {skincareProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {skincareProducts.slice(0, 12).map((product, index) => {
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
                
                // Different background styles for variety (matching luxury brand aesthetic)
                const bgStyles = [
                  'bg-gradient-to-br from-primary/20 via-cta/10 to-background',
                  'bg-gradient-to-br from-text/10 via-gray-700/5 to-background',
                  'bg-gradient-to-br from-cta/15 via-primary/10 to-background',
                  'bg-gradient-to-br from-gray-800/10 via-text/5 to-background',
                  'bg-gradient-to-br from-primary/15 via-cta/5 to-background',
                  'bg-gradient-to-br from-text/8 via-gray-600/5 to-background',
                ];
                const bgStyle = bgStyles[index % bgStyles.length];

                return (
                  <Link
                    key={product.id || product._id || index}
                    to={`/skincare/${product.id || product._id}`}
                    className="group relative overflow-hidden rounded-lg bg-white shadow-lg"
                  >
                    {/* Card Background with Gradient */}
                    <div className={`relative h-48 sm:h-56 md:h-64 lg:h-80 ${bgStyle} p-3 sm:p-4 flex flex-col justify-between`}>
                      {/* Brand Badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] lg:text-xs font-bold text-text uppercase tracking-wide z-10">
                        {brandName.length > 12 ? brandName.substring(0, 12) + '...' : brandName}
                  </div>

                      {/* Product Image */}
                      <div className="flex-1 flex items-center justify-center mt-4 sm:mt-6">
                        <img
                          src={product.image || product.imageUrl || product.images?.[0]}
                          alt={product.name || product.productName}
                          className="max-w-full max-h-28 sm:max-h-32 md:max-h-40 lg:max-h-48 object-contain"
                          onError={(e) => handleImageError(e, 300, 300)}
                        />
                </div>

                      {/* Offer Text */}
                      <div className="mt-auto pt-2 sm:pt-3">
                        <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-text mb-1 line-clamp-2">
                          {product.name || product.productName}
                        </p>
                        <p className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-cta uppercase tracking-wide">
                          {offerText}
                        </p>
                        {product.price && (
                          <p className="text-[10px] sm:text-xs text-text-muted mt-1">
                            ₹{product.finalPrice || product.price}
                            {product.mrp && product.mrp > (product.finalPrice || product.price) && (
                              <span className="line-through ml-2">₹{product.mrp}</span>
                            )}
                          </p>
                        )}
              </div>

                      {/* Hover Overlay Effect */}
          </div>
                  </Link>
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
            <div className="text-center mt-8 lg:mt-12">
              <Link
                to="/skincare"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90"
              >
                View All Skincare
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- STORIES SECTION (Carousel Style) --- */}
      <div className="py-8 sm:py-12 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Carousel Container */}
            <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth" ref={categoryScrollRef}>
              {/* Story Card 1 - Discover Our Stores */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-cta/10 to-background shadow-lg">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src={stories[0]?.image || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop'} 
                      alt="Discover" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text mb-2" style={{ fontFamily: 'sans-serif' }}>
                      Discover Our Stores
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mb-4">Check out what's trending now.</p>
                  </div>
                </div>
              </div>

              {/* Story Card 2 - The Beauty Clearance Sale */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text mb-3 sm:mb-4" style={{ fontFamily: 'sans-serif' }}>
                        THE BEAUTY CLEARANCE SALE
                      </h3>
                      <div className="inline-flex items-center gap-2 bg-cta text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                        <span className="text-xs sm:text-sm font-bold">UP TO 60% OFF</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-primary/80 hover:bg-primary text-text px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors">
                    Stock up now!
                  </button>
                </div>
              </div>

              {/* Story Card 3 - Fragrance Collective */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background shadow-lg border border-primary/10">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2" style={{ fontFamily: 'serif' }}>
                        Fragrance
                      </h3>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text uppercase tracking-wider" style={{ fontFamily: 'serif' }}>
                        COLLECTIVE
                      </h3>
                    </div>
                  </div>
                  <button className="bg-background hover:bg-primary/10 text-text px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors border border-primary/20">
                    Meet Your Scent Soulmate
                  </button>
                </div>
              </div>

              {/* Story Card 4 - The Ingredient Store */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/25 to-primary/5 shadow-lg">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text mb-1" style={{ fontFamily: 'sans-serif' }}>
                        THE <span className="text-2xl sm:text-3xl lg:text-4xl text-cta">INGREDIENT</span> STORE
                      </h3>
                    </div>
                  </div>
                  <button className="bg-primary/80 hover:bg-primary text-text px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors">
                    Find Your Ideal Match
                  </button>
                </div>
              </div>

              {/* Story Card 5 - The Ultimate Bridal Beauty Store */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-cta/5 to-background shadow-lg border border-cta/10">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-cta mb-1" style={{ fontFamily: 'serif' }}>
                        THE ULTIMATE
                      </h3>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cta mb-1" style={{ fontFamily: 'serif' }}>
                        Bridal Beauty
                      </h3>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-cta mb-2" style={{ fontFamily: 'serif' }}>
                        STORE
                      </h3>
                      <div className="flex justify-center gap-2">
                        <span className="text-cta">◆</span>
                        <span className="text-cta">◆</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-cta/20 hover:bg-cta/30 text-text px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors">
                    Get Shaadi Ready
                  </button>
                </div>
              </div>

              {/* Story Card 6 - The Travel Beauty Store */}
              <div className="flex-shrink-0 w-56 sm:w-64 lg:w-80 rounded-2xl overflow-hidden bg-white shadow-lg border border-primary/10">
                <div className="relative h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cta mb-2" style={{ fontFamily: 'sans-serif' }}>
                        THE Travel Beauty STORE
                      </h3>
                      <div className="flex justify-center gap-1 mb-4">
                        <div className="w-6 sm:w-8 h-1 bg-cta rounded-full"></div>
                        <div className="w-6 sm:w-8 h-1 bg-cta rounded-full"></div>
                        <div className="w-6 sm:w-8 h-1 bg-cta rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <button className="bg-cta/20 hover:bg-cta/30 text-text px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors">
                    Glow On The Go
                  </button>
                </div>
              </div>
            </div>

            {/* Scroll Arrow - Right */}
            <button
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg z-10"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      

      {/* --- THREE SECTION BANNER (Skincare Legends, Hot Sellers, Greatest Combos) --- */}
      <section className="py-8 sm:py-12 bg-[#fefcfb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Section: SKINCARE LEGENDS */}
            <div className="relative bg-gradient-to-b from-[#d4c5b8] to-[#c4b5a8] border-2 border-[#120e0f] p-6 sm:p-8 min-h-[500px] sm:min-h-[600px] flex flex-col">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" style={{ color: '#120e0f' }}>
                Introducing the SKINCARE LEGENDS!
              </h2>
              
              {/* Category Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                <Link to="/skincare?category=serum" className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors text-center">
                  Skin Brightening Star
                </Link>
                <Link to="/skincare?category=serum" className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors text-center">
                  De-tan Professional
                </Link>
                <Link to="/skincare?category=serum" className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors text-center">
                  Pigmentation Specialist
                </Link>
                <Link to="/skincare?category=serum" className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors text-center">
                  Acne Fighter
                </Link>
              </div>
              
              {/* Moisturizer Section */}
              <div className="mb-4 sm:mb-6">
                <Link 
                  to="/skincare?category=moisturizer"
                  className="block w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base font-bold border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors text-center"
                >
                  Moisturizer - Skincare
                </Link>
              </div>
              
              {/* Skincare Products */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="text-center w-full">
                  <p className="text-sm sm:text-base text-[#120e0f]/70 mb-4">Premium Skincare Serums</p>
                  <div className="grid grid-cols-2 gap-3">
                    {skincareProducts.slice(0, 4).map((product, idx) => {
                      const imageUrl = product.image || product.imageUrl || product.images?.[0];
                      return (
                        <Link
                          key={product._id || product.id || idx}
                          to={`/skincare/${product._id || product.id}`}
                          className="w-full h-20 sm:h-24 bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden flex items-center justify-center hover:border-[#bb3435] transition-colors"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name || product.productName}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] text-[#120e0f] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                            {product.name || product.productName || 'Product'}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/skincare"
                className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold text-center border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
              >
                NEW LAUNCH
              </Link>
            </div>

            {/* Middle Section: HOT SELLERS */}
            <div className="relative bg-[#e8e8e8] border-2 border-[#120e0f] p-6 sm:p-8 min-h-[500px] sm:min-h-[600px] flex flex-col">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#120e0f' }}>
                HOT SELLERS
              </h2>
              <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: '#120e0f' }}>
                High In Demand Secure Yours Now!
              </p>
              
              {/* Hot Sellers Skincare Products */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="text-center w-full">
                  <p className="text-sm sm:text-base text-[#120e0f]/70 mb-4">Best Selling Products</p>
                  <div className="grid grid-cols-2 gap-3">
                    {skincareProducts.slice(4, 9).map((product, idx) => {
                      const imageUrl = product.image || product.imageUrl || product.images?.[0];
                      return (
                        <Link
                          key={product._id || product.id || idx}
                          to={`/skincare/${product._id || product.id}`}
                          className="w-full h-20 sm:h-24 bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden flex items-center justify-center hover:border-[#bb3435] transition-colors"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name || product.productName}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] text-[#120e0f] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                            {product.name || product.productName || 'Product'}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/sale"
                className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold text-center border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
              >
                Hot Sellers
              </Link>
            </div>

            {/* Right Section: Greatest Combos */}
            <div className="relative bg-gradient-to-b from-[#d4c5b8] to-[#c4b5a8] border-2 border-[#120e0f] p-6 sm:p-8 min-h-[500px] sm:min-h-[600px] flex flex-col">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute -left-2 -top-2 bg-[#bb3435] border-2 border-[#120e0f] px-3 sm:px-4 py-2 sm:py-2.5 transform rotate-[-12deg] z-10">
                  <span className="text-xs sm:text-sm font-bold text-[#fefcfb]">UP TO 60% OFF</span>
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#120e0f' }}>
                Grab your Biggest Savings with our Greatest Combos!
              </h2>
              
              {/* Combo Skincare Products */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="text-center w-full">
                  <p className="text-sm sm:text-base text-[#120e0f]/70 mb-4">Combo Products</p>
                  <div className="grid grid-cols-2 gap-3">
                    {skincareProducts.slice(0, 8).map((product, idx) => {
                      const imageUrl = product.image || product.imageUrl || product.images?.[0];
                      return (
                        <Link
                          key={product._id || product.id || idx}
                          to={`/skincare/${product._id || product.id}`}
                          className="w-full h-16 sm:h-20 bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden flex items-center justify-center hover:border-[#bb3435] transition-colors"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name || product.productName}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] text-[#120e0f] p-1" style={{ display: imageUrl ? 'none' : 'flex' }}>
                            {product.name || product.productName || 'Product'}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/sale"
                className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold text-center border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
              >
                Combos
              </Link>
            </div>
          </div>
        </div>
      </section>

    


      
      {/* <div className="w-fit m-0 p-0 leading-none overflow-visible h-auto w-auto hidden lg:block">
        <img
          src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765186240/d347cf32-1980-4355-9ac5-9168cf727263.png"
          alt="Full size"
          className="block w-auto h-auto m-0 p-0 border-none outline-none"
        />
      </div> */}



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

      {/* 3. Women - Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-1 gap-4 lg:gap-12">
          <div className="bg-pink-50 p-4 sm:p-6 border border-pink-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-pink-600">For Her</h2>
              <Link to="/women" className="text-xs sm:text-sm font-semibold text-pink-600 hover:text-pink-800 transition">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {isLoading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) : womenItems.slice(0, 3).map(p => (
                <div key={p._id} className="transform scale-90 sm:scale-100">
                  <ProductCard product={p} />
            </div>
              ))}
          </div>
            {/* Content under the images */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm mb-4" style={{ color: '#120e0f', opacity: 0.8 }}>
                Discover our curated collection of women's fashion, designed to elevate your style
              </p>
              <Link
                to="/women"
                className="inline-block px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors border"
                style={{ backgroundColor: '#bb3435', color: '#fefcfb', borderColor: '#bb3435' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#120e0f';
                  e.target.style.borderColor = '#120e0f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#bb3435';
                  e.target.style.borderColor = '#bb3435';
                }}
              >
                Shop Women's Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-6 sm:mb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Featured Collections</h2>
          <p className="text-sm sm:text-base text-gray-500">Essential styles for her.</p>
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