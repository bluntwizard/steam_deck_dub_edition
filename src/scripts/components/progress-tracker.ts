/**
 * Progress Tracker Component for Steam Deck DUB Edition
 * Handles tracking user progress through tutorials and guides
 */

// Define interfaces for TypeScript
interface ProgressItem {
  id: string;
  completed: boolean;
  text?: string;
  element?: HTMLElement;
}

interface ProgressSummary {
  total: number;
  completed: number;
  percentage: number;
}

interface ProgressUpdateEvent {
  itemId: string;
  completed: boolean;
  totalItems: number;
  completedItems: number;
}

/**
 * Progress Tracker class
 * Tracks and persists user progress through guides and tutorials
 */
class ProgressTracker {
  private storageKeyPrefix: string;
  private initialized: boolean;
  private trackedElements: HTMLElement[];
  private progressItems: Map<string, boolean>;
  private mutationObserver?: MutationObserver;
  
  constructor() {
    /**
     * Storage key prefix for progress items
     */
    this.storageKeyPrefix = 'sdde_progress_';
    
    /**
     * Whether the component is initialized
     */
    this.initialized = false;
    
    /**
     * DOM Elements being tracked
     */
    this.trackedElements = [];
    
    /**
     * Map of progress items by ID
     */
    this.progressItems = new Map();
  }
  
  /**
   * Initialize the progress tracker
   */
  initialize(): void {
    if (this.initialized) return;
    
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
    const tutorialSteps = document.querySelectorAll(
      '.tutorial-section ol > li, ' +
      '.steps-section ol > li, ' + 
      '.guide-section ol > li, ' +
      '[data-track-progress] li'
    );
    
    tutorialSteps.forEach((item: Element) => {
      if (!item.querySelector('.progress-check')) {
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'progress-check';
        
        // Generate unique ID for this step
        const itemId = this.generateItemId(item as HTMLElement);
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
        this.trackedElements.push(item as HTMLElement);
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
    const sectionId = section ? section.id || 'main' : 'main';
    
    // Get text content (limited to prevent long IDs)
    const text = element.textContent ? element.textContent.trim().substring(0, 30) : '';
    
    // Get position within parent 
    const parent = element.parentNode;
    let index = 0;
    if (parent) {
      index = Array.from(parent.children).indexOf(element);
    }
    
    return `${this.storageKeyPrefix}${path}_${sectionId}_${index}_${text}`;
  }
  
  /**
   * Update progress for a specific item
   */
  updateProgress(itemId: string, completed: boolean): void {
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
      } as ProgressUpdateEvent
    }));
    
    // Announce progress update for screen readers
    this.announceProgressUpdate(completed ? 'completed' : 'reset');
  }
  
  /**
   * Get count of completed items
   */
  private getCompletedCount(): number {
    let count = 0;
    document.querySelectorAll('.progress-check').forEach((checkbox: Element) => {
      if ((checkbox as HTMLInputElement).checked) {
        count++;
      }
    });
    return count;
  }
  
  /**
   * Update the progress summary display
   */
  private updateProgressSummary(): void {
    const summary = document.querySelector('.progress-summary');
    if (!summary) {
      this.createProgressSummary();
      return;
    }
    
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update summary text
    const summaryText = summary.querySelector('.progress-text');
    if (summaryText) {
      summaryText.textContent = `${completed}/${total} (${percentage}%)`;
    }
    
    // Update progress bar
    const progressBar = summary.querySelector('.progress-bar-fill');
    if (progressBar) {
      (progressBar as HTMLElement).style.width = `${percentage}%`;
    }
    
    // Update data attributes
    summary.setAttribute('data-completed', completed.toString());
    summary.setAttribute('data-total', total.toString());
    summary.setAttribute('data-percentage', percentage.toString());
  }
  
  /**
   * Create a progress summary element
   */
  private createProgressSummary(): void {
    const existingSummary = document.querySelector('.progress-summary');
    if (existingSummary) return;
    
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Only create if we have items to track
    if (total === 0) return;
    
    // Create progress summary element
    const summary = document.createElement('div');
    summary.className = 'progress-summary';
    summary.setAttribute('data-completed', completed.toString());
    summary.setAttribute('data-total', total.toString());
    summary.setAttribute('data-percentage', percentage.toString());
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressBarFill = document.createElement('div');
    progressBarFill.className = 'progress-bar-fill';
    progressBarFill.style.width = `${percentage}%`;
    
    // Create text
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = `${completed}/${total} (${percentage}%)`;
    
    // Add reset buttons
    const resetPageBtn = document.createElement('button');
    resetPageBtn.className = 'reset-page-btn';
    resetPageBtn.setAttribute('aria-label', 'Reset progress for this page');
    resetPageBtn.innerHTML = '<span class="icon">↺</span> Reset Page';
    resetPageBtn.addEventListener('click', () => this.resetPageProgress());
    
    const resetAllBtn = document.createElement('button');
    resetAllBtn.className = 'reset-all-btn';
    resetAllBtn.setAttribute('aria-label', 'Reset all progress');
    resetAllBtn.innerHTML = '<span class="icon">↺</span> Reset All';
    resetAllBtn.addEventListener('click', () => this.resetAllProgress());
    
    // Assemble the elements
    progressBar.appendChild(progressBarFill);
    summary.appendChild(progressBar);
    summary.appendChild(progressText);
    summary.appendChild(resetPageBtn);
    summary.appendChild(resetAllBtn);
    
    // Add to the page
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(summary);
  }
  
  /**
   * Reset progress for the current page
   */
  resetPageProgress(): void {
    if (!confirm('Are you sure you want to reset progress for this page?')) {
      return;
    }
    
    const path = window.location.pathname;
    const itemsToReset: string[] = [];
    
    // Find all progress items for this page
    this.progressItems.forEach((value, key) => {
      if (key.includes(path)) {
        itemsToReset.push(key);
      }
    });
    
    // Reset each item
    itemsToReset.forEach(key => {
      // Remove from localStorage
      localStorage.removeItem(key);
      // Remove from in-memory map
      this.progressItems.delete(key);
    });
    
    // Reset checkboxes
    document.querySelectorAll('.progress-check').forEach((checkbox: Element) => {
      (checkbox as HTMLInputElement).checked = false;
    });
    
    // Update summary
    this.updateProgressSummary();
    
    // Announce reset
    this.announceProgressUpdate('reset-page');
  }
  
  /**
   * Reset all progress across all pages
   */
  resetAllProgress(): void {
    if (!confirm('Are you sure you want to reset all progress? This will clear your progress across all pages.')) {
      return;
    }
    
    // Remove all progress items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKeyPrefix)) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear in-memory map
    this.progressItems.clear();
    
    // Reset checkboxes
    document.querySelectorAll('.progress-check').forEach((checkbox: Element) => {
      (checkbox as HTMLInputElement).checked = false;
    });
    
    // Update summary
    this.updateProgressSummary();
    
    // Announce reset
    this.announceProgressUpdate('reset-all');
  }
  
  /**
   * Set up mutation observer to handle dynamically added content
   */
  private setupMutationObserver(): void {
    // Create observer instance
    this.mutationObserver = new MutationObserver((mutationsList) => {
      let shouldRefresh = false;
      
      // Check if any mutation includes new tutorial steps
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // Check added nodes for tutorial steps
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Check if the element or its children contain tutorial steps
              if (element.querySelector && (
                element.matches('.tutorial-section, .steps-section, .guide-section, [data-track-progress]') ||
                element.querySelector('.tutorial-section, .steps-section, .guide-section, [data-track-progress]')
              )) {
                shouldRefresh = true;
                break;
              }
            }
          }
        }
        
        if (shouldRefresh) break;
      }
      
      // Refresh progress checkboxes if needed
      if (shouldRefresh) {
        setTimeout(() => {
          this.initProgressCheckboxes();
          this.updateProgressSummary();
        }, 100);
      }
    });
    
    // Start observing
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Create a checkbox element with label
   */
  private createCheckbox(id: string, text: string, checked = false): HTMLElement {
    const container = document.createElement('div');
    container.className = 'checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = text;
    
    container.appendChild(checkbox);
    container.appendChild(label);
    
    return container;
  }
  
  /**
   * Announce progress updates for screen readers
   */
  private announceProgressUpdate(action: string): void {
    const announcer = document.querySelector('.sr-announcer');
    let message = '';
    
    const completed = this.getCompletedCount();
    const total = this.trackedElements.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    switch (action) {
      case 'completed':
        message = `Item marked as complete. ${completed} of ${total} items completed (${percentage}%).`;
        break;
      case 'reset':
        message = `Item marked as incomplete. ${completed} of ${total} items completed (${percentage}%).`;
        break;
      case 'reset-page':
        message = `Progress reset for this page. ${completed} of ${total} items completed (${percentage}%).`;
        break;
      case 'reset-all':
        message = 'All progress has been reset.';
        break;
    }
    
    if (announcer) {
      announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    } else {
      // Create announcer element if it doesn't exist
      const newAnnouncer = document.createElement('div');
      newAnnouncer.className = 'sr-announcer';
      newAnnouncer.setAttribute('aria-live', 'polite');
      newAnnouncer.textContent = message;
      document.body.appendChild(newAnnouncer);
      
      // Clear after announcement
      setTimeout(() => {
        newAnnouncer.textContent = '';
      }, 1000);
    }
  }
  
  /**
   * Creates a progress summary in the target element
   */
  createEmbeddedProgressSummary(targetElement: HTMLElement): void {
    if (!targetElement) return;
    
    const total = this.trackedElements.length;
    const completed = this.getCompletedCount();
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Create progress summary element
    const summary = document.createElement('div');
    summary.className = 'embedded-progress-summary';
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressBarFill = document.createElement('div');
    progressBarFill.className = 'progress-bar-fill';
    progressBarFill.style.width = `${percentage}%`;
    
    // Create text
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = `${completed}/${total} (${percentage}%)`;
    
    // Assemble the elements
    progressBar.appendChild(progressBarFill);
    summary.appendChild(progressBar);
    summary.appendChild(progressText);
    
    // Clear existing content
    targetElement.innerHTML = '';
    
    // Add to the target element
    targetElement.appendChild(summary);
  }
  
  /**
   * Set up keyboard navigation for checkboxes
   */
  setupKeyboardNavigation(): void {
    document.querySelectorAll('.progress-check').forEach((checkbox: Element) => {
      const item = checkbox.parentElement;
      if (!item) return;
      
      // Add keyboard event listeners
      item.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          (checkbox as HTMLInputElement).checked = !(checkbox as HTMLInputElement).checked;
          
          // Trigger change event
          const event = new Event('change');
          checkbox.dispatchEvent(event);
        }
      });
      
      // Make container focusable
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'checkbox');
      item.setAttribute('aria-checked', (checkbox as HTMLInputElement).checked.toString());
      
      // Keep aria-checked in sync with checkbox state
      checkbox.addEventListener('change', () => {
        item.setAttribute('aria-checked', (checkbox as HTMLInputElement).checked.toString());
      });
    });
  }
}

// Create singleton instance
const progressTracker = new ProgressTracker();

// Export the singleton
export default progressTracker; 