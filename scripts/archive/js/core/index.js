/**
 * Core JS functionality for Grimoire
 * Export all functionality from this module for easier imports
 */

// Export UI functionality
export * from './ui-main.js';

// Define entry point
export default {
  init: () => {
    console.log('Initializing Grimoire core functionality');
    
    // Import dynamically to avoid circular dependencies
    import('./ui-main.js').then(uiModule => {
      if (typeof uiModule.initUI === 'function') {
        uiModule.initUI();
      }
    });
  }
}; 