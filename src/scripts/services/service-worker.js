/**
 * Enhanced Service Worker for Steam Deck DUB Edition Guide
 * Provides offline functionality and caching of essential resources
 * with improved PWA capabilities
 */

// Cache version - increment this when making significant changes
const CACHE_VERSION = '3';

// Cache names for different types of assets
const CACHE_NAMES = {
  static: `static-cache-v${CACHE_VERSION}`,
  content: `content-cache-v${CACHE_VERSION}`,
  dynamic: `dynamic-cache-v${CACHE_VERSION}`,
  images: `images-cache-v${CACHE_VERSION}`,
  locales: `locales-cache-v${CACHE_VERSION}`,
  fonts: `fonts-cache-v${CACHE_VERSION}`,
  documents: `documents-cache-v${CACHE_VERSION}`
};

// Assets to cache on install (core files needed for the app to function)
const STATIC_ASSETS = [
  '/', // Root path
  '/index.html',
  '/main.js',
  '/preload.js',
  '/offline.html', // Fallback page for when offline
  '/src/ui-main.js',
  '/src/utils.js',
  '/src/i18n.js',
  '/manifest.json',
  '/src/components/Button/index.js',
  '/src/components/Button/Button.js',
  '/src/components/Button/Button.module.css',
  '/src/components/Dialog/index.js',
  '/src/components/Dialog/Dialog.js',
  '/src/components/Dialog/Dialog.module.css',
  '/src/components/ErrorHandler/index.js',
  '/src/components/ErrorHandler/ErrorHandler.js',
  '/src/components/ErrorHandler/ErrorHandler.module.css',
  '/src/components/HelpCenter/index.js',
  '/src/components/HelpCenter/HelpCenter.js',
  '/src/components/HelpCenter/HelpCenter.module.css',
  '/src/components/NotificationSystem/index.js',
  '/src/components/NotificationSystem/NotificationSystem.js',
  '/src/components/NotificationSystem/NotificationSystem.module.css',
  '/src/components/PageLoader/index.js',
  '/src/components/PageLoader/PageLoader.js',
  '/src/components/PageLoader/PageLoader.module.css',
  '/src/styles/main.css',
  '/sdde.svg',
  '/dub_edition.png',
  '/Steam_Deck_colored_logo.svg'
];

// Font files to cache
const FONT_ASSETS = [
  '/fonts/OpenDyslexic-Regular.otf',
  '/fonts/OpenDyslexic-Bold.otf',
  '/fonts/OpenDyslexic-Italic.otf'
];

// Locale files to cache
const LOCALE_ASSETS = [
  '/locales/en.json',
  '/locales/es.json',
  '/src/locales/en.json',
  '/src/locales/es.json'
];

// Document assets to cache for offline access
const DOCUMENT_ASSETS = [
  '/docs/developer-quickstart.md',
  '/docs/components.md',
  '/docs/component-visuals.md',
  '/docs/testing.md',
  '/CONTRIBUTING.md',
  '/README.md'
];

// Icon assets
const ICON_ASSETS = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png'
];

// All assets to cache on install
const PRECACHE_ASSETS = [
  ...STATIC_ASSETS,
  ...LOCALE_ASSETS,
  ...FONT_ASSETS,
  ...ICON_ASSETS
];

// Maximum number of items in dynamic cache
const DYNAMIC_CACHE_LIMIT = 150;

// Background sync tag for pending requests
const BACKGROUND_SYNC_TAG = 'sdde-pending-requests';

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAMES.static)
        .then(cache => {
          console.log('[Service Worker] Precaching App Shell');
          return cache.addAll(STATIC_ASSETS);
        }),
      
      // Cache locale files
      caches.open(CACHE_NAMES.locales)
        .then(cache => {
          console.log('[Service Worker] Precaching Locale Files');
          return cache.addAll(LOCALE_ASSETS);
        }),
        
      // Cache font files
      caches.open(CACHE_NAMES.fonts)
        .then(cache => {
          console.log('[Service Worker] Precaching Font Files');
          return cache.addAll(FONT_ASSETS);
        }),
        
      // Cache document files for offline access
      caches.open(CACHE_NAMES.documents)
        .then(cache => {
          console.log('[Service Worker] Precaching Document Files');
          return cache.addAll(DOCUMENT_ASSETS);
        })
    ])
    .then(() => {
      console.log('[Service Worker] Successfully cached app resources');
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
            Object.values(CACHE_NAMES).every(cacheName => key !== cacheName) &&
            Object.keys(CACHE_NAMES).some(cacheType => 
              key.startsWith(`${cacheType}-cache-v`))
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
  } else if (isFontFile(requestUrl)) {
    // Font files - Cache first, falling back to network
    event.respondWith(
      cacheFirst(event.request, CACHE_NAMES.fonts)
    );
  } else if (isDocumentFile(requestUrl)) {
    // Document files - Network first, falling back to cache
    event.respondWith(
      networkFirst(event.request, CACHE_NAMES.documents)
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

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(processPendingRequests());
  }
});

// Push notification event
self.addEventListener('push', event => {
  if (!event.data) {
    console.log('[Service Worker] Push received but no data');
    return;
  }
  
  const data = event.data.json();
  console.log('[Service Worker] Push received:', data);
  
  const title = data.title || 'Steam Deck DUB Edition';
  const options = {
    body: data.body || 'New notification from SDDE',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  // This looks to see if the target URL is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then(clientList => {
      const notificationData = event.notification.data;
      const url = notificationData && notificationData.url ? notificationData.url : '/';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Helper functions

/**
 * Check if the URL is a locale file
 */
function isLocaleFile(url) {
  return url.pathname.includes('/locales/');
}

/**
 * Check if the URL is a font file
 */
function isFontFile(url) {
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
  return fontExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext)) ||
         url.pathname.includes('/fonts/');
}

/**
 * Check if the URL is a document file
 */
function isDocumentFile(url) {
  return url.pathname.includes('/docs/') || 
         url.pathname.endsWith('.md') ||
         DOCUMENT_ASSETS.some(doc => url.pathname.endsWith(doc));
}

/**
 * Check if the URL is a content file
 */
function isContentFile(url) {
  return url.pathname.includes('/content/');
}

/**
 * Check if the URL is an image file
 */
function isImageFile(url) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext)) ||
         url.pathname.includes('/images/') ||
         url.pathname.includes('/icons/');
}

/**
 * Check if the URL is a static asset
 */
function isAssetFile(url) {
  const assetExtensions = ['.css', '.js', '.json'];
  return assetExtensions.some(ext => url.pathname.endsWith(ext)) || 
         url.pathname === '/' || 
         url.pathname.endsWith('/index.html') ||
         url.pathname.endsWith('/offline.html') ||
         url.pathname.includes('/src/components/');
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
 * Stale-while-revalidate: return cached version immediately, then update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  // First, try to get the resource from the cache
  const cachedResponse = await caches.match(request);
  
  // Next, send a network request in the background to update the cache
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      cacheResponse(request, networkResponse.clone(), cacheName);
      return networkResponse;
    })
    .catch(error => {
      console.log('[Service Worker] Fetch failed for stale-while-revalidate:', error);
      // Just catch the error and don't propagate it further
    });
  
  // Return the cached response immediately or wait for the network response
  return cachedResponse || fetchPromise;
}

/**
 * Store the response in the appropriate cache
 */
async function cacheResponse(request, response, cacheName) {
  // Only cache valid responses
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  
  // Trim the cache if it's the dynamic cache
  if (cacheName === CACHE_NAMES.dynamic) {
    await trimCache(cache, DYNAMIC_CACHE_LIMIT);
  }
}

/**
 * Trim the cache to a certain number of items
 */
async function trimCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cache, maxItems);
  }
}

/**
 * Process any pending requests stored in IndexedDB
 */
async function processPendingRequests() {
  // This would be implemented with IndexedDB to store and retrieve pending requests
  console.log('[Service Worker] Processing pending requests');
  // Implementation would go here
}

/**
 * Register for periodic background sync if available
 */
async function registerPeriodicSync() {
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('content-update', {
        minInterval: 24 * 60 * 60 * 1000 // Once per day
      });
      console.log('[Service Worker] Periodic sync registered');
    } catch (error) {
      console.error('[Service Worker] Periodic sync could not be registered:', error);
    }
  }
}

// Try to register for periodic sync
registerPeriodicSync().catch(console.error);








