/**
 * Core JS functionality for Steam Deck DUB Edition
 * Export all functionality from this module for easier imports
 */

// Export UI functionality
export * from './ui-main.js';

// Define entry point
export default {
  init: () => {
    console.log('Initializing Steam Deck DUB Edition core functionality');
    
    // Import dynamically to avoid circular dependencies
    import('./ui-main.js').then(uiModule => {
      if (typeof uiModule.initUI === 'function') {
        uiModule.initUI();
      }
    });
  }
}; 