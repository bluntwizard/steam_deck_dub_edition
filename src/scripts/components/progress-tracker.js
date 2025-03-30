/**
 * Progress Tracker Component for Grimoire
 * Handles tracking user progress through tutorials and guides
 * 
 * @module ProgressTracker
 * @author Grimoire Team
 * @version 1.0.0
 */

/**
 * @typedef {Object} ProgressItem
 * @property {string} id - Unique identifier for the progress item
 * @property {boolean} completed - Whether the item is completed
 * @property {string} [text] - Text description of the progress item
 * @property {HTMLElement} [element] - Reference to the DOM element
 */

/**
 * @typedef {Object} ProgressSummary
 * @property {number} total - Total number of items
 * @property {number} completed - Number of completed items
 * @property {number} percentage - Percentage of completion (0-100)
 */

/**
 * @typedef {Object} ProgressUpdateEvent
 * @property {string} itemId - ID of the updated item
 * @property {boolean} completed - New completion state
 * @property {number} totalItems - Total number of items
 * @property {number} completedItems - Number of completed items
 */

/**
 * @class ProgressTracker
 * @classdesc Tracks and persists user progress through guides and tutorials
 */
class ProgressTracker {
  constructor() {
    /**
     * Storage key prefix for progress items
     * @type {string}
     * @private
     */
    this.storageKeyPrefix = 'sdde_progress_';
    
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
  }
  
  /**
   * Initialize the progress tracker
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
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
    const tutorialSteps = document.querySelectorAll(
      '.tutorial-section ol > li, ' +
      '.steps-section ol > li, ' + 
      '.guide-section ol > li, ' +
      '[data-track-progress] li'
    );
    
    tutorialSteps.forEach(item => {
      if (!item.querySelector('.progress-check')) {
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'progress-check';
        
        // Generate unique ID for this step
        const itemId = this.generateItemId(item);
        checkbox.dataset.progressId = itemId;
        
        // Check if this item has saved progress
        checkbox.checked = this.progressItems.get(itemId) || false;
        
        // Save progress to localStorage when toggled
        checkbox.addEventListener('change', () => {
          this.updateProgress(itemId, checkbox.checked);
        });
        
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
    
    // Save to localStorage
    if (completed) {
      localStorage.setItem(itemId, 'true');
    } else {
      localStorage.removeItem(itemId);
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
   * Update progress summary displays
   * @private
   * @returns {void}
   */
  updateProgressSummary() {
    // Find all progress summary elements
    const summaryElements = document.querySelectorAll('.progress-summary');
    
    if (summaryElements.length === 0) {
      // Create a summary element if none exists and we have progress to show
      if (this.trackedElements.length > 0) {
        this.createProgressSummary();
      }
      return;
    }
    
    // Calculate progress
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update all summary elements
    summaryElements.forEach(element => {
      // Update progress bar if it exists
      const progressBar = element.querySelector('.progress-bar-inner');
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
      
      // Update text
      const textElement = element.querySelector('.progress-text');
      if (textElement) {
        textElement.textContent = `${completed} of ${total} steps completed (${percentage}%)`;
      }
    });
  }
  
  /**
   * Create a progress summary element
   * @private
   * @returns {void}
   */
  createProgressSummary() {
    // Only create if we have tracked elements
    if (this.trackedElements.length === 0) return;
    
    // Find a container for the summary
    const container = document.querySelector(
      '.tutorial-section, .steps-section, .guide-section, [data-track-progress]'
    );
    
    if (!container) return;
    
    // Check if a summary already exists in this container
    if (container.querySelector('.progress-summary')) return;
    
    // Calculate progress
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Create summary element
    const summary = document.createElement('div');
    summary.className = 'progress-summary';
    summary.innerHTML = `
      <h3>Your Progress</h3>
      <div class="progress-bar">
        <div class="progress-bar-inner" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-text">${completed} of ${total} steps completed (${percentage}%)</div>
    `;
    
    // Insert at the beginning of the container
    container.insertBefore(summary, container.firstChild);
  }
  
  /**
   * Reset progress for the current page
   * @returns {void}
   */
  resetPageProgress() {
    const pagePath = window.location.pathname;
    const pageKeyPrefix = `${this.storageKeyPrefix}${pagePath}`;
    
    // Remove all progress items for this page
    for (const key of this.progressItems.keys()) {
      if (key.startsWith(pageKeyPrefix)) {
        localStorage.removeItem(key);
        this.progressItems.delete(key);
      }
    }
    
    // Uncheck all checkboxes
    document.querySelectorAll('.progress-check').forEach(checkbox => {
      checkbox.checked = false;
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
    // Remove all progress items
    for (const key of this.progressItems.keys()) {
      localStorage.removeItem(key);
    }
    
    // Clear the map
    this.progressItems.clear();
    
    // Uncheck all checkboxes
    document.querySelectorAll('.progress-check').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Update summary
    this.updateProgressSummary();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('progress-reset-all'));
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
            if (node.nodeType === 1 && (
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
   * Creates a checkbox element for tracking progress
   * @private
   * @param {string} id - Unique ID for the progress item
   * @param {string} text - Text description for the progress item
   * @param {boolean} checked - Whether the item is already completed
   * @returns {HTMLElement} The created checkbox element
   */
  createCheckbox(id, text, checked = false) {
    // Create container for better styling and interaction area
    const container = document.createElement('div');
    container.className = 'progress-item';
    
    // Create checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.setAttribute('aria-labelledby', `${id}-label`);
    
    // Create label
    const label = document.createElement('label');
    label.htmlFor = id;
    label.id = `${id}-label`;
    label.className = 'progress-label';
    label.textContent = text;
    
    // If checked, add completed class
    if (checked) {
      container.classList.add('completed');
    }
    
    // Add event listener for checkbox change
    checkbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      container.classList.toggle('completed', isChecked);
      this.updateProgress(id, isChecked);
      
      // Announce progress update to screen readers
      this.announceProgressUpdate(isChecked ? 'completed' : 'marked as incomplete');
    });
    
    // Append elements to container
    container.appendChild(checkbox);
    container.appendChild(label);
    
    return container;
  }

  /**
   * Announce progress update for screen readers
   * @private
   * @param {string} action - The action that occurred (completed/incomplete)
   */
  announceProgressUpdate(action) {
    let announcer = document.getElementById('progress-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'progress-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    const summary = this.createProgressSummary();
    announcer.textContent = `Step ${action}. ${summary.completed} of ${summary.total} steps completed (${summary.percentage}%).`;
    
    // Clear after a delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * Creates a visual progress summary showing completion status
   * @param {HTMLElement} targetElement - Element to append the summary to
   * @returns {void}
   */
  createProgressSummary(targetElement) {
    if (!targetElement) return this.getProgressSummary();
    
    // Clear existing summary
    const existingSummary = targetElement.querySelector('.progress-summary');
    if (existingSummary) existingSummary.remove();
    
    // Get progress data
    const summary = this.getProgressSummary();
    
    // Create summary container
    const summaryEl = document.createElement('div');
    summaryEl.className = 'progress-summary';
    summaryEl.setAttribute('role', 'region');
    summaryEl.setAttribute('aria-label', 'Progress summary');
    
    // Create progress text
    const textEl = document.createElement('div');
    textEl.className = 'progress-text';
    textEl.textContent = `${summary.completed} of ${summary.total} completed (${summary.percentage}%)`;
    
    // Create progress bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'progress-bar-container';
    barContainer.setAttribute('role', 'progressbar');
    barContainer.setAttribute('aria-valuenow', summary.completed);
    barContainer.setAttribute('aria-valuemin', '0');
    barContainer.setAttribute('aria-valuemax', summary.total);
    barContainer.setAttribute('aria-valuetext', `${summary.completed} of ${summary.total} steps completed (${summary.percentage}%)`);
    
    // Create progress bar
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.style.width = `${summary.percentage}%`;
    
    // Create reset button if there's progress
    if (summary.completed > 0) {
      const resetButton = document.createElement('button');
      resetButton.className = 'progress-reset-button';
      resetButton.textContent = 'Reset Progress';
      resetButton.setAttribute('aria-label', 'Reset progress for this page');
      resetButton.addEventListener('click', () => {
        this.resetCurrentProgress();
        this.createProgressSummary(targetElement);
        this.announceProgressUpdate('reset');
      });
      
      // Append reset button
      summaryEl.appendChild(resetButton);
    }
    
    // Assemble the progress bar
    barContainer.appendChild(bar);
    
    // Append elements to summary
    summaryEl.appendChild(textEl);
    summaryEl.appendChild(barContainer);
    
    // Add to target
    targetElement.appendChild(summaryEl);
    
    return summary;
  }

  /**
   * Set up keyboard navigation for progress items
   * @private
   */
  setupKeyboardNavigation() {
    const progressItems = document.querySelectorAll('.progress-item');
    
    progressItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      
      // Add keyboard event listener to improve accessibility
      item.addEventListener('keydown', (e) => {
        // Space or Enter can toggle checkbox
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
      
      // Make container focusable
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'checkbox');
      item.setAttribute('aria-checked', checkbox.checked);
      
      // Keep aria-checked in sync with checkbox state
      checkbox.addEventListener('change', () => {
        item.setAttribute('aria-checked', checkbox.checked);
      });
    });
  }
}

// Create singleton instance
const progressTracker = new ProgressTracker();

// Export the singleton
export default progressTracker;
