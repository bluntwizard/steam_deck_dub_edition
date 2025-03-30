/**
 * Components Index
 * Steam Deck DUB Edition
 */

// Import from TypeScript files for the components we've migrated
import { initNavigation, initScrollHandlers, handleUrlHash } from './navigation.js';
import { loadPreferences, applyPreferences, userPreferences, showPreferencesDialog } from './preferences.js';
import { initSidebar } from './sidebar.js';

// Import the remaining components
// We'll handle these differently since they have mixed export patterns
// Some are ESM (export default) and some are CommonJS (module.exports)
const gallery = require('./gallery.js').default;
const progressTracker = require('./progress-tracker.js').default;
const versionDisplay = require('./version-display.js');

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