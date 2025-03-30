/**
 * Grimoire
 * SvgHeader Component
 * 
 * A component for managing SVG headers with proper styling and fallback support
 */

import styles from './SvgHeader.module.css';

class SvgHeader {
  /**
   * Create a new SVG header
   * @param {Object} options - Configuration options
   * @param {string} options.svgPath - Path to the SVG file
   * @param {string} options.fallbackText - Text to show if SVG fails to load
   * @param {string} options.ariaLabel - Accessibility label for the SVG
   * @param {HTMLElement} options.container - Container element to append the header to
   * @param {string} options.cssPath - Path to external CSS for the SVG (optional)
   * @param {Object} options.cssVariables - CSS variables to pass to the SVG (optional)
   * @param {boolean} options.autoInit - Whether to initialize automatically (default: true)
   */
  constructor(options = {}) {
    this.options = {
      svgPath: options.svgPath || 'sdde.svg',
      fallbackText: options.fallbackText || 'Grimoire',
      ariaLabel: options.ariaLabel || 'Grimoire Logo',
      container: options.container || document.body,
      cssPath: options.cssPath || 'svg-header-styles.css',
      cssVariables: options.cssVariables || [
        '--color-main',
        '--color-primary',
        '--color-secondary',
        '--color-background', 
        '--color-link',
        '--color-link-active'
      ],
      autoInit: options.autoInit !== false
    };
    
    /**
     * The header container element
     * @type {HTMLElement}
     */
    this.headerContainer = null;
    
    /**
     * The SVG container element
     * @type {HTMLElement}
     */
    this.svgContainer = null;
    
    /**
     * Whether the component is initialized
     * @type {boolean}
     */
    this.initialized = false;
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the SVG header
   * @returns {HTMLElement} The created header container
   */
  initialize() {
    if (this.initialized) return this.headerContainer;
    
    // Create header container
    this.headerContainer = document.createElement('div');
    this.headerContainer.className = `${styles.headerContainer} header-container`;
    
    // Create SVG container using object tag
    this.svgContainer = document.createElement('object');
    this.svgContainer.data = this.options.svgPath;
    this.svgContainer.type = 'image/svg+xml';
    this.svgContainer.className = `${styles.headerSvg} header-svg`;
    this.svgContainer.setAttribute('aria-label', this.options.ariaLabel);
    
    // Create fallback content
    const fallback = document.createElement('div');
    fallback.className = `${styles.svgFallback} svg-fallback`;
    fallback.innerHTML = `<h2>${this.options.fallbackText}</h2>`;
    
    // Append fallback to SVG container
    this.svgContainer.appendChild(fallback);
    
    // Append SVG container to header container
    this.headerContainer.appendChild(this.svgContainer);
    
    // Add loading state
    this.headerContainer.classList.add(styles.svgLoading, 'svg-loading');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Append header container to specified container
    this.options.container.appendChild(this.headerContainer);
    
    this.initialized = true;
    return this.headerContainer;
  }
  
  /**
   * Set up event listeners for the SVG container
   * @private
   */
  setupEventListeners() {
    if (!this.svgContainer) return;
    
    // Handle load event
    this.svgContainer.addEventListener('load', this.handleSvgLoad.bind(this));
    
    // Handle error event
    this.svgContainer.addEventListener('error', this.handleSvgError.bind(this));
  }
  
  /**
   * Handle SVG load event
   * @private
   * @param {Event} event - Load event
   */
  handleSvgLoad(event) {
    try {
      // Get the SVG document
      const svgDoc = this.svgContainer.contentDocument;
      
      if (svgDoc && svgDoc.documentElement) {
        // Apply CSS to the SVG
        this.applyCssToSvg(svgDoc);
        
        // Apply CSS variables to the SVG
        this.applyCssVariablesToSvg(svgDoc);
        
        // Remove loading state and add loaded state
        this.headerContainer.classList.remove(styles.svgLoading, 'svg-loading');
        this.headerContainer.classList.add(styles.svgLoaded, 'svg-loaded');
        this.svgContainer.classList.add(styles.svgLoaded, 'svg-loaded');
        
        // Dispatch loaded event
        this.dispatchEvent('svg-loaded', { svgDoc });
      }
    } catch (error) {
      console.error('Error styling SVG header:', error);
      this.handleSvgError();
    }
  }
  
  /**
   * Handle SVG error event
   * @private
   */
  handleSvgError() {
    console.error('Failed to load SVG header');
    
    // Remove loading state and add error state
    this.headerContainer.classList.remove(styles.svgLoading, 'svg-loading');
    this.headerContainer.classList.add(styles.svgError, 'svg-error');
    
    // Dispatch error event
    this.dispatchEvent('svg-error', { });
  }
  
  /**
   * Apply external CSS to the SVG document
   * @private
   * @param {Document} svgDoc - SVG document
   */
  applyCssToSvg(svgDoc) {
    if (!svgDoc || !this.options.cssPath) return;
    
    // Create a link element to load the external CSS
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('type', 'text/css');
    linkElem.setAttribute('href', this.options.cssPath);
    
    // Append it to the SVG document head
    const svgHead = svgDoc.querySelector('head') || svgDoc.documentElement;
    svgHead.appendChild(linkElem);
  }
  
  /**
   * Apply CSS variables to the SVG document
   * @private
   * @param {Document} svgDoc - SVG document
   */
  applyCssVariablesToSvg(svgDoc) {
    if (!svgDoc || !this.options.cssVariables) return;
    
    // Get computed styles from root
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Create style element
    const styleElem = document.createElement('style');
    
    // Build CSS variables string
    let styleText = ':root {\n';
    this.options.cssVariables.forEach(varName => {
      const value = rootStyles.getPropertyValue(varName);
      if (value) {
        styleText += `  ${varName}: ${value};\n`;
      }
    });
    styleText += '}';
    
    // Set style content and append to SVG
    styleElem.textContent = styleText;
    const svgHead = svgDoc.querySelector('head') || svgDoc.documentElement;
    svgHead.appendChild(styleElem);
  }
  
  /**
   * Dispatch a custom event
   * @private
   * @param {string} name - Event name
   * @param {Object} detail - Event details
   */
  dispatchEvent(name, detail = {}) {
    const event = new CustomEvent(name, {
      bubbles: true,
      detail: {
        svgHeader: this,
        ...detail
      }
    });
    
    this.headerContainer.dispatchEvent(event);
    document.dispatchEvent(event);
  }
  
  /**
   * Manually set a new SVG path
   * @param {string} path - New SVG path
   */
  setSvgPath(path) {
    if (!this.svgContainer) return;
    
    // Add loading state
    this.headerContainer.classList.add(styles.svgLoading, 'svg-loading');
    this.headerContainer.classList.remove(styles.svgLoaded, 'svg-loaded', styles.svgError, 'svg-error');
    
    // Update path
    this.options.svgPath = path;
    this.svgContainer.data = path;
  }
  
  /**
   * Manually set fallback text
   * @param {string} text - New fallback text
   */
  setFallbackText(text) {
    if (!this.headerContainer) return;
    
    this.options.fallbackText = text;
    
    const fallback = this.headerContainer.querySelector(`.${styles.svgFallback}, .svg-fallback`);
    if (fallback) {
      fallback.innerHTML = `<h2>${text}</h2>`;
    }
  }
  
  /**
   * Manually destroy the component
   */
  destroy() {
    if (!this.headerContainer) return;
    
    // Remove event listeners
    if (this.svgContainer) {
      this.svgContainer.removeEventListener('load', this.handleSvgLoad);
      this.svgContainer.removeEventListener('error', this.handleSvgError);
    }
    
    // Remove from DOM
    this.headerContainer.remove();
    
    // Reset properties
    this.headerContainer = null;
    this.svgContainer = null;
    this.initialized = false;
  }
}

export default SvgHeader; 