import styles from './ProgressTracker.module.css';

/**
 * ProgressTracker Component
 * Tracks and persists user progress through guides and tutorials
 */
export class ProgressTracker {
  constructor(options = {}) {
    /**
     * Storage key prefix for progress items
     * @type {string}
     * @private
     */
    this.storageKeyPrefix = options.storageKeyPrefix || 'sdde_progress_';
    
    /**
     * CSS selectors for trackable elements
     * @type {string}
     * @private
     */
    this.trackableSelectors = options.trackableSelectors || 
      '.tutorial-section ol > li, .steps-section ol > li, .guide-section ol > li, [data-track-progress] li';
    
    /**
     * Whether the component is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * DOM Elements being tracked
     * @type {Array<HTMLElement>}
     * @private 
     */
    this.trackedElements = [];
    
    /**
     * Map of progress items by ID
     * @type {Map<string, boolean>}
     * @private
     */
    this.progressItems = new Map();
    
    // Auto-initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the progress tracker
   * @param {Object} [options] - Initialization options
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    // Apply any new options
    Object.assign(this, options);
    
    this.loadProgressFromStorage();
    this.initProgressCheckboxes();
    this.setupMutationObserver();
    
    this.initialized = true;
    console.log('Progress tracker initialized');
  }
  
  /**
   * Load saved progress from localStorage
   * @private
   * @returns {void}
   */
  loadProgressFromStorage() {
    // Clear existing progress
    this.progressItems.clear();
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available for progress tracking');
      return;
    }
    
    // Retrieve all progress items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKeyPrefix)) {
        const value = localStorage.getItem(key) === 'true';
        this.progressItems.set(key, value);
      }
    }
    
    console.log(`Loaded ${this.progressItems.size} progress items from storage`);
  }
  
  /**
   * Add progress tracking checkboxes to tutorial steps
   * @private
   * @returns {void}
   */
  initProgressCheckboxes() {
    // Clear tracked elements
    this.trackedElements = [];
    
    // Find all tutorial steps
    const tutorialSteps = document.querySelectorAll(this.trackableSelectors);
    
    tutorialSteps.forEach(item => {
      if (!item.querySelector(`.${styles.progressCheck}`)) {
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = styles.progressCheck;
        
        // Generate unique ID for this step
        const itemId = this.generateItemId(item);
        checkbox.dataset.progressId = itemId;
        
        // Check if this item has saved progress
        checkbox.checked = this.progressItems.get(itemId) || false;
        
        // Save progress to localStorage when toggled
        checkbox.addEventListener('change', () => {
          this.updateProgress(itemId, checkbox.checked);
          
          // Add or remove 'completed' class from parent item
          if (checkbox.checked) {
            item.classList.add(styles.completed);
          } else {
            item.classList.remove(styles.completed);
          }
        });
        
        // Apply completed class if needed
        if (checkbox.checked) {
          item.classList.add(styles.completed);
        }
        
        // Insert checkbox before the first child
        item.insertBefore(checkbox, item.firstChild);
        
        // Add to tracked elements
        this.trackedElements.push(item);
      }
    });
    
    console.log(`Initialized ${this.trackedElements.length} progress checkboxes`);
  }
  
  /**
   * Generate a unique ID for a progress item
   * @private
   * @param {HTMLElement} element - The element to generate an ID for
   * @returns {string} The unique ID
   */
  generateItemId(element) {
    // Get page path
    const path = window.location.pathname;
    
    // Get section ID if available
    const section = element.closest('section, article, div[id]');
    const sectionId = section ? section.id || 'main' : 'main';
    
    // Get text content (limited to prevent long IDs)
    const text = element.textContent.trim().substring(0, 30);
    
    // Get position within parent 
    const parent = element.parentNode;
    const index = Array.from(parent.children).indexOf(element);
    
    return `${this.storageKeyPrefix}${path}_${sectionId}_${index}_${text}`;
  }
  
  /**
   * Update progress for a specific item
   * @param {string} itemId - The unique ID of the item
   * @param {boolean} completed - Whether the item is completed
   * @returns {void}
   */
  updateProgress(itemId, completed) {
    // Update in-memory map
    this.progressItems.set(itemId, completed);
    
    // Save to localStorage if available
    if (typeof localStorage !== 'undefined') {
      if (completed) {
        localStorage.setItem(itemId, 'true');
      } else {
        localStorage.removeItem(itemId);
      }
    }
    
    // Update progress summary
    this.updateProgressSummary();
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('progress-updated', {
      detail: {
        itemId,
        completed,
        totalItems: this.trackedElements.length,
        completedItems: this.getCompletedCount()
      }
    }));
    
    // Announce progress update to screen readers
    this.announceProgressUpdate(completed ? 'completed' : 'marked as incomplete');
  }
  
  /**
   * Get the total number of completed items
   * @returns {number} The number of completed items
   */
  getCompletedCount() {
    let count = 0;
    for (const completed of this.progressItems.values()) {
      if (completed) count++;
    }
    return count;
  }
  
  /**
   * Get progress summary data
   * @returns {Object} Progress summary object
   */
  getProgressSummary() {
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      percentage
    };
  }
  
  /**
   * Update progress summary displays
   * @private
   * @returns {void}
   */
  updateProgressSummary() {
    // Find all progress summary elements
    const summaryElements = document.querySelectorAll(`.${styles.progressSummary}`);
    
    if (summaryElements.length === 0) {
      // Create a summary element if none exists and we have progress to show
      if (this.trackedElements.length > 0) {
        this.createProgressSummary();
      }
      return;
    }
    
    // Get progress data
    const summary = this.getProgressSummary();
    
    // Update all summary elements
    summaryElements.forEach(element => {
      // Update progress bar if it exists
      const progressBar = element.querySelector(`.${styles.progressSummaryBarInner}`);
      if (progressBar) {
        progressBar.style.width = `${summary.percentage}%`;
      }
      
      // Update percentage text
      const percentageElement = element.querySelector(`.${styles.progressSummaryPercentage}`);
      if (percentageElement) {
        percentageElement.textContent = `${summary.percentage}%`;
      }
      
      // Update count text
      const countElement = element.querySelector(`.${styles.progressSummaryCount}`);
      if (countElement) {
        countElement.textContent = `${summary.completed} of ${summary.total} completed`;
      }
      
      // Update progressbar attributes for accessibility
      const progressBarContainer = element.querySelector(`.${styles.progressSummaryBar}`);
      if (progressBarContainer) {
        progressBarContainer.setAttribute('aria-valuenow', summary.completed);
        progressBarContainer.setAttribute('aria-valuemin', '0');
        progressBarContainer.setAttribute('aria-valuemax', summary.total);
        progressBarContainer.setAttribute('aria-valuetext', 
          `${summary.completed} of ${summary.total} steps completed (${summary.percentage}%)`);
      }
    });
  }
  
  /**
   * Create a progress summary element
   * @param {HTMLElement} [targetElement] - Optional target element to append the summary to
   * @returns {void|Object} Void or progress summary object
   */
  createProgressSummary(targetElement) {
    // If no target specified, just return the summary data
    if (!targetElement) return this.getProgressSummary();
    
    // Only create if we have tracked elements
    if (this.trackedElements.length === 0) return this.getProgressSummary();
    
    // Find a container if not specified
    if (!targetElement) {
      targetElement = document.querySelector(
        '.tutorial-section, .steps-section, .guide-section, [data-track-progress]'
      );
    }
    
    if (!targetElement) return this.getProgressSummary();
    
    // Check if a summary already exists in this container
    if (targetElement.querySelector(`.${styles.progressSummary}`)) {
      // Just update it
      this.updateProgressSummary();
      return this.getProgressSummary();
    }
    
    // Get progress data
    const summary = this.getProgressSummary();
    
    // Create summary element
    const summaryEl = document.createElement('div');
    summaryEl.className = styles.progressSummary;
    summaryEl.setAttribute('role', 'region');
    summaryEl.setAttribute('aria-label', 'Progress summary');
    
    // Create header
    const headerEl = document.createElement('div');
    headerEl.className = styles.progressSummaryHeader;
    
    // Create title
    const titleEl = document.createElement('h3');
    titleEl.className = styles.progressSummaryTitle;
    titleEl.textContent = 'Your Progress';
    
    // Create percentage display
    const percentageEl = document.createElement('div');
    percentageEl.className = styles.progressSummaryPercentage;
    percentageEl.textContent = `${summary.percentage}%`;
    
    // Add elements to header
    headerEl.appendChild(titleEl);
    headerEl.appendChild(percentageEl);
    
    // Create progress bar container
    const barContainerEl = document.createElement('div');
    barContainerEl.className = styles.progressSummaryBar;
    barContainerEl.setAttribute('role', 'progressbar');
    barContainerEl.setAttribute('aria-valuenow', summary.completed);
    barContainerEl.setAttribute('aria-valuemin', '0');
    barContainerEl.setAttribute('aria-valuemax', summary.total);
    barContainerEl.setAttribute('aria-valuetext', 
      `${summary.completed} of ${summary.total} steps completed (${summary.percentage}%)`);
    
    // Create progress bar
    const barEl = document.createElement('div');
    barEl.className = styles.progressSummaryBarInner;
    barEl.style.width = `${summary.percentage}%`;
    
    // Add bar to container
    barContainerEl.appendChild(barEl);
    
    // Create count element
    const countEl = document.createElement('div');
    countEl.className = styles.progressSummaryCount;
    countEl.textContent = `${summary.completed} of ${summary.total} completed`;
    
    // Create reset button if there's progress
    if (summary.completed > 0) {
      const resetButton = document.createElement('button');
      resetButton.className = styles.resetButton;
      resetButton.textContent = 'Reset Progress';
      resetButton.setAttribute('aria-label', 'Reset progress for this page');
      resetButton.addEventListener('click', () => {
        this.resetPageProgress();
        this.announceProgressUpdate('reset');
      });
      
      // Add reset button to summary
      summaryEl.appendChild(resetButton);
    }
    
    // Assemble the summary
    summaryEl.appendChild(headerEl);
    summaryEl.appendChild(barContainerEl);
    summaryEl.appendChild(countEl);
    
    // Add to target
    targetElement.insertBefore(summaryEl, targetElement.firstChild);
    
    return summary;
  }
  
  /**
   * Reset progress for the current page
   * @returns {void}
   */
  resetPageProgress() {
    const pagePath = window.location.pathname;
    const pageKeyPrefix = `${this.storageKeyPrefix}${pagePath}`;
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available for progress tracking');
      return;
    }
    
    // Remove all progress items for this page
    for (const key of this.progressItems.keys()) {
      if (key.startsWith(pageKeyPrefix)) {
        localStorage.removeItem(key);
        this.progressItems.delete(key);
      }
    }
    
    // Uncheck all checkboxes
    document.querySelectorAll(`.${styles.progressCheck}`).forEach(checkbox => {
      checkbox.checked = false;
      
      // Remove completed class from parent
      const listItem = checkbox.closest('li');
      if (listItem) {
        listItem.classList.remove(styles.completed);
      }
    });
    
    // Update summary
    this.updateProgressSummary();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('progress-reset', {
      detail: { path: pagePath }
    }));
  }
  
  /**
   * Reset all progress
   * @returns {void}
   */
  resetAllProgress() {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available for progress tracking');
      return;
    }
    
    // Remove all progress items
    for (const key of this.progressItems.keys()) {
      if (key.startsWith(this.storageKeyPrefix)) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear the map
    this.progressItems.clear();
    
    // Uncheck all checkboxes
    document.querySelectorAll(`.${styles.progressCheck}`).forEach(checkbox => {
      checkbox.checked = false;
      
      // Remove completed class from parent
      const listItem = checkbox.closest('li');
      if (listItem) {
        listItem.classList.remove(styles.completed);
      }
    });
    
    // Update summary
    this.updateProgressSummary();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('progress-reset-all'));
    
    // Announce to screen readers
    this.announceProgressUpdate('reset for all pages');
  }
  
  /**
   * Set up mutation observer to detect new content
   * @private
   * @returns {void}
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldInit = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is an element and contains potential tutorial steps
            if (node.nodeType === Node.ELEMENT_NODE && (
              node.matches('.tutorial-section, .steps-section, .guide-section, [data-track-progress]') ||
              node.querySelector('ol > li')
            )) {
              shouldInit = true;
            }
          });
        }
      });
      
      if (shouldInit) {
        this.initProgressCheckboxes();
        this.updateProgressSummary();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Announce progress update for screen readers
   * @private
   * @param {string} action - The action that occurred (completed/incomplete/reset)
   */
  announceProgressUpdate(action) {
    let announcer = document.getElementById('progress-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'progress-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      document.body.appendChild(announcer);
    }
    
    // Get progress summary for the announcement
    const summary = this.getProgressSummary();
    announcer.textContent = `Step ${action}. ${summary.completed} of ${summary.total} steps completed (${summary.percentage}%).`;
    
    // Clear after a delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
} 