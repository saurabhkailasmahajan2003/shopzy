import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../utils/api';

const LOCAL_WISHLIST_KEY = 'local_wishlist_ids';

const getLocalWishlist = () => {
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading local wishlist:', err);
    return [];
  }
};

const saveLocalWishlist = (ids) => {
  try {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Error saving local wishlist:', err);
  }
};

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        const items = response.data.wishlist || [];
        setWishlist(items);
        setWishlistIds(new Set(items.map(item => item.productId || item.product?._id || item.product?.id)));
        saveLocalWishlist(items.map(item => item.productId || item.product?._id || item.product?.id));
      }
    } catch (error) {
      // Silently fall back to local storage when API route is missing
      const localIds = getLocalWishlist();
      setWishlistIds(new Set(localIds));
      setWishlist(localIds.map(id => ({ productId: id })));
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await wishlistAPI.addToWishlist(productId);
      if (response.success) {
        setWishlistIds(prev => new Set([...prev, productId]));
        await loadWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to local storage if API is not available
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.add(productId);
        saveLocalWishlist([...next]);
        return next;
      });
      setWishlist(prev => {
        const exists = prev.some(item => (item.productId || item.product?._id || item.product?.id) === productId);
        if (exists) return prev;
        return [...prev, { productId }];
      });
      return true;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.success) {
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setWishlist(prev => prev.filter(item => 
          (item.productId || item.product?._id || item.product?.id) !== productId
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to local storage if API is not available
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        saveLocalWishlist([...next]);
        return next;
      });
      setWishlist(prev => prev.filter(item => 
        (item.productId || item.product?._id || item.product?.id) !== productId
      ));
      return true;
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistCount,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

