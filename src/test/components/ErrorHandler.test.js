/**
 * Steam Deck DUB Edition
 * ErrorHandler Component Tests
 */

import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';

// Mock the CSS module
jest.mock('../../components/ErrorHandler/ErrorHandler.module.css', () => ({
  errorToast: 'errorToast-mock',
  visible: 'visible-mock',
  errorContent: 'errorContent-mock',
  errorIcon: 'errorIcon-mock',
  errorMessage: 'errorMessage-mock',
  errorDetails: 'errorDetails-mock',
  closeButton: 'closeButton-mock',
  inlineError: 'inlineError-mock',
  errorModal: 'errorModal-mock',
  errorModalContent: 'errorModalContent-mock',
  errorModalHeader: 'errorModalHeader-mock',
  errorModalBody: 'errorModalBody-mock',
  errorModalFooter: 'errorModalFooter-mock',
  reloadButton: 'reloadButton-mock',
  errorBoundary: 'errorBoundary-mock'
}));

describe('ErrorHandler', () => {
  let errorHandler;
  let container;
  let originalConsoleError;
  let originalConsoleWarn;
  let originalConsoleLog;
  let originalWindowOnerror;
  let originalWindowAddEventListener;

  beforeEach(() => {
    // Create a container for DOM testing
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock console methods
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
    
    // Mock window.onerror
    originalWindowOnerror = window.onerror;
    window.onerror = null;
    
    // Mock addEventListener
    originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn();
  });

  afterEach(() => {
    // Clean up
    if (errorHandler && typeof errorHandler.destroy === 'function') {
      errorHandler.destroy();
    }
    document.body.removeChild(container);
    
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    
    // Restore window.onerror
    window.onerror = originalWindowOnerror;
    
    // Restore addEventListener
    window.addEventListener = originalWindowAddEventListener;
    
    jest.clearAllMocks();
  });

  // Initialization Tests
  describe('Initialization', () => {
    test('should initialize with default options', () => {
      errorHandler = new ErrorHandler();
      expect(errorHandler).toBeDefined();
      expect(errorHandler.options.captureGlobalErrors).toBe(true);
      expect(errorHandler.options.logErrors).toBe(true);
      expect(errorHandler.options.showNotifications).toBe(true);
      expect(errorHandler.options.notificationType).toBe('toast');
      expect(errorHandler.errorHistory).toEqual([]);
    });

    test('should accept custom options', () => {
      const onErrorMock = jest.fn();
      errorHandler = new ErrorHandler({
        captureGlobalErrors: false,
        logErrors: false,
        showNotifications: false,
        notificationType: 'modal',
        notificationDuration: 5000,
        includeStackTrace: false,
        onError: onErrorMock,
        errorMessages: { default: 'Custom default error message' },
        autoInit: false
      });

      expect(errorHandler.options.captureGlobalErrors).toBe(false);
      expect(errorHandler.options.logErrors).toBe(false);
      expect(errorHandler.options.showNotifications).toBe(false);
      expect(errorHandler.options.notificationType).toBe('modal');
      expect(errorHandler.options.notificationDuration).toBe(5000);
      expect(errorHandler.options.includeStackTrace).toBe(false);
      expect(errorHandler.options.onError).toBe(onErrorMock);
      expect(errorHandler.options.errorMessages.default).toBe('Custom default error message');
      expect(errorHandler.options.autoInit).toBe(false);
    });

    test('should initialize automatically when autoInit is true', () => {
      const initSpy = jest.spyOn(ErrorHandler.prototype, 'initialize');
      errorHandler = new ErrorHandler({ autoInit: true });
      expect(initSpy).toHaveBeenCalled();
      initSpy.mockRestore();
    });

    test('should not initialize automatically when autoInit is false', () => {
      const initSpy = jest.spyOn(ErrorHandler.prototype, 'initialize');
      errorHandler = new ErrorHandler({ autoInit: false });
      expect(initSpy).not.toHaveBeenCalled();
      initSpy.mockRestore();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('should handle errors properly', () => {
      errorHandler = new ErrorHandler({
        showNotifications: false,
        container
      });
      
      const error = new Error('Test error');
      const handleErrorSpy = jest.spyOn(errorHandler, 'handleError');
      const logErrorSpy = jest.spyOn(errorHandler, 'logError');
      const addToHistorySpy = jest.spyOn(errorHandler, 'addToErrorHistory');
      
      errorHandler.handleError(error);
      
      expect(handleErrorSpy).toHaveBeenCalledWith(error);
      expect(logErrorSpy).toHaveBeenCalledWith(error);
      expect(addToHistorySpy).toHaveBeenCalledWith(error);
      expect(errorHandler.errorHistory.length).toBe(1);
      expect(errorHandler.errorHistory[0].message).toBe('Test error');
    });

    test('should use custom error messages when provided', () => {
      errorHandler = new ErrorHandler({
        showNotifications: false,
        errorMessages: {
          default: 'Default error message',
          ValidationError: 'Custom validation error message',
          NetworkError: 'Custom network error message'
        }
      });
      
      const validationError = new Error('ValidationError');
      validationError.name = 'ValidationError';
      
      const getErrorMessageSpy = jest.spyOn(errorHandler, 'getErrorMessage');
      
      // Test with a custom error type
      expect(errorHandler.getErrorMessage(validationError)).toBe('Custom validation error message');
      
      // Test with unknown error type (should use default)
      const unknownError = new Error('Unknown error');
      expect(errorHandler.getErrorMessage(unknownError)).toBe('Default error message');
      
      // Test with original message fallback
      errorHandler.options.errorMessages = {};
      expect(errorHandler.getErrorMessage(unknownError)).toBe('Unknown error');
      
      getErrorMessageSpy.mockRestore();
    });

    test('should call onError callback when provided', () => {
      const onErrorMock = jest.fn();
      errorHandler = new ErrorHandler({
        showNotifications: false,
        onError: onErrorMock
      });
      
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(onErrorMock).toHaveBeenCalledWith(error);
    });

    test('should wrap functions to catch errors', () => {
      errorHandler = new ErrorHandler({ showNotifications: false });
      
      const mockFunction = jest.fn().mockImplementation(() => {
        throw new Error('Function error');
      });
      
      const wrappedFunction = errorHandler.wrapWithErrorHandler(mockFunction);
      const handleErrorSpy = jest.spyOn(errorHandler, 'handleError');
      
      // Function should throw, but error should be caught
      wrappedFunction();
      
      expect(mockFunction).toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalled();
      expect(handleErrorSpy.mock.calls[0][0].message).toBe('Function error');
    });
  });

  // Global Error Handling Tests
  describe('Global Error Handling', () => {
    test('should set up global error handlers when initialized', () => {
      errorHandler = new ErrorHandler();
      
      // Check if window.onerror was set
      expect(typeof window.onerror).toBe('function');
      
      // Check if event listeners were added
      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function), true);
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function), true);
    });

    test('should handle global errors via window.onerror', () => {
      errorHandler = new ErrorHandler();
      const handleErrorSpy = jest.spyOn(errorHandler, 'handleError');
      
      // Simulate a global error
      window.onerror('Error message', 'test.js', 1, 1, new Error('Global error'));
      
      expect(handleErrorSpy).toHaveBeenCalled();
      expect(handleErrorSpy.mock.calls[0][0].message).toBe('Global error');
    });

    test('should remove global error handlers when destroyed', () => {
      errorHandler = new ErrorHandler();
      const originalOnerror = window.onerror;
      
      errorHandler.destroy();
      
      expect(window.onerror).toBeNull();
      expect(window.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  // Notification Tests
  describe('Error Notifications', () => {
    test('should show toast notification for errors', () => {
      const clock = jest.useFakeTimers();
      errorHandler = new ErrorHandler({
        notificationType: 'toast',
        notificationDuration: 3000,
        container
      });
      
      const error = new Error('Toast notification error');
      const showToastSpy = jest.spyOn(errorHandler, 'showToastNotification');
      
      errorHandler.handleError(error);
      
      expect(showToastSpy).toHaveBeenCalled();
      
      // Check if toast element was created
      const toast = document.querySelector('.errorToast-mock');
      expect(toast).not.toBeNull();
      expect(toast.querySelector('.errorMessage-mock').textContent).toBe('Toast notification error');
      
      // Check if toast is removed after duration
      clock.advanceTimersByTime(3000);
      expect(document.querySelector('.errorToast-mock')).toBeNull();
      
      showToastSpy.mockRestore();
      clock.clearAllTimers();
    });

    test('should show modal notification for errors', () => {
      errorHandler = new ErrorHandler({
        notificationType: 'modal',
        container
      });
      
      const error = new Error('Modal notification error');
      const showModalSpy = jest.spyOn(errorHandler, 'showModalNotification');
      
      errorHandler.handleError(error);
      
      expect(showModalSpy).toHaveBeenCalled();
      
      // Check if modal element was created
      const modal = document.querySelector('.errorModal-mock');
      expect(modal).not.toBeNull();
      expect(modal.querySelector('.errorMessage-mock').textContent).toBe('Modal notification error');
      
      // Simulate clicking reload button
      const reloadButton = modal.querySelector('.reloadButton-mock');
      expect(reloadButton).not.toBeNull();
      
      showModalSpy.mockRestore();
    });

    test('should show inline notification for errors', () => {
      const targetElement = document.createElement('div');
      container.appendChild(targetElement);
      
      errorHandler = new ErrorHandler({
        notificationType: 'inline',
        container
      });
      
      const error = new Error('Inline notification error');
      const showInlineSpy = jest.spyOn(errorHandler, 'showInlineNotification');
      
      errorHandler.handleError(error, { targetElement });
      
      expect(showInlineSpy).toHaveBeenCalled();
      
      // Check if inline error element was created
      const inlineError = targetElement.querySelector('.inlineError-mock');
      expect(inlineError).not.toBeNull();
      expect(inlineError.querySelector('.errorMessage-mock').textContent).toBe('Inline notification error');
      
      showInlineSpy.mockRestore();
    });
  });

  // Error Boundary Tests
  describe('Error Boundary', () => {
    test('should create error boundary elements', () => {
      errorHandler = new ErrorHandler({
        container
      });
      
      const targetElement = document.createElement('div');
      container.appendChild(targetElement);
      
      const error = new Error('Boundary error');
      errorHandler.createErrorBoundary(targetElement, error);
      
      // Check if error boundary was created
      const errorBoundary = targetElement.querySelector('.errorBoundary-mock');
      expect(errorBoundary).not.toBeNull();
      expect(errorBoundary.textContent).toContain('Boundary error');
    });
  });

  // Error History Tests
  describe('Error History', () => {
    test('should maintain error history', () => {
      errorHandler = new ErrorHandler({
        showNotifications: false
      });
      
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      
      errorHandler.handleError(error1);
      errorHandler.handleError(error2);
      
      expect(errorHandler.errorHistory.length).toBe(2);
      expect(errorHandler.errorHistory[0].message).toBe('First error');
      expect(errorHandler.errorHistory[1].message).toBe('Second error');
      
      // Test getErrorHistory
      const history = errorHandler.getErrorHistory();
      expect(history).toEqual(errorHandler.errorHistory);
      
      // Test clearErrorHistory
      errorHandler.clearErrorHistory();
      expect(errorHandler.errorHistory.length).toBe(0);
    });

    test('should limit error history size', () => {
      errorHandler = new ErrorHandler({
        showNotifications: false,
        maxHistorySize: 2
      });
      
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');
      
      errorHandler.handleError(error1);
      errorHandler.handleError(error2);
      errorHandler.handleError(error3);
      
      // Should only keep the most recent 2 errors
      expect(errorHandler.errorHistory.length).toBe(2);
      expect(errorHandler.errorHistory[0].message).toBe('Error 2');
      expect(errorHandler.errorHistory[1].message).toBe('Error 3');
    });
  });

  // Utility Functions Tests
  describe('Utility Functions', () => {
    test('should format error stack traces', () => {
      errorHandler = new ErrorHandler();
      
      const error = new Error('Stack trace error');
      const formattedStack = errorHandler.formatStackTrace(error);
      
      expect(typeof formattedStack).toBe('string');
      expect(formattedStack).toContain('Stack trace error');
    });

    test('should destroy properly', () => {
      errorHandler = new ErrorHandler({
        container
      });
      
      // Add some notifications to test cleanup
      errorHandler.handleError(new Error('Test error'));
      
      const destroySpy = jest.spyOn(errorHandler, 'destroy');
      errorHandler.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(errorHandler.errorHistory.length).toBe(0);
      expect(document.querySelector('.errorToast-mock')).toBeNull();
      
      // Should be safe to call destroy multiple times
      errorHandler.destroy();
      
      destroySpy.mockRestore();
    });
  });
}); 