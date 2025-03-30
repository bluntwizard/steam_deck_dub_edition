/**
 * Main Scripts Index
 * Steam Deck DUB Edition Guide
 * 
 * Imports all JavaScript/TypeScript modules
 */

// Core modules
import './core/ui-improvements.ts';  // Migrated
import './core/main.ts';  // Migrated
import './core/renderer.js';
import './core/layout.ts';  // Migrated

// Utility modules
import './utils/cleanup.js';
import './utils/layout-utilities.js';
import './utils/print-helper.js';
import './utils/debug-helper.js';

// Service modules
import './services/content-loader.js';
import './services/search.js';
import './services/offline.js';
import './services/pdf-export.js';
import './services/version-manager.js';
import './services/progress-tracker.js';

// Component modules
import './components/preferences.js';
import './components/navigation.js';

// Initialize app
console.log('Steam Deck DUB Edition Guide - Initializing...'); 