import { getCachedProductResponse, cacheProductResponse } from './productCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('API Request:', `${API_BASE_URL}${endpoint}`, {
      method: config.method || 'GET',
      hasToken: !!token,
      body: config.body ? JSON.parse(config.body) : null
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response from server');
    }

    console.log('API Response:', {
      status: response.status,
      success: data.success,
      message: data.message
    });

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Server error: ${response.status}`;
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  sendOTP: async (phoneNumber) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  verifyOTP: async (phoneNumber, otp, name = null, email = null) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp, name, email }),
    });
  },
};

// Cart API calls
export const cartAPI = {
  getCart: async () => {
    return apiRequest('/cart');
  },

  addToCart: async (product, quantity = 1, size = '', color = '') => {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product, quantity, size, color }),
    });
  },

  updateCartItem: async (itemId, quantity) => {
    return apiRequest(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId) => {
    return apiRequest(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Order API calls
export const orderAPI = {
  getOrders: async () => {
    return apiRequest('/orders');
  },

  getOrder: async (orderId) => {
    return apiRequest(`/orders/${orderId}`);
  },

  createOrder: async (shippingAddress, paymentMethod = 'COD') => {
    return apiRequest('/orders/create', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    });
  },
};

// Payment API calls
export const paymentAPI = {
  createRazorpayOrder: async (shippingAddress) => {
    return apiRequest('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress }),
    });
  },

  verifyPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    return apiRequest('/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });
  },
};

// Profile API calls
export const profileAPI = {
  getProfile: async () => {
    return apiRequest('/profile');
  },

  updateProfile: async (data) => {
    return apiRequest('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Product API calls with caching
export const productAPI = {
  getWatches: async (params = {}) => {
    const endpoint = '/products/watches';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached watches data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/watches${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getWatchById: async (id) => {
    const endpoint = `/products/watches/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached watch data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/watches/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  getLenses: async (params = {}) => {
    const endpoint = '/products/lens';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached lenses data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/lens${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getLensById: async (id) => {
    const endpoint = `/products/lens/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached lens data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/lens/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  getAccessories: async (params = {}) => {
    const endpoint = '/products/accessories';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached accessories data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/accessories${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getAccessoryById: async (id) => {
    const endpoint = `/products/accessories/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached accessory data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/accessories/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  getWomenItems: async (params = {}) => {
    const endpoint = '/products/women';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached women items data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/women${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getWomenItemById: async (id) => {
    const endpoint = `/products/women/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached women item data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/women/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  getSkincareProducts: async (params = {}) => {
    const endpoint = '/products/skincare';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached skincare data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/skincare${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getSkincareProductById: async (id) => {
    const endpoint = `/products/skincare/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached skincare product data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/skincare/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  getShoes: async (params = {}) => {
    const endpoint = '/products/shoes';
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, params);
    if (cached) {
      console.log('📦 Using cached shoes data');
      return cached;
    }

    // Fetch from API
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/products/shoes${queryString ? `?${queryString}` : ''}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, params, response);
    }
    
    return response;
  },

  getShoeById: async (id) => {
    const endpoint = `/products/shoes/${id}`;
    
    // Check cache first
    const cached = getCachedProductResponse(endpoint, {});
    if (cached) {
      console.log(`📦 Using cached shoe data for ID: ${id}`);
      return cached;
    }

    // Fetch from API
    const response = await apiRequest(`/products/shoes/${id}`);
    
    // Cache the response
    if (response.success) {
      cacheProductResponse(endpoint, {}, response);
    }
    
    return response;
  },

  // Helper to get all products from all categories
  getAllProducts: async (params = {}) => {
    try {
      const [watches, lenses, accessories, women, skincare, shoes] = await Promise.all([
        productAPI.getWatches(params),
        productAPI.getLenses(params),
        productAPI.getAccessories(params),
        productAPI.getWomenItems(params),
        productAPI.getSkincareProducts(params),
        productAPI.getShoes(params),
      ]);

      const allProducts = [
        ...(watches.success ? watches.data.products : []),
        ...(lenses.success ? lenses.data.products : []),
        ...(accessories.success ? accessories.data.products : []),
        ...(women.success ? women.data.products : []),
        ...(skincare.success ? skincare.data.products : []),
        ...(shoes.success ? shoes.data.products : []),
      ];

      return {
        success: true,
        data: { products: allProducts },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: { products: [] },
      };
    }
  },
};

export const adminAPI = {
  getSummary: async () => apiRequest('/admin/summary'),
  getOrders: async () => apiRequest('/admin/orders'),
  updateOrderStatus: async (orderId, status) =>
    apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: async (orderId) =>
    apiRequest(`/admin/orders/${orderId}`, { method: 'DELETE' }),
  getProducts: async (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/admin/products${query}`);
  },
  createProduct: async (payload) =>
    apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: async (id, payload) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: async (id, category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/admin/products/${id}${query}`, { method: 'DELETE' });
  },
  getUsers: async () => apiRequest('/admin/users'),
  deleteUser: async (userId) =>
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
};

// Review API calls
export const reviewAPI = {
  getReviews: async (productId, sort = 'newest', limit = 50) => {
    return apiRequest(`/reviews/${productId}?sort=${sort}&limit=${limit}`);
  },

  createReview: async (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  markHelpful: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}/helpful`, {
      method: 'PUT',
    });
  },
};

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: async () => {
    return apiRequest('/wishlist');
  },

  addToWishlist: async (productId) => {
    return apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist: async (productId) => {
    return apiRequest(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  },

  checkWishlist: async (productId) => {
    return apiRequest(`/wishlist/check/${productId}`);
  },
};

// Search API calls
export const searchAPI = {
  searchProducts: async (query, params = {}) => {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return apiRequest(`/search?${queryString}`);
  },
};

// Order Tracking API calls
export const trackingAPI = {
  trackOrder: async (orderId) => {
    return apiRequest(`/orders/track/${orderId}`);
  },
};

export default apiRequest;

