import styles from './PageLoader.module.css';

/**
 * PageLoader options interface
 */
export interface PageLoaderOptions {
  /**
   * Selector for container to append the loader to
   */
  container?: string;
  
  /**
   * Default loading message
   */
  message?: string;
  
  /**
   * Whether to show loading spinner
   */
  showSpinner?: boolean;
  
  /**
   * Whether to show progress bar
   */
  showProgress?: boolean;
  
  /**
   * Whether to auto-hide when page is fully loaded
   */
  autoHide?: boolean;
  
  /**
   * Minimum time to display loader in ms
   */
  minDisplayTime?: number;
  
  /**
   * Fade out animation time in ms
   */
  fadeOutTime?: number;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * PageLoader Component
 * Provides a full-page loading overlay with customizable messages and progress indication
 */
export class PageLoader {
  /**
   * Container element for the loader
   */
  private container: HTMLElement;
  
  /**
   * Default loading message
   */
  private message: string;
  
  /**
   * Whether to show the spinner
   */
  private showSpinner: boolean;
  
  /**
   * Whether to show progress bar
   */
  private showProgress: boolean;
  
  /**
   * Whether to auto-hide when page is loaded
   */
  private autoHide: boolean;
  
  /**
   * Minimum display time in milliseconds
   */
  private minDisplayTime: number;
  
  /**
   * Fade out time in milliseconds
   */
  private fadeOutTime: number;
  
  /**
   * Current progress value (0-100)
   */
  private progress: number;
  
  /**
   * Timestamp when loader was shown
   */
  private startTime: number | null;
  
  /**
   * Whether the loader is initialized
   */
  private initialized: boolean;
  
  /**
   * Whether the loader is currently visible
   */
  private visible: boolean;
  
  /**
   * Main loader element
   */
  private loaderElement: HTMLElement | null;
  
  /**
   * Progress bar element
   */
  private progressBarElement: HTMLElement | null;
  
  /**
   * Message element
   */
  private messageElement: HTMLElement | null;
  
  /**
   * Additional load steps to track
   */
  private loadSteps: Map<string, boolean>;
  
  /**
   * Create a new PageLoader instance
   */
  constructor(options: PageLoaderOptions = {}) {
    const containerSelector = options.container || 'body';
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      throw new Error(`PageLoader: Container element "${containerSelector}" not found`);
    }
    
    this.container = container as HTMLElement;
    this.message = options.message || 'Loading...';
    this.showSpinner = options.showSpinner !== undefined ? options.showSpinner : true;
    this.showProgress = options.showProgress !== undefined ? options.showProgress : false;
    this.autoHide = options.autoHide !== undefined ? options.autoHide : true;
    this.minDisplayTime = options.minDisplayTime || 800;
    this.fadeOutTime = options.fadeOutTime || 300;
    this.progress = 0;
    this.startTime = null;
    this.initialized = false;
    this.visible = false;
    this.loaderElement = null;
    this.progressBarElement = null;
    this.messageElement = null;
    this.loadSteps = new Map();
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the page loader
   * @returns This PageLoader instance for chaining
   */
  initialize(): PageLoader {
    if (this.initialized) {
      return this;
    }
    
    this.createElement();
    this.setupEventListeners();
    this.initialized = true;
    
    return this;
  }
  
  /**
   * Create the loader element
   */
  private createElement(): void {
    // Create main loader element
    this.loaderElement = document.createElement('div');
    this.loaderElement.className = styles.pageLoader;
    
    // Create overlay content
    const content = document.createElement('div');
    content.className = styles.loaderContent;
    
    // Add spinner if enabled
    if (this.showSpinner) {
      const spinner = document.createElement('div');
      spinner.className = styles.spinner;
      content.appendChild(spinner);
    }
    
    // Add message
    this.messageElement = document.createElement('div');
    this.messageElement.className = styles.message;
    this.messageElement.textContent = this.message;
    content.appendChild(this.messageElement);
    
    // Add progress bar if enabled
    if (this.showProgress) {
      const progressContainer = document.createElement('div');
      progressContainer.className = styles.progressContainer;
      
      this.progressBarElement = document.createElement('div');
      this.progressBarElement.className = styles.progressBar;
      this.progressBarElement.style.width = '0%';
      
      progressContainer.appendChild(this.progressBarElement);
      content.appendChild(progressContainer);
    }
    
    // Add content to loader
    this.loaderElement.appendChild(content);
    
    // Add to container but don't show yet
    this.container.appendChild(this.loaderElement);
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (this.autoHide) {
      // Hide when page is fully loaded
      window.addEventListener('load', () => {
        this.setProgress(100);
        this.hideAfterDelay();
      });
      
      // Track resource loading
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.setProgress(50);
        });
      } else {
        this.setProgress(50);
      }
      
      // Track AJAX requests (if applicable)
      if (window.XMLHttpRequest) {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        let activeRequests = 0;
        
        XMLHttpRequest.prototype.open = function(
          this: XMLHttpRequest,
          method: string, 
          url: string | URL, 
          async?: boolean, 
          username?: string | null, 
          password?: string | null
        ) {
          return originalOpen.apply(this, [method, url, async, username, password].filter(arg => arg !== undefined) as Parameters<typeof originalOpen>);
        };
        
        XMLHttpRequest.prototype.send = function(
          this: XMLHttpRequest,
          body?: Document | XMLHttpRequestBodyInit | null
        ) {
          activeRequests++;
          
          this.addEventListener('loadend', () => {
            activeRequests--;
            if (activeRequests === 0) {
              document.dispatchEvent(new CustomEvent('ajax-complete'));
            }
          });
          
          return originalSend.apply(this, body !== undefined ? [body] : []);
        };
        
        document.addEventListener('ajax-complete', () => {
          this.setProgress(90);
        });
      }
    }
    
    // Custom event for content loaded
    document.addEventListener('content-loaded', () => {
      this.setProgress(95);
      this.hideAfterDelay();
    });
  }
  
  /**
   * Show the loader
   * @param message - Optional message to display
   * @returns This PageLoader instance for chaining
   */
  show(message?: string): PageLoader {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (message) {
      this.setMessage(message);
    }
    
    this.startTime = Date.now();
    
    if (this.loaderElement) {
      this.loaderElement.classList.add(styles.visible);
    }
    
    this.visible = true;
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('pageloader-shown', {
      detail: { pageLoader: this }
    }));
    
    return this;
  }
  
  /**
   * Hide the loader
   * @returns This PageLoader instance for chaining
   */
  hide(): PageLoader {
    if (!this.visible || !this.loaderElement) {
      return this;
    }
    
    this.loaderElement.classList.remove(styles.visible);
    this.loaderElement.classList.add(styles.fadeOut);
    this.visible = false;
    
    // Remove fade out class after animation completes
    setTimeout(() => {
      if (this.loaderElement) {
        this.loaderElement.classList.remove(styles.fadeOut);
      }
    }, this.fadeOutTime);
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('pageloader-hidden', {
      detail: { pageLoader: this }
    }));
    
    return this;
  }
  
  /**
   * Hide the loader after ensuring minimum display time
   */
  private hideAfterDelay(): void {
    const now = Date.now();
    const timeShown = this.startTime ? now - this.startTime : 0;
    
    if (timeShown >= this.minDisplayTime) {
      // Minimum time elapsed, hide immediately
      this.hide();
    } else {
      // Wait for minimum time
      const remainingTime = this.minDisplayTime - timeShown;
      setTimeout(() => this.hide(), remainingTime);
    }
  }
  
  /**
   * Set the loader message
   * @param message - Message to display
   * @returns This PageLoader instance for chaining
   */
  setMessage(message: string): PageLoader {
    if (this.messageElement) {
      this.messageElement.textContent = message;
    }
    
    return this;
  }
  
  /**
   * Set the current progress
   * @param value - Progress value (0-100)
   * @returns This PageLoader instance for chaining
   */
  setProgress(value: number): PageLoader {
    // Ensure value is between 0-100
    this.progress = Math.max(0, Math.min(100, value));
    
    // Update progress bar if it exists
    if (this.progressBarElement) {
      this.progressBarElement.style.width = `${this.progress}%`;
    }
    
    // If we reached 100%, hide after minimum display time
    if (this.progress >= 100) {
      this.hideAfterDelay();
    }
    
    // Dispatch progress event
    document.dispatchEvent(new CustomEvent('pageloader-progress', {
      detail: { 
        pageLoader: this,
        progress: this.progress 
      }
    }));
    
    return this;
  }
  
  /**
   * Add a custom load step to track
   * @param stepId - Unique ID for the load step
   * @param completed - Whether the step is already completed
   * @returns This PageLoader instance for chaining
   */
  addLoadStep(stepId: string, completed = false): PageLoader {
    this.loadSteps.set(stepId, completed);
    this.updateProgressFromSteps();
    
    return this;
  }
  
  /**
   * Mark a load step as completed
   * @param stepId - ID of the load step
   * @returns This PageLoader instance for chaining
   */
  completeLoadStep(stepId: string): PageLoader {
    if (this.loadSteps.has(stepId)) {
      this.loadSteps.set(stepId, true);
      this.updateProgressFromSteps();
    }
    
    return this;
  }
  
  /**
   * Calculate and update progress based on completed steps
   */
  private updateProgressFromSteps(): void {
    if (this.loadSteps.size === 0) {
      return;
    }
    
    let completed = 0;
    
    for (const [_, isCompleted] of this.loadSteps) {
      if (isCompleted) {
        completed++;
      }
    }
    
    const progress = Math.floor((completed / this.loadSteps.size) * 100);
    this.setProgress(progress);
  }
  
  /**
   * Show an error message
   * @param errorMessage - Error message to display
   * @returns This PageLoader instance for chaining
   */
  showError(errorMessage: string): PageLoader {
    if (!this.loaderElement) {
      return this;
    }
    
    // Add error class
    this.loaderElement.classList.add(styles.error);
    
    // Update message with error
    if (this.messageElement) {
      this.messageElement.innerHTML = `
        <div class="${styles.errorIcon}">⚠️</div>
        <div>${errorMessage}</div>
        <button class="${styles.retryButton}" onclick="window.location.reload()">
          Retry
        </button>
      `;
    }
    
    // Dispatch error event
    document.dispatchEvent(new CustomEvent('pageloader-error', {
      detail: { 
        pageLoader: this,
        error: errorMessage 
      }
    }));
    
    return this;
  }
  
  /**
   * Destroy the loader and clean up
   */
  destroy(): void {
    // Remove the loader element
    if (this.loaderElement && this.loaderElement.parentNode) {
      this.loaderElement.parentNode.removeChild(this.loaderElement);
    }
    
    // Reset properties
    this.loaderElement = null;
    this.progressBarElement = null;
    this.messageElement = null;
    this.initialized = false;
    this.visible = false;
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('pageloader-destroyed', {
      detail: { pageLoader: this }
    }));
  }
} 