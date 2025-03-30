/**
 * Enhanced Service Worker for Steam Deck DUB Edition Guide
 * Provides offline functionality and caching of essential resources
 * with improved PWA capabilities
 * 
 * IMPORTANT: This file must be compiled separately from the main application code
 * as it runs in a service worker context, not the browser window context.
 * The TypeScript types are defined, but the actual Service Worker API
 * is only available in the service worker runtime.
 * 
 * To use this, compile this file separately and deploy it to the root as service-worker.js
 * There are TypeScript errors shown here because the service worker globals aren't 
 * recognized in a normal TS file. In a real project, you would use workbox, service-worker-loader,
 * or another tool to properly build service workers in TypeScript.
 */

// @ts-ignore - Ignore TypeScript errors for service worker globals
import {
  CacheConfig,
  ServiceWorkerAssets,
  CachingStrategy,
  PendingRequest
} from '../../types/service-worker';

// Cache version - increment this when making significant changes
const CACHE_VERSION: string = '3';

// Cache names for different types of assets
const CACHE_NAMES: CacheConfig = {
  static: `static-cache-v${CACHE_VERSION}`,
  content: `content-cache-v${CACHE_VERSION}`,
  dynamic: `dynamic-cache-v${CACHE_VERSION}`,
  images: `images-cache-v${CACHE_VERSION}`,
  locales: `locales-cache-v${CACHE_VERSION}`,
  fonts: `fonts-cache-v${CACHE_VERSION}`,
  documents: `documents-cache-v${CACHE_VERSION}`
};

// Assets to cache on install (core files needed for the app to function)
const STATIC_ASSETS: string[] = [
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
const FONT_ASSETS: string[] = [
  '/fonts/OpenDyslexic-Regular.otf',
  '/fonts/OpenDyslexic-Bold.otf',
  '/fonts/OpenDyslexic-Italic.otf'
];

// Locale files to cache
const LOCALE_ASSETS: string[] = [
  '/locales/en.json',
  '/locales/es.json',
  '/src/locales/en.json',
  '/src/locales/es.json'
];

// Document assets to cache for offline access
const DOCUMENT_ASSETS: string[] = [
  '/docs/developer-quickstart.md',
  '/docs/components.md',
  '/docs/component-visuals.md',
  '/docs/testing.md',
  '/CONTRIBUTING.md',
  '/README.md'
];

// Icon assets
const ICON_ASSETS: string[] = [
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
const PRECACHE_ASSETS: string[] = [
  ...STATIC_ASSETS,
  ...LOCALE_ASSETS,
  ...FONT_ASSETS,
  ...ICON_ASSETS
];

// Maximum number of items in dynamic cache
const DYNAMIC_CACHE_LIMIT: number = 150;

// Background sync tag for pending requests
const BACKGROUND_SYNC_TAG: string = 'sdde-pending-requests';

// Install event - cache essential files
// @ts-ignore - Service Worker API
self.addEventListener('install', (event: ExtendableEvent) => {
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
      // @ts-ignore - Service Worker API
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[Service Worker] Precaching error:', error);
    })
  );
});

// Activate event - clean up old caches
// @ts-ignore - Service Worker API
self.addEventListener('activate', (event: ExtendableEvent) => {
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
          return Promise.resolve();
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients for latest version');
        // @ts-ignore - Service Worker API
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
// @ts-ignore - Service Worker API
self.addEventListener('fetch', (event: FetchEvent) => {
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
// @ts-ignore - Service Worker API
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(processPendingRequests());
  }
});

// Push notification event
// @ts-ignore - Service Worker API
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) {
    console.log('[Service Worker] Push received but no data');
    return;
  }
  
  const data = event.data.json();
  console.log('[Service Worker] Push received:', data);
  
  const title = data.title || 'Steam Deck DUB Edition';
  // @ts-ignore - Service Worker API NotificationOptions has additional properties in the Service Worker context
  const options: NotificationOptions = {
    body: data.body || 'New notification from SDDE',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction,
    renotify: data.renotify,
    silent: data.silent,
    timestamp: data.timestamp
  };
  
  event.waitUntil(
    // @ts-ignore - Service Worker API
    self.registration.showNotification(title, options)
  );
});

// Message event from clients
// @ts-ignore - Service Worker API
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'CACHE_NEW_CONTENT') {
    const { urls } = event.data;
    event.waitUntil(
      caches.open(CACHE_NAMES.content)
        .then(cache => {
          return Promise.all(
            urls.map((url: string) => {
              return fetch(url).then(response => {
                if (!response.ok) {
                  throw new Error(`Cannot cache ${url}: ${response.status}`);
                }
                return cache.put(url, response);
              }).catch(error => {
                console.error(`Failed to cache ${url}:`, error);
              });
            })
          );
        })
    );
  }
});

// Notification click handler
// @ts-ignore - Service Worker API
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  // Handle notification action if present
  if (event.action) {
    console.log('[Service Worker] Notification action clicked:', event.action);
    // Custom action handling can go here
  } else {
    // Default action - open the app
    event.waitUntil(
      // @ts-ignore - Service Worker API
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList: Client[]) => {
          // If we have an open window, focus it
          for (const client of clientList) {
            if ('focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open a new window
          // @ts-ignore - Service Worker API
          if (self.clients.openWindow) {
            // @ts-ignore - Service Worker API
            return self.clients.openWindow('/');
          }
          return null;
        })
    );
  }
});

// =====================================
// Caching strategies
// =====================================

/**
 * Cache first strategy - try cache first, then network
 * @param request The request to fetch
 * @param cacheName The name of the cache to check
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log(`[Service Worker] Serving from cache: ${request.url}`);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      console.log(`[Service Worker] Caching new resource: ${request.url}`);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error(`[Service Worker] Network error for ${request.url}:`, error);
    // Return offline fallback if available
    return caches.match('/offline.html') as Promise<Response>;
  }
}

/**
 * Network first strategy - try network first, then cache
 * @param request The request to fetch
 * @param cacheName The name of the cache to check
 */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    // Try to get from network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Update the cache with the new response
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    console.log(`[Service Worker] Falling back to cache for: ${request.url}`);
    // If network fails, fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache either, return offline fallback
    return caches.match('/offline.html') as Promise<Response>;
  }
}

/**
 * Stale while revalidate - return cache immediately, but update cache in background
 * @param request The request to fetch
 * @param cacheName The name of the cache to check
 */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      })
      .catch(error => {
        console.log(`[Service Worker] Background fetch failed: ${error}`);
      });
      
    return cachedResponse;
  }
  
  // If not in cache, get from network and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      
      // Limit size of cache
      limitCacheSize(cacheName, DYNAMIC_CACHE_LIMIT);
    }
    return networkResponse;
  } catch (error) {
    // If network fails and not in cache, return fallback
    return caches.match('/offline.html') as Promise<Response>;
  }
}

/**
 * Process pending requests stored for background sync
 */
async function processPendingRequests(): Promise<void> {
  try {
    // Open cache for pending requests
    const cache = await caches.open('pending-requests');
    const keys = await cache.keys();
    
    for (const key of keys) {
      try {
        // Get the stored request details
        const response = await cache.match(key);
        const requestData = await response?.json() as PendingRequest;
        
        // Skip if the request is too old (more than 24 hours)
        const now = Date.now();
        if (now - requestData.timestamp > 24 * 60 * 60 * 1000) {
          await cache.delete(key);
          continue;
        }
        
        // Create headers
        const headers = new Headers();
        for (const [name, value] of Object.entries(requestData.headers)) {
          headers.append(name, value);
        }
        
        // Create and send request
        const request = new Request(requestData.url, {
          method: requestData.method,
          headers,
          body: requestData.body
        });
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          console.log(`[Service Worker] Successfully processed pending request: ${requestData.url}`);
          await cache.delete(key);
        } else {
          throw new Error(`Request failed with status ${networkResponse.status}`);
        }
      } catch (error) {
        console.error(`[Service Worker] Error processing pending request:`, error);
        
        // Increment retry count and update timestamp
        const response = await cache.match(key);
        if (response) {
          const requestData = await response.json() as PendingRequest;
          if (requestData.retries < 5) {
            requestData.retries++;
            requestData.timestamp = Date.now();
            await cache.put(key, new Response(JSON.stringify(requestData)));
          } else {
            // Too many retries, delete the request
            await cache.delete(key);
          }
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in processPendingRequests:', error);
  }
}

/**
 * Limit the size of a cache
 * @param cacheName The name of the cache to limit
 * @param maxItems Maximum number of items to keep in the cache
 */
async function limitCacheSize(cacheName: string, maxItems: number): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest items (first in, first out)
    await cache.delete(keys[0]);
    // Continue limiting the cache size recursively
    limitCacheSize(cacheName, maxItems);
  }
}

// =====================================
// Helper functions to identify file types
// =====================================

/**
 * Check if URL is for a locale file
 */
function isLocaleFile(url: URL): boolean {
  return url.pathname.includes('/locales/') || 
         url.pathname.endsWith('.json') && url.pathname.includes('/lang/');
}

/**
 * Check if URL is for a font file
 */
function isFontFile(url: URL): boolean {
  return url.pathname.includes('/fonts/') || 
         /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname);
}

/**
 * Check if URL is for a document file
 */
function isDocumentFile(url: URL): boolean {
  return url.pathname.includes('/docs/') || 
         /\.(md|pdf|docx?)$/i.test(url.pathname);
}

/**
 * Check if URL is for a content file
 */
function isContentFile(url: URL): boolean {
  return url.pathname.includes('/content/') || 
         url.pathname.includes('/sections/') ||
         url.pathname.includes('/articles/');
}

/**
 * Check if URL is for an image file
 */
function isImageFile(url: URL): boolean {
  return /\.(jpe?g|png|gif|svg|webp|avif)$/i.test(url.pathname);
}

/**
 * Check if URL is for a static asset
 */
function isAssetFile(url: URL): boolean {
  return url.pathname.includes('/assets/') ||
         url.pathname.includes('/static/') ||
         /\.(css|js)$/i.test(url.pathname);
}

/**
 * Check if URL is for an external resource
 */
function isExternalResource(url: URL): boolean {
  const currentOrigin = self.location.origin;
  return url.origin !== currentOrigin;
} 