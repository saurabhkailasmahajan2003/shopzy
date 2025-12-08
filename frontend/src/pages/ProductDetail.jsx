import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { handleImageError } from '../utils/imageFallback';

// --- ICONS ---
const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const StarIcon = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  // 1. Get Params
  const { id, category } = useParams();
  
  // 2. Hooks
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  // 3. State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // UI State
  const [openSection, setOpenSection] = useState('description'); 
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchProduct();
  }, [id, category]);

  // --- FETCH FUNCTION ---
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const validCategories = ['men', 'women', 'watches', 'lens', 'accessories'];
      
      const categoryMap = {
        'watches': 'watches', 'watch': 'watches',
        'lens': 'lens', 'lenses': 'lens',
        'accessories': 'accessories',
        'men': 'men', 'mens': 'men',
        'women': 'women', 'womens': 'women',
        'fashion': 'men',
      };

      let foundData = null;

      if (category && category !== 'undefined') {
        const apiCategory = categoryMap[category] || category;
        try {
          const res = await fetch(`${API_BASE_URL}/products/${apiCategory}/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) foundData = data;
          }
        } catch (err) {
          console.warn("Direct category fetch failed, trying fallback...");
        }
      }

      if (!foundData) {
        for (const cat of validCategories) {
          try {
            const res = await fetch(`${API_BASE_URL}/products/${cat}/${id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                foundData = data;
                break; 
              }
            }
          } catch (e) {
            // continue
          }
        }
      }

      if (foundData) {
        setProduct(foundData.data.product);
        if (foundData.data.product.sizes?.length > 0) setSelectedSize(foundData.data.product.sizes[0]);
        if (foundData.data.product.colors?.length > 0) setSelectedColor(foundData.data.product.colors[0]);
      } else {
        throw new Error('Product not found in any category');
      }

    } catch (error) {
      console.error('Final Error fetching product:', error);
      setProduct(null); 
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleAddToCart = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
    } catch (error) {
      if (error.message.includes('login')) setShowLoginModal(true);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    try {
      if (isInWishlist(product._id || product.id)) {
        await removeFromWishlist(product._id || product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      if (error.message.includes('login')) setShowLoginModal(true);
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setSelectedImageIndex(index);
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return <LoadingState />;
  if (!product) return <NotFoundState />;

  const productImages = product.images || [product.image || product.thumbnail];
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  const discount = product.discountPercent || (originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
  const isWishlisted = isInWishlist(product._id || product.id);

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div className="min-h-screen bg-white pb-10">
        
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <nav className="hidden sm:flex text-sm text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/${product.category || 'shop'}`} className="hover:text-black transition-colors capitalize">{product.category || 'Shop'}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
          </nav>
        </div>

        <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
            
            {/* LEFT COLUMN: Image Gallery */}
            <div className="product-gallery flex flex-col gap-4 select-none">
              
              {/* Desktop: Main Image */}
              <div className="hidden lg:block relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in group">
                <img 
                  src={productImages[selectedImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => handleImageError(e, 800, 1000)}
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Desktop: Thumbnails */}
              <div className="hidden lg:grid grid-cols-5 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex ? 'border-black opacity-100 ring-1 ring-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => handleImageError(e, 100, 100)} />
                  </button>
                ))}
              </div>

              {/* Mobile: Horizontal Snap Scroll Carousel */}
              <div className="lg:hidden relative w-full bg-gray-100 aspect-[3/4]">
                 <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
                 >
                    {productImages.map((img, idx) => (
                      <div key={idx} className="min-w-full h-full snap-center relative">
                        <img src={img} className="w-full h-full object-cover" onError={(e) => handleImageError(e, 600, 800)} />
                      </div>
                    ))}
                 </div>
                 {/* Mobile Dots */}
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {productImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === selectedImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} 
                      />
                    ))}
                 </div>
                 {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Product Info (Sticky on Desktop) */}
            <div className="product-info mt-6 px-4 sm:mt-0 sm:px-0 lg:sticky lg:top-24 h-fit">
              
              {/* Header Info */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">{product.brand}</h2>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
                  </div>
                  {/* Desktop Wishlist Button */}
                  <button 
                    onClick={handleWishlistToggle}
                    className="hidden lg:flex p-3 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.floor(product.rating || 0)} />)}
                  </div>
                  <span className="text-sm text-gray-500">({product.reviewsCount || 42} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString()}</span>
                  {originalPrice > finalPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Selectors */}
              <div className="space-y-6 mb-8">
                {/* Color Selector */}
                {(product.colors?.length > 0 || product.color) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Color: <span className="text-gray-500 font-normal">{selectedColor || product.color}</span></h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors ? product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedColor === color ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-1' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <span className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color }} />
                        </button>
                      )) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full bg-gray-50 text-sm">
                           <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: product.color || '#000' }} />
                           {product.color}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                      <button className="text-xs text-blue-600 underline">Size Guide</button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                            selectedSize === size
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-gray-200 text-gray-900 hover:border-gray-900'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Actions (Hidden on Mobile) */}
              <div className="hidden lg:flex gap-4 mb-8 z-50">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white text-lg font-semibold py-4 rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => { handleAddToCart(); navigate('/cart'); }}
                  className="flex-1 bg-white text-black border-2 border-black text-lg font-semibold py-4 rounded-full hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Buy Now
                </button>
              </div>

              {/* Accordions for Details */}
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {/* Description */}
                <div className="py-4">
                  <button 
                    onClick={() => toggleSection('description')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="text-base font-medium text-gray-900">Description</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'description' ? 'rotate-180' : ''}`} />
                  </button>
                  {openSection === 'description' && (
                    <div className="pt-4 text-sm text-gray-600 leading-relaxed animate-fadeIn">
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className="py-4">
                  <button 
                    onClick={() => toggleSection('specs')}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="text-base font-medium text-gray-900">Product Details</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'specs' ? 'rotate-180' : ''}`} />
                  </button>
                  {openSection === 'specs' && (
                    <div className="pt-4 grid grid-cols-1 gap-y-2 text-sm text-gray-600 animate-fadeIn">
                      <div className="grid grid-cols-3"><span className="font-medium text-gray-900">Brand</span> <span className="col-span-2">{product.brand}</span></div>
                      {product.productDetails?.fabric && <div className="grid grid-cols-3"><span className="font-medium text-gray-900">Material</span> <span className="col-span-2">{product.productDetails.fabric}</span></div>}
                      {product.productDetails?.fit && <div className="grid grid-cols-3"><span className="font-medium text-gray-900">Fit</span> <span className="col-span-2">{product.productDetails.fit}</span></div>}
                    </div>
                  )}
                </div>
                
                {/* Delivery */}
                <div className="py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Free delivery on orders over ₹499</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>30 Days Easy Returns</span>
                  </div>
                </div>

                {/* --- NEW STICKY MOBILE BUTTONS --- */}
                {/* Positioned inside product-info so 'sticky bottom-0' works relative to this section */}
                {/* -mx-4 to span full width despite parent padding */}
                <div className="lg:hidden sticky bottom-0 z-50 bg-white border-t border-gray-100 p-4 -mx-4 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-3">
                    <button 
                      onClick={handleWishlistToggle}
                      className={`p-3 rounded-lg border border-gray-300 flex items-center justify-center transition-colors ${isWishlisted ? 'bg-red-50 border-red-200' : 'bg-white'}`}
                    >
                      <svg className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-black text-white font-bold text-base py-3 rounded-lg shadow-md active:bg-gray-900 active:scale-[0.98] transition-all"
                    >
                      Add to Cart • ₹{finalPrice.toLocaleString()}
                    </button>
                  </div>
                </div>
                {/* --- END STICKY MOBILE BUTTONS --- */}

              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// --- LOADING & ERROR STATES ---

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading details...</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
    <p className="text-gray-500 mb-6">The product you are looking for doesn't exist or has been removed.</p>
    <Link to="/" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
      Back to Home
    </Link>
  </div>
);

export default ProductDetail;