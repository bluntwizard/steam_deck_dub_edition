/**
 * Service Worker Type Definitions
 * Grimoire Guide
 */

// Work around missing declaration in lib.dom.d.ts
interface WorkerGlobalScope {
  location: Location;
}

// Service Worker Global Scope
declare interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  clients: Clients;
  registration: ServiceWorkerRegistration;
  skipWaiting(): Promise<void>;
  fetch(request: RequestInfo): Promise<Response>;
  caches: CacheStorage;
  location: Location;
}

// Clients API
declare interface Clients {
  get(id: string): Promise<Client | undefined>;
  matchAll(options?: ClientQueryOptions): Promise<ReadonlyArray<Client>>;
  openWindow(url: string): Promise<WindowClient | null>;
  claim(): Promise<void>;
}

declare interface ClientQueryOptions {
  includeUncontrolled?: boolean;
  type?: ClientType;
}

declare type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

// Client interface
declare interface Client {
  id: string;
  type: ClientType;
  url: string;
  frameType: FrameType;
  postMessage(message: any, transfer?: ReadonlyArray<any>): void;
}

declare interface WindowClient extends Client {
  visibilityState: DocumentVisibilityState;
  focused: boolean;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient | null>;
}

declare type FrameType = 'auxiliary' | 'top-level' | 'nested' | 'none';
declare type DocumentVisibilityState = 'hidden' | 'visible' | 'prerender';

// Service Worker Registration
declare interface ServiceWorkerRegistration {
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  scope: string;
  updateViaCache: ServiceWorkerUpdateViaCache;
  navigationPreload: NavigationPreloadManager;
  pushManager: PushManager;
  sync: SyncManager;
  periodicSync: PeriodicSyncManager;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  getNotifications(options?: GetNotificationOptions): Promise<ReadonlyArray<Notification>>;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
}

// Notification options
declare interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationAction[];
  data?: any;
}

declare interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Push notification data
declare interface PushNotificationData {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
  url?: string;
}

// Events
declare interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

declare interface FetchEvent extends ExtendableEvent {
  request: Request;
  clientId: string;
  resultingClientId: string;
  respondWith(response: Response | Promise<Response>): void;
}

declare interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

declare interface PushEvent extends ExtendableEvent {
  data: PushMessageData | null;
}

declare interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json<T>(): T;
  text(): string;
}

declare interface SyncEvent extends ExtendableEvent {
  tag: string;
}

// Sync Manager
declare interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Periodic Sync Manager
declare interface PeriodicSyncManager {
  register(tag: string, options?: PeriodicSyncOptions): Promise<void>;
  unregister(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

declare interface PeriodicSyncOptions {
  minInterval: number;
}

// Cache Storage
declare interface CacheStorage {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  has(cacheName: string): Promise<boolean>;
  open(cacheName: string): Promise<Cache>;
  delete(cacheName: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

// Cache
declare interface Cache {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  matchAll(request: RequestInfo, options?: CacheQueryOptions): Promise<ReadonlyArray<Response>>;
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  put(request: RequestInfo, response: Response): Promise<void>;
  delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
  keys(request?: RequestInfo, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>>;
}

declare interface CacheQueryOptions {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
  cacheName?: string;
} 