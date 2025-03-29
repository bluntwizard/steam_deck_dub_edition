/**
 * Main UI Controller for Steam Deck DUB Edition
 * Initializes and coordinates all UI components
 * 
 * @module ui-main
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

// Import critical component modules
import themeController from './components/theme.js';
import lazyLoader from './components/lazy-loader.js';

// Import utilities
import { utils } from './utils.js';

// Components that will be lazy-loaded
let searchController;
let codeBlocksController;
let gallery;
let progressTracker;
let accessibilityUI;
let versionDisplay;

/**
 * Lazy load a component module
 * @param {string} modulePath - Path to the module
 * @returns {Promise<any>} Resolved with the module's default export
 */
async function loadComponent(modulePath) {
  try {
    // Ensure the path starts with ./ for relative imports
    const normalizedPath = modulePath.startsWith('./') ? modulePath : `./${modulePath}`;
    const module = await import(/* webpackChunkName: "[request]" */ normalizedPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${modulePath}`, error);
    throw error;
  }
}

/**
 * Initialize all application components
 * @function initializeApp
 * @returns {void}
 */
function initializeApp() {
  console.log('Initializing Steam Deck DUB Edition UI...');
  
  // Add skip links for keyboard accessibility
  addSkipLinks();
  
  // Initialize critical components immediately
  themeController.initialize();
  
  // Initialize lazy loader for content
  lazyLoader.initialize({
    contentBaseUrl: './content/',
    loadTimeout: 15000 // 15 seconds timeout
  });

  // Debug content sections and force load if needed
  setTimeout(() => {
    lazyLoader.debugContentSections();
    
    // Force load all content sections if none have loaded automatically
    const loadedSections = document.querySelectorAll('[data-content-loaded="true"]');
    if (loadedSections.length === 0) {
      console.log('No sections loaded automatically, forcing load...');
      lazyLoader.forceLoadAllContent();
    }
  }, 1000);

  // Load remaining components based on need
  loadRemainingComponents();
  
  // Add event listener for all external links
  setupExternalLinks();
  
  // Set up other UI features
  setupThemeToggle();
  setupCodeBlocks();
  setupSearch();
  
  // Wait for accessibility UI to load before initializing
  loadComponent('./components/accessibility-ui.js')
    .then(module => {
      accessibilityUI = module;
      accessibilityUI.initialize();
    })
    .catch(error => {
      console.error('Failed to load accessibility UI:', error);
    });
  
  // Add event listener for printing
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);
  
  console.log('UI initialization complete');
}

/**
 * Load non-critical components
 * @returns {Promise<void>}
 */
async function loadRemainingComponents() {
  // Components needed for visible content immediately
  initializeVisibleComponents();
  
  // Defer less critical components
  setTimeout(() => {
    initializeDeferredComponents();
  }, 100);
}

/**
 * Initialize components that may be needed for visible content
 * @returns {Promise<void>}
 */
async function initializeVisibleComponents() {
  try {
    // Load code blocks controller if code blocks are present
    if (document.querySelector('pre code')) {
      codeBlocksController = await loadComponent('./components/code-blocks.js');
      codeBlocksController.initialize({
        addCopyButtons: true,
        lineNumbers: true,
        showLanguage: true
      });
    }
    
    // Load gallery if gallery elements are present
    if (document.querySelector('.gallery, [data-gallery]')) {
      gallery = await loadComponent('./components/gallery.js');
      gallery.initialize();
    }
  } catch (error) {
    console.error('Error initializing visible components:', error);
  }
}

/**
 * Initialize components that can be deferred
 * @returns {Promise<void>}
 */
async function initializeDeferredComponents() {
  try {
    // Initialize search
    searchController = await loadComponent('./components/search.js');
    searchController.initialize();
    
    // Initialize progress tracker
    progressTracker = await loadComponent('./components/progress-tracker.js');
    progressTracker.initialize();

    // Initialize version display
    versionDisplay = await loadComponent('./components/version-display.js');
    versionDisplay.initialize();
  } catch (error) {
    console.error('Error initializing deferred components:', error);
  }
}

/**
 * Set up handling for external links to open in new tab/window
 * @function setupExternalLinks
 * @private
 * @returns {void}
 */
function setupExternalLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && link.getAttribute('href') && 
        (link.getAttribute('href').startsWith('http') || 
         link.getAttribute('href').startsWith('https')) && 
        !link.getAttribute('href').includes(window.location.hostname)) {
      
      // External link
      e.preventDefault();
      
      // Add rel attributes for security and target for new window
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
      
      // Check if already has target="_blank"
      if (!link.getAttribute('target') || link.getAttribute('target') !== '_blank') {
        link.setAttribute('target', '_blank');
      }
      
      // Open the link
      window.open(link.getAttribute('href'), '_blank');
    }
  });
}

/**
 * Add skip links for keyboard navigation accessibility
 */
function addSkipLinks() {
  const mainContent = document.querySelector('main');
  const mainNavigation = document.querySelector('nav.main-nav');
  
  if (!document.getElementById('skip-to-main')) {
    const skipToMain = document.createElement('a');
    skipToMain.id = 'skip-to-main';
    skipToMain.className = 'skip-link';
    skipToMain.href = '#main-content';
    skipToMain.textContent = 'Skip to main content';
    
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
    
    document.body.insertBefore(skipToMain, document.body.firstChild);
  }
  
  if (mainNavigation && !document.getElementById('skip-to-nav')) {
    const skipToNav = document.createElement('a');
    skipToNav.id = 'skip-to-nav';
    skipToNav.className = 'skip-link';
    skipToNav.href = '#main-navigation';
    skipToNav.textContent = 'Skip to navigation';
    
    if (!mainNavigation.id) {
      mainNavigation.id = 'main-navigation';
    }
    
    document.body.insertBefore(skipToNav, document.body.firstChild);
  }
}

/**
 * Handle preparation for printing
 */
function handleBeforePrint() {
  // Ensure all lazy-loaded content is visible for printing
  document.querySelectorAll('.lazy-content[data-src]').forEach(section => {
    if (!section.hasAttribute('data-loaded')) {
      lazyLoader.loadContent(section);
    }
  });
  
  // Expand all collapsed sections
  document.querySelectorAll('.collapsible.collapsed').forEach(section => {
    section.classList.remove('collapsed');
  });
  
  // Add print-specific class to body
  document.body.classList.add('printing');
}

/**
 * Handle cleanup after printing
 */
function handleAfterPrint() {
  // Remove print-specific class
  document.body.classList.remove('printing');
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
  // DOM already loaded, initialize immediately
  initializeApp();
}

// Export functions and components
export { initializeApp, loadComponent };
export { themeController };
export { lazyLoader };

// These components are exported but may be undefined until loaded
export { searchController };
export { codeBlocksController };
export { gallery };
export { progressTracker };
export { accessibilityUI };
export { versionDisplay };
