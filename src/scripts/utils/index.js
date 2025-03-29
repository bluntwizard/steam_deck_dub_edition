/**
 * Utility Functions Index
 * Steam Deck DUB Edition
 */

export { default as debugHelper } from './debug-helper.js';
export { default as layoutUtilities } from './layout-utilities.js';
export { default as cleanup } from './cleanup.js';
export { default as printHelper } from './print-helper.js';
export { default as accessibility } from './accessibility.js';
export { default as accessibilityUI } from './accessibility-ui.js';
export { default as lazyLoader } from './lazy-loader.js';
export { default as search } from './search.js';

// Common utility functions
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return defaultValue;
  }
}

export function setLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Error writing to localStorage', e);
    return false;
  }
}
