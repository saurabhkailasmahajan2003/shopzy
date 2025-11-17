import { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load wishlist from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        setWishlist(response.data.wishlist.products || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await wishlistAPI.addToWishlist(product);
      if (response.success) {
        setWishlist(response.data.wishlist.products || []);
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(response.data.wishlist.products || []);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        isLoading,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

