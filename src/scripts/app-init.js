/**
 * app-init.js - Main application initialization for the Grimoire application.
 * Coordinates the initialization of modular components and manages their interactions.
 */

// Import modular components
import NotificationSystem from '../components/NotificationSystem/index.js';
import ErrorHandler from '../components/ErrorHandler/index.js';
import PageLoader from '../components/PageLoader/index.js';
import HelpCenter from '../components/HelpCenter/index.js';

// Import performance optimization utilities
import { initPerformanceMonitoring, measureExecutionTime, logPerformanceMetrics } from './utils/performance-monitor.js';
import { initImageOptimizer, preloadImages } from './utils/image-optimizer.js';
import { runWhenIdle } from './utils/dom-optimizer.js';
import { contentCache, dataCache, imageCache } from './utils/cache-optimizer.js';

class AppInitializer {
  constructor() {
    this.initialized = false;
    this.components = {};
    
    // Start performance monitoring early
    initPerformanceMonitoring();
    
    console.log('AppInitializer created');
  }

  /**
   * Initializes all core application components
   */
  async initialize() {
    if (this.initialized) {
      console.warn('AppInitializer already initialized');
      return;
    }

    console.log('Initializing Grimoire application...');
    
    try {
      // Initialize NotificationSystem first for early feedback
      this.initNotificationSystem();
      
      // Initialize ErrorHandler next to capture errors during initialization
      this.initErrorHandler();
      
      // Initialize PageLoader for content loading
      this.initPageLoader();
      
      // Initialize HelpCenter
      this.initHelpCenter();
      
      // Setup event listeners and UI interactions
      this.setupEventListeners();
      
      // Initialize theme based on user preference
      this.initThemePreference();
      
      // Initialize performance optimizations
      this.initPerformanceOptimizations();

      // Mark as initialized
      this.initialized = true;
      console.log('Application initialization complete');
      
      // Show welcome notification
      this.components.notificationSystem.success({
        message: 'Grimoire initialized successfully',
        duration: 3000
      });
      
      // Log performance metrics after initialization
      runWhenIdle(() => {
        logPerformanceMetrics();
      });
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      
      // Try to show error notification if notification system is available
      if (this.components.notificationSystem) {
        this.components.notificationSystem.error({
          message: 'Failed to initialize application',
          details: error.message,
          duration: 0 // Persistent until dismissed
        });
      } else {
        // Fallback alert if notification system isn't available
        alert(`Failed to initialize application: ${error.message}`);
      }
    }
  }

  /**
   * Initialize the notification system
   */
  initNotificationSystem() {
    console.log('Initializing NotificationSystem');
    
    this.components.notificationSystem = new NotificationSystem({
      position: 'top-right',
      maxNotifications: 3,
      autoRemove: true,
      container: document.body
    });
  }

  /**
   * Initialize the error handler
   */
  initErrorHandler() {
    console.log('Initializing ErrorHandler');
    
    this.components.errorHandler = new ErrorHandler({
      captureGlobalErrors: true,
      logErrors: true,
      showNotifications: true,
      notificationSystem: this.components.notificationSystem,
      includeStackTrace: process.env.NODE_ENV === 'development',
      onError: (error) => {
        console.error('Application error:', error);
      },
      errorMessages: {
        network: 'Network error occurred. Please check your connection.',
        timeout: 'The operation timed out. Please try again.',
        serverError: 'Server error occurred. Please try again later.',
        unknown: 'An unexpected error occurred. Please try again.'
      }
    });
  }

  /**
   * Initialize the page loader
   */
  initPageLoader() {
    console.log('Initializing PageLoader');
    
    this.components.pageLoader = new PageLoader({
      container: document.getElementById('dynamic-content'),
      message: 'Loading guide content...',
      showSpinner: true,
      showProgress: true,
      autoHide: true,
      minDisplayTime: 500,
      fadeOutTime: 300
    });
  }

  /**
   * Initialize the help center
   */
  initHelpCenter() {
    console.log('Initializing HelpCenter');
    
    this.components.helpCenter = new HelpCenter({
      title: 'Grimoire Help',
      buttonPosition: 'bottom-right',
      defaultTopic: 'getting-started',
      topics: [
        {
          id: 'getting-started',
          title: 'Getting Started',
          content: 'Welcome to Grimoire! This guide will help you get started with using the application...'
        },
        {
          id: 'navigation',
          title: 'Navigation',
          content: 'Learn how to navigate through the guide sections and find the information you need...'
        },
        {
          id: 'settings',
          title: 'Settings',
          content: 'Customize your experience by configuring the settings to your preference...'
        },
        {
          id: 'troubleshooting',
          title: 'Troubleshooting',
          content: 'Having issues? Check out these common troubleshooting steps...'
        }
      ],
      onClose: () => {
        console.log('Help center closed');
      }
    });
  }

  /**
   * Initialize performance optimizations
   */
  initPerformanceOptimizations() {
    console.log('Initializing performance optimizations');
    
    // Initialize image optimization
    initImageOptimizer();
    
    // Preload critical images
    this.preloadCriticalAssets();
    
    // Apply performance optimizations to event listeners
    this.optimizeEventListeners();
    
    // Apply code splitting and lazy loading for non-critical components
    this.setupLazyLoading();
  }
  
  /**
   * Preload critical assets needed for initial rendering
   */
  preloadCriticalAssets() {
    // Identify critical images
    const criticalImages = [
      './assets/images/logo.png',
      './assets/images/hero-banner.jpg',
      './assets/icons/settings.svg',
      './assets/icons/help.svg'
    ];
    
    // Preload in the background
    runWhenIdle(() => {
      preloadImages(criticalImages)
        .then(results => {
          console.log(`Preloaded ${results.successful.length} critical images`);
          if (results.failed.length > 0) {
            console.warn(`Failed to preload ${results.failed.length} images`);
          }
        });
    });
  }
  
  /**
   * Apply optimizations to event listeners
   */
  optimizeEventListeners() {
    // Use passive event listeners for scroll events
    const scrollListenerOptions = { passive: true };
    
    // Replace existing scroll listeners with passive ones
    if (window.addEventListener) {
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(type, listener, options) {
        let modifiedOptions = options;
        if (type === 'scroll' || type === 'touchmove') {
          if (typeof options === 'boolean') {
            modifiedOptions = { 
              capture: options,
              passive: true
            };
          } else if (typeof options === 'object') {
            modifiedOptions = {
              ...options,
              passive: options.passive !== false
            };
          } else {
            modifiedOptions = { passive: true };
          }
        }
        return originalAddEventListener.call(this, type, listener, modifiedOptions);
      };
    }
    
    // Debounce resize handlers
    if (window.ResizeObserver) {
      // Use ResizeObserver instead of resize event where possible
      const contentArea = document.getElementById('dynamic-content');
      if (contentArea) {
        const resizeObserver = new ResizeObserver(
          // Throttle to prevent too frequent updates
          this.throttle(entries => {
            for (let entry of entries) {
              // Handle resize of content area
              this.handleContentResize(entry.contentRect);
            }
          }, 100)
        );
        
        resizeObserver.observe(contentArea);
      }
    }
  }
  
  /**
   * Handle content area resize
   * @param {DOMRectReadOnly} contentRect - The new content dimensions
   */
  handleContentResize(contentRect) {
    // Adjust layout based on new dimensions
    const width = contentRect.width;
    
    // Add appropriate responsive classes
    document.body.classList.remove('narrow', 'medium', 'wide');
    
    if (width < 600) {
      document.body.classList.add('narrow');
    } else if (width < 1024) {
      document.body.classList.add('medium');
    } else {
      document.body.classList.add('wide');
    }
  }
  
  /**
   * Set up lazy loading for non-critical components
   */
  setupLazyLoading() {
    // Use Intersection Observer to detect when components should be loaded
    if ('IntersectionObserver' in window) {
      const lazyComponents = document.querySelectorAll('[data-lazy-component]');
      
      const componentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const componentElement = entry.target;
            const componentName = componentElement.dataset.lazyComponent;
            
            // Load the component dynamically
            this.loadComponentDynamically(componentName, componentElement);
            
            // Stop observing once loaded
            componentObserver.unobserve(componentElement);
          }
        });
      }, {
        rootMargin: '200px 0px', // Load when within 200px of viewport
      });
      
      lazyComponents.forEach(component => {
        componentObserver.observe(component);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadAllComponents();
    }
  }
  
  /**
   * Load a component dynamically using code splitting
   * @param {string} componentName - Name of the component to load
   * @param {HTMLElement} container - Element to mount component into
   */
  loadComponentDynamically(componentName, container) {
    // Skip if this component was already loaded
    if (container.dataset.componentLoaded === 'true') return;
    
    // Show loading indicator
    container.classList.add('loading-component');
    
    // Check if we have this component in cache
    const cachedComponent = contentCache.get(`component:${componentName}`);
    if (cachedComponent) {
      container.innerHTML = cachedComponent;
      container.classList.remove('loading-component');
      container.dataset.componentLoaded = 'true';
      this.initializeComponent(componentName, container);
      return;
    }
    
    // Dynamically import the component based on its name
    import(`../components/${componentName}/${componentName}.js`)
      .then(module => {
        // Create the component
        const Component = module.default;
        const component = new Component({
          container: container
        });
        
        // Initialize and render
        component.render();
        
        // Update the container
        container.classList.remove('loading-component');
        container.dataset.componentLoaded = 'true';
        
        // Cache the component's HTML for future use
        contentCache.set(`component:${componentName}`, container.innerHTML, 3600000); // Cache for 1 hour
      })
      .catch(error => {
        console.error(`Failed to load component ${componentName}:`, error);
        container.classList.remove('loading-component');
        container.classList.add('component-error');
        container.innerHTML = `<div class="error-message">Failed to load component ${componentName}</div>`;
      });
  }
  
  /**
   * Load all lazy components immediately
   */
  loadAllComponents() {
    document.querySelectorAll('[data-lazy-component]').forEach(container => {
      const componentName = container.dataset.lazyComponent;
      this.loadComponentDynamically(componentName, container);
    });
  }
  
  /**
   * Initialize a dynamically loaded component
   * @param {string} componentName - Name of the component
   * @param {HTMLElement} container - Container element
   */
  initializeComponent(componentName, container) {
    // Add any component-specific initialization here
    switch (componentName) {
      case 'ThemeSelector':
        // Initialize theme selector events
        const themeButtons = container.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
          button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            this.setTheme(theme);
          });
        });
        break;
        
      case 'ContentViewer':
        // Initialize content viewer
        const tabs = container.querySelectorAll('.content-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            const tabId = tab.dataset.tabId;
            this.switchContentTab(tabId, container);
          });
        });
        break;
        
      // Add cases for other components as needed
    }
  }
  
  /**
   * Switch between content tabs
   * @param {string} tabId - ID of the tab to show
   * @param {HTMLElement} container - Container element
   */
  switchContentTab(tabId, container) {
    // Hide all tab contents
    container.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = container.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
    if (selectedContent) {
      selectedContent.classList.add('active');
    }
    
    // Update active tab
    container.querySelectorAll('.content-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tabId === tabId) {
        tab.classList.add('active');
      }
    });
  }

  /**
   * Setup event listeners for application interactions
   */
  setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Apply measured execution to event handlers for performance monitoring
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', measureExecutionTime(this.toggleTheme.bind(this), 'toggleTheme'));
    }
    
    // Help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
      helpButton.addEventListener('click', measureExecutionTime(() => {
        this.components.helpCenter.show();
      }, 'showHelpCenter'));
    }
    
    // Back to top button - use passive listener for better scrolling performance
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // Show/hide back to top button based on scroll position - passive listener
      window.addEventListener('scroll', this.throttle(() => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      }, 100), { passive: true });
    }
    
    // Optimize search functionality with debouncing
    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('search-input');
    if (searchToggle && searchInput) {
      searchToggle.addEventListener('click', () => {
        searchInput.focus();
        document.getElementById('header').classList.add('collapsed');
      });
      
      // Apply debounce to search input to prevent excessive processing
      searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
    }
    
    // Handle all copy buttons with event delegation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.copy-button')) {
        this.handleCopyClick(e);
      }
    });
    
    // Handle service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.components.notificationSystem.info({
          message: 'Application updated. Refresh to apply changes.',
          duration: 0,
          actions: [
            {
              text: 'Refresh Now',
              onClick: () => window.location.reload()
            }
          ]
        });
      });
    }
    
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.components.notificationSystem.success({
        message: 'You are now online',
        duration: 3000
      });
    });
    
    window.addEventListener('offline', () => {
      this.components.notificationSystem.warning({
        message: 'You are now offline. Some features may not work.',
        duration: 0
      });
    });
  }

  /**
   * Initialize theme preference
   */
  initThemePreference() {
    console.log('Initializing theme preference');
    
    // Get user's preferred theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update theme if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    this.components.notificationSystem.info({
      message: `Switched to ${newTheme} theme`,
      duration: 2000
    });
  }

  /**
   * Handle click on a copy button
   * @param {Event} event - Click event
   */
  handleCopyClick(event) {
    const button = event.target.closest('.copy-button');
    const target = button.dataset.target;
    const element = document.getElementById(target);
    
    if (element) {
      const textToCopy = element.innerText;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          // Show success indicator
          button.classList.add('success');
          button.setAttribute('title', 'Copied!');
          
          // Reset after 2 seconds
          setTimeout(() => {
            button.classList.remove('success');
            button.setAttribute('title', 'Copy to clipboard');
          }, 2000);
      
      this.components.notificationSystem.success({
            message: 'Copied to clipboard',
        duration: 2000
      });
        })
        .catch((error) => {
          console.error('Failed to copy text:', error);
          this.components.notificationSystem.error({
            message: 'Failed to copy text',
            duration: 3000
          });
        });
    }
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const container = document.getElementById('dynamic-content');
    
    // Clear previous search results
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
    
    // If search term is empty, exit early
    if (!searchTerm) {
      return;
    }
    
    // Check if we have cached results for this search term
    const cachedResults = dataCache.get(`search:${searchTerm}`);
    if (cachedResults) {
      this.displaySearchResults(cachedResults, searchTerm);
      return;
    }
    
    // Find all text content
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, code, pre');
    const results = [];
    
    // Search through each element
    textElements.forEach(element => {
      const text = element.innerText.toLowerCase();
      if (text.includes(searchTerm)) {
        // Highlight the matching element
        element.classList.add('search-highlight');
        
        // Add to results
        results.push({
          element: element,
          text: element.innerText,
          parent: this.findParentHeader(element)
        });
      }
    });
    
    // Cache the results for future searches
    dataCache.set(`search:${searchTerm}`, results, 3600000); // Cache for 1 hour
    
    // Display search results
    this.displaySearchResults(results, searchTerm);
  }
  
  /**
   * Find the parent header for a given element
   * @param {HTMLElement} element - The element to find parent header for
   * @returns {string} The parent header text
   */
  findParentHeader(element) {
    let current = element;
    
    while (current && current.tagName !== 'BODY') {
      // Check if the current element is inside a section with a header
      if (current.tagName === 'SECTION' || current.classList.contains('guide-section')) {
        const header = current.querySelector('h1, h2, h3, h4, h5, h6');
        if (header) {
          return header.innerText;
        }
      }
      
      // Move up the DOM tree
      current = current.parentElement;
    }
    
    return 'General';
  }
  
  /**
   * Display search results
   * @param {Array} results - Search results
   * @param {string} searchTerm - The search term
   */
  displaySearchResults(results, searchTerm) {
    const searchResultsContainer = document.getElementById('search-results');
    
    if (!searchResultsContainer) {
      return;
    }
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      searchResultsContainer.innerHTML = `<p class="no-results">No results found for "${searchTerm}"</p>`;
      return;
    }
    
    // Group results by parent section
    const groupedResults = {};
    results.forEach(result => {
      if (!groupedResults[result.parent]) {
        groupedResults[result.parent] = [];
      }
      groupedResults[result.parent].push(result);
    });
    
    // Create results list
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    // Add result count
    const countElement = document.createElement('div');
    countElement.className = 'results-count';
    countElement.textContent = `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchTerm}"`;
    resultsList.appendChild(countElement);
    
    // Add grouped results
    Object.entries(groupedResults).forEach(([parent, groupResults]) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'result-group';
      
      const groupHeader = document.createElement('h3');
      groupHeader.className = 'group-header';
      groupHeader.textContent = parent;
      groupElement.appendChild(groupHeader);
      
      const groupList = document.createElement('ul');
      groupResults.forEach(result => {
        const listItem = document.createElement('li');
        
        // Highlight the search term in the result text
        const highlightedText = result.text.replace(
          new RegExp(searchTerm, 'gi'),
          match => `<mark>${match}</mark>`
        );
        
        listItem.innerHTML = highlightedText;
        
        // Add click handler to scroll to the result
        listItem.addEventListener('click', () => {
          result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Flash the element to make it noticeable
          result.element.classList.add('flash-highlight');
          setTimeout(() => {
            result.element.classList.remove('flash-highlight');
          }, 2000);
        });
        
        groupList.appendChild(listItem);
      });
      
      groupElement.appendChild(groupList);
      resultsList.appendChild(groupElement);
    });
    
    searchResultsContainer.appendChild(resultsList);
    searchResultsContainer.classList.add('show');
  }
  
  /**
   * Debounce function to limit execution frequency
   * @param {Function} func - Function to debounce
   * @param {number} wait - Milliseconds to wait
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Throttle function to limit execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Throttle interval in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Create and export a singleton instance
const appInitializer = new AppInitializer();
export default appInitializer;

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  appInitializer.initialize();
}); 