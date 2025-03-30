/**
 * TypeScript definitions for service worker functionality
 * Grimoire Guide
 */

// Service Worker specific event types 
// These are not included in the standard lib.dom.d.ts
declare global {
  interface Client {
    id: string;
    type: "window" | "worker" | "sharedworker";
    url: string;
    postMessage(message: any, transfer?: Transferable[]): void;
  }

  interface ExtendableEvent extends Event {
    waitUntil(fn: Promise<any>): void;
  }

  interface FetchEvent extends ExtendableEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
  }

  interface SyncEvent extends ExtendableEvent {
    tag: string;
  }

  interface PushEvent extends ExtendableEvent {
    data: {
      json(): any;
      text(): string;
      arrayBuffer(): ArrayBuffer;
    };
  }

  interface ExtendableMessageEvent extends ExtendableEvent {
    data: any;
    source: Client | MessagePort | ServiceWorker;
    ports: ReadonlyArray<MessagePort>;
  }
}

// Cache version and names configuration
export interface CacheConfig {
  static: string;
  content: string;
  dynamic: string;
  images: string;
  locales: string;
  fonts: string;
  documents: string;
}

// Asset types for precaching
export type AssetPath = string;

export interface ServiceWorkerAssets {
  static: AssetPath[];
  fonts: AssetPath[];
  locales: AssetPath[];
  documents: AssetPath[];
  icons: AssetPath[];
}

// Notification data type for push notifications
export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
}

// Notification action type
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Background sync request type
export interface PendingRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retries: number;
}

// Caching strategies
export type CachingStrategy = 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';

// Request routing configuration
export interface RequestRouteConfig {
  urlPattern: RegExp | string;
  strategy: CachingStrategy;
  cacheName: string;
}

// Service worker events interface
export interface ServiceWorkerEventHandlers {
  onInstall: (event: ExtendableEvent) => void;
  onActivate: (event: ExtendableEvent) => void;
  onFetch: (event: FetchEvent) => void;
  onSync: (event: SyncEvent) => void;
  onPush: (event: PushEvent) => void;
  onMessage: (event: ExtendableMessageEvent) => void;
}

// Service worker initialization options
export interface ServiceWorkerOptions {
  cacheVersion: string;
  dynamicCacheLimit?: number;
  backgroundSyncTag?: string;
  debug?: boolean;
}

// Content type helpers
export interface ContentTypeHelpers {
  isLocaleFile: (url: URL) => boolean;
  isFontFile: (url: URL) => boolean;
  isDocumentFile: (url: URL) => boolean;
  isContentFile: (url: URL) => boolean;
  isImageFile: (url: URL) => boolean;
  isAssetFile: (url: URL) => boolean;
  isExternalResource: (url: URL) => boolean;
} 