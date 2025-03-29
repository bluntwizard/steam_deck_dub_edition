import styles from './LazyLoader.module.css';

/**
 * LazyLoader Component
 * Handles dynamic loading of content sections as they enter the viewport
 */
export class LazyLoader {
  constructor(options = {}) {
    /**
     * IntersectionObserver for detecting when elements enter viewport
     * @type {IntersectionObserver|null}
     * @private
     */
    this.observer = null;
    
    /**
     * Map of sections being loaded to their promises
     * @type {Map<string, Promise<void>>}
     * @private
     */
    this.loadingPromises = new Map();
    
    /**
     * Whether the lazy loader is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Base URL for content loading
     * @type {string}
     * @private
     */
    this.contentBaseUrl = options.contentBaseUrl || './content/';
    
    /**
     * Default timeout for content loading (ms)
     * @type {number}
     * @private
     */
    this.loadTimeout = options.loadTimeout || 10000; // 10 seconds
    
    // Initialize if options.autoInit is true
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the lazy loader
   * @param {Object} [options] - Configuration options
   * @param {string} [options.contentBaseUrl] - Base URL for content loading
   * @param {number} [options.loadTimeout] - Timeout for content loading in ms
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    // Apply options
    if (options.contentBaseUrl) {
      this.contentBaseUrl = options.contentBaseUrl;
    }
    
    if (options.loadTimeout) {
      this.loadTimeout = options.loadTimeout;
    }
    
    // Set up IntersectionObserver
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '200px 0px', // Load content 200px before it enters viewport
        threshold: 0.01 // Trigger when 1% of the element is visible
      }
    );
    
    // Observe elements with data-content-src attribute
    this.observeContentSections();
    
    // Set up observer for dynamically added content sections
    this.setupMutationObserver();
    
    this.initialized = true;
    console.log('Lazy loader initialized');
  }
  
  /**
   * Handle intersection events
   * @private
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   * @param {IntersectionObserver} observer - The intersection observer
   * @returns {void}
   */
  handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        
        // Stop observing this element
        observer.unobserve(section);
        
        // Load content for this section
        this.loadContent(section).catch(error => {
          console.error('Error lazy loading content:', error);
          
          // Show error in the section
          this.showLoadError(section, error);
        });
      }
    });
  }
  
  /**
   * Observe all content sections on the page
   * @private
   * @returns {void}
   */
  observeContentSections() {
    document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])').forEach(section => {
      this.observer.observe(section);
    });
  }
  
  /**
   * Set up mutation observer to detect new content sections
   * @private
   * @returns {void}
   */
  setupMutationObserver() {
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if it's a content section
              if (node.hasAttribute('data-content-src') && !node.hasAttribute('data-content-loaded')) {
                this.observer.observe(node);
              }
              
              // Check for content sections within the added node
              const sections = node.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])');
              sections.forEach(section => {
                this.observer.observe(section);
              });
            }
          });
        }
      });
    });
    
    // Start observing the document
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Load content for a specific section
   * @param {HTMLElement} section - The section element to load content for
   * @returns {Promise<void>} Promise that resolves when content is loaded
   */
  async loadContent(section) {
    // Get the content source
    const contentSrc = section.getAttribute('data-content-src');
    
    // Skip if no content source or already loaded
    if (!contentSrc || section.hasAttribute('data-content-loaded')) {
      console.log('Skipping section load:', contentSrc || 'unknown', '- Already loaded or no source');
      return Promise.resolve();
    }
    
    // Check if content is already being loaded
    if (this.loadingPromises.has(contentSrc)) {
      console.log('Content already loading:', contentSrc);
      return this.loadingPromises.get(contentSrc);
    }
    
    // Show loading indicator
    this.showLoading(section);
    
    // Build the content URL
    const contentUrl = this.buildContentUrl(contentSrc);
    console.log('Loading content from:', contentUrl);
    
    // Create a promise for this content load
    const loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Add a timeout
        const timeoutId = setTimeout(() => {
          reject(new Error(`Content load timed out after ${this.loadTimeout}ms: ${contentSrc}`));
        }, this.loadTimeout);
        
        // Fetch the content with better error handling
        const response = await fetch(contentUrl);
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Check if response is OK
        if (!response.ok) {
          const error = new Error(`Failed to load content (${response.status} ${response.statusText}): ${contentSrc}`);
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
        }
        
        // Get content as text
        const html = await response.text();
        
        // Validate content
        if (!html.trim()) {
          throw new Error(`Empty content received for: ${contentSrc}`);
        }
        
        // Insert content into section
        this.insertContent(section, html);
        
        // Mark as loaded
        section.setAttribute('data-content-loaded', 'true');
        
        // Resolve promise
        resolve();
        
        // Dispatch loaded event
        section.dispatchEvent(new CustomEvent('content-loaded'));
        document.dispatchEvent(new CustomEvent('section-content-loaded', {
          detail: { section, contentSrc }
        }));
        
        console.log('Content loaded successfully:', contentSrc);
      } catch (error) {
        console.error('Error loading content:', error);
        this.showLoadError(section, error);
        reject(error);
      } finally {
        // Remove from loading promises
        this.loadingPromises.delete(contentSrc);
      }
    });
    
    // Store promise
    this.loadingPromises.set(contentSrc, loadPromise);
    
    return loadPromise;
  }
  
  /**
   * Build the URL for loading content
   * @private
   * @param {string} contentSrc - The content source path
   * @returns {string} - The full URL for loading the content
   */
  buildContentUrl(contentSrc) {
    // If it's an absolute URL, use it as is
    if (contentSrc.startsWith('http://') || contentSrc.startsWith('https://')) {
      return contentSrc;
    }
    
    // Handle relative paths
    let fullSrc = contentSrc;
    
    // Make sure it has the right extension
    if (!fullSrc.endsWith('.html')) {
      fullSrc += '.html';
    }
    
    const contentUrl = `${this.contentBaseUrl}${fullSrc}`;
    
    // For debugging: try to detect if this is a webpack dev server path
    if (window.location.port === '8081' || window.location.hostname === 'localhost') {
      console.log('Dev environment detected, adjusting content URL');
      return contentUrl; // Dev server should handle the paths correctly
    }
    
    return contentUrl;
  }
  
  /**
   * Show loading indicator in a section
   * @private
   * @param {HTMLElement} section - The section element
   * @returns {void}
   */
  showLoading(section) {
    // Save current content if any
    if (!section.hasAttribute('data-original-content')) {
      section.setAttribute('data-original-content', section.innerHTML);
    }
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = styles.loadingIndicator;
    loadingIndicator.innerHTML = `
      <div class="${styles.loadingSpinner}"></div>
      <p>Loading content...</p>
    `;
    
    // Clear section and add loading indicator
    section.innerHTML = '';
    section.appendChild(loadingIndicator);
  }
  
  /**
   * Show error message in a section
   * @private
   * @param {HTMLElement} section - The section element
   * @param {Error} error - The error that occurred
   * @returns {void}
   */
  showLoadError(section, error) {
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = styles.loadingError;
    errorMessage.innerHTML = `
      <div class="${styles.errorIcon}">⚠️</div>
      <h3>Content Loading Error</h3>
      <p>${error.message}</p>
      <button class="${styles.retryButton}">Try Again</button>
    `;
    
    // Clear section and add error message
    section.innerHTML = '';
    section.appendChild(errorMessage);
    
    // Add retry functionality
    errorMessage.querySelector(`.${styles.retryButton}`).addEventListener('click', () => {
      // Try loading again
      this.loadContent(section).catch(error => {
        console.error('Error retrying content load:', error);
        this.showLoadError(section, error);
      });
    });
  }
  
  /**
   * Insert content into a section
   * @private
   * @param {HTMLElement} section - The section element
   * @param {string} html - The HTML content to insert
   * @returns {void}
   */
  insertContent(section, html) {
    // Create a temporary container to parse the HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    
    // Clear the section
    section.innerHTML = '';
    
    // Move the content from the temp container to the section
    while (tempContainer.firstChild) {
      section.appendChild(tempContainer.firstChild);
    }
    
    // Process code blocks if Prism is available
    if (window.Prism) {
      section.querySelectorAll('pre code').forEach(block => {
        window.Prism.highlightElement(block);
      });
    }
    
    // Setup any components in the loaded content
    document.dispatchEvent(new CustomEvent('content-inserted', {
      detail: { section, contentSrc: section.getAttribute('data-content-src') }
    }));
  }
  
  /**
   * Preload content for a section without displaying it
   * @param {string} contentSrc - The content source path
   * @returns {Promise<string>} - Promise that resolves with the content HTML
   */
  async preloadContent(contentSrc) {
    const contentUrl = this.buildContentUrl(contentSrc);
    
    const response = await fetch(contentUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to preload content: ${response.status} ${response.statusText}`);
    }
    
    return response.text();
  }
  
  /**
   * Force load all content sections immediately
   * @returns {Promise<void[]>} - Promise that resolves when all content is loaded
   */
  loadAllContent() {
    const sections = document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])');
    
    const loadPromises = Array.from(sections).map(section => {
      // Unobserve the section first
      if (this.observer) {
        this.observer.unobserve(section);
      }
      
      // Load the content
      return this.loadContent(section).catch(error => {
        console.error('Error loading all content:', error);
        this.showLoadError(section, error);
      });
    });
    
    return Promise.all(loadPromises);
  }
  
  /**
   * Debug helper to log information about content sections
   * @returns {void}
   */
  debugContentSections() {
    console.group('LazyLoader Debug Info');
    
    // Log the contentBaseUrl being used
    console.log('Content Base URL:', this.contentBaseUrl);
    
    // Count and log content sections
    const allSections = document.querySelectorAll('[data-content-src]');
    console.log(`Total content sections found: ${allSections.length}`);
    
    // Log details about each section
    allSections.forEach((section, index) => {
      const src = section.getAttribute('data-content-src');
      const loaded = section.hasAttribute('data-content-loaded');
      const id = section.id || `anonymous-section-${index}`;
      
      console.group(`Section #${index + 1}: ${id}`);
      console.log('Source:', src);
      console.log('Full URL:', this.buildContentUrl(src));
      console.log('Loaded:', loaded);
      console.log('Visible:', this.isElementVisible(section));
      console.groupEnd();
    });
    
    // Log loading promises
    console.log('Active loading promises:', this.loadingPromises.size);
    
    // Check if sections directory exists
    fetch(this.contentBaseUrl)
      .then(response => {
        console.log('Content directory access:', response.ok ? 'Success' : 'Failed');
      })
      .catch(error => {
        console.error('Error accessing content directory:', error);
      });
    
    console.groupEnd();
  }
  
  /**
   * Check if an element is visible in the viewport
   * @private
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} Whether the element is visible
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * Force load all content sections immediately
   * @returns {void}
   */
  forceLoadAllContent() {
    document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])').forEach(section => {
      this.loadContent(section).catch(error => {
        console.error('Error force loading content:', error);
        this.showLoadError(section, error);
      });
    });
  }
} 