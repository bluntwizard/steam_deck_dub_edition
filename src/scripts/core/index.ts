/**
 * Core Index
 * Steam Deck DUB Edition
 */

// Import from TypeScript files when available
export { 
  initializeApplication, 
  updateTheme, 
  resetApplication, 
  isInitialized, 
  // Export these managers directly from app-initialization
  // rather than duplicating them below
  accessibilityManager, 
  progressTracker 
} from './app-initialization';

// These will need to be migrated to TypeScript later
// For now, import them as-is or comment out if they cause errors
// export { default as fontLoader } from './font-loader.js';
// export { default as layout } from './layout.js';
// export { default as main } from './main.js';
// export { default as renderer } from './renderer.js';
export { default as settingsManager } from './settings-manager.js';
// export { default as theme } from './theme.js';
// export { default as uiImprovements } from './ui-improvements.js';

// Note: Once other modules are migrated to TypeScript, 
// update their imports to remove the .js extension 