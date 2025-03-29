/**
 * Progress Tracker Component for Steam Deck DUB Edition
 * Handles tracking user progress through tutorials and guides
 * 
 * @module ProgressTracker
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './ProgressTracker.module.css';

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
      if (!item.querySelector(`.${styles['progress-check']}`)) {
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = styles['progress-check'];
        
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
}

export default ProgressTracker; 