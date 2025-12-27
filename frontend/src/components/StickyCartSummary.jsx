import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const StickyCartSummary = () => {
  const { cart, getCartTotal, getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldStick, setShouldStick] = useState(true);
  const containerRef = useRef(null);

  const cartTotal = getCartTotal();
  const cartCount = getCartItemsCount();
  const freeShippingThreshold = 1000;
  const freebieThreshold = 3;
  const itemsNeeded = Math.max(0, freebieThreshold - cart.length);
  
  // Calculate savings (if there are discounted items)
  const originalTotal = cart.reduce((total, item) => {
    const product = item.product || item;
    const originalPrice = product.price || product.originalPrice || 0;
    const finalPrice = product.finalPrice || product.price || 0;
    return total + (originalPrice * item.quantity);
  }, 0);
  const savings = originalTotal > cartTotal ? originalTotal - cartTotal : 0;

  // Check if we should show the sticky bar
  useEffect(() => {
    if (cartCount === 0) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
  }, [cartCount]);

  // Handle sticky positioning - stick at bottom until footer appears
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const footer = document.querySelector('footer');
      
      if (!footer) {
        setShouldStick(true);
        return;
      }

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = containerRect.height;

      // Calculate distance from bottom of viewport to top of footer
      const distanceToFooter = footerRect.top - windowHeight;

      // If footer is visible or close to being visible (within container height + padding), don't stick
      if (distanceToFooter < containerHeight + 20) {
        setShouldStick(false);
      } else {
        setShouldStick(true);
      }
    };

    // Use requestAnimationFrame for smoother performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!isVisible || cartCount === 0) return null;

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <>
      {/* Sticky Cart Summary - Fixed at bottom until footer */}
      <div
        ref={containerRef}
        className={`bg-[#FAF8F5] border-t-2 border-[#3D2817]/30 transition-all duration-300 luxury-shadow-sm ${
          shouldStick ? 'fixed bottom-0 right-0 z-20 ml-auto' : 'relative'
        }`}
        style={{ 
          width: shouldStick ? '75%' : '100%',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex items-center justify-between gap-4">
            
            {/* Left: Close Button & Subtotal */}
            <div className="flex items-center gap-4 flex-1">
              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="w-8 h-8 flex items-center justify-center border border-[#3D2817]/30 bg-[#FAF8F5] hover:bg-[#3D2817] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              {/* Subtotal & Savings */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#3D2817]">Subtotal</span>
                {savings > 0 && (
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-1">
                    Save: ₹{savings.toLocaleString()}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {originalTotal > cartTotal && (
                    <span className="text-sm text-[#3D2817]/50 line-through">
                      ₹{originalTotal.toLocaleString()}
                    </span>
                  )}
                  <span className="text-base font-bold text-[#3D2817]">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Product Display Placeholders */}
            <div className="hidden md:flex items-center gap-2">
              {cart.slice(0, 3).map((item, idx) => {
                const product = item.product || item;
                const imageUrl = product.images?.[0] || product.image || product.thumbnail;
                return (
                  <div
                    key={item._id || item.id || idx}
                    className="w-12 h-12 border border-[#3D2817]/30 bg-[#FAF8F5] overflow-hidden flex items-center justify-center"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name || product.productName}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#3D2817]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Empty placeholders for remaining items */}
              {Array.from({ length: Math.max(0, 3 - Math.min(cart.length, 3)) }).map((_, idx) => (
                <div
                  key={`placeholder-${idx}`}
                  className="w-12 h-12 border border-[#3D2817]/30 bg-[#FAF8F5] flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-[#3D2817]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              ))}
            </div>

              {/* Right: Add More Items Button */}
              <div className="flex-shrink-0">
                {itemsNeeded > 0 ? (
                  <button
                    onClick={handleViewCart}
                    className="px-4 py-2 border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] font-medium text-sm hover:bg-[#3D2817] hover:text-white transition-colors whitespace-nowrap"
                  >
                    Add {itemsNeeded} More Item{itemsNeeded > 1 ? '(s)' : ''}
                  </button>
                ) : (
                  <button
                    onClick={handleViewCart}
                    className="px-4 py-2 border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] font-medium text-sm hover:bg-[#3D2817] hover:text-white transition-colors whitespace-nowrap"
                  >
                    View Cart ({cartCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyCartSummary;

