/**
 * app-init.ts - Main application initialization for the Steam Deck DUB Edition application.
 * Coordinates the initialization of modular components and manages their interactions.
 */

// Import modular components - import from TypeScript files
import { NotificationSystem } from '../components/NotificationSystem';
import { ErrorHandler } from '../components/ErrorHandler';
import { PageLoader } from '../components/PageLoader';
import { HelpCenter } from '../components/HelpCenter';

// Import performance optimization utilities
import { initPerformanceMonitoring, measureExecutionTime, logPerformanceMetrics } from './utils/performance-monitor';
import { initImageOptimizer, preloadImages } from './utils/image-optimizer';
import { runWhenIdle } from './utils/dom-optimizer';
import { contentCache, dataCache, imageCache } from './utils/cache-optimizer';

// Import notification types
import type { NotificationOptions as NotificationSystemOptions } from '../types/notification-system';

// Define interfaces for component options
interface NotificationOptions extends NotificationSystemOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  autoRemove?: boolean;
  container?: HTMLElement;
}

interface ErrorHandlerOptions {
  captureGlobalErrors?: boolean;
  logErrors?: boolean;
  showNotifications?: boolean;
  notificationSystem?: NotificationSystem;
  includeStackTrace?: boolean;
  onError?: (error: Error) => void;
  errorMessages?: {
    network?: string;
    timeout?: string;
    serverError?: string;
    unknown?: string;
    [key: string]: string | undefined;
  };
}

interface PageLoaderOptions {
  container?: HTMLElement;
  message?: string;
  showSpinner?: boolean;
  showProgress?: boolean;
  autoHide?: boolean;
  minDisplayTime?: number;
  fadeOutTime?: number;
}

interface HelpCenterOptions {
  title?: string;
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultTopic?: string;
  topics?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  onClose?: () => void;
}

interface ComponentMap {
  notificationSystem: NotificationSystem;
  errorHandler: ErrorHandler;
  pageLoader: PageLoader;
  helpCenter: HelpCenter;
  [key: string]: any;
}

interface PreloadResult {
  successful: string[];
  failed: string[];
}

class AppInitializer {
  private initialized: boolean;
  private components: Partial<ComponentMap>;
  
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
  async initialize(): Promise<void> {
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
      
      // Initialize performance optimizations
      this.initPerformanceOptimizations();

      // Mark as initialized
      this.initialized = true;
      console.log('Application initialization complete');
      
      // Show welcome notification
      if (this.components.notificationSystem) {
        this.components.notificationSystem.success({
          message: 'Steam Deck DUB Edition initialized successfully',
          duration: 3000
        });
      }
      
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
          duration: 0 // Persistent until dismissed
        });
      } else {
        // Fallback alert if notification system isn't available
        alert(`Failed to initialize application: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Initialize the notification system
   */
  private initNotificationSystem(): void {
    console.log('Initializing NotificationSystem');
    
    const options: NotificationOptions = {
      position: 'top-right',
      maxNotifications: 3,
      autoRemove: true,
      container: document.body
    };
    
    this.components.notificationSystem = new NotificationSystem(options);
  }

  /**
   * Initialize the error handler
   */
  private initErrorHandler(): void {
    console.log('Initializing ErrorHandler');
    
    if (!this.components.notificationSystem) {
      console.warn('NotificationSystem not initialized before ErrorHandler');
      return;
    }
    
    const options: ErrorHandlerOptions = {
      captureGlobalErrors: true,
      logErrors: true,
      showNotifications: true,
      notificationSystem: this.components.notificationSystem,
      includeStackTrace: process.env.NODE_ENV === 'development',
      onError: (error: Error) => {
        console.error('Application error:', error);
      },
      errorMessages: {
        network: 'Network error occurred. Please check your connection.',
        timeout: 'The operation timed out. Please try again.',
        serverError: 'Server error occurred. Please try again later.',
        unknown: 'An unexpected error occurred. Please try again.'
      }
    };
    
    this.components.errorHandler = new ErrorHandler(options);
  }

  /**
   * Initialize the page loader
   */
  private initPageLoader(): void {
    console.log('Initializing PageLoader');
    
    const container = document.getElementById('dynamic-content');
    if (!container) {
      console.warn('Dynamic content container not found');
      return;
    }
    
    const options: PageLoaderOptions = {
      container,
      message: 'Loading guide content...',
      showSpinner: true,
      showProgress: true,
      autoHide: true,
      minDisplayTime: 500,
      fadeOutTime: 300
    };
    
    this.components.pageLoader = new PageLoader(options);
  }

  /**
   * Initialize the help center
   */
  private initHelpCenter(): void {
    console.log('Initializing HelpCenter');
    
    const options: HelpCenterOptions = {
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
    };
    
    this.components.helpCenter = new HelpCenter(options);
  }

  /**
   * Initialize performance optimizations
   */
  private initPerformanceOptimizations(): void {
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
  private preloadCriticalAssets(): void {
    // Identify critical images
    const criticalImages = [
      './assets/images/logo.png',
      './assets/images/hero-banner.jpg',
      './assets/icons/settings.svg',
      './assets/icons/help.svg'
    ];
    
    // Preload in the background
    runWhenIdle(() => {
      void preloadImages(criticalImages)
        .then((results: PreloadResult) => {
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
  private optimizeEventListeners(): void {
    // Use passive event listeners for scroll events
    const scrollListenerOptions: AddEventListenerOptions = { passive: true };
    
    // Replace existing scroll listeners with passive ones
    if (window.addEventListener) {
      const originalAddEventListener = window.addEventListener;
      
      // Use a more compatible approach for overriding addEventListener
      const passiveEventListeners = new Set(['scroll', 'touchmove', 'wheel', 'touchstart']);
      
      window.addEventListener = function(
        type: string, 
        listener: EventListenerOrEventListenerObject, 
        options?: boolean | AddEventListenerOptions
      ): void {
        let modifiedOptions: boolean | AddEventListenerOptions = options || false;
        
        if (passiveEventListeners.has(type)) {
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
        
        originalAddEventListener.call(
          window, 
          type, 
          listener, 
          modifiedOptions
        );
      };
    }
  }
  
  /**
   * Handle content resize events
   */
  private handleContentResize(contentRect: DOMRectReadOnly): void {
    // Adjust UI based on content size
    const width = contentRect.width;
    
    // Apply responsive adjustments
    if (width < 600) {
      document.body.classList.add('narrow-content');
    } else {
      document.body.classList.remove('narrow-content');
    }
    
    // Dispatch custom event for responsive components
    const event = new CustomEvent('content-resize', { 
      detail: { width, height: contentRect.height } 
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Setup lazy loading for components
   */
  private setupLazyLoading(): void {
    // Detect IntersectionObserver support
    if ('IntersectionObserver' in window) {
      const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyElement = entry.target as HTMLElement;
            
            // Get component to load
            const componentName = lazyElement.dataset.component;
            if (componentName) {
              // Dynamically load the component
              void this.loadComponentDynamically(componentName, lazyElement);
              
              // Stop observing this element
              lazyLoadObserver.unobserve(lazyElement);
            }
          }
        });
      });
      
      // Observe all elements with data-component attribute
      document.querySelectorAll('[data-component]').forEach(element => {
        lazyLoadObserver.observe(element);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      console.log('IntersectionObserver not supported, loading all components immediately');
      this.loadAllComponents();
    }
  }
  
  /**
   * Dynamically load a component
   */
  private async loadComponentDynamically(componentName: string, container: HTMLElement): Promise<void> {
    try {
      // Use dynamic import for code splitting - adjust for TypeScript
      const componentModule = await import(`../components/${componentName}/${componentName}.ts`);
      
      // Initialize component
      this.initializeComponent(componentName, container, componentModule.default);
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      
      // Show error in container
      container.innerHTML = `
        <div class="error-container">
          <h3>Failed to load ${componentName}</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button class="retry-button" data-component="${componentName}">Retry</button>
        </div>
      `;
      
      // Add retry button event listener
      const retryButton = container.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          container.innerHTML = '<div class="loading">Loading...</div>';
          void this.loadComponentDynamically(componentName, container);
        });
      }
    }
  }
  
  /**
   * Load all components immediately
   */
  private loadAllComponents(): void {
    document.querySelectorAll('[data-component]').forEach(element => {
      const componentName = element.getAttribute('data-component');
      if (componentName) {
        void this.loadComponentDynamically(componentName, element as HTMLElement);
      }
    });
  }
  
  /**
   * Initialize a dynamically loaded component
   */
  private initializeComponent(componentName: string, container: HTMLElement, ComponentClass: any): void {
    try {
      // Initialize with container
      const component = new ComponentClass({ container });
      
      // Store reference
      this.components[componentName.toLowerCase()] = component;
      
      // Set data attribute to mark as initialized
      container.setAttribute('data-initialized', 'true');
      
      console.log(`Component ${componentName} initialized`);
    } catch (error) {
      console.error(`Failed to initialize component: ${componentName}`, error);
      
      // Show error in container
      container.innerHTML = `
        <div class="error-container">
          <h3>Failed to initialize ${componentName}</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
  
  /**
   * Switch content tab
   */
  public switchContentTab(tabId: string, container?: HTMLElement): void {
    const targetContainer = container || document.getElementById('dynamic-content');
    if (!targetContainer) {
      console.error('Content container not found');
      return;
    }
    
    // Show loading state
    if (this.components.pageLoader) {
      this.components.pageLoader.show();
    }
    
    // Update active tab in navigation
    document.querySelectorAll('.nav-list a').forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Load content
    fetch(`src/content/${tabId}.html`)
      .then(response => response.text())
      .then(html => {
        targetContainer.innerHTML = html;
        
        // Initialize components in the loaded content
        this.setupLazyLoading();
        
        // Hide loader
        if (this.components.pageLoader) {
          this.components.pageLoader.hide();
        }
      })
      .catch(error => {
        console.error(`Failed to load content: ${tabId}`, error);
        targetContainer.innerHTML = `
          <div class="error-container">
            <h2>Failed to load content</h2>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <button class="retry-button" data-tab-id="${tabId}">Retry</button>
          </div>
        `;
        
        // Add retry button event listener
        const retryButton = targetContainer.querySelector('.retry-button');
        if (retryButton) {
          retryButton.addEventListener('click', () => {
            this.switchContentTab(tabId, targetContainer);
          });
        }
        
        if (this.components.pageLoader) {
          this.components.pageLoader.hide();
        }
      });
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Theme toggle button
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
      themeToggleButton.addEventListener('click', () => this.toggleTheme());
    }
    
    // Help button
    const helpButton = document.getElementById('help-button');
    if (helpButton && this.components.helpCenter) {
      helpButton.addEventListener('click', () => {
        this.components.helpCenter?.toggle();
      });
    }
    
    // Search toggle
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    
    if (searchToggle && searchContainer && searchInput) {
      searchToggle.addEventListener('click', () => {
        searchContainer.classList.toggle('expanded');
        if (searchContainer.classList.contains('expanded')) {
          searchInput.focus();
        }
      });
    }
    
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((event: Event) => {
        this.handleSearch(event);
      }, 300));
      
      // Clear search button
      const searchClear = document.getElementById('search-clear');
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
          searchInput.focus();
        });
      }
    }
    
    // Add copy-to-clipboard functionality to code blocks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('copy-button')) {
        this.handleCopyClick(event);
      }
    });
    
    // Add highlight functionality to headings
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const heading = this.findParentHeader(target);
      
      if (heading) {
        // Get the heading ID
        const id = heading.id;
        if (id) {
          // Update URL hash without scrolling
          const scrollPosition = window.scrollY;
          window.location.hash = id;
          window.scrollTo(0, scrollPosition);
          
          // Add highlight effect
          heading.classList.add('highlight');
          setTimeout(() => {
            heading.classList.remove('highlight');
          }, 1500);
        }
      }
    });
    
    // Monitor content size changes
    if ('ResizeObserver' in window) {
      const contentElement = document.querySelector('.content-wrapper');
      if (contentElement) {
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            this.handleContentResize(entry.contentRect);
          }
        });
        
        resizeObserver.observe(contentElement);
      }
    }
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
      // Show button when scrolled down
      window.addEventListener('scroll', this.throttle(() => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      }, 200));
      
      // Scroll to top when clicked
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  
  /**
   * Initialize theme preference
   */
  private initThemePreference(): void {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      // Apply saved theme
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Update theme toggle button
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        if (savedTheme === 'dark') {
          themeToggle.classList.add('dark-mode');
        } else {
          themeToggle.classList.remove('dark-mode');
        }
      }
    } else {
      // Detect system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
          themeToggle.classList.add('dark-mode');
        }
      }
    }
    
    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }
  
  /**
   * Toggle between light and dark theme
   */
  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update theme attribute
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.classList.toggle('dark-mode');
    }
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
  }
  
  /**
   * Handle copy-to-clipboard button click
   */
  private handleCopyClick(event: MouseEvent): void {
    const button = event.target as HTMLElement;
    const codeBlock = button.closest('.code-container');
    
    if (!codeBlock) return;
    
    const codeElement = codeBlock.querySelector('code');
    if (!codeElement) return;
    
    // Copy text to clipboard
    const textToCopy = codeElement.textContent || '';
    
    try {
      // Use Clipboard API if available
      if (navigator.clipboard) {
        void navigator.clipboard.writeText(textToCopy)
          .then(() => {
            // Show success feedback
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            // Reset after 2 seconds
            setTimeout(() => {
              button.textContent = 'Copy';
              button.classList.remove('copied');
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
            // Show error feedback
            button.textContent = 'Failed!';
            button.classList.add('error');
            
            // Reset after 2 seconds
            setTimeout(() => {
              button.textContent = 'Copy';
              button.classList.remove('error');
            }, 2000);
          });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';  // Avoid scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // Show success feedback
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  
  /**
   * Handle search input
   */
  private handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.trim().toLowerCase();
    
    // Get containers
    const contentContainer = document.getElementById('dynamic-content');
    const noResultsMessage = document.getElementById('no-results');
    
    if (!contentContainer || !noResultsMessage) return;
    
    if (!searchTerm) {
      // Reset search
      contentContainer.style.display = 'block';
      noResultsMessage.style.display = 'none';
      
      // Remove highlights
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
      });
      
      return;
    }
    
    // Perform search on visible content
    const searchResults = this.performSearch(searchTerm);
    
    if (searchResults.length === 0) {
      // Show no results message
      contentContainer.style.display = 'none';
      noResultsMessage.style.display = 'block';
    } else {
      // Display results
      contentContainer.style.display = 'block';
      noResultsMessage.style.display = 'none';
      
      // Display search results
      this.displaySearchResults(searchResults, searchTerm);
    }
  }
  
  /**
   * Find parent header element
   */
  private findParentHeader(element: HTMLElement): HTMLElement | null {
    // Check if element itself is a header
    if (/^H[1-6]$/.test(element.tagName)) {
      return element;
    }
    
    // Check if element is inside a header
    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
      if (/^H[1-6]$/.test(parent.tagName)) {
        return parent;
      }
      parent = parent.parentElement;
    }
    
    return null;
  }
  
  /**
   * Perform search on content
   */
  private performSearch(searchTerm: string): HTMLElement[] {
    const contentContainer = document.getElementById('dynamic-content');
    if (!contentContainer) return [];
    
    // Get all text-containing elements
    const elements = contentContainer.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
    
    // Filter elements containing the search term
    return Array.from(elements).filter(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes(searchTerm);
    }) as HTMLElement[];
  }
  
  /**
   * Display search results
   */
  private displaySearchResults(results: HTMLElement[], searchTerm: string): void {
    // Remove existing highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
    
    // Highlight search results
    results.forEach(element => {
      element.classList.add('search-highlight');
      
      // Scroll to first result
      if (element === results[0]) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
    
    // Update search count
    const searchCount = document.getElementById('search-count');
    if (searchCount) {
      searchCount.textContent = `${results.length} results found`;
      searchCount.style.display = 'block';
    }
  }
  
  /**
   * Load a content section
   * @param sectionId Section identifier to load
   */
  public loadContent(sectionId: string): void {
    this.switchContentTab(sectionId);
  }
  
  /**
   * Show update notification
   */
  public showUpdateNotification(): void {
    if (this.components.notificationSystem) {
      this.components.notificationSystem.info({
        message: 'A new version is available',
        duration: 0, // Persistent until dismissed
        actions: [
          {
            label: 'Refresh',
            onClick: () => {
              window.location.reload();
              return true; // Close notification
            }
          },
          {
            label: 'Later',
            onClick: () => true // Just close the notification
          }
        ]
      });
    }
  }
  
  /**
   * Debounce function to limit how often a function is called
   */
  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return (...args: Parameters<T>): void => {
      const later = () => {
        timeout = null;
        func(...args);
      };
      
      if (timeout !== null) clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
    };
  }
  
  /**
   * Throttle function to limit execution rate
   */
  private throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>): void => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Create and export a singleton instance
const appInit = new AppInitializer();
export default appInit; 