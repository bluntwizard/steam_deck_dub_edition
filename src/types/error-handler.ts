/**
 * ErrorHandler component type definitions
 */

/**
 * Error notification type options
 */
export type ErrorNotificationType = 'toast' | 'modal' | 'inline';

/**
 * Error metadata interface
 */
export interface ErrorMetadata {
  /**
   * Source file where the error occurred
   */
  source?: string;
  
  /**
   * Line number where the error occurred
   */
  line?: number;
  
  /**
   * Column number where the error occurred
   */
  column?: number;
  
  /**
   * Whether the error was unhandled
   */
  unhandled?: boolean;
  
  /**
   * Error type classification
   */
  type?: 'global' | 'promise' | 'component' | 'api' | 'custom' | string;
  
  /**
   * Component name if error occurred in a component
   */
  component?: string;
  
  /**
   * Additional custom metadata
   */
  [key: string]: any;
}

/**
 * Error record interface
 */
export interface ErrorRecord {
  /**
   * The original error object
   */
  error: Error;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error stack trace
   */
  stack?: string;
  
  /**
   * Timestamp when the error occurred
   */
  timestamp: Date;
  
  /**
   * Additional error metadata
   */
  metadata: ErrorMetadata & {
    /**
     * URL where the error occurred
     */
    url: string;
    
    /**
     * User agent information
     */
    userAgent: string;
  };
}

/**
 * Custom error messages configuration
 */
export interface ErrorMessages {
  /**
   * Default error message
   */
  default?: string;
  
  /**
   * Network error message
   */
  network?: string;
  
  /**
   * Authentication error message
   */
  auth?: string;
  
  /**
   * Permission error message
   */
  permission?: string;
  
  /**
   * Not found error message
   */
  notFound?: string;
  
  /**
   * Server error message
   */
  server?: string;
  
  /**
   * Custom error type messages
   */
  [key: string]: string | undefined;
}

/**
 * Error boundary configuration
 */
export interface ErrorBoundaryOptions {
  /**
   * Fallback UI component to render when an error occurs
   */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  
  /**
   * Whether to reset the error state when children change
   */
  resetOnPropsChange?: boolean;
  
  /**
   * Whether to log errors to the console
   */
  logErrors?: boolean;
  
  /**
   * Whether to include stack traces in the UI
   */
  showStackTrace?: boolean;
  
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  
  /**
   * Called when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error handler configuration options
 */
export interface ErrorHandlerOptions {
  /**
   * Whether to capture unhandled errors and promise rejections
   */
  captureGlobalErrors?: boolean;
  
  /**
   * Whether to log errors to console
   */
  logErrors?: boolean;
  
  /**
   * Whether to show error notifications
   */
  showNotifications?: boolean;
  
  /**
   * Error notification type
   */
  notificationType?: ErrorNotificationType;
  
  /**
   * Duration to show notifications in ms
   */
  notificationDuration?: number;
  
  /**
   * Whether to include stack traces in UI (for dev environments)
   */
  includeStackTrace?: boolean;
  
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error, metadata: ErrorMetadata) => void;
  
  /**
   * Custom error messages for specific error types
   */
  errorMessages?: ErrorMessages;
  
  /**
   * Maximum number of errors to keep in history
   */
  maxErrorHistory?: number;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
} 