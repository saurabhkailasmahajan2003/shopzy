import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      console.log('Load cart response:', response);
      if (response.success) {
        const items = response.data?.cart?.items || [];
        console.log('Loaded cart items:', items.length);
        setCart(items);
      } else {
        console.error('Failed to load cart:', response.message);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, size = '', color = '') => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    if (!product) {
      throw new Error('Product is required');
    }

    // Ensure product has required fields
    const productId = product._id || product.id;
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      console.log('Adding to cart:', { 
        productId, 
        productName: product.name || product.productName,
        quantity, 
        size, 
        color 
      });
      
      const response = await cartAPI.addToCart(product, quantity, size, color);
      console.log('Add to cart response:', response);
      
      if (response && response.success) {
        const items = response.data?.cart?.items || [];
        console.log('Setting cart items:', items.length, 'items');
        setCart(items);
        // Reload cart to ensure sync
        await loadCart();
        return response;
      } else {
        const errorMsg = response?.message || 'Failed to add to cart';
        console.error('Add to cart failed:', errorMsg);
        // Try to reload cart anyway
        await loadCart();
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      // Reload cart to sync with backend
      await loadCart();
      const errorMessage = error.message || 'Failed to add product to cart';
      throw new Error(errorMessage);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      return;
    }

    // Ensure itemId is a string
    const itemIdString = String(itemId).replace('temp-', '');

    try {
      console.log('Removing from cart:', { itemId: itemIdString, originalItemId: itemId });
      const response = await cartAPI.removeFromCart(itemIdString);
      if (response && response.success) {
        setCart(response.data?.cart?.items || []);
      } else {
        // Reload cart to sync with backend
        await loadCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Reload cart to sync with backend
      await loadCart();
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      console.error('Cannot update quantity: User not authenticated');
      return;
    }

    if (!itemId) {
      console.error('Cannot update quantity: Item ID is missing');
      return;
    }

    // Ensure itemId is a string
    const itemIdString = String(itemId).replace('temp-', '');

    if (quantity <= 0) {
      await removeFromCart(itemIdString);
      return;
    }

    try {
      console.log('Updating quantity:', { itemId: itemIdString, quantity, originalItemId: itemId });
      const response = await cartAPI.updateCartItem(itemIdString, quantity);
      console.log('Update quantity response:', response);
      
      if (response && response.success) {
        const items = response.data?.cart?.items || [];
        console.log('Updated cart items:', items.length, 'items');
        setCart(items);
      } else {
        console.error('Failed to update quantity:', response?.message || 'Unknown error');
        // Reload cart to sync with backend
        await loadCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      // Reload cart to sync with backend
      await loadCart();
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await cartAPI.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = item.product || item;
      const price = product.finalPrice || product.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isLoading,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

