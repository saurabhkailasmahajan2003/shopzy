import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { handleImageError } from '../utils/imageFallback';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCart();
  const navigate = useNavigate();
  
  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1000;
  const freebieThreshold = 3; // Products needed for freebie
  const productsForFreebie = freebieThreshold - cart.length;
  const progress = Math.min((cart.length / freebieThreshold) * 100, 100);

  // Handle Escape Key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAF8F5] z-50 shadow-2xl flex flex-col border-l-2 border-[#3D2817]/30 overflow-hidden transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#3D2817]/30 bg-[#FAF8F5]">
          <h2 className="text-lg font-bold text-[#3D2817]">
            CART ({getCartItemsCount()})
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-[#3D2817] hover:opacity-70 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Freebie Banner */}
          {productsForFreebie > 0 && productsForFreebie <= freebieThreshold && (
            <div className="bg-green-100 border-b-2 border-[#3D2817]/30 p-3">
              <p className="text-sm font-medium text-[#3D2817] text-center">
                You are {productsForFreebie} product{productsForFreebie > 1 ? 's' : ''} away from 1st freebie
              </p>
              {/* Progress Bar */}
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 h-2 bg-[#120e0f]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#120e0f] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {[1, 2, 3].map((num) => (
                  <div 
                    key={num}
                    className={`w-5 h-5 flex items-center justify-center border border-[#3D2817]/30 ${
                      num <= cart.length ? 'bg-[#120e0f]' : 'bg-[#FAF8F5]'
                    }`}
                  >
                    <svg className="w-3 h-3 text-[#fefcfb]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-[#3D2817]/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-[#3D2817]/70 mb-4">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-[#3D2817]/30 text-[#3D2817] font-medium hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                const product = item.product || item;
                // Get the cart item ID (MongoDB _id of the cart item, not the product)
                const itemId = item._id || item.id || `temp-${index}`;
                
                const productImage = product.images?.length 
                  ? product.images[0] 
                  : product.image || product.thumbnail || '';
                
                const productPrice = product.finalPrice || product.price || 0;
                const originalPrice = product.price || product.originalPrice || productPrice;
                const discount = originalPrice > productPrice 
                  ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
                  : 0;
                const productName = product.name || product.productName || 'Product';
                
                return (
                  <div key={itemId} className="border border-[#3D2817]/30 bg-[#FAF8F5] p-3">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 border border-[#3D2817]/30 overflow-hidden bg-[#FAF8F5]">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => handleImageError(e, 80, 80)}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#3D2817] truncate mb-1">
                          {productName}
                        </h3>
                        
                        {/* Pricing */}
                        <div className="flex items-center gap-2 mb-2">
                          {originalPrice > productPrice ? (
                            <>
                              <span className="text-xs text-[#3D2817]/50 line-through">
                                Rs. {originalPrice.toLocaleString()}
                              </span>
                              <span className="text-sm font-bold text-[#3D2817]">
                                Rs. {productPrice.toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <span className="text-xs font-medium text-green-600">
                                  ({discount}% OFF)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-bold text-[#3D2817]">
                              Rs. {productPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Variant & Quantity */}
                        <div className="space-y-2">
                          {/* Variant Display (if applicable) */}
                          {(item.size || item.color || product.size || product.color) && (
                            <div className="text-xs text-[#3D2817]/70">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                              {!item.size && !item.color && product.size && `Size: ${product.size}`}
                              {!item.size && !item.color && product.size && product.color && ' • '}
                              {!item.size && !item.color && product.color && `Color: ${product.color}`}
                            </div>
                          )}

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(itemId, item.quantity - 1);
                              }}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center border border-[#3D2817]/30 bg-[#FAF8F5] hover:bg-[#120e0f] hover:text-[#fefcfb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-sm font-medium text-[#3D2817] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(itemId, item.quantity + 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center border border-[#3D2817]/30 bg-[#FAF8F5] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="self-start p-1 text-[#3D2817] hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Free Shipping Banner */}
          {cart.length > 0 && (
            <div className="bg-green-100 border-t-2 border-b-2 border-[#3D2817]/30 p-3 mx-4 mb-4">
              <p className="text-sm font-medium text-[#3D2817] text-center">
                Free Shipping on all Orders
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {cart.length > 0 && (
          <div className="border-t-2 border-[#3D2817]/30 bg-[#FAF8F5] p-4 space-y-4">
            {/* Grand Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#3D2817]">GRAND TOTAL</span>
              <div className="text-right">
                {cartTotal < freeShippingThreshold ? (
                  <>
                    <span className="text-sm text-[#3D2817]/50 line-through mr-2">
                      Rs. {cartTotal.toLocaleString()}
                    </span>
                    <span className="text-base font-bold text-[#3D2817]">
                      Rs. {cartTotal.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-bold text-[#3D2817]">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                )}
                <p className="text-xs text-[#3D2817]/70 mt-0.5">(Inc. All Taxes)</p>
              </div>
            </div>

            {/* BUY NOW Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#120e0f] text-[#fefcfb] font-bold text-sm hover:bg-[#120e0f]/90 transition-colors"
            >
              BUY NOW
            </button>

            {/* Powered By */}
            <p className="text-xs text-[#3D2817]/60 text-center">
              Powered By Shiprocket
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

