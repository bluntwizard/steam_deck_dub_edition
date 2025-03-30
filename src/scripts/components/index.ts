/**
 * Components Index
 * Steam Deck DUB Edition
 */

// Import from TypeScript files for the components we've migrated
import { initNavigation, initScrollHandlers, handleUrlHash } from './navigation.js';
import { loadPreferences, applyPreferences, userPreferences, showPreferencesDialog } from './preferences.js';
import { initSidebar } from './sidebar.js';
import progressTracker from './progress-tracker.js';
import versionDisplay from './version-display.js';

// For components not yet migrated, import from JavaScript files
// code-blocks.js appears to be empty or not a proper module
// gallery.js is still using the old format

// Create navigation component object with exported functions
const navigation = {
  initNavigation,
  initScrollHandlers,
  handleUrlHash
};

// Create preferences component object with exported functions
const preferences = {
  loadPreferences,
  applyPreferences,
  userPreferences,
  showPreferencesDialog
};

// Create sidebar component object with exported functions
const sidebar = {
  initSidebar
};

// Since code-blocks.js appears to be empty or not a proper module,
// create a placeholder object until it's migrated
const codeBlocks = {
  // Will be implemented in TypeScript migration
};

// Gallery import placeholder
const gallery = {
  // Will be replaced with proper TypeScript implementation
};

// Export all components
export {
  codeBlocks,
  gallery,
  navigation,
  preferences,
  progressTracker,
  sidebar,
  versionDisplay
}; 