import styles from './ProgressTracker.module.css';

/**
 * Options for configuring the ProgressTracker
 */
export interface ProgressTrackerOptions {
  /**
   * Storage key prefix for progress items
   */
  storageKeyPrefix?: string;
  
  /**
   * CSS selectors for trackable elements
   */
  trackableSelectors?: string;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * Progress summary information
 */
export interface ProgressSummary {
  /**
   * Total number of tracked items
   */
  total: number;
  
  /**
   * Number of completed items
   */
  completed: number;
  
  /**
   * Percentage of completion (0-100)
   */
  percentage: number;
}

/**
 * Progress update event detail
 */
export interface ProgressUpdateEventDetail {
  /**
   * ID of the updated item
   */
  itemId: string;
  
  /**
   * Whether the item is completed
   */
  completed: boolean;
  
  /**
   * Total number of tracked items
   */
  totalItems: number;
  
  /**
   * Number of completed items
   */
  completedItems: number;
}

/**
 * ProgressTracker Component
 * Tracks and persists user progress through guides and tutorials
 */
export class ProgressTracker {
  /**
   * Storage key prefix for progress items
   */
  private storageKeyPrefix: string;
  
  /**
   * CSS selectors for trackable elements
   */
  private trackableSelectors: string;
  
  /**
   * Whether the component is initialized
   */
  private initialized: boolean;
  
  /**
   * DOM Elements being tracked
   */
  private trackedElements: HTMLElement[];
  
  /**
   * Map of progress items by ID
   */
  private progressItems: Map<string, boolean>;
  
  /**
   * Mutation observer to track DOM changes
   */
  private observer: MutationObserver | null;
  
  /**
   * Create a new ProgressTracker instance
   */
  constructor(options: ProgressTrackerOptions = {}) {
    this.storageKeyPrefix = options.storageKeyPrefix || 'sdde_progress_';
    
    this.trackableSelectors = options.trackableSelectors || 
      '.tutorial-section ol > li, .steps-section ol > li, .guide-section ol > li, [data-track-progress] li';
    
    this.initialized = false;
    this.trackedElements = [];
    this.progressItems = new Map();
    this.observer = null;
    
    // Auto-initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the progress tracker
   */
  initialize(options: Partial<ProgressTrackerOptions> = {}): void {
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
   */
  private loadProgressFromStorage(): void {
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
   */
  private initProgressCheckboxes(): void {
    // Clear tracked elements
    this.trackedElements = [];
    
    // Find all tutorial steps
    const tutorialSteps = document.querySelectorAll(this.trackableSelectors);
    
    tutorialSteps.forEach(item => {
      const element = item as HTMLElement;
      if (!element.querySelector(`.${styles.progressCheck}`)) {
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = styles.progressCheck;
        
        // Generate unique ID for this step
        const itemId = this.generateItemId(element);
        checkbox.dataset.progressId = itemId;
        
        // Check if this item has saved progress
        checkbox.checked = this.progressItems.get(itemId) || false;
        
        // Save progress to localStorage when toggled
        checkbox.addEventListener('change', () => {
          this.updateProgress(itemId, checkbox.checked);
          
          // Add or remove 'completed' class from parent item
          if (checkbox.checked) {
            element.classList.add(styles.completed);
          } else {
            element.classList.remove(styles.completed);
          }
        });
        
        // Apply completed class if needed
        if (checkbox.checked) {
          element.classList.add(styles.completed);
        }
        
        // Insert checkbox before the first child
        element.insertBefore(checkbox, element.firstChild);
        
        // Add to tracked elements
        this.trackedElements.push(element);
      }
    });
    
    console.log(`Initialized ${this.trackedElements.length} progress checkboxes`);
  }
  
  /**
   * Generate a unique ID for a progress item
   */
  private generateItemId(element: HTMLElement): string {
    // Get page path
    const path = window.location.pathname;
    
    // Get section ID if available
    const section = element.closest('section, article, div[id]');
    const sectionId = section ? (section as HTMLElement).id || 'main' : 'main';
    
    // Get text content (limited to prevent long IDs)
    const text = element.textContent?.trim().substring(0, 30) || '';
    
    // Get position within parent 
    const parent = element.parentNode;
    const index = parent ? Array.from(parent.children).indexOf(element) : 0;
    
    return `${this.storageKeyPrefix}${path}_${sectionId}_${index}_${text}`;
  }
  
  /**
   * Set up a mutation observer to track DOM changes
   */
  private setupMutationObserver(): void {
    // Skip if the MutationObserver API is not available
    if (typeof MutationObserver === 'undefined') {
      console.warn('MutationObserver not available for progress tracking');
      return;
    }
    
    // Create observer
    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      let shouldRefresh = false;
      
      // Check if any tracked content was modified
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check for new nodes with trackable content
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches(this.trackableSelectors) || 
                  element.querySelector(this.trackableSelectors)) {
                shouldRefresh = true;
              }
            }
          });
          
          // Check for removed nodes that were tracked
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (this.trackedElements.includes(element) || 
                  element.querySelector(`.${styles.progressCheck}`)) {
                shouldRefresh = true;
              }
            }
          });
        }
      }
      
      // Refresh progress if necessary
      if (shouldRefresh) {
        this.initProgressCheckboxes();
        this.updateProgressSummary();
      }
    });
    
    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Update progress for a specific item
   */
  updateProgress(itemId: string, completed: boolean): void {
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
    document.dispatchEvent(new CustomEvent<ProgressUpdateEventDetail>('progress-updated', {
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
   */
  getCompletedCount(): number {
    let count = 0;
    for (const completed of this.progressItems.values()) {
      if (completed) count++;
    }
    return count;
  }
  
  /**
   * Get progress summary data
   */
  getProgressSummary(): ProgressSummary {
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
   */
  private updateProgressSummary(): void {
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
      if (progressBar instanceof HTMLElement) {
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
      if (progressBarContainer instanceof HTMLElement) {
        progressBarContainer.setAttribute('aria-valuenow', summary.completed.toString());
        progressBarContainer.setAttribute('aria-valuemin', '0');
        progressBarContainer.setAttribute('aria-valuemax', summary.total.toString());
        progressBarContainer.setAttribute('aria-valuetext', 
          `${summary.completed} of ${summary.total} steps completed (${summary.percentage}%)`);
      }
    });
  }
  
  /**
   * Create a progress summary element
   */
  createProgressSummary(targetElement?: HTMLElement): ProgressSummary | void {
    // If no target specified, just return the summary data
    if (!targetElement) return this.getProgressSummary();
    
    // Only create if we have tracked elements
    if (this.trackedElements.length === 0) return this.getProgressSummary();
    
    // Find a container if not specified
    if (!targetElement) {
      const foundElement = document.querySelector(
        '.tutorial-section, .steps-section, .guide-section, [data-track-progress]'
      );
      
      if (!foundElement) return this.getProgressSummary();
      targetElement = foundElement as HTMLElement;
    }
    
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
    summaryEl.appendChild(headerEl);
    
    // Create progress bar
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = styles.progressSummaryBar;
    progressBarContainer.setAttribute('role', 'progressbar');
    progressBarContainer.setAttribute('aria-valuenow', summary.completed.toString());
    progressBarContainer.setAttribute('aria-valuemin', '0');
    progressBarContainer.setAttribute('aria-valuemax', summary.total.toString());
    progressBarContainer.setAttribute('aria-valuetext', 
      `${summary.completed} of ${summary.total} steps completed (${summary.percentage}%)`);
    
    const progressBar = document.createElement('div');
    progressBar.className = styles.progressSummaryBarInner;
    progressBar.style.width = `${summary.percentage}%`;
    
    progressBarContainer.appendChild(progressBar);
    summaryEl.appendChild(progressBarContainer);
    
    // Create count display
    const countEl = document.createElement('div');
    countEl.className = styles.progressSummaryCount;
    countEl.textContent = `${summary.completed} of ${summary.total} completed`;
    summaryEl.appendChild(countEl);
    
    // Add summary to container
    targetElement.appendChild(summaryEl);
    
    return summary;
  }
  
  /**
   * Reset progress for the current page
   */
  resetProgress(): void {
    // Filter out progress items only for the current page
    const path = window.location.pathname;
    
    // Collect keys to remove
    const keysToRemove: string[] = [];
    
    // Check each progress item
    this.progressItems.forEach((value, key) => {
      if (key.includes(path)) {
        keysToRemove.push(key);
      }
    });
    
    // Remove from in-memory map
    keysToRemove.forEach(key => {
      this.progressItems.delete(key);
      
      // Remove from localStorage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    });
    
    // Reset UI state
    this.trackedElements.forEach(element => {
      // Remove completed class
      element.classList.remove(styles.completed);
      
      // Uncheck checkboxes
      const checkbox = element.querySelector(`.${styles.progressCheck}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });
    
    // Update progress summary
    this.updateProgressSummary();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('progress-reset', {
      detail: {
        totalItems: this.trackedElements.length,
        completedItems: 0
      }
    }));
    
    // Announce reset to screen readers
    this.announceProgressUpdate('reset');
    
    console.log(`Progress reset for ${path} (${keysToRemove.length} items)`);
  }
  
  /**
   * Reset all progress across the entire site
   */
  resetAllProgress(): void {
    // Clear in-memory map
    this.progressItems.clear();
    
    // Clear localStorage if available
    if (typeof localStorage !== 'undefined') {
      // Collect keys to remove (only those with our prefix)
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKeyPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove each item
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cleared ${keysToRemove.length} progress items from localStorage`);
    }
    
    // Reset UI state
    this.trackedElements.forEach(element => {
      // Remove completed class
      element.classList.remove(styles.completed);
      
      // Uncheck checkboxes
      const checkbox = element.querySelector(`.${styles.progressCheck}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });
    
    // Update progress summary
    this.updateProgressSummary();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('progress-reset-all', {
      detail: {
        totalItems: this.trackedElements.length,
        completedItems: 0
      }
    }));
    
    // Announce reset to screen readers
    this.announceProgressUpdate('reset for all pages');
  }
  
  /**
   * Check if the component is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Destroy the progress tracker and clean up
   */
  destroy(): void {
    // Stop observing DOM changes
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Remove all checkboxes
    this.trackedElements.forEach(element => {
      const checkbox = element.querySelector(`.${styles.progressCheck}`);
      if (checkbox) {
        checkbox.remove();
      }
      
      // Remove completed class
      element.classList.remove(styles.completed);
    });
    
    // Reset state
    this.trackedElements = [];
    this.initialized = false;
    
    console.log('Progress tracker destroyed');
  }
  
  /**
   * Announce progress update for screen readers
   */
  private announceProgressUpdate(action: string): void {
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
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  }
} 