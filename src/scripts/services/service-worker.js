/**
 * Service Worker for Steam Deck DUB Edition Guide
 * Provides offline functionality and caching of essential resources
 */

// Cache version - increment this when making significant changes
const CACHE_VERSION = '2';

// Cache names for different types of assets
const CACHE_NAMES = {
  static: `static-cache-v${CACHE_VERSION}`,
  content: `content-cache-v${CACHE_VERSION}`,
  dynamic: `dynamic-cache-v${CACHE_VERSION}`,
  images: `images-cache-v${CACHE_VERSION}`,
  locales: `locales-cache-v${CACHE_VERSION}`
};

// Assets to cache on install (core files needed for the app to function)
const STATIC_ASSETS = [
  '/', // Root path
  '/index.html',
  '/styles.css',
  '/scripts/services/preload.js',
  '/offline.html', // Fallback page for when offline
  '/src/ui-main.js',
  '/src/utils.js',
  '/src/i18n.js',
  '/src/components/sidebar.js',
  '/src/components/search.js',
  '/src/components/navigation.js',
  '/src/components/theme.js',
  '/src/styles/theme.css',
  '/dyslexic-font.css',
  '/navigation-fixes.css',
  '/print-styles.css',
  '/sdde.svg',
  '/dub_edition.png',
  '/Steam_Deck_colored_logo.svg'
];

// Locale files to cache
const LOCALE_ASSETS = [
  '/locales/en.json',
  '/locales/es.json'
];

// All assets to cache on install
const PRECACHE_ASSETS = [
  ...STATIC_ASSETS,
  ...LOCALE_ASSETS
];

// Maximum number of items in dynamic cache
const DYNAMIC_CACHE_LIMIT = 100;

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return caches.open(CACHE_NAMES.locales);
      })
      .then(cache => {
        console.log('[Service Worker] Precaching Locale Files');
        return cache.addAll(LOCALE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully cached app shell');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Precaching error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          // Check if this is an old version of our caches
          if (
            key.startsWith('static-cache-v') && key !== CACHE_NAMES.static ||
            key.startsWith('content-cache-v') && key !== CACHE_NAMES.content ||
            key.startsWith('dynamic-cache-v') && key !== CACHE_NAMES.dynamic ||
            key.startsWith('images-cache-v') && key !== CACHE_NAMES.images ||
            key.startsWith('locales-cache-v') && key !== CACHE_NAMES.locales
          ) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients for latest version');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip if it's not a GET request or if it's a chrome-extension request
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Extract URL to determine caching strategy
  const requestUrl = new URL(event.request.url);
  
  // Handle different caching strategies based on file type or path
  if (isLocaleFile(requestUrl)) {
    // Locale files - Cache first, falling back to network
    event.respondWith(
      cacheFirst(event.request, CACHE_NAMES.locales)
    );
  } else if (isContentFile(requestUrl)) {
    // Content files - Network first, falling back to cache
    event.respondWith(
      networkFirst(event.request, CACHE_NAMES.content)
    );
  } else if (isImageFile(requestUrl)) {
    // Images - Cache first with background refresh
    event.respondWith(
      staleWhileRevalidate(event.request, CACHE_NAMES.images)
    );
  } else if (isAssetFile(requestUrl)) {
    // Static assets - Cache first, falling back to network
    event.respondWith(
      cacheFirst(event.request, CACHE_NAMES.static)
    );
  } else if (isExternalResource(requestUrl)) {
    // External resources - Stale-while-revalidate
    event.respondWith(
      staleWhileRevalidate(event.request, CACHE_NAMES.dynamic)
    );
  } else {
    // Everything else - Network first, falling back to cache
    event.respondWith(
      networkFirst(event.request, CACHE_NAMES.dynamic)
    );
  }
});

/**
 * Check if the URL is a locale file
 */
function isLocaleFile(url) {
  return url.pathname.startsWith('/locales/');
}

/**
 * Check if the URL is a content file
 */
function isContentFile(url) {
  return url.pathname.startsWith('/content/');
}

/**
 * Check if the URL is an image file
 */
function isImageFile(url) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

/**
 * Check if the URL is a static asset
 */
function isAssetFile(url) {
  const assetExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf'];
  return assetExtensions.some(ext => url.pathname.endsWith(ext)) || 
         url.pathname === '/' || 
         url.pathname === '/index.html' ||
         url.pathname === '/offline.html';
}

/**
 * Check if the URL is an external resource
 */
function isExternalResource(url) {
  return url.origin !== location.origin;
}

/**
 * Cache-first strategy: try cache first, then network
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    await cacheResponse(request, networkResponse.clone(), cacheName);
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first fetch failed:', error);
    
    // If it's an HTML request, return the offline page
    if (request.headers.get('Accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // For other resources, we just fail
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network-first strategy: try network first, then cache
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    await cacheResponse(request, networkResponse.clone(), cacheName);
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an HTML request and there's no cached version, return the offline page
    if (request.headers.get('Accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // For other resources, return an error response
    return new Response('Network error and no cached version available', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Stale-while-revalidate strategy: return cached version immediately,
 * then update the cache in the background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Create a promise to update the cache
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      cacheResponse(request, networkResponse.clone(), cacheName);
      return networkResponse;
    })
    .catch(error => {
      console.log('[Service Worker] Stale-while-revalidate fetch failed:', error);
      // If it's an HTML request, return the offline page
      if (request.headers.get('Accept')?.includes('text/html')) {
        return caches.match('/offline.html');
      }
    });
  
  // Return the cached response immediately, or wait for the network if no cached response
  return cachedResponse || fetchPromise;
}

/**
 * Helper function to add a response to the cache
 */
async function cacheResponse(request, response, cacheName) {
  // Only cache valid responses
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  const cache = await caches.open(cacheName);
  
  // For dynamic cache, implement size limit
  if (cacheName === CACHE_NAMES.dynamic) {
    // Clean up dynamic cache if necessary
    trimCache(cache, DYNAMIC_CACHE_LIMIT);
  }
  
  cache.put(request, response);
}

/**
 * Trim the cache to the specified maximum
 */
async function trimCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    // Recursively trim again if still too large
    trimCache(cache, maxItems);
  }
}

/**
 * Listen for messages from clients
 */
self.addEventListener('message', event => {
  // Check for cache update requests
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  // Check for cache clear requests
  if (event.data && event.data.action === 'clearCache') {
    const cacheToClean = event.data.cacheName;
    
    if (cacheToClean && CACHE_NAMES[cacheToClean]) {
      console.log(`[Service Worker] Clearing ${cacheToClean} cache`);
      caches.open(CACHE_NAMES[cacheToClean]).then(cache => cache.keys().then(keys => {
        keys.forEach(request => cache.delete(request));
      }));
    } else if (cacheToClean === 'all') {
      console.log('[Service Worker] Clearing all caches');
      Object.values(CACHE_NAMES).forEach(cacheName => {
        caches.open(cacheName).then(cache => cache.keys().then(keys => {
          keys.forEach(request => cache.delete(request));
        }));
      });
    }
    
    // Let the client know we've received the request
    event.ports[0].postMessage({
      action: 'clearCache',
      status: 'success',
      message: `Clearing cache: ${cacheToClean || 'all'}`
    });
  }
  
  // Check for content version check requests
  if (event.data && event.data.action === 'checkContentVersion') {
    event.ports[0].postMessage({
      action: 'contentVersionStatus',
      version: CACHE_VERSION
    });
  }
});
