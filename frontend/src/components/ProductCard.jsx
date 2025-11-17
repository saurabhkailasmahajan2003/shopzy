import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { handleImageError } from '../utils/imageFallback';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get product images (use images array if available, otherwise use single image)
  const productImages = product.images || [product.image || product.thumbnail];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product.colors || ['#000000', '#3B82F6', '#EF4444'];
  const brand = product.brand || product.vendor || 'Brand';
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  const discount = originalPrice > finalPrice 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
    : (product.discountPercent || 0);

  // Auto-cycle through images on hover
  useEffect(() => {
    if (isHovered && productImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, productImages.length]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      await addToCart(product);
    } catch (error) {
      if (error.message.includes('login')) {
        setShowLoginModal(true);
      }
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const productId = product._id || product.id;
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      if (error.message.includes('login')) {
        setShowLoginModal(true);
      }
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
        navigator.share({
          title: product.name,
          text: `Check out ${product.name} - ₹${finalPrice}`,
          url: window.location.origin + `/product/${product._id || product.id}`,
        }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/product/${product._id || product.id}`);
    }
  };

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <Link 
        to={product.category 
          ? `/product/${product.category}/${product._id || product.id}` 
          : `/product/${product._id || product.id}`} 
        className="block"
      >
      <div 
        className="bg-white border border-gray-200 overflow-hidden w-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - 4:5 aspect ratio */}
        <div 
          className="relative bg-gray-50 aspect-[4/5] w-full"
        >
          <div className="relative w-full h-full overflow-hidden">
            {productImages.length > 1 ? (
              productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - View ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => handleImageError(e, 400, 400)}
                />
              ))
            ) : (
              <img
                src={productImages[0] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, 400, 400)}
              />
            )}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 z-20 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-110"
            title={isInWishlist(product._id || product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist(product._id || product.id) ? (
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600 hover:text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>

          {/* Image Indicators (only show if multiple images) */}
          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {productImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'w-4 bg-white'
                      : 'w-1 bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content - All details visible */}
        <div 
          className={`p-3 flex flex-col flex-1 min-h-0 transition-transform duration-300 ${
            isHovered ? '-translate-y-1' : ''
          }`}
        >
          {/* Brand Name and Category */}
          <div className="flex items-center gap-2 mb-1 flex-shrink-0">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {brand}
            </div>
            {product.category && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 capitalize">
                  {product.category}
                </span>
              </>
            )}
          </div>

          {/* Product Name - Full text visible */}
          <h3 className="text-sm font-medium text-gray-900 mb-1 flex-shrink-0">
            {product.name}
          </h3>

          {/* Rating and Reviews */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2 flex-shrink-0">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700 ml-0.5">{product.rating}</span>
              </div>
              {product.reviews && (
                <span className="text-xs text-gray-500">({product.reviews})</span>
              )}
            </div>
          )}

          {/* Price - Always visible */}
          <div className="mb-2 flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-gray-900">
                ₹{finalPrice.toLocaleString()}
              </span>
              {originalPrice > finalPrice && (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
};

export default ProductCard;
