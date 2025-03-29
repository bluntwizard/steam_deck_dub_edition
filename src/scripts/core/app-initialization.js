/**
 * App Initialization for Steam Deck DUB Edition
 * Integrates all components and initializes them appropriately
 */

import settingsManager from '../services/settings.js';
import accessibilityManager from '../utils/accessibility.js';
import progressTracker from '../services/progress-tracker.js';
import i18n from '../i18n.js';

/**
 * Initialize all application components in the correct order
 */
export function initializeApplication() {
  // Initialize i18n first to ensure translations are available
  i18n.initializeI18n().then(() => {
    console.log('Internationalization initialized');
    
    // Initialize accessibility features
    accessibilityManager.initialize();
    console.log('Accessibility features initialized');
    
    // Initialize settings
    // This will automatically show the settings button
    console.log('Settings manager initialized');
    
    // Initialize progress tracking last as it depends on DOM content
    document.addEventListener('DOMContentLoaded', () => {
      progressTracker.initializeTracking();
      console.log('Progress tracking initialized');
    });
    
    // Add settings section for progress tracker
    const originalCreateAccessibilitySection = accessibilityManager.createSettingsUI;
    accessibilityManager.createSettingsUI = function(container, onChange) {
      // Call original method
      originalCreateAccessibilitySection.call(this, container, onChange);
      
      // Add progress tracker settings
      progressTracker.createSettingsUI(container);
    };
    
    // Listen for theme changes and update progress tracker styles
    document.addEventListener('theme-changed', (e) => {
      // Adjust progress tracker styles based on theme
      const theme = e.detail.theme;
      document.documentElement.setAttribute('data-theme', theme);
    });
    
    // Register with service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: 'appInitialized',
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * Append CSS file to the document head
 * @param {string} path - Path to the CSS file
 */
export function loadStylesheet(path) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = path;
  document.head.appendChild(link);
}

// Automatically load required stylesheets
loadStylesheet('/src/styles/progress-tracker.css');

// Initialize application when script is loaded
initializeApplication();

// Export components for direct access if needed
export { settingsManager, accessibilityManager, progressTracker };
