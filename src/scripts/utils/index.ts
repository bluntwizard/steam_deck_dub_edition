/**
 * Utility Functions Index
 * Grimoire
 */

// Import other utility modules - we'll uncomment these as we convert them to TypeScript
// export { default as debugHelper } from './debug-helper';
// export { default as layoutUtilities } from './layout-utilities';
// export { default as cleanup } from './cleanup';
// export { default as printHelper } from './print-helper';
// export { default as accessibility } from './accessibility';
// export { default as accessibilityUI } from './accessibility-ui';
// export { default as lazyLoader } from './lazy-loader';
// export { default as search } from './search';

// Import validation functions
export * from './validation';

// Import error handling functions
export * from './error-handling';

/**
 * Debounce function to limit how often a function can be called
 * @param func - The function to debounce
 * @param wait - The time to wait in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 * @param func - The function to throttle
 * @param limit - The minimum time between calls in milliseconds
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format a date using a locale string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate a random ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @returns Generated unique ID
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is currently in the viewport
 * @param el - The DOM element to check
 * @returns True if element is in viewport
 */
export function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when copying is complete
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Get an item from localStorage with proper type handling and error protection
 * @param key - The key to retrieve
 * @param defaultValue - Default value if key doesn't exist or on error
 * @returns The stored value or default value
 */
export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage with proper error handling
 * @param key - The key to set
 * @param value - The value to store
 * @returns True if successful, false on error
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Error writing to localStorage', e);
    return false;
  }
} 