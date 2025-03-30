import React from 'react';
import styles from './ErrorHandler.module.css';
import {
  ErrorHandlerOptions,
  ErrorMetadata,
  ErrorRecord,
  ErrorBoundaryOptions,
  ErrorNotificationType
} from '../../types/error-handler';

/**
 * ErrorHandler Component
 * Provides centralized error handling, logging, and user feedback for application errors
 */
export class ErrorHandler {
  private captureGlobalErrors: boolean;
  private logErrors: boolean;
  private showNotifications: boolean;
  private notificationType: ErrorNotificationType;
  private notificationDuration: number;
  private includeStackTrace: boolean;
  private onError: ((error: Error, metadata: ErrorMetadata) => void) | null;
  private errorMessages: Record<string, string>;
  private errorHistory: ErrorRecord[];
  private maxErrorHistory: number;
  private initialized: boolean;
  private originalWindowErrorHandler: OnErrorEventHandler | null;
  private originalPromiseRejectionHandler: ((event: PromiseRejectionEvent) => void) | null;
  private activeErrorModal: HTMLElement | null;
  private isDevelopment: boolean;

  /**
   * Create a new ErrorHandler
   * @param options - Configuration options
   */
  constructor(options: ErrorHandlerOptions = {}) {
    this.captureGlobalErrors = options.captureGlobalErrors !== false;
    this.logErrors = options.logErrors !== false;
    this.showNotifications = options.showNotifications !== false;
    this.notificationType = options.notificationType || 'toast';
    this.notificationDuration = options.notificationDuration || 5000;
    this.includeStackTrace = options.includeStackTrace || false;
    this.onError = options.onError || null;
    this.errorMessages = options.errorMessages || {};
    this.errorHistory = [];
    this.maxErrorHistory = options.maxErrorHistory || 10;
    this.initialized = false;
    this.originalWindowErrorHandler = null;
    this.originalPromiseRejectionHandler = null;
    this.activeErrorModal = null;
    
    // Determine if we're in development mode
    this.isDevelopment = 
      process?.env?.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the error handler
   * @returns This ErrorHandler instance for chaining
   */
  initialize(): ErrorHandler {
    if (this.initialized) {
      return this;
    }
    
    if (this.captureGlobalErrors) {
      this.setupGlobalErrorHandling();
    }
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Set up global error handlers for unhandled errors
   * @private
   */
  private setupGlobalErrorHandling(): void {
    // Save original handlers
    this.originalWindowErrorHandler = window.onerror;
    this.originalPromiseRejectionHandler = window.onunhandledrejection;
    
    // Set up window.onerror handler
    window.onerror = (message, source, line, column, error): boolean => {
      this.handleError(error || new Error(String(message)), {
        source,
        line,
        column,
        unhandled: true,
        type: 'global'
      });
      
      // Call original handler if it exists
      if (typeof this.originalWindowErrorHandler === 'function') {
        return this.originalWindowErrorHandler(message, source, line, column, error);
      }
      
      // Return true to prevent default browser error handling
      return true;
    };
    
    // Set up unhandled promise rejection handler
    window.onunhandledrejection = (event: PromiseRejectionEvent): void => {
      const error = event.reason instanceof Error ? 
        event.reason : 
        new Error(String(event.reason) || 'Unhandled Promise Rejection');
      
      this.handleError(error, {
        unhandled: true,
        type: 'promise'
      });
      
      // Call original handler if it exists
      if (typeof this.originalPromiseRejectionHandler === 'function') {
        this.originalPromiseRejectionHandler(event);
      }
    };
  }
  
  /**
   * Handle an error
   * @param error - The error object
   * @param metadata - Additional error metadata
   * @returns This ErrorHandler instance for chaining
   */
  handleError(error: Error, metadata: ErrorMetadata = {}): ErrorHandler {
    // Create error record with timestamp
    const errorRecord: ErrorRecord = {
      error,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };
    
    // Add to error history
    this.addToErrorHistory(errorRecord);
    
    // Log error if enabled
    if (this.logErrors) {
      this.logError(errorRecord);
    }
    
    // Show notification if enabled
    if (this.showNotifications) {
      this.showErrorNotification(errorRecord);
    }
    
    // Call onError callback if provided
    if (typeof this.onError === 'function') {
      try {
        this.onError(error, errorRecord.metadata);
      } catch (callbackError) {
        console.error('Error in error handler callback:', callbackError);
      }
    }
    
    return this;
  }
  
  /**
   * Log an error to the console
   * @param errorRecord - The error record
   * @private
   */
  private logError(errorRecord: ErrorRecord): void {
    console.group('ErrorHandler: Error Detected');
    console.error('Error:', errorRecord.error);
    console.info('Message:', errorRecord.message);
    console.info('Timestamp:', errorRecord.timestamp.toISOString());
    console.info('Metadata:', errorRecord.metadata);
    if (errorRecord.stack) {
      console.info('Stack Trace:', errorRecord.stack);
    }
    console.groupEnd();
  }
  
  /**
   * Add an error record to the error history
   * @param errorRecord - The error record to add
   * @private
   */
  private addToErrorHistory(errorRecord: ErrorRecord): void {
    this.errorHistory.unshift(errorRecord);
    
    // Trim history if it exceeds max size
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory);
    }
  }
  
  /**
   * Show an error notification based on the current notification type
   * @param errorRecord - The error record
   * @private
   */
  private showErrorNotification(errorRecord: ErrorRecord): void {
    // Get appropriate error message
    const message = this.getCustomErrorMessage(errorRecord.error) || 
                   this.formatErrorMessage(errorRecord.message);
    
    // Show notification based on type
    switch (this.notificationType) {
      case 'toast':
        this.showErrorToast(message, errorRecord);
        break;
      case 'modal':
        this.showErrorModal(message, errorRecord);
        break;
      case 'inline':
        this.showInlineError(message, errorRecord);
        break;
      default:
        this.showErrorToast(message, errorRecord);
    }
  }
  
  /**
   * Get custom error message based on error type
   * @param error - The error object
   * @returns The custom error message or null
   * @private
   */
  private getCustomErrorMessage(error: Error): string | null {
    // Check for network errors
    if (error.name === 'NetworkError' || 
      error.message.includes('network') || 
      error.message.includes('NetworkError') || 
      error.message.includes('Failed to fetch')) {
      return this.errorMessages.network || 'Network error occurred. Please check your connection.';
    }
    
    // Check for authentication errors
    if (error.name === 'AuthError' || 
      error.message.includes('authentication') || 
      error.message.includes('auth') || 
      error.message.includes('unauthorized') || 
      error.message.includes('401')) {
      return this.errorMessages.auth || 'Authentication error. Please sign in again.';
    }
    
    // Check for permission errors
    if (error.name === 'PermissionError' || 
      error.message.includes('permission') || 
      error.message.includes('forbidden') || 
      error.message.includes('403')) {
      return this.errorMessages.permission || 'You do not have permission to perform this action.';
    }
    
    // Check for not found errors
    if (error.name === 'NotFoundError' || 
      error.message.includes('not found') || 
      error.message.includes('404')) {
      return this.errorMessages.notFound || 'The requested resource was not found.';
    }
    
    // Check for server errors
    if (error.name === 'ServerError' || 
      error.message.includes('server') || 
      error.message.includes('500')) {
      return this.errorMessages.server || 'A server error occurred. Please try again later.';
    }
    
    // Return the default error message if specified
    if (this.errorMessages.default) {
      return this.errorMessages.default;
    }
    
    // No custom message found
    return null;
  }
  
  /**
   * Format an error message for display
   * @param message - The raw error message
   * @returns Formatted error message
   * @private
   */
  private formatErrorMessage(message: string): string {
    // Remove common prefixes
    let formatted = message
      .replace(/^Error:\s*/i, '')
      .replace(/^Exception:\s*/i, '')
      .replace(/^Uncaught\s*/i, '')
      .trim();
      
    // Capitalize first letter if needed
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    return formatted || 'An unknown error occurred.';
  }
  
  /**
   * Show an error toast notification
   * @param message - The error message
   * @param errorRecord - The error record
   * @private
   */
  private showErrorToast(message: string, errorRecord: ErrorRecord): void {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('error-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'error-toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.left = '20px';
      toastContainer.style.zIndex = '10000';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = styles.errorToast;
    toast.innerHTML = `
      <div class="${styles.errorIcon}">⚠️</div>
      <div class="${styles.errorContent}">
        <p class="${styles.errorMessage}">${message}</p>
        ${this.includeStackTrace && this.isDevelopment && errorRecord.stack ? `
          <details class="${styles.errorDetails}">
            <summary>View Details</summary>
            <pre>${errorRecord.stack}</pre>
          </details>
        ` : ''}
      </div>
      <button class="${styles.closeButton}" aria-label="Close">×</button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Add close button event listener
    const closeButton = toast.querySelector(`.${styles.closeButton}`);
    closeButton?.addEventListener('click', () => this.removeToast(toast));
    
    // Show toast with animation
    setTimeout(() => {
      toast.classList.add(styles.visible);
    }, 10);
    
    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(toast);
    }, this.notificationDuration);
  }
  
  /**
   * Remove a toast element
   * @param toast - The toast element to remove
   * @private
   */
  private removeToast(toast: HTMLElement): void {
    toast.classList.remove(styles.visible);
    
    // Remove after animation completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // Remove container if empty
      const container = document.getElementById('error-toast-container');
      if (container && container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  }
  
  /**
   * Show an error modal
   * @param message - The error message
   * @param errorRecord - The error record
   * @private
   */
  private showErrorModal(message: string, errorRecord: ErrorRecord): void {
    // Remove existing modal if present
    if (this.activeErrorModal) {
      this.removeErrorModal();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = styles.errorModal;
    modal.innerHTML = `
      <div class="${styles.errorModalContent}">
        <div class="${styles.errorModalHeader}">
          <h2>Error Occurred</h2>
          <button class="${styles.closeButton}" aria-label="Close">×</button>
        </div>
        <div class="${styles.errorModalBody}">
          <div class="${styles.errorIcon}">⚠️</div>
          <p class="${styles.errorMessage}">${message}</p>
          ${this.includeStackTrace && this.isDevelopment && errorRecord.stack ? `
            <details class="${styles.errorDetails}">
              <summary>Technical Details</summary>
              <pre>${errorRecord.stack}</pre>
            </details>
          ` : ''}
        </div>
        <div class="${styles.errorModalFooter}">
          <button class="${styles.reloadButton}">Reload Page</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    this.activeErrorModal = modal;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    const closeButton = modal.querySelector(`.${styles.closeButton}`);
    closeButton?.addEventListener('click', () => this.removeErrorModal());
    
    const reloadButton = modal.querySelector(`.${styles.reloadButton}`);
    reloadButton?.addEventListener('click', () => window.location.reload());
    
    // Show modal with animation
    setTimeout(() => {
      modal.classList.add(styles.visible);
    }, 10);
  }
  
  /**
   * Remove the active error modal
   * @private
   */
  private removeErrorModal(): void {
    if (!this.activeErrorModal) return;
    
    this.activeErrorModal.classList.remove(styles.visible);
    
    // Remove after animation completes
    setTimeout(() => {
      if (this.activeErrorModal && this.activeErrorModal.parentNode) {
        this.activeErrorModal.parentNode.removeChild(this.activeErrorModal);
      }
      this.activeErrorModal = null;
      
      // Restore body scrolling
      document.body.style.overflow = '';
    }, 300);
  }
  
  /**
   * Show an inline error
   * @param message - The error message
   * @param errorRecord - The error record
   * @private
   */
  private showInlineError(message: string, errorRecord: ErrorRecord): void {
    // Look for an error container
    const errorContainer = document.querySelector('[data-error-container]') || 
                          document.getElementById('error-container');
    
    if (!errorContainer) {
      // If no container, fall back to toast notification
      this.showErrorToast(message, errorRecord);
      return;
    }
    
    // Create inline error element
    const inlineError = document.createElement('div');
    inlineError.className = styles.inlineError;
    inlineError.innerHTML = `
      <div class="${styles.errorIcon}">⚠️</div>
      <p class="${styles.errorMessage}">${message}</p>
      <button class="${styles.closeButton}" aria-label="Close">×</button>
    `;
    
    // Add to container
    errorContainer.appendChild(inlineError);
    
    // Add close button event listener
    const closeButton = inlineError.querySelector(`.${styles.closeButton}`);
    closeButton?.addEventListener('click', () => {
      inlineError.classList.remove(styles.visible);
      
      // Remove after animation completes
      setTimeout(() => {
        if (inlineError.parentNode) {
          inlineError.parentNode.removeChild(inlineError);
        }
      }, 300);
    });
    
    // Show with animation
    setTimeout(() => {
      inlineError.classList.add(styles.visible);
    }, 10);
    
    // Auto remove after duration
    setTimeout(() => {
      if (inlineError.parentNode) {
        inlineError.classList.remove(styles.visible);
        
        // Remove after animation completes
        setTimeout(() => {
          if (inlineError.parentNode) {
            inlineError.parentNode.removeChild(inlineError);
          }
        }, 300);
      }
    }, this.notificationDuration);
  }
  
  /**
   * Get the error history
   * @returns Array of error records
   */
  getErrorHistory(): ErrorRecord[] {
    return [...this.errorHistory];
  }
  
  /**
   * Clear the error history
   * @returns This ErrorHandler instance for chaining
   */
  clearErrorHistory(): ErrorHandler {
    this.errorHistory = [];
    return this;
  }
  
  /**
   * Wrap a function with error handling
   * @param fn - The function to wrap
   * @param metadata - Additional error metadata
   * @returns Wrapped function
   */
  wrapWithErrorHandling<T extends (...args: any[]) => any>(
    fn: T, 
    metadata: ErrorMetadata = {}
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), metadata);
        throw error; // Re-throw to maintain original behavior
      }
    };
  }
  
  /**
   * Create a React error boundary component
   * @param options - Error boundary options
   * @returns Error boundary component
   */
  createErrorBoundary(options: ErrorBoundaryOptions = {}): React.ComponentClass {
    const errorHandler = this;
    
    return class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
        this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
      }
      
      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error
        if (options.logErrors !== false) {
          errorHandler.handleError(error, { 
            type: 'component', 
            componentStack: errorInfo.componentStack 
          });
        }
        
        // Call onError if provided
        if (typeof options.onError === 'function') {
          options.onError(error, errorInfo);
        }
      }
      
      componentDidUpdate(prevProps: { children: React.ReactNode }) {
        // Reset error state if children change and resetOnPropsChange is true
        if (options.resetOnPropsChange && this.state.hasError && prevProps.children !== this.props.children) {
          this.resetErrorBoundary();
        }
      }
      
      resetErrorBoundary() {
        this.setState({ hasError: false, error: null });
      }
      
      render() {
        if (this.state.hasError) {
          // Render fallback UI if an error occurred
          if (options.fallback) {
            if (typeof options.fallback === 'function' && this.state.error) {
              return options.fallback(this.state.error, this.resetErrorBoundary);
            }
            return options.fallback;
          }
          
          // Default error UI
          return (
            <div className={styles.errorBoundary}>
              <h3>{options.errorMessage || 'Something went wrong'}</h3>
              {options.showStackTrace && errorHandler.isDevelopment && this.state.error && (
                <details>
                  <summary>Error Details</summary>
                  <pre>{this.state.error.stack}</pre>
                </details>
              )}
              <button onClick={this.resetErrorBoundary}>Try Again</button>
            </div>
          );
        }
        
        return this.props.children;
      }
    };
  }
  
  /**
   * Destroy the error handler and clean up
   */
  destroy(): void {
    // Restore original error handlers
    if (this.originalWindowErrorHandler !== null) {
      window.onerror = this.originalWindowErrorHandler;
    }
    
    if (this.originalPromiseRejectionHandler !== null) {
      window.onunhandledrejection = this.originalPromiseRejectionHandler;
    }
    
    // Remove any active error UI
    if (this.activeErrorModal) {
      this.removeErrorModal();
    }
    
    // Clear error history
    this.errorHistory = [];
    
    // Mark as uninitialized
    this.initialized = false;
  }
} 