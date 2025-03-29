/**
 * JavaScript entry point for Steam Deck DUB Edition
 */

// Import core functionality
import core from './core';

// Export modules for external use
export { default as core } from './core';

// Initialize when imported
export function initialize() {
  core.init();
}

// Auto-initialize when this module is loaded directly
if (typeof window !== 'undefined') {
  // Only run on browser, not during server-side rendering
  window.addEventListener('DOMContentLoaded', () => {
    initialize();
  });
}

export default {
  initialize
}; 