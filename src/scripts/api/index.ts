/**
 * API Module - Index
 * Grimoire Guide
 * 
 * This module provides a central API client for making HTTP requests with advanced caching.
 */

export { 
  createApiClient, 
  defaultApiClient, 
  createApiError 
} from './api-client';

// Re-export the types for convenient access
export type {
  ApiClient,
  ApiClientConfig,
  ApiError,
  ApiRequestOptions,
  ApiResponse,
  CacheOptions,
  CacheStrategy,
  HttpMethod
} from '../../types/api-client'; 