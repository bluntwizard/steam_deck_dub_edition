/**
 * API Client Type Definitions
 * Steam Deck DUB Edition Guide
 */

/**
 * HTTP Request Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Cache strategy to use for request
 */
export type CacheStrategy = 'network-only' | 'cache-first' | 'cache-only' | 'stale-while-revalidate';

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** The strategy to use for caching */
  strategy: CacheStrategy;
  
  /** The name of the cache to use */
  cacheName?: string;
  
  /** Time-to-live in milliseconds for cache entries */
  ttl?: number;
  
  /** Whether to force a network request even when cached data is available */
  forceRefresh?: boolean;
}

/**
 * Request options
 */
export interface ApiRequestOptions<T = any> {
  /** HTTP method for the request */
  method?: HttpMethod;
  
  /** URL for the request (if not using baseUrl + path) */
  url?: string;
  
  /** Path to append to baseUrl */
  path?: string;
  
  /** Request body for POST, PUT, PATCH requests */
  body?: any;
  
  /** Request headers */
  headers?: Record<string, string>;
  
  /** URL query parameters */
  params?: Record<string, string | number | boolean | null | undefined>;
  
  /** Caching options */
  cache?: CacheOptions;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Credentials mode for the request */
  credentials?: RequestCredentials;
  
  /** Function to transform the response data */
  responseTransformer?: (data: any) => T;
  
  /** Whether to retry failed requests */
  retry?: boolean;
  
  /** Maximum number of retry attempts */
  maxRetries?: number;
  
  /** Whether the API call should be authenticated */
  authenticated?: boolean;
}

/**
 * Response from an API call
 */
export interface ApiResponse<T = any> {
  /** Response data (parsed from JSON) */
  data: T;
  
  /** HTTP status code */
  status: number;
  
  /** Response headers */
  headers: Headers;
  
  /** Whether the response came from cache */
  fromCache: boolean;
  
  /** Original response object */
  response: Response;
}

/**
 * Error from an API call
 */
export interface ApiError extends Error {
  /** HTTP status code */
  status?: number;
  
  /** Response data if available */
  data?: any;
  
  /** Whether the error is related to a network issue */
  isNetworkError: boolean;
  
  /** Whether the error is related to a timeout */
  isTimeout: boolean;
  
  /** Original response if available */
  response?: Response;
  
  /** Original error if this wraps another error */
  originalError?: Error;
}

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  
  /** Default headers to include with every request */
  defaultHeaders?: Record<string, string>;
  
  /** Default timeout for requests in milliseconds */
  defaultTimeout?: number;
  
  /** Default credentials mode */
  defaultCredentials?: RequestCredentials;
  
  /** Whether to retry failed requests by default */
  retry?: boolean;
  
  /** Maximum number of retry attempts */
  maxRetries?: number;
  
  /** Default cache strategy */
  defaultCacheStrategy?: CacheStrategy;
  
  /** Default cache TTL in milliseconds */
  defaultCacheTtl?: number;
  
  /** Default cache name */
  defaultCacheName?: string;
  
  /** Function to get authentication token when needed */
  getAuthToken?: () => Promise<string | null> | string | null;
}

/**
 * API Client interface
 */
export interface ApiClient {
  /**
   * Send a GET request
   * @param path Path or URL
   * @param options Request options
   */
  get<T = any>(path: string, options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>): Promise<ApiResponse<T>>;
  
  /**
   * Send a POST request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  post<T = any>(path: string, body?: any, options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>): Promise<ApiResponse<T>>;
  
  /**
   * Send a PUT request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  put<T = any>(path: string, body?: any, options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>): Promise<ApiResponse<T>>;
  
  /**
   * Send a PATCH request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  patch<T = any>(path: string, body?: any, options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>): Promise<ApiResponse<T>>;
  
  /**
   * Send a DELETE request
   * @param path Path or URL
   * @param options Request options
   */
  delete<T = any>(path: string, options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>): Promise<ApiResponse<T>>;
  
  /**
   * Send a request with custom options
   * @param options Request options
   */
  request<T = any>(options: ApiRequestOptions<T>): Promise<ApiResponse<T>>;
  
  /**
   * Clear the cache for a specific URL or path
   * @param urlOrPath URL or path to clear from cache
   * @param cacheName Optional cache name
   */
  clearCache(urlOrPath: string, cacheName?: string): Promise<void>;
  
  /**
   * Prefetch a URL or path and store in cache
   * @param urlOrPath URL or path to prefetch
   * @param options Prefetch options
   */
  prefetch(urlOrPath: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<void>;
} 