import styles from './ErrorHandler.module.css';

/**
 * ErrorHandler Component
 * Provides centralized error handling, logging, and user feedback for application errors
 */
export class ErrorHandler {
  /**
   * Create a new ErrorHandler
   * @param {Object} options - Configuration options
   * @param {boolean} [options.captureGlobalErrors=true] - Whether to capture unhandled errors and promise rejections
   * @param {boolean} [options.logErrors=true] - Whether to log errors to console
   * @param {boolean} [options.showNotifications=true] - Whether to show error notifications 
   * @param {string} [options.notificationType='toast'] - Error notification type ('toast', 'modal', 'inline')
   * @param {Object} [options.notificationDuration=5000] - Duration to show notifications in ms
   * @param {boolean} [options.includeStackTrace=false] - Whether to include stack traces in UI (for dev environments)
   * @param {Function} [options.onError] - Callback when an error occurs, receives the error and metadata
   * @param {Object} [options.errorMessages] - Custom error messages for specific error types
   * @param {boolean} [options.autoInit=true] - Whether to initialize automatically
   */
  constructor(options = {}) {
    /**
     * Whether to capture unhandled errors and promise rejections
     * @type {boolean}
     * @private
     */
    this.captureGlobalErrors = options.captureGlobalErrors !== false;
    
    /**
     * Whether to log errors to console
     * @type {boolean}
     * @private
     */
    this.logErrors = options.logErrors !== false;
    
    /**
     * Whether to show error notifications
     * @type {boolean}
     * @private
     */
    this.showNotifications = options.showNotifications !== false;
    
    /**
     * Error notification type
     * @type {string}
     * @private
     */
    this.notificationType = options.notificationType || 'toast';
    
    /**
     * Duration to show notifications in ms
     * @type {number}
     * @private
     */
    this.notificationDuration = options.notificationDuration || 5000;
    
    /**
     * Whether to include stack traces in UI (for dev environments)
     * @type {boolean}
     * @private
     */
    this.includeStackTrace = options.includeStackTrace || false;
    
    /**
     * Error callback
     * @type {Function|null}
     * @private
     */
    this.onError = options.onError || null;
    
    /**
     * Custom error messages for specific error types
     * @type {Object}
     * @private
     */
    this.errorMessages = options.errorMessages || {};
    
    /**
     * List of recent errors
     * @type {Array}
     * @private
     */
    this.errorHistory = [];
    
    /**
     * Maximum number of errors to keep in history
     * @type {number}
     * @private
     */
    this.maxErrorHistory = options.maxErrorHistory || 10;
    
    /**
     * Whether the error handler is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Original window error handler
     * @type {Function|null}
     * @private
     */
    this.originalWindowErrorHandler = null;
    
    /**
     * Original promise rejection handler
     * @type {Function|null}
     * @private
     */
    this.originalPromiseRejectionHandler = null;
    
    /**
     * Current active error modal
     * @type {HTMLElement|null}
     * @private
     */
    this.activeErrorModal = null;
    
    /**
     * Whether we're in development mode
     * @type {boolean}
     * @private
     */
    this.isDevelopment = process?.env?.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the error handler
   * @returns {ErrorHandler} This ErrorHandler instance for chaining
   */
  initialize() {
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
  setupGlobalErrorHandling() {
    // Save original handlers
    this.originalWindowErrorHandler = window.onerror;
    this.originalPromiseRejectionHandler = window.onunhandledrejection;
    
    // Set up window.onerror handler
    window.onerror = (message, source, line, column, error) => {
      this.handleError(error || new Error(message), {
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
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? 
        event.reason : 
        new Error(event.reason || 'Unhandled Promise Rejection');
      
      this.handleError(error, {
        unhandled: true,
        type: 'promise'
      });
      
      // Call original handler if it exists
      if (typeof this.originalPromiseRejectionHandler === 'function') {
        return this.originalPromiseRejectionHandler(event);
      }
    };
  }
  
  /**
   * Handle an error
   * @param {Error} error - The error object
   * @param {Object} [metadata={}] - Additional error metadata
   * @returns {ErrorHandler} This ErrorHandler instance for chaining
   */
  handleError(error, metadata = {}) {
    // Create error record with timestamp
    const errorRecord = {
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
   * @param {Object} errorRecord - The error record
   * @private
   */
  logError(errorRecord) {
    console.group('ErrorHandler: Error Detected');
    console.error('Error:', errorRecord.error);
    console.info('Message:', errorRecord.message);
    
    if (errorRecord.metadata && Object.keys(errorRecord.metadata).length > 0) {
      console.info('Metadata:', errorRecord.metadata);
    }
    
    if (errorRecord.stack) {
      console.debug('Stack Trace:', errorRecord.stack);
    }
    
    console.groupEnd();
  }
  
  /**
   * Add an error to the error history
   * @param {Object} errorRecord - The error record
   * @private
   */
  addToErrorHistory(errorRecord) {
    this.errorHistory.unshift(errorRecord);
    
    // Trim history if it exceeds max size
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory);
    }
  }
  
  /**
   * Show an error notification
   * @param {Object} errorRecord - The error record
   * @private
   */
  showErrorNotification(errorRecord) {
    const { error, message } = errorRecord;
    
    // Get custom message for this error type if available
    const customMessage = this.getCustomErrorMessage(error);
    const displayMessage = customMessage || this.formatErrorMessage(message);
    
    switch (this.notificationType) {
      case 'modal':
        this.showErrorModal(displayMessage, errorRecord);
        break;
        
      case 'inline':
        this.showInlineError(displayMessage, errorRecord);
        break;
        
      case 'toast':
      default:
        this.showErrorToast(displayMessage, errorRecord);
        break;
    }
  }
  
  /**
   * Get a custom error message for a specific error type
   * @param {Error} error - The error object
   * @returns {string|null} Custom message or null
   * @private
   */
  getCustomErrorMessage(error) {
    // Check if we have a custom message for this error constructor name
    if (error.constructor && error.constructor.name) {
      const customMessage = this.errorMessages[error.constructor.name];
      if (customMessage) {
        return customMessage;
      }
    }
    
    // Check for custom messages based on error code
    if (error.code && this.errorMessages[error.code]) {
      return this.errorMessages[error.code];
    }
    
    // Check for custom messages based on pattern matching
    for (const [pattern, message] of Object.entries(this.errorMessages)) {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        // This is a regex pattern
        const regex = new RegExp(pattern.slice(1, -1));
        if (regex.test(error.message)) {
          return message;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Format an error message for display
   * @param {string} message - The raw error message
   * @returns {string} Formatted message
   * @private
   */
  formatErrorMessage(message) {
    // Remove common prefixes
    let formatted = message
      .replace(/^Error: /, '')
      .trim();
    
    // Capitalize first letter if needed
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    return formatted;
  }
  
  /**
   * Show a toast notification for an error
   * @param {string} message - The error message
   * @param {Object} errorRecord - The error record
   * @private
   */
  showErrorToast(message, errorRecord) {
    // Try to use existing NotificationSystem if available
    if (window.NotificationSystem) {
      try {
        window.NotificationSystem.show({
          message,
          type: 'error',
          duration: this.notificationDuration,
          data: { errorRecord }
        });
        return;
      } catch (e) {
        console.warn('Failed to use NotificationSystem:', e);
        // Fall back to creating our own notification
      }
    }
    
    // Create notification element
    const toast = document.createElement('div');
    toast.className = styles.errorToast;
    toast.setAttribute('role', 'alert');
    
    // Create content
    toast.innerHTML = `
      <div class="${styles.errorIcon}">⚠️</div>
      <div class="${styles.errorContent}">
        <div class="${styles.errorMessage}">${message}</div>
        ${this.includeStackTrace && errorRecord.stack ? 
          `<details class="${styles.errorDetails}">
            <summary>Details</summary>
            <pre>${errorRecord.stack}</pre>
          </details>` : ''
        }
      </div>
      <button class="${styles.closeButton}" aria-label="Close">×</button>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Add close button functionality
    const closeButton = toast.querySelector(`.${styles.closeButton}`);
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeToast(toast);
      });
    }
    
    // Show the toast (add visible class in next frame to trigger animation)
    setTimeout(() => {
      toast.classList.add(styles.visible);
    }, 10);
    
    // Auto-hide after duration
    setTimeout(() => {
      this.removeToast(toast);
    }, this.notificationDuration);
  }
  
  /**
   * Remove a toast notification
   * @param {HTMLElement} toast - The toast element
   * @private
   */
  removeToast(toast) {
    toast.classList.remove(styles.visible);
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // Match transition duration in CSS
  }
  
  /**
   * Show an error modal for a serious error
   * @param {string} message - The error message
   * @param {Object} errorRecord - The error record
   * @private
   */
  showErrorModal(message, errorRecord) {
    // Don't show multiple modals
    if (this.activeErrorModal) {
      return;
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = styles.errorModal;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'error-title');
    
    // Create content
    modal.innerHTML = `
      <div class="${styles.errorModalContent}">
        <div class="${styles.errorModalHeader}">
          <h2 id="error-title">Application Error</h2>
          <button class="${styles.closeButton}" aria-label="Close">×</button>
        </div>
        <div class="${styles.errorModalBody}">
          <div class="${styles.errorIcon}">⚠️</div>
          <div class="${styles.errorMessage}">${message}</div>
          ${this.includeStackTrace && errorRecord.stack ? 
            `<details class="${styles.errorDetails}">
              <summary>Technical Details</summary>
              <pre>${errorRecord.stack}</pre>
            </details>` : ''
          }
        </div>
        <div class="${styles.errorModalFooter}">
          <button class="${styles.reloadButton}">Reload Page</button>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    this.activeErrorModal = modal;
    
    // Add button event listeners
    const closeButton = modal.querySelector(`.${styles.closeButton}`);
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeErrorModal();
      });
    }
    
    const reloadButton = modal.querySelector(`.${styles.reloadButton}`);
    if (reloadButton) {
      reloadButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
    
    // Show the modal (add visible class in next frame to trigger animation)
    setTimeout(() => {
      modal.classList.add(styles.visible);
    }, 10);
  }
  
  /**
   * Remove the active error modal
   * @private
   */
  removeErrorModal() {
    if (!this.activeErrorModal) {
      return;
    }
    
    this.activeErrorModal.classList.remove(styles.visible);
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (this.activeErrorModal && this.activeErrorModal.parentNode) {
        this.activeErrorModal.parentNode.removeChild(this.activeErrorModal);
      }
      this.activeErrorModal = null;
    }, 300); // Match transition duration in CSS
  }
  
  /**
   * Show an inline error near a specific element
   * @param {string} message - The error message
   * @param {Object} errorRecord - The error record
   * @private
   */
  showInlineError(message, errorRecord) {
    // If metadata includes a targetElement or targetSelector, show inline error there
    const { metadata } = errorRecord;
    let targetElement = null;
    
    if (metadata.targetElement && metadata.targetElement instanceof HTMLElement) {
      targetElement = metadata.targetElement;
    } else if (metadata.targetSelector) {
      targetElement = document.querySelector(metadata.targetSelector);
    }
    
    if (!targetElement) {
      // Fall back to toast if we don't have a target element
      this.showErrorToast(message, errorRecord);
      return;
    }
    
    // Check if an inline error already exists for this element
    const existingError = targetElement.querySelector(`.${styles.inlineError}`);
    if (existingError) {
      // Update the existing error message
      const messageEl = existingError.querySelector(`.${styles.errorMessage}`);
      if (messageEl) {
        messageEl.textContent = message;
      }
      return;
    }
    
    // Create inline error element
    const inlineError = document.createElement('div');
    inlineError.className = styles.inlineError;
    inlineError.setAttribute('role', 'alert');
    
    // Create content
    inlineError.innerHTML = `
      <div class="${styles.errorIcon}">⚠️</div>
      <div class="${styles.errorMessage}">${message}</div>
      <button class="${styles.closeButton}" aria-label="Close">×</button>
    `;
    
    // Add to DOM after the target element
    targetElement.parentNode.insertBefore(inlineError, targetElement.nextSibling);
    
    // Add close button functionality
    const closeButton = inlineError.querySelector(`.${styles.closeButton}`);
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        if (inlineError.parentNode) {
          inlineError.parentNode.removeChild(inlineError);
        }
      });
    }
    
    // Show the inline error (add visible class in next frame to trigger animation)
    setTimeout(() => {
      inlineError.classList.add(styles.visible);
    }, 10);
    
    // Auto-remove after duration if specified
    if (this.notificationDuration > 0) {
      setTimeout(() => {
        if (inlineError.parentNode) {
          inlineError.classList.remove(styles.visible);
          setTimeout(() => {
            if (inlineError.parentNode) {
              inlineError.parentNode.removeChild(inlineError);
            }
          }, 300); // Match transition duration in CSS
        }
      }, this.notificationDuration);
    }
  }
  
  /**
   * Get the error history
   * @returns {Array} Array of error records
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }
  
  /**
   * Clear the error history
   * @returns {ErrorHandler} This ErrorHandler instance for chaining
   */
  clearErrorHistory() {
    this.errorHistory = [];
    return this;
  }
  
  /**
   * Create a wrapped function that catches errors
   * @param {Function} fn - Function to wrap with error handling
   * @param {Object} [metadata={}] - Additional error metadata
   * @returns {Function} Wrapped function that catches errors
   */
  wrapWithErrorHandling(fn, metadata = {}) {
    return (...args) => {
      try {
        const result = fn(...args);
        
        // Check if the result is a promise
        if (result && typeof result.then === 'function') {
          return result.catch(error => {
            this.handleError(error, {
              ...metadata,
              args
            });
            throw error; // Re-throw the error for other handlers
          });
        }
        
        return result;
      } catch (error) {
        this.handleError(error, {
          ...metadata,
          args
        });
        throw error; // Re-throw the error for other handlers
      }
    };
  }
  
  /**
   * Create an error boundary component (React-inspired)
   * @param {Object} options - Error boundary options
   * @param {string} [options.fallbackContent='An error occurred.'] - Fallback content to display
   * @param {Function} [options.onError] - Error callback
   * @returns {Object} Error boundary methods
   */
  createErrorBoundary(options = {}) {
    const fallbackContent = options.fallbackContent || 'An error occurred.';
    const onError = options.onError || null;
    
    let hasError = false;
    let errorElement = null;
    
    return {
      /**
       * Wrap a function with error boundary
       * @param {Function} fn - Function to wrap
       * @returns {Function} Wrapped function
       */
      wrap: (fn) => {
        return (...args) => {
          if (hasError) {
            return errorElement;
          }
          
          try {
            return fn(...args);
          } catch (error) {
            hasError = true;
            
            // Create error element
            errorElement = document.createElement('div');
            errorElement.className = styles.errorBoundary;
            errorElement.setAttribute('role', 'alert');
            errorElement.innerHTML = fallbackContent;
            
            // Handle the error
            this.handleError(error, {
              type: 'boundary',
              args
            });
            
            if (typeof onError === 'function') {
              try {
                onError(error);
              } catch (callbackError) {
                console.error('Error in error boundary callback:', callbackError);
              }
            }
            
            return errorElement;
          }
        };
      },
      
      /**
       * Reset the error boundary
       */
      reset: () => {
        hasError = false;
        errorElement = null;
      }
    };
  }
  
  /**
   * Destroy the error handler and clean up
   */
  destroy() {
    // Restore original error handlers
    if (this.originalWindowErrorHandler !== null) {
      window.onerror = this.originalWindowErrorHandler;
    }
    
    if (this.originalPromiseRejectionHandler !== null) {
      window.onunhandledrejection = this.originalPromiseRejectionHandler;
    }
    
    // Remove any active UI elements
    if (this.activeErrorModal && this.activeErrorModal.parentNode) {
      this.activeErrorModal.parentNode.removeChild(this.activeErrorModal);
      this.activeErrorModal = null;
    }
    
    // Remove all toast notifications
    const toasts = document.querySelectorAll(`.${styles.errorToast}`);
    toasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    
    // Clear error history
    this.errorHistory = [];
    
    this.initialized = false;
  }
} 