/**
 * API Client Implementation
 * Grimoire Guide
 * 
 * A central utility for making HTTP requests with advanced caching capabilities.
 */

import { 
  ApiClient,
  ApiClientConfig,
  ApiError,
  ApiRequestOptions,
  ApiResponse,
  CacheOptions,
  CacheStrategy,
  HttpMethod
} from '../../types/api-client';

/**
 * Creates an API error with additional metadata
 */
function createApiError(
  message: string, 
  status?: number, 
  data?: any, 
  isNetworkError = false, 
  isTimeout = false, 
  response?: Response, 
  originalError?: Error
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  error.isNetworkError = isNetworkError;
  error.isTimeout = isTimeout;
  error.response = response;
  error.originalError = originalError;
  error.name = 'ApiError';
  
  return error;
}

/**
 * Default API client configuration
 */
const DEFAULT_CONFIG: Partial<ApiClientConfig> = {
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  defaultTimeout: 30000,
  defaultCredentials: 'same-origin',
  retry: true,
  maxRetries: 3,
  defaultCacheStrategy: 'network-only',
  defaultCacheTtl: 3600000, // 1 hour
  defaultCacheName: 'sdde-api-cache-v1',
};

/**
 * Create a URL from a base URL and path, handling path segments properly
 * @param baseUrl Base URL
 * @param path Path to append
 * @returns Full URL
 */
function createUrl(baseUrl: string, path: string): string {
  // If path is already a full URL, return it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const pathSegment = path.startsWith('/') ? path : `/${path}`;
  
  return `${base}${pathSegment}`;
}

/**
 * Build URL with query parameters
 * @param url Base URL
 * @param params Query parameters
 * @returns URL with query parameters
 */
function buildUrlWithParams(url: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  if (!params) return url;
  
  const urlObj = new URL(url);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      urlObj.searchParams.append(key, String(value));
    }
  });
  
  return urlObj.toString();
}

/**
 * Implement the API Client
 */
export class ApiClientImpl implements ApiClient {
  private config: ApiClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();
  private retryTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  
  /**
   * Create a new API client instance
   * @param config Client configuration
   */
  constructor(config: ApiClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    } as ApiClientConfig;
  }
  
  /**
   * Send a GET request
   * @param path Path or URL
   * @param options Request options
   */
  async get<T = any>(
    path: string, 
    options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'GET',
      path,
    });
  }
  
  /**
   * Send a POST request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  async post<T = any>(
    path: string, 
    body?: any, 
    options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'POST',
      path,
      body,
    });
  }
  
  /**
   * Send a PUT request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  async put<T = any>(
    path: string, 
    body?: any, 
    options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'PUT',
      path,
      body,
    });
  }
  
  /**
   * Send a PATCH request
   * @param path Path or URL
   * @param body Request body
   * @param options Request options
   */
  async patch<T = any>(
    path: string, 
    body?: any, 
    options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'PATCH',
      path,
      body,
    });
  }
  
  /**
   * Send a DELETE request
   * @param path Path or URL
   * @param options Request options
   */
  async delete<T = any>(
    path: string, 
    options?: Omit<ApiRequestOptions<T>, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...options,
      method: 'DELETE',
      path,
    });
  }
  
  /**
   * Send a request with custom options
   * @param options Request options
   */
  async request<T = any>(options: ApiRequestOptions<T>): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      url,
      path,
      body,
      headers = {},
      params,
      cache,
      timeout = this.config.defaultTimeout,
      credentials = this.config.defaultCredentials,
      responseTransformer,
      retry = this.config.retry,
      maxRetries = this.config.maxRetries || 3,
      authenticated = false,
    } = options;
    
    // Build the final URL
    let finalUrl: string;
    if (url) {
      finalUrl = url;
    } else if (path) {
      finalUrl = createUrl(this.config.baseUrl, path);
    } else {
      throw createApiError('Either url or path must be provided', undefined, undefined, false, false);
    }
    
    finalUrl = buildUrlWithParams(finalUrl, params);
    
    // Create a unique request ID for this request (for abort controller and retry tracking)
    const requestId = `${method}:${finalUrl}:${Date.now()}`;
    
    // Set up the abort controller for request timeout
    const abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    if (timeout) {
      timeoutId = setTimeout(() => {
        abortController.abort();
        this.abortControllers.delete(requestId);
        if (timeoutId) clearTimeout(timeoutId);
      }, timeout);
    }
    
    this.abortControllers.set(requestId, abortController);
    
    // Check cache first if cache-first strategy is enabled
    const cacheEnabled = !!(cache && 'caches' in window);
    const cacheStrategy = cache?.strategy || this.config.defaultCacheStrategy;
    const cacheName = cache?.cacheName || this.config.defaultCacheName;
    
    if (cacheEnabled && cacheStrategy === 'cache-first' && method === 'GET') {
      try {
        const cachedResponse = await this.getFromCache(finalUrl, cacheName);
        
        if (cachedResponse) {
          // Check if the cache entry has expired
          const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
          const now = new Date();
          const cacheAge = now.getTime() - cachedDate.getTime();
          const cacheTtl = cache.ttl || this.config.defaultCacheTtl || 3600000;
          
          if (cacheAge < cacheTtl && !cache.forceRefresh) {
            // Cache is valid, return it
            const data = await this.parseResponseData(cachedResponse.clone(), responseTransformer);
            
            // Clean up
            if (timeoutId) clearTimeout(timeoutId);
            this.abortControllers.delete(requestId);
            
            return {
              data,
              status: cachedResponse.status,
              headers: cachedResponse.headers,
              fromCache: true,
              response: cachedResponse,
            };
          }
        }
      } catch (error) {
        console.warn('Error retrieving from cache:', error);
        // Continue to network request
      }
    }
    
    // Prepare request headers
    const requestHeaders: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...headers,
    };
    
    // Add authentication if needed
    if (authenticated && this.config.getAuthToken) {
      const token = await this.config.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials,
      signal: abortController.signal,
    };
    
    // Add body for non-GET requests
    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    try {
      // Make the network request
      const response = await fetch(finalUrl, fetchOptions);
      
      // Store in cache if successful
      if (cacheEnabled && response.ok && method === 'GET') {
        try {
          await this.storeInCache(finalUrl, response.clone(), cacheName);
        } catch (error) {
          console.warn('Error storing response in cache:', error);
        }
      }
      
      // Check if the response is successful
      if (!response.ok) {
        let errorData;
        try {
          // Try to parse error data as JSON
          errorData = await response.json();
        } catch (e) {
          // If parsing fails, use text or status text
          try {
            errorData = await response.text();
          } catch (e2) {
            errorData = response.statusText;
          }
        }
        
        // Handle retrying if enabled
        if (retry && this.shouldRetry(response.status) && maxRetries > 0) {
          // Clean up the current request
          if (timeoutId) clearTimeout(timeoutId);
          this.abortControllers.delete(requestId);
          
          // Schedule a retry
          return new Promise((resolve, reject) => {
            const retryTimeout = setTimeout(() => {
              this.retryTimeouts.delete(requestId);
              
              // Retry with decremented maxRetries
              this.request<T>({
                ...options,
                maxRetries: maxRetries - 1,
              })
                .then(resolve)
                .catch(reject);
            }, this.getRetryDelay(maxRetries));
            
            this.retryTimeouts.set(requestId, retryTimeout);
          });
        }
        
        throw createApiError(
          `Request failed with status ${response.status}`,
          response.status,
          errorData,
          false,
          false,
          response
        );
      }
      
      // Parse response data
      const data = await this.parseResponseData(response.clone(), responseTransformer);
      
      // Clean up
      if (timeoutId) clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
      
      return {
        data,
        status: response.status,
        headers: response.headers,
        fromCache: false,
        response,
      };
    } catch (error: unknown) {
      // Clean up
      if (timeoutId) clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
      
      // Check if this was an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw createApiError(
          `Request timed out after ${timeout}ms`,
          undefined,
          undefined,
          false,
          true,
          undefined,
          error
        );
      }
      
      // Check if this was a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Handle retrying for network errors
        if (retry && maxRetries > 0) {
          return new Promise((resolve, reject) => {
            const retryTimeout = setTimeout(() => {
              this.retryTimeouts.delete(requestId);
              
              // Retry with decremented maxRetries
              this.request<T>({
                ...options,
                maxRetries: maxRetries - 1,
              })
                .then(resolve)
                .catch(reject);
            }, this.getRetryDelay(maxRetries));
            
            this.retryTimeouts.set(requestId, retryTimeout);
          });
        }
        
        throw createApiError(
          'Network error occurred',
          undefined,
          undefined,
          true,
          false,
          undefined,
          error
        );
      }
      
      // If it's already an ApiError, just rethrow it
      if (error instanceof Error && error.name === 'ApiError') {
        throw error;
      }
      
      // Otherwise wrap in an ApiError with a default message
      throw createApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        undefined,
        undefined,
        false,
        false,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Clear the cache for a specific URL or path
   * @param urlOrPath URL or path to clear from cache
   * @param cacheName Optional cache name
   */
  async clearCache(urlOrPath: string, cacheName?: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    const cacheToUse = cacheName || this.config.defaultCacheName || 'sdde-api-cache-v1';
    
    try {
      const finalUrl = urlOrPath.startsWith('http') 
        ? urlOrPath 
        : createUrl(this.config.baseUrl, urlOrPath);
      
      const cache = await caches.open(cacheToUse);
      await cache.delete(finalUrl);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }
  
  /**
   * Prefetch a URL or path and store in cache
   * @param urlOrPath URL or path to prefetch
   * @param options Prefetch options
   */
  async prefetch(urlOrPath: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    try {
      // Perform a GET request with cache-first strategy to ensure it's cached
      await this.get(urlOrPath, {
        ...options,
        cache: {
          strategy: 'network-only',
          cacheName: options?.cache?.cacheName || this.config.defaultCacheName || 'sdde-api-cache-v1',
          ttl: options?.cache?.ttl || this.config.defaultCacheTtl || 3600000,
          forceRefresh: true,
        }
      });
    } catch (error) {
      console.warn('Error prefetching URL:', error);
    }
  }
  
  /**
   * Determine if a request should be retried based on status code
   * @param status HTTP status code
   * @returns Whether the request should be retried
   */
  private shouldRetry(status: number): boolean {
    // Retry server errors (5xx) and certain client errors like rate limiting (429)
    return status >= 500 || status === 429;
  }
  
  /**
   * Get the delay before retrying a request
   * @param attempt Current retry attempt (0-based)
   * @returns Delay in milliseconds
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const maxRetries = this.config.maxRetries || 3;
    const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, maxRetries - attempt));
    
    // Add jitter (±20%) to prevent thundering herd
    const jitter = 0.2 * exponentialDelay;
    return exponentialDelay - jitter + Math.random() * (jitter * 2);
  }
  
  /**
   * Get a response from cache
   * @param url URL to retrieve
   * @param cacheName Cache name
   * @returns Cached response or null
   */
  private async getFromCache(url: string, cacheName?: string): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }
    
    try {
      const cache = await caches.open(cacheName || this.config.defaultCacheName || 'sdde-api-cache-v1');
      const response = await cache.match(url);
      return response || null;
    } catch (error) {
      console.warn('Error retrieving from cache:', error);
      return null;
    }
  }
  
  /**
   * Store a response in cache
   * @param url URL to cache
   * @param response Response to cache
   * @param cacheName Cache name
   */
  private async storeInCache(url: string, response: Response, cacheName?: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    try {
      const cache = await caches.open(cacheName || this.config.defaultCacheName || 'sdde-api-cache-v1');
      await cache.put(url, response);
    } catch (error) {
      console.warn('Error storing in cache:', error);
    }
  }
  
  /**
   * Parse response data and apply transformation if needed
   * @param response Response to parse
   * @param transformer Optional data transformer
   * @returns Parsed and transformed data
   */
  private async parseResponseData<T>(response: Response, transformer?: (data: any) => T): Promise<T> {
    let data: any;
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text();
    } else {
      // For binary data, return the response as is
      return response as any;
    }
    
    // Apply transformation if provided
    if (transformer) {
      return transformer(data);
    }
    
    return data;
  }
  
  /**
   * Cancel all ongoing requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => {
      controller.abort();
    });
    this.abortControllers.clear();
    
    this.retryTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.retryTimeouts.clear();
  }
  
  /**
   * Cancel a specific request
   * @param requestId Request ID to cancel
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
    
    const timeout = this.retryTimeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(requestId);
    }
  }
}

/**
 * Create a new API client with default configuration
 * @param config API client configuration
 * @returns API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClientImpl(config);
}

/**
 * Create a default API client for the application
 */
export const defaultApiClient = createApiClient({
  baseUrl: window.location.origin,
});

/**
 * Export the ApiError creator for use in other modules
 */
export { createApiError }; 