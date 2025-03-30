/**
 * Grimoire
 * Error Handling Utility Functions
 */

import { ErrorMetadata } from '../../types/error-handler';

/**
 * Error types that can be used for classifying errors
 */
export enum ErrorType {
  API = 'API_ERROR',
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTH = 'AUTH_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNEXPECTED = 'UNEXPECTED_ERROR'
}

/**
 * Extended Error class with additional properties
 */
export class AppError extends Error {
  /**
   * Error type classification
   */
  public type: ErrorType;

  /**
   * HTTP status code (for API errors)
   */
  public statusCode?: number;

  /**
   * Additional error metadata
   */
  public metadata: ErrorMetadata;

  /**
   * Original error that caused this error
   */
  public originalError?: Error;

  /**
   * Create a new AppError
   * @param message - Error message
   * @param type - Error type
   * @param metadata - Additional error metadata
   * @param originalError - Original error that caused this error
   */
  constructor(
    message: string,
    type: ErrorType = ErrorType.UNEXPECTED,
    metadata: ErrorMetadata = {},
    originalError?: Error
  ) {
    super(message);

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;
    this.type = type;
    this.metadata = metadata;
    this.originalError = originalError;

    // Extract status code from API errors
    if (type === ErrorType.API && originalError && 'status' in originalError) {
      this.statusCode = (originalError as any).status;
    }

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for API-related failures
 */
export class ApiError extends AppError {
  constructor(message: string, statusCode?: number, metadata: ErrorMetadata = {}, originalError?: Error) {
    super(message, ErrorType.API, { ...metadata, statusCode }, originalError);
    this.statusCode = statusCode;
  }
}

/**
 * Error for network-related failures
 */
export class NetworkError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}, originalError?: Error) {
    super(message, ErrorType.NETWORK, metadata, originalError);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  /**
   * Validation errors by field
   */
  public validationErrors: Record<string, string> = {};

  constructor(
    message: string,
    validationErrors: Record<string, string> = {},
    metadata: ErrorMetadata = {},
    originalError?: Error
  ) {
    super(message, ErrorType.VALIDATION, metadata, originalError);
    this.validationErrors = validationErrors;
  }
}

/**
 * Error for authentication failures
 */
export class AuthError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}, originalError?: Error) {
    super(message, ErrorType.AUTH, metadata, originalError);
  }
}

/**
 * Convert an unknown error to an AppError
 * @param error - The error to convert
 * @param defaultMessage - Default message if error is not an Error object
 * @returns AppError instance
 */
export function toAppError(error: unknown, defaultMessage = 'An unknown error occurred'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorType.UNEXPECTED,
      {},
      error
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(
      error,
      ErrorType.UNEXPECTED,
      {}
    );
  }

  return new AppError(
    typeof error === 'string' ? error : 'An unexpected error occurred',
    ErrorType.UNEXPECTED,
    {
      originalValue: error
    }
  );
}

/**
 * Determine if an error is a network error
 * @param error - The error to check
 * @returns True if the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError && error.type === ErrorType.NETWORK) {
    return true;
  }

  // Check for fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Determine if an error is an API error with a specific status code
 * @param error - The error to check
 * @param statusCode - The status code to check for (optional)
 * @returns True if the error is an API error with the specified status code
 */
export function isApiError(error: unknown, statusCode?: number): boolean {
  if (error instanceof ApiError) {
    return statusCode ? error.statusCode === statusCode : true;
  }

  return false;
}

/**
 * Add context to an existing error
 * @param error - The original error
 * @param context - Additional context to add
 * @returns A new AppError with the added context
 */
export function enrichError(error: Error, context: Record<string, unknown>): AppError {
  const appError = toAppError(error);
  
  // Merge the new context with existing metadata
  appError.metadata = {
    ...appError.metadata,
    ...context
  };

  return appError;
}

/**
 * Create a function wrapper that catches errors and passes them through a handler
 * @param fn - The function to wrap
 * @param errorHandler - Function to handle any errors thrown
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler: (error: Error, ...args: Parameters<T>) => ReturnType<T> | Promise<ReturnType<T>>
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      return errorHandler(toAppError(error), ...args);
    }
  };
}

/**
 * Create a validation error with field-specific errors
 * @param message - Overall error message
 * @param fieldErrors - Map of field names to error messages
 * @returns ValidationError
 */
export function createAppValidationError(
  message: string,
  fieldErrors: Record<string, string> = {}
): ValidationError {
  return new ValidationError(message, fieldErrors);
}

/**
 * Safely stringify an error object for logging
 * @param error - The error to stringify
 * @returns JSON string representation of the error
 */
export function stringifyError(error: unknown): string {
  try {
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError ? { 
          type: error.type,
          metadata: error.metadata,
          statusCode: error.statusCode,
          validationErrors: error instanceof ValidationError ? error.validationErrors : undefined
        } : {})
      });
    }
    
    return JSON.stringify(error);
  } catch (e) {
    return `Could not stringify error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/**
 * Log an error with consistent formatting
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context: Record<string, unknown> = {}): void {
  const appError = toAppError(error);
  
  console.group('Application Error');
  console.error('Error:', appError);
  console.info('Message:', appError.message);
  console.info('Type:', appError.type);
  
  if (Object.keys(appError.metadata).length > 0) {
    console.info('Metadata:', appError.metadata);
  }
  
  if (Object.keys(context).length > 0) {
    console.info('Context:', context);
  }
  
  if (appError.originalError && appError.originalError !== appError) {
    console.info('Original Error:', appError.originalError);
  }
  
  if (appError.stack) {
    console.info('Stack Trace:', appError.stack);
  }
  
  console.groupEnd();
}

/**
 * Get a user-friendly error message from an error
 * @param error - The error to get a message from
 * @param defaultMessage - Default message if one cannot be determined
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  const appError = toAppError(error);
  
  // Use error message if it's not a generic message
  if (appError.message && 
      appError.message !== 'Error' && 
      !appError.message.includes('network error') &&
      appError.message !== 'An unknown error occurred') {
    return appError.message;
  }
  
  // Provide specific messages based on error type
  switch (appError.type) {
    case ErrorType.NETWORK:
      return 'Network connection failed. Please check your internet connection and try again.';
    case ErrorType.API:
      if (appError.statusCode === 401 || appError.statusCode === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (appError.statusCode === 404) {
        return 'The requested resource was not found.';
      }
      if (appError.statusCode && appError.statusCode >= 500) {
        return 'The server encountered an error. Please try again later.';
      }
      return 'There was a problem communicating with the server.';
    case ErrorType.VALIDATION:
      return 'Please check the form for errors and try again.';
    case ErrorType.AUTH:
      return 'Authentication failed. Please sign in again.';
    case ErrorType.TIMEOUT:
      return 'The operation timed out. Please try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    default:
      return defaultMessage;
  }
}

/**
 * Check if the error should be reported to analytics/monitoring
 * @param error - The error to check
 * @returns True if the error should be reported
 */
export function shouldReportError(error: unknown): boolean {
  const appError = toAppError(error);
  
  // Don't report validation errors
  if (appError.type === ErrorType.VALIDATION) {
    return false;
  }
  
  // Don't report authentication errors
  if (appError.type === ErrorType.AUTH) {
    return false;
  }
  
  // Don't report 404 errors
  if (appError.type === ErrorType.API && appError.statusCode === 404) {
    return false;
  }
  
  // Report all other errors
  return true;
}

/**
 * Handle an error with consistent behavior
 * @param error - The error to handle
 * @param options - Error handling options
 * @returns AppError for further processing
 */
export function handleError(
  error: unknown, 
  options: {
    log?: boolean;
    context?: Record<string, unknown>;
    rethrow?: boolean;
  } = {}
): AppError {
  const { log = true, context = {}, rethrow = false } = options;
  const appError = toAppError(error);
  
  // Log the error if requested
  if (log) {
    logError(appError, context);
  }
  
  // Rethrow if requested
  if (rethrow) {
    throw appError;
  }
  
  return appError;
} 