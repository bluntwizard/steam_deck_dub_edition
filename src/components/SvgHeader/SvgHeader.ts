/**
 * Steam Deck DUB Edition
 * SvgHeader Component
 * 
 * A component for managing SVG headers with proper styling and fallback support
 */

import styles from './SvgHeader.module.css';
import { SvgHeaderOptions, SvgLoadEventDetail, SvgErrorEventDetail } from '../../types/svg-header';

export class SvgHeader {
  /**
   * Configuration options
   */
  private options: Required<SvgHeaderOptions>;
  
  /**
   * The header container element
   */
  private headerContainer: HTMLElement | null = null;
  
  /**
   * The SVG container element
   */
  private svgContainer: HTMLObjectElement | null = null;
  
  /**
   * Whether the component is initialized
   */
  private initialized: boolean = false;
  
  /**
   * Create a new SVG header
   */
  constructor(options: SvgHeaderOptions = {}) {
    this.options = {
      svgPath: options.svgPath || 'sdde.svg',
      fallbackText: options.fallbackText || 'Steam Deck DUB Edition',
      ariaLabel: options.ariaLabel || 'Steam Deck DUB Edition Logo',
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
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the SVG header
   * @returns The created header container
   */
  initialize(): HTMLElement {
    if (this.initialized && this.headerContainer) return this.headerContainer;
    
    // Create header container
    this.headerContainer = document.createElement('div');
    this.headerContainer.className = `${styles.headerContainer} header-container`;
    
    // Create SVG container using object tag
    this.svgContainer = document.createElement('object') as HTMLObjectElement;
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
  private setupEventListeners(): void {
    if (!this.svgContainer) return;
    
    // Handle load event
    this.svgContainer.addEventListener('load', this.handleSvgLoad.bind(this));
    
    // Handle error event
    this.svgContainer.addEventListener('error', this.handleSvgError.bind(this));
  }
  
  /**
   * Handle SVG load event
   * @private
   */
  private handleSvgLoad(): void {
    try {
      if (!this.svgContainer || !this.headerContainer) return;
      
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
  private handleSvgError(): void {
    if (!this.headerContainer) return;
    
    console.error('Failed to load SVG header');
    
    // Remove loading state and add error state
    this.headerContainer.classList.remove(styles.svgLoading, 'svg-loading');
    this.headerContainer.classList.add(styles.svgError, 'svg-error');
    
    // Dispatch error event
    this.dispatchEvent('svg-error', {});
  }
  
  /**
   * Apply external CSS to the SVG document
   * @private
   */
  private applyCssToSvg(svgDoc: Document): void {
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
   */
  private applyCssVariablesToSvg(svgDoc: Document): void {
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
   */
  private dispatchEvent(name: string, detail: Partial<SvgLoadEventDetail> = {}): void {
    if (!this.headerContainer) return;
    
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
   */
  setSvgPath(path: string): void {
    if (!this.svgContainer || !this.headerContainer) return;
    
    // Add loading state
    this.headerContainer.classList.add(styles.svgLoading, 'svg-loading');
    this.headerContainer.classList.remove(styles.svgLoaded, 'svg-loaded', styles.svgError, 'svg-error');
    
    // Update path
    this.options.svgPath = path;
    this.svgContainer.data = path;
  }
  
  /**
   * Set fallback text
   */
  setFallbackText(text: string): void {
    if (!this.headerContainer) return;
    
    // Update options
    this.options.fallbackText = text;
    
    // Update fallback element if it exists
    const fallback = this.headerContainer.querySelector('.svg-fallback');
    if (fallback) {
      fallback.innerHTML = `<h2>${text}</h2>`;
    }
  }
  
  /**
   * Destroy the SVG header and clean up
   */
  destroy(): void {
    if (!this.initialized) return;
    
    // Remove event listeners if SVG container exists
    if (this.svgContainer) {
      this.svgContainer.removeEventListener('load', this.handleSvgLoad.bind(this));
      this.svgContainer.removeEventListener('error', this.handleSvgError.bind(this));
    }
    
    // Remove container from DOM if it exists
    if (this.headerContainer && this.headerContainer.parentNode) {
      this.headerContainer.parentNode.removeChild(this.headerContainer);
    }
    
    // Reset properties
    this.headerContainer = null;
    this.svgContainer = null;
    this.initialized = false;
  }
} 