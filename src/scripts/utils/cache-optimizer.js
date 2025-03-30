/**
 * Cache Optimization Utilities
 * Provides tools for efficient content caching, both in-memory and browser-based
 */

/**
 * In-memory LRU (Least Recently Used) Cache implementation
 */
export class LRUCache {
  /**
   * Create a new LRU Cache
   * @param {number} capacity - Maximum number of items to store
   */
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
    this.expirations = new Map(); // For time-based expiration
  }
  
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Check if the item has expired
    if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
      this.delete(key);
      return undefined;
    }
    
    // Move the accessed key to the end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to store
   * @param {number} [ttl] - Time to live in milliseconds
   */
  set(key, value, ttl = null) {
    // If the cache is at capacity and this is a new key, delete the least recently used item
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      const lruKey = this.cache.keys().next().value;
      this.delete(lruKey);
    }
    
    // Add to cache
    this.cache.set(key, value);
    
    // Set expiration if ttl is provided
    if (ttl) {
      this.expirations.set(key, Date.now() + ttl);
    } else {
      this.expirations.delete(key);
    }
    
    return this;
  }
  
  /**
   * Delete an item from the cache
   * @param {string} key - Cache key to delete
   * @returns {boolean} True if the item was deleted
   */
  delete(key) {
    this.expirations.delete(key);
    return this.cache.delete(key);
  }
  
  /**
   * Check if the key exists in the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if the key exists and is not expired
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    // Check if the item has expired
    if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache.clear();
    this.expirations.clear();
  }
  
  /**
   * Get the current size of the cache
   * @returns {number} Number of items in the cache
   */
  size() {
    return this.cache.size;
  }
  
  /**
   * Get all keys in the cache (excluding expired items)
   * @returns {Array} Array of cache keys
   */
  keys() {
    // Filter out expired keys
    return [...this.cache.keys()].filter(key => {
      if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
        this.delete(key);
        return false;
      }
      return true;
    });
  }
}

// Create a shared content cache instance
export const contentCache = new LRUCache(200);
export const imageCache = new LRUCache(100);
export const dataCache = new LRUCache(50);

/**
 * Service worker cache helper - manages cache entries via the service worker
 */
export class ServiceWorkerCache {
  /**
   * Create a new service worker cache helper
   * @param {string} cacheName - Name of the cache to use
   */
  constructor(cacheName = 'sdde-cache-v1') {
    this.cacheName = cacheName;
    this.enabled = 'serviceWorker' in navigator && 'caches' in window;
  }
  
  /**
   * Check if the browser supports the Cache API
   * @returns {boolean} True if supported
   */
  isSupported() {
    return this.enabled;
  }
  
  /**
   * Store a response in the cache
   * @param {string} url - URL to use as the cache key
   * @param {Response} response - Response object to cache
   * @returns {Promise} Promise that resolves when caching is complete
   */
  async put(url, response) {
    if (!this.enabled) return Promise.resolve(false);
    
    try {
      const cache = await caches.open(this.cacheName);
      return cache.put(url, response.clone());
    } catch (error) {
      console.error('Failed to cache response:', error);
      return Promise.resolve(false);
    }
  }
  
  /**
   * Get a response from the cache
   * @param {string} url - URL to retrieve
   * @returns {Promise<Response|null>} Promise that resolves with the Response or null
   */
  async get(url) {
    if (!this.enabled) return Promise.resolve(null);
    
    try {
      const cache = await caches.open(this.cacheName);
      return cache.match(url);
    } catch (error) {
      console.error('Failed to retrieve from cache:', error);
      return Promise.resolve(null);
    }
  }
  
  /**
   * Delete an entry from the cache
   * @param {string} url - URL to delete
   * @returns {Promise<boolean>} Promise that resolves with true if deleted
   */
  async delete(url) {
    if (!this.enabled) return Promise.resolve(false);
    
    try {
      const cache = await caches.open(this.cacheName);
      return cache.delete(url);
    } catch (error) {
      console.error('Failed to delete from cache:', error);
      return Promise.resolve(false);
    }
  }
  
  /**
   * Clear the entire cache
   * @returns {Promise<boolean>} Promise that resolves with true if cleared
   */
  async clear() {
    if (!this.enabled) return Promise.resolve(false);
    
    try {
      return caches.delete(this.cacheName);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return Promise.resolve(false);
    }
  }
  
  /**
   * Prefetch a list of URLs and add them to the cache
   * @param {Array<string>} urls - URLs to prefetch
   * @returns {Promise<Array>} Promise that resolves with results
   */
  async prefetch(urls) {
    if (!this.enabled || !urls.length) return Promise.resolve([]);
    
    try {
      const cache = await caches.open(this.cacheName);
      
      const fetchPromises = urls.map(async (url) => {
        try {
          const response = await fetch(url, { credentials: 'same-origin' });
          if (response.ok) {
            await cache.put(url, response.clone());
            return { url, success: true };
          }
          return { url, success: false, error: `HTTP Error: ${response.status}` };
        } catch (error) {
          return { url, success: false, error: error.message };
        }
      });
      
      return Promise.all(fetchPromises);
    } catch (error) {
      console.error('Failed to prefetch URLs:', error);
      return Promise.resolve([]);
    }
  }
}

// Create a shared service worker cache instance
export const swCache = new ServiceWorkerCache();

/**
 * Enhanced fetch with caching
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Response object
 */
export async function fetchWithCache(url, options = {}) {
  const {
    cacheFirst = false,
    cacheName = 'sdde-cache-v1',
    expiration = 3600000, // 1 hour
    forceRefresh = false,
    headers = {},
    ...fetchOptions
  } = options;
  
  // Check if cache is supported
  const cacheSupported = 'caches' in window;
  
  // If cache is not supported or we're forcing a refresh, just fetch
  if (!cacheSupported || forceRefresh) {
    return fetch(url, { headers, ...fetchOptions });
  }
  
  try {
    const cache = await caches.open(cacheName);
    
    // Cache-first strategy
    if (cacheFirst) {
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        // Check if the cached response has expired
        const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
        const now = new Date();
        const cacheAge = now - cachedDate;
        
        if (cacheAge < expiration) {
          // Return the cached response if not expired
          return cachedResponse;
        }
      }
    }
    
    // Fetch from network
    const response = await fetch(url, { headers, ...fetchOptions });
    
    // Cache the new response
    if (response.ok) {
      // Clone the response before caching
      cache.put(url, response.clone());
    }
    
    return response;
  } catch (error) {
    // If error fetching, try to return from cache as fallback
    if (cacheSupported) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        console.warn(`Failed to fetch from network, using cached version for: ${url}`);
        return cachedResponse;
      }
    }
    
    // Re-throw the error if no cache fallback
    throw error;
  }
}

/**
 * Cache an image in memory for fast access
 * @param {string} src - Image URL
 * @returns {Promise} Promise that resolves when the image is cached
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    // Don't preload if already in cache
    if (imageCache.has(src)) {
      resolve(src);
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      resolve(src);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to preload image: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel
 * @param {Array<string>} sources - Array of image URLs
 * @param {number} [concurrency=4] - Number of concurrent loads
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export async function preloadImages(sources, concurrency = 4) {
  const results = {
    successful: [],
    failed: []
  };
  
  // Process images in batches for controlled concurrency
  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);
    
    const promises = batch.map(src => 
      preloadImage(src)
        .then(() => results.successful.push(src))
        .catch(() => results.failed.push(src))
    );
    
    await Promise.allSettled(promises);
  }
  
  return results;
} 