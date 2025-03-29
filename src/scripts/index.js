// Main scripts index - imports all JavaScript modules
import './utils/cleanup.js';
import './services/content-loader.js';
import './core/ui-improvements.js';
import './services/search.js';
import './components/preferences.js';
import './core/main.js';
import './core/renderer.js';
import './core/layout.js';
import './utils/layout-utilities.js';
import './components/navigation.js';
import './services/offline.js';
import './utils/print-helper.js';
import './services/pdf-export.js';
import './services/progress-tracker.js';
import './utils/debug-helper.js';

// Core initialization function
export function initialize() {
  console.log('Initializing Steam Deck DUB Edition');
  // Core functionalities are automatically initialized through imports
}

// Export default object for compatibility
export default {
  initialize
};
