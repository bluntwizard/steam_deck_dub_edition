/**
 * Core Index
 * Steam Deck DUB Edition
 */

// Import from TypeScript files when available, otherwise from JS files
export { initializeApplication, updateTheme, resetApplication, isInitialized, settingsManager, accessibilityManager, progressTracker } from './app-initialization';
export { default as fontLoader } from './font-loader.js';
export { default as layout } from './layout.js';
export { default as main } from './main.js';
export { default as renderer } from './renderer.js';
export { default as settingsManager } from './settings-manager.js';
export { default as theme } from './theme.js';
export { default as uiImprovements } from './ui-improvements.js';

// Note: Once other modules are migrated to TypeScript, 
// update their imports to remove the .js extension 