/**
 * Product Cache Utility
 * Stores products in localStorage and in-memory cache to avoid re-fetching
 */

const CACHE_PREFIX = 'shopzy_products_';
const CACHE_VERSION = 'v1';
const DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// In-memory cache for faster access during the same session
const memoryCache = new Map();

/**
 * Generate a cache key from endpoint and params
 */
const getCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  const paramsString = JSON.stringify(sortedParams);
  return `${CACHE_PREFIX}${CACHE_VERSION}_${endpoint}_${paramsString}`;
};

/**
 * Get cached data from localStorage
 */
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp, expiration } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (expiration && now > expiration) {
      localStorage.removeItem(key);
      memoryCache.delete(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Set data in cache (both localStorage and memory)
 */
const setCachedData = (key, data, duration = DEFAULT_CACHE_DURATION) => {
  try {
    const now = Date.now();
    const expiration = now + duration;
    const cacheData = {
      data,
      timestamp: now,
      expiration,
    };

    // Store in localStorage
    localStorage.setItem(key, JSON.stringify(cacheData));

    // Store in memory cache
    memoryCache.set(key, { data, expiration });

    return true;
  } catch (error) {
    console.error('Error writing to cache:', error);
    // If localStorage is full, try to clear old cache entries
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
      try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), expiration: Date.now() + duration }));
        memoryCache.set(key, { data, expiration: Date.now() + duration });
        return true;
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
        return false;
      }
    }
    return false;
  }
};

/**
 * Clear old cache entries to free up space
 */
const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { expiration } = JSON.parse(cached);
            if (expiration && now > expiration) {
              localStorage.removeItem(key);
              memoryCache.delete(key);
              cleared++;
            }
          }
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          memoryCache.delete(key);
          cleared++;
        }
      }
    });

    console.log(`Cleared ${cleared} expired cache entries`);
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

/**
 * Check memory cache first, then localStorage
 */
const getFromCache = (key) => {
  // Check memory cache first (faster)
  const memoryData = memoryCache.get(key);
  if (memoryData) {
    const now = Date.now();
    if (memoryData.expiration && now > memoryData.expiration) {
      memoryCache.delete(key);
      localStorage.removeItem(key);
      return null;
    }
    return memoryData.data;
  }

  // Fallback to localStorage
  return getCachedData(key);
};

/**
 * Cache a product API response
 */
export const cacheProductResponse = (endpoint, params, response, duration = DEFAULT_CACHE_DURATION) => {
  const key = getCacheKey(endpoint, params);
  setCachedData(key, response, duration);
  return response;
};

/**
 * Get cached product API response
 */
export const getCachedProductResponse = (endpoint, params) => {
  const key = getCacheKey(endpoint, params);
  return getFromCache(key);
};

/**
 * Clear all product cache
 */
export const clearProductCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    memoryCache.clear();
    console.log('Product cache cleared');
  } catch (error) {
    console.error('Error clearing product cache:', error);
  }
};

/**
 * Clear cache for a specific endpoint
 */
export const clearCacheForEndpoint = (endpoint) => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes(endpoint)) {
        localStorage.removeItem(key);
        memoryCache.delete(key);
      }
    });
    console.log(`Cache cleared for endpoint: ${endpoint}`);
  } catch (error) {
    console.error('Error clearing cache for endpoint:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    let totalSize = 0;

    cacheKeys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          totalSize += cached.length;
          const { expiration } = JSON.parse(cached);
          if (expiration && now > expiration) {
            expired++;
          } else {
            valid++;
          }
        }
      } catch (e) {
        expired++;
      }
    });

    return {
      total: cacheKeys.length,
      valid,
      expired,
      memoryCacheSize: memoryCache.size,
      estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { total: 0, valid: 0, expired: 0, memoryCacheSize: 0, estimatedSize: '0 KB' };
  }
};

// Clean up expired cache on load
if (typeof window !== 'undefined') {
  clearOldCache();
}

