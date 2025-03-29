import styles from './PageLoader.module.css';

/**
 * PageLoader Component
 * Provides a full-page loading overlay with customizable messages and progress indication
 */
export class PageLoader {
  /**
   * Create a new PageLoader instance
   * @param {Object} options - Configuration options
   * @param {string} [options.container='body'] - Selector for container to append the loader to
   * @param {string} [options.message='Loading...'] - Default loading message
   * @param {boolean} [options.showSpinner=true] - Whether to show loading spinner
   * @param {boolean} [options.showProgress=false] - Whether to show progress bar
   * @param {boolean} [options.autoHide=true] - Whether to auto-hide when page is fully loaded
   * @param {number} [options.minDisplayTime=800] - Minimum time to display loader in ms
   * @param {number} [options.fadeOutTime=300] - Fade out animation time in ms
   * @param {boolean} [options.autoInit=true] - Whether to initialize automatically
   */
  constructor(options = {}) {
    /**
     * Container element for the loader
     * @type {HTMLElement}
     * @private
     */
    this.container = document.querySelector(options.container || 'body');
    
    /**
     * Default loading message
     * @type {string}
     * @private
     */
    this.message = options.message || 'Loading...';
    
    /**
     * Whether to show the spinner
     * @type {boolean}
     * @private
     */
    this.showSpinner = options.showSpinner !== undefined ? options.showSpinner : true;
    
    /**
     * Whether to show progress bar
     * @type {boolean}
     * @private
     */
    this.showProgress = options.showProgress !== undefined ? options.showProgress : false;
    
    /**
     * Whether to auto-hide when page is loaded
     * @type {boolean}
     * @private
     */
    this.autoHide = options.autoHide !== undefined ? options.autoHide : true;
    
    /**
     * Minimum display time in milliseconds
     * @type {number}
     * @private
     */
    this.minDisplayTime = options.minDisplayTime || 800;
    
    /**
     * Fade out time in milliseconds
     * @type {number}
     * @private
     */
    this.fadeOutTime = options.fadeOutTime || 300;
    
    /**
     * Current progress value (0-100)
     * @type {number}
     * @private
     */
    this.progress = 0;
    
    /**
     * Timestamp when loader was shown
     * @type {number|null}
     * @private
     */
    this.startTime = null;
    
    /**
     * Whether the loader is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Whether the loader is currently visible
     * @type {boolean}
     * @private
     */
    this.visible = false;
    
    /**
     * Main loader element
     * @type {HTMLElement|null}
     * @private
     */
    this.loaderElement = null;
    
    /**
     * Progress bar element
     * @type {HTMLElement|null}
     * @private
     */
    this.progressBarElement = null;
    
    /**
     * Message element
     * @type {HTMLElement|null}
     * @private
     */
    this.messageElement = null;
    
    /**
     * Additional load steps to track
     * @type {Map<string, boolean>}
     * @private
     */
    this.loadSteps = new Map();
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the page loader
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  initialize() {
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
   * @private
   */
  createElement() {
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
   * @private
   */
  setupEventListeners() {
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
        
        XMLHttpRequest.prototype.open = function() {
          return originalOpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
          activeRequests++;
          
          this.addEventListener('loadend', () => {
            activeRequests--;
            if (activeRequests === 0) {
              document.dispatchEvent(new CustomEvent('ajax-complete'));
            }
          });
          
          return originalSend.apply(this, arguments);
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
   * @param {string} [message] - Optional message to display
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  show(message) {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (message) {
      this.setMessage(message);
    }
    
    this.startTime = Date.now();
    this.loaderElement.classList.add(styles.visible);
    this.visible = true;
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('pageloader-shown', {
      detail: { pageLoader: this }
    }));
    
    return this;
  }
  
  /**
   * Hide the loader
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  hide() {
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
   * @private
   */
  hideAfterDelay() {
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
   * @param {string} message - Message to display
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  setMessage(message) {
    if (this.messageElement) {
      this.messageElement.textContent = message;
    }
    
    return this;
  }
  
  /**
   * Set the current progress
   * @param {number} value - Progress value (0-100)
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  setProgress(value) {
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
   * @param {string} stepId - Unique ID for the load step
   * @param {boolean} [completed=false] - Whether the step is already completed
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  addLoadStep(stepId, completed = false) {
    this.loadSteps.set(stepId, completed);
    this.updateProgressFromSteps();
    
    return this;
  }
  
  /**
   * Mark a load step as completed
   * @param {string} stepId - ID of the load step
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  completeLoadStep(stepId) {
    if (this.loadSteps.has(stepId)) {
      this.loadSteps.set(stepId, true);
      this.updateProgressFromSteps();
    }
    
    return this;
  }
  
  /**
   * Calculate and update progress based on completed steps
   * @private
   */
  updateProgressFromSteps() {
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
   * @param {string} errorMessage - Error message to display
   * @returns {PageLoader} This PageLoader instance for chaining
   */
  showError(errorMessage) {
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
  destroy() {
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