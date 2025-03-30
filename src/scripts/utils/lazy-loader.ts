/**
 * Lazy Loading Module for Steam Deck DUB Edition
 * Handles dynamic loading of content sections
 */

/**
 * Configuration options for LazyLoader
 */
interface LazyLoaderOptions {
  contentBaseUrl?: string;
  loadTimeout?: number;
}

/**
 * Manages lazy loading of content sections
 */
class LazyLoader {
  private observer: IntersectionObserver | null;
  private loadingPromises: Map<string, Promise<void>>;
  private initialized: boolean;
  private contentBaseUrl: string;
  private loadTimeout: number;
  private mutationObserver?: MutationObserver;

  constructor() {
    /**
     * IntersectionObserver for detecting when elements enter viewport
     */
    this.observer = null;
    
    /**
     * Map of sections being loaded to their promises
     */
    this.loadingPromises = new Map();
    
    /**
     * Whether the lazy loader is initialized
     */
    this.initialized = false;
    
    /**
     * Base URL for content loading
     */
    this.contentBaseUrl = './content/';
    
    /**
     * Default timeout for content loading (ms)
     */
    this.loadTimeout = 10000; // 10 seconds
  }
  
  /**
   * Initialize the lazy loader
   */
  initialize(options: LazyLoaderOptions = {}): void {
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
   */
  private handleIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target as HTMLElement;
        
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
   */
  private observeContentSections(): void {
    document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])').forEach(section => {
      if (this.observer) {
        this.observer.observe(section);
      }
    });
  }
  
  /**
   * Set up mutation observer to detect new content sections
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Check if it's a content section
              if (element.hasAttribute('data-content-src') && !element.hasAttribute('data-content-loaded')) {
                if (this.observer) {
                  this.observer.observe(element);
                }
              }
              
              // Check for content sections within the added node
              const sections = element.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])');
              sections.forEach(section => {
                if (this.observer) {
                  this.observer.observe(section);
                }
              });
            }
          });
        }
      });
    });
    
    // Start observing the document
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Load content for a specific section
   */
  async loadContent(section: HTMLElement): Promise<void> {
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
      return this.loadingPromises.get(contentSrc) as Promise<void>;
    }
    
    // Show loading indicator
    this.showLoading(section);
    
    // Build the content URL
    const contentUrl = this.buildContentUrl(contentSrc);
    console.log('Loading content from:', contentUrl);
    
    // Create a promise for this content load
    const loadPromise = new Promise<void>(async (resolve, reject) => {
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
          (error as any).status = response.status;
          (error as any).statusText = response.statusText;
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
        this.showLoadError(section, error instanceof Error ? error : new Error(String(error)));
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
   * Build the URL for content
   */
  private buildContentUrl(contentSrc: string): string {
    // If contentSrc starts with http:// or https://, use it as is
    if (contentSrc.startsWith('http://') || contentSrc.startsWith('https://')) {
      return contentSrc;
    }
    
    // If contentSrc starts with /, join with origin
    if (contentSrc.startsWith('/')) {
      return window.location.origin + contentSrc;
    }
    
    // Otherwise, join with base URL
    let url = this.contentBaseUrl;
    if (!url.endsWith('/')) {
      url += '/';
    }
    
    return url + contentSrc;
  }
  
  /**
   * Show loading indicator in a section
   */
  private showLoading(section: HTMLElement): void {
    // Check if loading indicator already exists
    if (section.querySelector('.loading-indicator')) {
      return;
    }
    
    // Create loading indicator
    const loading = document.createElement('div');
    loading.className = 'loading-indicator';
    loading.setAttribute('aria-label', 'Loading content...');
    loading.setAttribute('role', 'status');
    
    // Add spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    loading.appendChild(spinner);
    
    // Add loading text
    const text = document.createElement('div');
    text.className = 'loading-text';
    text.textContent = 'Loading...';
    loading.appendChild(text);
    
    // Add to section
    section.appendChild(loading);
  }
  
  /**
   * Show error message in a section
   */
  private showLoadError(section: HTMLElement, error: Error): void {
    // Remove loading indicator if present
    const loading = section.querySelector('.loading-indicator');
    if (loading) {
      loading.remove();
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'content-load-error';
    
    // Add error heading
    const heading = document.createElement('h3');
    heading.textContent = 'Error Loading Content';
    errorElement.appendChild(heading);
    
    // Add error message
    const message = document.createElement('p');
    message.textContent = error.message || 'Failed to load content. Please try refreshing the page.';
    errorElement.appendChild(message);
    
    // Add retry button
    const retryButton = document.createElement('button');
    retryButton.className = 'error-retry-btn';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove error element
      errorElement.remove();
      
      // Try loading again
      this.loadContent(section).catch(err => {
        console.error('Error retrying content load:', err);
        this.showLoadError(section, err instanceof Error ? err : new Error(String(err)));
      });
    });
    errorElement.appendChild(retryButton);
    
    // Add to section
    section.appendChild(errorElement);
  }
  
  /**
   * Insert content into a section
   */
  private insertContent(section: HTMLElement, html: string): void {
    // Remove loading indicator if present
    const loading = section.querySelector('.loading-indicator');
    if (loading) {
      loading.remove();
    }
    
    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = html;
    
    // Check if container has a single root element that's a section/article/div
    const rootElement = container.children.length === 1 && 
                       ['SECTION', 'ARTICLE', 'DIV'].includes(container.firstElementChild?.tagName || '') ? 
                       container.firstElementChild : null;
    
    // If we have a root element, merge attributes and replace children
    if (rootElement) {
      // Copy attributes from loaded content's root element to section
      Array.from(rootElement.attributes).forEach(attr => {
        // Skip data-content-src and data-content-loaded
        if (attr.name !== 'data-content-src' && attr.name !== 'data-content-loaded') {
          section.setAttribute(attr.name, attr.value);
        }
      });
      
      // Replace children
      section.innerHTML = rootElement.innerHTML;
    } else {
      // Just insert the HTML directly
      section.innerHTML = html;
    }
  }
  
  /**
   * Preload content without inserting it
   */
  async preloadContent(contentSrc: string): Promise<string> {
    // Build the content URL
    const contentUrl = this.buildContentUrl(contentSrc);
    
    // Fetch the content
    const response = await fetch(contentUrl);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`Failed to preload content (${response.status} ${response.statusText}): ${contentSrc}`);
    }
    
    // Return the content as text
    return response.text();
  }
  
  /**
   * Load all content sections on the page
   */
  async loadAllContent(): Promise<void[]> {
    const sections = Array.from(document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])'));
    
    // Create array of promises
    const promises = sections.map(section => {
      return this.loadContent(section as HTMLElement).catch(error => {
        console.error('Error loading content during loadAllContent:', error);
        return Promise.resolve(); // Continue despite errors
      });
    });
    
    // Wait for all to complete
    return Promise.all(promises);
  }
  
  /**
   * Debug content sections on the page
   */
  debugContentSections(): void {
    const sections = document.querySelectorAll('[data-content-src]');
    
    console.group('Content Sections Debug');
    console.log(`Found ${sections.length} content sections on the page.`);
    
    sections.forEach((section, index) => {
      const contentSrc = section.getAttribute('data-content-src');
      const isLoaded = section.hasAttribute('data-content-loaded');
      const isInViewport = this.isElementVisible(section as HTMLElement);
      
      console.group(`Section ${index + 1}: ${contentSrc}`);
      console.log('Element:', section);
      console.log('Loaded:', isLoaded);
      console.log('In viewport:', isInViewport);
      
      // Show loading status
      if (!isLoaded) {
        if (this.loadingPromises.has(contentSrc || '')) {
          console.log('Status: Currently loading');
        } else {
          console.log('Status: Not loaded yet');
        }
      } else {
        console.log('Status: Successfully loaded');
      }
      
      console.groupEnd();
    });
    
    console.groupEnd();
  }
  
  /**
   * Check if an element is visible in the viewport
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * Force loading of all content sections immediately
   */
  forceLoadAllContent(): void {
    document.querySelectorAll('[data-content-src]:not([data-content-loaded="true"])').forEach(section => {
      this.loadContent(section as HTMLElement).catch(error => {
        console.error('Error during forced content load:', error);
      });
    });
  }
}

// Create singleton instance
const lazyLoader = new LazyLoader();

// Export the singleton
export default lazyLoader; 