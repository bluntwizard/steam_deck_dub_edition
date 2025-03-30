/**
 * Error handling utilities tests
 * Steam Deck DUB Edition
 */

import {
  AppError,
  ApiError,
  NetworkError,
  ValidationError,
  AuthError,
  ErrorType,
  toAppError,
  isNetworkError,
  isApiError,
  enrichError,
  withErrorHandling,
  createAppValidationError,
  stringifyError,
  logError,
  getUserFriendlyMessage,
  shouldReportError,
  handleError
} from '../error-handling';

describe('Error handling utilities', () => {
  describe('Error classes', () => {
    test('AppError should create an error with the correct properties', () => {
      const error = new AppError('Test error', ErrorType.API, 400, { test: true });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.API);
      expect(error.statusCode).toBe(400);
      expect(error.metadata).toEqual({ test: true });
    });
    
    test('ApiError should create an error with API type', () => {
      const error = new ApiError('API error', 404);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.API);
      expect(error.statusCode).toBe(404);
    });
    
    test('NetworkError should create an error with NETWORK type', () => {
      const error = new NetworkError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Network error occurred');
    });
    
    test('ValidationError should create an error with VALIDATION type and field errors', () => {
      const fieldErrors = { name: ['Name is required'] };
      const error = new ValidationError('Validation failed', fieldErrors);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.fieldErrors).toEqual(fieldErrors);
    });
    
    test('AuthError should create an error with AUTH type', () => {
      const error = new AuthError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.AUTH);
      expect(error.message).toBe('Authentication error occurred');
    });
  });
  
  describe('toAppError', () => {
    test('should return the same error if already an AppError', () => {
      const originalError = new AppError('Test error');
      const result = toAppError(originalError);
      
      expect(result).toBe(originalError);
    });
    
    test('should convert Error to AppError', () => {
      const originalError = new Error('Test error');
      const result = toAppError(originalError);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.type).toBe(ErrorType.UNEXPECTED);
      expect(result.originalError).toBe(originalError);
    });
    
    test('should convert string to AppError', () => {
      const result = toAppError('Test error');
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.type).toBe(ErrorType.UNEXPECTED);
    });
    
    test('should handle null/undefined', () => {
      const result = toAppError(null);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.type).toBe(ErrorType.UNEXPECTED);
    });
  });
  
  describe('Error detection functions', () => {
    test('isNetworkError should identify NetworkError instances', () => {
      expect(isNetworkError(new NetworkError())).toBe(true);
      expect(isNetworkError(new Error('network connection error'))).toBe(true);
      expect(isNetworkError(new Error('unrelated error'))).toBe(false);
    });
    
    test('isApiError should identify ApiError instances', () => {
      expect(isApiError(new ApiError('API error', 500))).toBe(true);
      expect(isApiError(new Error('API error'))).toBe(false);
    });
  });
  
  describe('Error manipulation functions', () => {
    test('enrichError should add metadata to errors', () => {
      const error = new Error('Test error');
      const result = enrichError(error, { user: 'test', context: 'login' });
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.metadata).toEqual({ user: 'test', context: 'login' });
    });
    
    test('createAppValidationError should create ValidationError with field errors', () => {
      const fieldErrors = { email: ['Invalid email format'] };
      const result = createAppValidationError('Validation error', fieldErrors);
      
      expect(result).toBeInstanceOf(ValidationError);
      expect(result.fieldErrors).toEqual(fieldErrors);
    });
  });
  
  describe('Error handling functions', () => {
    test('withErrorHandling should handle synchronous errors', () => {
      const mockErrorHandler = jest.fn().mockReturnValue('error handled');
      const throwingFn = () => { throw new Error('Test error'); };
      
      const wrapped = withErrorHandling(throwingFn, mockErrorHandler);
      const result = wrapped();
      
      expect(mockErrorHandler).toHaveBeenCalled();
      expect(result).toBe('error handled');
    });
    
    test('withErrorHandling should handle promise rejections', async () => {
      const mockErrorHandler = jest.fn().mockReturnValue(Promise.resolve('error handled'));
      const rejectingFn = () => Promise.reject(new Error('Test error'));
      
      const wrapped = withErrorHandling(rejectingFn, mockErrorHandler);
      const result = await wrapped();
      
      expect(mockErrorHandler).toHaveBeenCalled();
      expect(result).toBe('error handled');
    });
  });
  
  describe('Error output functions', () => {
    test('stringifyError should format error for logging', () => {
      const error = new ApiError('API error', 404);
      const result = stringifyError(error);
      
      expect(result).toContain('[API_ERROR] API error');
      expect(result).toContain('Status: 404');
    });
    
    test('getUserFriendlyMessage should return user-friendly messages', () => {
      expect(getUserFriendlyMessage(new NetworkError())).toBe(
        'Network error. Please check your internet connection and try again.'
      );
      
      expect(getUserFriendlyMessage(new ApiError('Not found', 404))).toBe(
        'The requested resource was not found.'
      );
      
      expect(getUserFriendlyMessage(new ApiError('Server error', 500))).toBe(
        'The server encountered an error. Please try again later.'
      );
    });
    
    test('shouldReportError should determine if errors should be reported', () => {
      expect(shouldReportError(new ValidationError())).toBe(false);
      expect(shouldReportError(new NetworkError())).toBe(false);
      expect(shouldReportError(new ApiError('Not found', 404))).toBe(false);
      expect(shouldReportError(new ApiError('Server error', 500))).toBe(true);
      expect(shouldReportError(new AppError('Generic error'))).toBe(true);
    });
  });
  
  describe('handleError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    test('should log error when shouldLog is true', () => {
      handleError(new Error('Test error'), 'test context');
      expect(console.error).toHaveBeenCalled();
    });
    
    test('should not log error when shouldLog is false', () => {
      handleError(new Error('Test error'), 'test context', false);
      expect(console.error).not.toHaveBeenCalled();
    });
    
    test('should throw error when shouldThrow is true', () => {
      expect(() => {
        handleError(new Error('Test error'), 'test context', true, true);
      }).toThrow();
    });
    
    test('should return AppError', () => {
      const result = handleError(new Error('Test error'));
      expect(result).toBeInstanceOf(AppError);
    });
  });
}); 