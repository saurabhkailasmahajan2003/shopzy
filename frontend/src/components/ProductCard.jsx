import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import LoginModal from './LoginModal';
import { handleImageError } from '../utils/imageFallback';
import { formatPrice } from '../utils/formatUtils';
import { optimizeImageUrl } from '../utils/imageOptimizer';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoverImageLoaded, setHoverImageLoaded] = useState(false);

  // Data Normalization
  // Handle images - support both array and object formats
  let productImages = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      productImages = product.images.filter(img => img && img.trim() !== '');
    } else if (typeof product.images === 'object') {
      // Convert object format {image1: "url", image2: "url"} to array
      productImages = Object.values(product.images).filter(img => img && typeof img === 'string' && img.trim() !== '');
    }
  }
  
  // Fallback to image or thumbnail if images array is empty
  if (productImages.length === 0) {
    const fallbackImage = product.image || product.thumbnail || product.images?.image1;
    if (fallbackImage) {
      productImages = [fallbackImage];
    }
  }
  
  const isWatch = (product.category || '').toLowerCase().includes('watch');
  const isLens = (product.category || '').toLowerCase().includes('lens');
  const isSkincare = (product.category || '').toLowerCase().includes('skincare') || (product.category || '').toLowerCase().includes('skin-care');
  const sizes = isWatch ? [] : (product.sizes || ['S', 'M', 'L', 'XL']); 
  const finalPrice = product.finalPrice || product.price || product.mrp || 0;
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const discountPercent = hasDiscount && originalPrice > 0 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
    : 0;
  const productId = product._id || product.id;
  
  // Determine category for URL
  const getCategoryForUrl = () => {
    const category = (product.category || '').toLowerCase();
    if (category.includes('watch')) return 'watches';
    if (category.includes('lens')) return 'lenses';
    if (category.includes('skincare') || category.includes('skin-care')) return 'skincare';
    if (category.includes('accessor')) return 'accessories';
    if (category.includes('women') || category.includes('saree')) return 'women';
    if (category.includes('shoe')) return 'shoes';
    return 'product'; // fallback
  };
  const productCategory = getCategoryForUrl();
  
  // Get reviews count and availability
  const reviewsCount = product.reviewsCount || product.reviewCount || product.numReviews || 0;
  const isBestseller = product.isBestseller || product.bestseller || false;
  const isSoldOut = product.stock === 0 || product.quantity === 0 || product.inStock === false;
  const soldCount = product.soldCount || product.totalSold || 0;
  
  // Description snippet
  const description = product.description || product.shortDescription || product.longDescription || '';
  const descriptionSnippet = description.length > 60 ? description.substring(0, 60) + '...' : description;
  
  // Get the image source with fallback
  // For lenses, use the 2nd image (index 1) as default if available
  let defaultImageIndex = 0;
  if (isLens && productImages.length > 1) {
    defaultImageIndex = 1; // Use 2nd image (image2) for lenses
  }
  
  // Determine which images to show
  let defaultImageSrc = 'https://via.placeholder.com/400x500?text=No+Image';
  let hoverImageSrc = null;
  
  if (productImages.length > 0) {
    defaultImageSrc = productImages[defaultImageIndex];
    // Get hover image (next image if available)
    const hoverIndex = defaultImageIndex + 1;
    if (productImages.length > hoverIndex) {
      hoverImageSrc = productImages[hoverIndex];
    } else if (productImages.length > 0 && defaultImageIndex > 0) {
      // If no next image, try the first image as hover
      hoverImageSrc = productImages[0];
    }
  }

  const handleAddClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If product has sizes, use first available size or empty string
    const selectedSize = sizes.length > 0 ? sizes[0] : '';
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    setIsAdding(true);
    try {
      console.log('ProductCard: Adding product to cart', {
        productId: product._id || product.id,
        productName: product.name || product.productName,
        selectedSize
      });
      await addToCart(product, 1, selectedSize, '');
      success('Product added to cart');
      setIsAdding(false);
      setShowSizes(false);
    } catch (err) {
      setIsAdding(false);
      setShowSizes(false);
      console.error('ProductCard: Error adding to cart:', err);
      const errorMessage = err.message || 'Failed to add product to cart';
      showError(errorMessage);
      if (errorMessage.toLowerCase().includes('login')) {
        setShowLoginModal(true);
      }
    }
  };


  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div 
        className="group relative w-full select-none" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (window.matchMedia('(min-width: 768px)').matches) {
            setShowSizes(false);
          }
        }}
      >
        <Link to={`/product/${productCategory}/${productId}`} className="block bg-[#FAF8F5] border border-[#3D2817]/30 p-2 sm:p-3 md:p-4 luxury-shadow rounded transition-shadow">
          
          {/* IMAGE AREA */}
          <div className="relative w-full aspect-square overflow-hidden bg-white mb-2 sm:mb-3 md:mb-4 border border-[#3D2817]/20 rounded">
            
            {/* Bestseller Badge - Yellow with black border */}
            {isBestseller && (
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 bg-[#D4AF37] text-[#3D2817] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 border border-[#3D2817]/30 rounded uppercase tracking-wide">
                Bestseller
              </span>
            )}

            {/* Discount Tag (if not bestseller) */}
            {!isBestseller && hasDiscount && (
               <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 bg-white text-[#3D2817] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 border border-[#3D2817]/30 rounded uppercase tracking-wide">
                 Sale
               </span>
            )}

            {/* Add to Cart Button - Top Right Corner */}
            <button
              type="button"
              onClick={handleAddClick}
              disabled={isAdding || isSoldOut}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded luxury-shadow"
              title="Add to cart"
              aria-label="Add to cart"
            >
              {isAdding ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>

            {/* Base Image - Square, centered */}
            {defaultImageSrc && (
              <img
                src={defaultImageSrc}
                alt={product.name || product.title || 'Product'}
                onLoad={() => setImageLoaded(true)}
                decoding="async"
                loading="lazy"
                className={`
                  w-full h-full object-contain transition-opacity duration-300
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onError={handleImageError}
              />
            )}

            {/* Hover Image - Simple fade transition */}
            {hoverImageSrc && (
              <>
                {/* Preload hover image */}
                <img
                  src={hoverImageSrc}
                  alt=""
                  className="hidden"
                  onLoad={() => setHoverImageLoaded(true)}
                  decoding="async"
                />
                {/* Hover cover image */}
                <img
                  src={hoverImageSrc}
                  alt={product.name || product.title || 'Product'}
                  className={`
                    absolute inset-0 w-full h-full object-contain transition-opacity duration-300
                    ${isHovered && hoverImageLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                  `}
                  onError={handleImageError}
                />
              </>
            )}

          </div>

          {/* PRODUCT DETAILS */}
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
            {/* Product Name - Bold, uppercase, minimal */}
            <h3 className="text-xs sm:text-sm font-bold text-[#3D2817] leading-tight line-clamp-2 uppercase tracking-tight">
              {(product.name || product.productName || 'Product').toUpperCase()}
            </h3>

            {/* Reviews and Availability - Orange for sales info */}
            {!isSkincare && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#3D2817]">
                {reviewsCount > 0 && (
                  <span className="font-medium">{reviewsCount.toLocaleString()} Reviews</span>
                )}
                {reviewsCount > 0 && (isSoldOut || soldCount > 0) && (
                  <span className="text-[#3D2817]/40">|</span>
                )}
                {isSoldOut ? (
                  <span className="text-orange-600 font-semibold">
                    {soldCount >= 10000 ? `${(soldCount / 1000).toFixed(0)}L+ ` : soldCount > 0 ? `${(soldCount / 1000).toFixed(1)}L+ ` : ''}Sold Out!!
                  </span>
                ) : soldCount > 0 && (
                  <span className="text-orange-600 font-semibold">
                    {soldCount >= 10000 ? `${(soldCount / 1000).toFixed(0)}L+ ` : `${soldCount.toLocaleString()} `}Sold
                  </span>
                )}
              </div>
            )}
            {isSkincare && reviewsCount > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#3D2817]">
                <span className="font-medium">{reviewsCount.toLocaleString()} Reviews</span>
              </div>
            )}

            {/* Description Snippet - Muted black/gray */}
            {descriptionSnippet && (
              <p className="text-[10px] sm:text-xs text-[#3D2817]/60 line-clamp-2 leading-relaxed">
                {descriptionSnippet}
              </p>
            )}

            {/* Divider Line - Thin black line */}
            <div className="border-t border-[#3D2817]/30"></div>

            {/* Pricing Section - Minimal, clean */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
              {hasDiscount && originalPrice > 0 && (
                <span className="text-[10px] sm:text-xs text-[#3D2817]/50 line-through">
                  Rs. {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-sm sm:text-base font-bold text-[#3D2817]">
                Rs. {formatPrice(finalPrice)}
              </span>
              {hasDiscount && discountPercent > 0 && (
                <span className="text-[10px] sm:text-xs text-green-600 font-semibold">
                  ({discountPercent}% off)
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

// PERFORMANCE FIX: 
// Only re-render if the product ID changes. 
// This prevents the "stutter" when infinite scroll adds new items.
export default memo(ProductCard, (prev, next) => {
  return (prev.product._id || prev.product.id) === (next.product._id || next.product.id);
});