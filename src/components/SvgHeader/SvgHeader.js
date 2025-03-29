/**
 * SvgHeader Component for Steam Deck DUB Edition
 * Manages the animated SVG header with styling and functionality
 * 
 * @module SvgHeader
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './SvgHeader.module.css';

/**
 * Class representing the SVG Header component
 */
class SvgHeader {
  /**
   * Create a new SvgHeader instance
   */
  constructor() {
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Collection of header container elements
     * @type {NodeList|Array}
     * @private
     */
    this.headerContainers = [];
    
    /**
     * Collection of SVG objects
     * @type {NodeList|Array}
     * @private
     */
    this.svgObjects = [];
  }
  
  /**
   * Initialize the SVG header component
   * @param {Object} options - Configuration options
   * @param {string} [options.containerSelector='.header-container'] - CSS selector for header containers
   * @param {string} [options.svgPath='sdde.svg'] - Path to the SVG file
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    const settings = {
      containerSelector: '.header-container',
      svgPath: 'sdde.svg',
      ...options
    };
    
    // Find header containers
    this.headerContainers = document.querySelectorAll(settings.containerSelector);
    
    if (!this.headerContainers.length) {
      console.warn(`SvgHeader: No elements found matching selector '${settings.containerSelector}'`);
      return;
    }
    
    // Apply module styles to containers
    this.headerContainers.forEach(container => {
      container.classList.add(styles['header-container']);
    });
    
    // Initialize SVG objects in each container
    this.initializeSvgObjects(settings.svgPath);
    
    // Add event listeners for SVG objects
    this.setupEventListeners();
    
    this.initialized = true;
    console.log('SvgHeader component initialized');
  }
  
  /**
   * Initialize SVG objects within containers
   * @param {string} svgPath - Path to the SVG file
   * @private
   */
  initializeSvgObjects(svgPath) {
    this.headerContainers.forEach(container => {
      // Check if container already has an SVG object
      let svgObject = container.querySelector('object');
      
      if (!svgObject) {
        // Create new SVG object if not present
        svgObject = document.createElement('object');
        svgObject.setAttribute('data', svgPath);
        svgObject.setAttribute('type', 'image/svg+xml');
        svgObject.setAttribute('aria-label', 'Steam Deck DUB Edition Logo');
        
        // Create fallback content
        const fallback = document.createElement('div');
        fallback.className = styles['svg-fallback'];
        fallback.innerHTML = '<h2>Steam Deck DUB Edition</h2>';
        svgObject.appendChild(fallback);
        
        container.appendChild(svgObject);
      }
      
      // Apply styles to SVG object
      svgObject.className = styles['header-svg'];
      
      // Store reference to SVG object
      this.svgObjects.push(svgObject);
    });
  }
  
  /**
   * Setup event listeners for SVG objects
   * @private
   */
  setupEventListeners() {
    this.svgObjects.forEach(svgObject => {
      // Listen for load event to initialize SVG
      svgObject.addEventListener('load', () => this.onSvgLoaded(svgObject));
      
      // Listen for error event to show fallback
      svgObject.addEventListener('error', () => this.onSvgError(svgObject));
    });
  }
  
  /**
   * Handle SVG load event
   * @param {HTMLObjectElement} svgObject - The SVG object element
   * @private
   */
  onSvgLoaded(svgObject) {
    try {
      // Access SVG document
      const svgDoc = svgObject.contentDocument;
      if (!svgDoc) return;
      
      // Apply styles to SVG elements
      this.applyStylingToSvgElements(svgDoc);
      
      // Add animation classes or other enhancements
      this.enhanceSvgElements(svgDoc);
      
      console.log('SVG header loaded successfully');
    } catch (error) {
      console.error('Error initializing SVG header:', error);
    }
  }
  
  /**
   * Handle SVG load error
   * @param {HTMLObjectElement} svgObject - The SVG object element
   * @private
   */
  onSvgError(svgObject) {
    // Show fallback content
    const fallback = svgObject.querySelector(`.${styles['svg-fallback']}`);
    if (fallback) {
      fallback.style.display = 'flex';
    }
    
    console.error('Failed to load SVG header');
  }
  
  /**
   * Apply styling to SVG document elements
   * @param {Document} svgDoc - The SVG document
   * @private
   */
  applyStylingToSvgElements(svgDoc) {
    // Find elements in the SVG document and apply additional styling
    const bodyElements = svgDoc.querySelectorAll('.cl-body');
    bodyElements.forEach(element => {
      // Apply theme variables
      this.applyThemeVariables(element);
    });
  }
  
  /**
   * Apply theme variables to SVG element
   * @param {Element} element - The SVG element
   * @private
   */
  applyThemeVariables(element) {
    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark-theme') ||
                      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Apply appropriate theme variables
    if (isDarkMode) {
      element.style.setProperty('--color-main', '#bd93f9');
      element.style.setProperty('--color-primary', '#ff79c6');
      element.style.setProperty('--color-secondary', '#8be9fd');
      element.style.setProperty('--color-background', '#282a36');
      element.style.setProperty('--color-link', '#50fa7b');
      element.style.setProperty('--color-link-active', '#ffb86c');
    } else {
      element.style.setProperty('--color-main', '#9B5DE5');
      element.style.setProperty('--color-primary', '#F15BB5');
      element.style.setProperty('--color-secondary', '#00BBF9');
      element.style.setProperty('--color-background', '#fff');
      element.style.setProperty('--color-link', '#00BBF9');
      element.style.setProperty('--color-link-active', '#F15BB5');
    }
  }
  
  /**
   * Enhance SVG elements with additional functionality
   * @param {Document} svgDoc - The SVG document
   * @private
   */
  enhanceSvgElements(svgDoc) {
    // Find hi elements and add wave animation
    const hiElements = svgDoc.querySelectorAll('.hi');
    hiElements.forEach(element => {
      element.classList.add(styles.hi);
    });
    
    // Find link elements and add hover effects
    const linkElements = svgDoc.querySelectorAll('a');
    linkElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.color = 'var(--color-link-active)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.color = 'var(--color-link)';
      });
    });
  }
  
  /**
   * Refresh the SVG header (e.g., after theme change)
   * @public
   */
  refresh() {
    if (!this.initialized) return;
    
    this.svgObjects.forEach(svgObject => {
      const svgDoc = svgObject.contentDocument;
      if (svgDoc) {
        const bodyElements = svgDoc.querySelectorAll('.cl-body');
        bodyElements.forEach(element => {
          this.applyThemeVariables(element);
        });
      }
    });
  }
}

// Export singleton instance
export default new SvgHeader(); 