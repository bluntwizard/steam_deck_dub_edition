/**
 * app-init.js - Main application initialization for the Steam Deck DUB Edition application.
 * Coordinates the initialization of modular components and manages their interactions.
 */

// Import modular components
import NotificationSystem from '../components/NotificationSystem/index.js';
import ErrorHandler from '../components/ErrorHandler/index.js';
import PageLoader from '../components/PageLoader/index.js';
import HelpCenter from '../components/HelpCenter/index.js';

class AppInitializer {
  constructor() {
    this.initialized = false;
    this.components = {};
    
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

    console.log('Initializing Steam Deck DUB Edition application...');
    
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

      // Mark as initialized
      this.initialized = true;
      console.log('Application initialization complete');
      
      // Show welcome notification
      this.components.notificationSystem.success({
        message: 'Steam Deck DUB Edition initialized successfully',
        duration: 3000
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
      title: 'Steam Deck DUB Edition Help',
      buttonPosition: 'bottom-right',
      defaultTopic: 'getting-started',
      topics: [
        {
          id: 'getting-started',
          title: 'Getting Started',
          content: 'Welcome to Steam Deck DUB Edition! This guide will help you get started with using the application...'
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
   * Setup event listeners for application interactions
   */
  setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
    
    // Help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
      helpButton.addEventListener('click', () => {
        this.components.helpCenter.show();
      });
    }
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // Show/hide back to top button based on scroll position
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      });
    }
    
    // Search toggle and functionality
    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('search-input');
    if (searchToggle && searchInput) {
      searchToggle.addEventListener('click', () => {
        searchInput.focus();
        document.getElementById('header').classList.add('collapsed');
      });
      
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    // Handle all copy buttons
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', this.handleCopyClick.bind(this));
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
   * Show notification when an app update is available
   */
  showUpdateNotification() {
    if (!this.components.notificationSystem) return;
    
    this.components.notificationSystem.info({
      message: 'A new version is available!',
      details: 'Refresh to update the application with the latest improvements.',
      duration: 0, // Persist until dismissed
      actions: [
        {
          text: 'Update Now',
          onClick: () => window.location.reload()
        },
        {
          text: 'Remind Later',
          onClick: () => {
            // Hide current notification but remind again in 30 minutes
            setTimeout(() => this.showUpdateNotification(), 30 * 60 * 1000);
          }
        }
      ]
    });
    
    // Also log to console
    console.log('New application version available. Refresh to update.');
  }

  /**
   * Initialize theme based on user preference
   */
  initThemePreference() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      // Check if user has dark mode preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    this.components.notificationSystem.info({
      message: `Theme switched to ${newTheme} mode`,
      duration: 2000
    });
  }

  /**
   * Handle copy button clicks
   * @param {Event} event - Click event
   */
  handleCopyClick(event) {
    const button = event.target.closest('.copy-button');
    const textToCopy = button.getAttribute('data-copy-text');
    
    if (!textToCopy) {
      console.error('No text to copy specified');
      return;
    }
    
    try {
      navigator.clipboard.writeText(textToCopy);
      
      // Show success state
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      
      this.components.notificationSystem.success({
        message: 'Text copied to clipboard',
        duration: 2000
      });
      
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (error) {
      this.components.errorHandler.handleError(error, {
        context: 'Clipboard operation',
        source: 'AppInitializer.handleCopyClick'
      });
      
      button.textContent = 'Failed!';
      
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    }
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const noResultsMessage = document.getElementById('no-results');
    const contentContainer = document.getElementById('dynamic-content');
    
    if (searchTerm.length < 2) {
      // Reset search results if search term is too short
      noResultsMessage.style.display = 'none';
      return;
    }
    
    // Show loading indicator
    this.components.pageLoader.show();
    this.components.pageLoader.setMessage('Searching...');
    
    try {
      // Simulate search delay for demo
      setTimeout(() => {
        // Perform search logic here
        // For demo purposes, we'll just check if any content contains the search term
        const contentElements = contentContainer.querySelectorAll('section, h1, h2, h3, p');
        let foundResults = false;
        
        contentElements.forEach(element => {
          const text = element.textContent.toLowerCase();
          if (text.includes(searchTerm)) {
            foundResults = true;
            element.style.display = 'block';
            // Highlight matching text (simple implementation)
            element.innerHTML = element.innerHTML.replace(
              new RegExp(searchTerm, 'gi'),
              match => `<mark>${match}</mark>`
            );
          } else {
            element.style.display = 'none';
          }
        });
        
        // Show/hide no results message
        noResultsMessage.style.display = foundResults ? 'none' : 'block';
        
        // Hide loading indicator
        this.components.pageLoader.hide();
      }, 500);
    } catch (error) {
      this.components.errorHandler.handleError(error, {
        context: 'Search operation',
        source: 'AppInitializer.handleSearch'
      });
      
      this.components.pageLoader.hide();
    }
  }

  /**
   * Load content for a specific section
   * @param {string} sectionId - ID of the section to load
   */
  loadContent(sectionId) {
    if (!sectionId) {
      console.error('No section ID provided');
      return;
    }
    
    this.components.pageLoader.show();
    this.components.pageLoader.setMessage(`Loading ${sectionId.replace(/-/g, ' ')}...`);
    
    try {
      // Add loading steps for better user feedback
      this.components.pageLoader.addLoadStep('Fetching content');
      
      fetch(`/content/${sectionId}.html`)
        .then(response => {
          this.components.pageLoader.completeLoadStep();
          
          if (!response.ok) {
            throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
          }
          
          this.components.pageLoader.addLoadStep('Processing content');
          return response.text();
        })
        .then(content => {
          this.components.pageLoader.completeLoadStep();
          
          const contentContainer = document.getElementById('dynamic-content');
          contentContainer.innerHTML = content;
          
          // Update page title
          const sectionTitle = contentContainer.querySelector('h1')?.textContent || sectionId;
          document.title = `Steam Deck DUB Edition - ${sectionTitle}`;
          
          // Generate table of contents if needed
          this.generateTableOfContents();
          
          // Restore any code highlighting
          if (window.Prism) {
            window.Prism.highlightAll();
          }
          
          this.components.pageLoader.hide();
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
          this.components.errorHandler.handleError(error, {
            context: 'Content loading',
            source: 'AppInitializer.loadContent'
          });
          
          this.components.pageLoader.showError('Failed to load content', error.message);
        });
    } catch (error) {
      this.components.errorHandler.handleError(error, {
        context: 'Content loading setup',
        source: 'AppInitializer.loadContent'
      });
      
      this.components.pageLoader.showError('Failed to initialize content loading', error.message);
    }
  }

  /**
   * Generate table of contents based on headings in the content
   */
  generateTableOfContents() {
    const contentContainer = document.getElementById('dynamic-content');
    const tocContainer = document.getElementById('table-of-contents');
    
    if (!tocContainer) return;
    
    // Clear existing TOC
    tocContainer.innerHTML = '';
    
    // Find all headings
    const headings = contentContainer.querySelectorAll('h1, h2, h3');
    
    if (headings.length < 3) {
      // Don't show TOC for content with few headings
      tocContainer.style.display = 'none';
      return;
    }
    
    tocContainer.style.display = 'block';
    
    // Create TOC header
    const tocHeader = document.createElement('h3');
    tocHeader.textContent = 'On this page';
    tocContainer.appendChild(tocHeader);
    
    // Create TOC list
    const tocList = document.createElement('ul');
    tocContainer.appendChild(tocList);
    
    // Add TOC items
    headings.forEach((heading, index) => {
      // Assign ID if heading doesn't have one
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      
      const listItem = document.createElement('li');
      listItem.className = `toc-level-${heading.tagName.toLowerCase()}`;
      
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
      
      // Add click event
      link.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelector(`#${heading.id}`).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }
}

// Create and export singleton instance
const appInit = new AppInitializer();
export default appInit;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  appInit.initialize();
}); 