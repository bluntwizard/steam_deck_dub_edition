/**
 * Progress Tracker for Steam Deck DUB Edition Guide
 * Allows users to mark sections as completed and track overall progress
 */

class ProgressTracker {
  constructor() {
    this.storageKey = 'sdde-progress';
    this.progressData = this.loadProgress();
    
    // Map of section IDs that can be tracked
    this.trackableSections = [
      'intro',
      'section-i',
      'section-ii',
      'section-iii',
      'section-iv',
      'decky-loader-plugins',
      'glossary',
      'flatpaks'
    ];
    
    // Wait for DOM content to be loaded before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
    
    // Listen for content loaded event
    window.addEventListener('content-loaded', () => {
      this.addProgressControls();
      this.updateProgressIndicators();
    });
  }
  
  /**
   * Initialize the progress tracker
   */
  init() {
    // Create progress UI elements
    this.createProgressIndicator();
    
    // Add progress controls once content is loaded
    if (document.body.classList.contains('content-loaded')) {
      this.addProgressControls();
      this.updateProgressIndicators();
    }
  }
  
  /**
   * Create the main progress indicator in the sidebar
   */
  createProgressIndicator() {
    const sidebar = document.querySelector('.sidebar-inner');
    if (!sidebar) return;
    
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    // Calculate overall progress
    const completedCount = Object.values(this.progressData).filter(Boolean).length;
    const totalCount = this.trackableSections.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    // Add HTML content
    progressContainer.innerHTML = `
      <h3>Your Progress</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-text">${progressPercentage}% Complete</div>
      <button id="reset-progress" class="reset-progress-button">Reset Progress</button>
    `;
    
    // Insert after version display if it exists, otherwise append
    const versionDisplay = sidebar.querySelector('.version-display');
    if (versionDisplay) {
      versionDisplay.insertAdjacentElement('beforebegin', progressContainer);
    } else {
      sidebar.appendChild(progressContainer);
    }
    
    // Add event listener to reset button
    document.getElementById('reset-progress').addEventListener('click', (e) => {
      e.preventDefault();
      this.confirmResetProgress();
    });
  }
  
  /**
   * Add progress tracking controls to each section
   */
  addProgressControls() {
    // For each trackable section
    this.trackableSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      
      // Check if control already exists
      if (section.querySelector('.progress-control')) return;
      
      // Find the section heading
      const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
      if (!heading) return;
      
      // Create progress control
      const control = document.createElement('div');
      control.className = 'progress-control';
      control.dataset.sectionId = sectionId;
      
      // Check if section is completed
      const isCompleted = this.progressData[sectionId] || false;
      
      // Set initial state
      control.classList.toggle('completed', isCompleted);
      control.setAttribute('aria-checked', isCompleted);
      control.setAttribute('role', 'checkbox');
      control.setAttribute('tabindex', '0');
      control.title = isCompleted ? 'Mark as incomplete' : 'Mark as completed';
      
      // Icon for control
      control.innerHTML = `
        <svg class="progress-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      `;
      
      // Add event listeners
      control.addEventListener('click', () => this.toggleSectionProgress(sectionId, control));
      
      // Keyboard accessibility
      control.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleSectionProgress(sectionId, control);
        }
      });
      
      // Add control to heading
      heading.appendChild(control);
      
      // Update sidebar link for this section
      this.updateSidebarLink(sectionId, isCompleted);
    });
    
    // Create the floating progress FAB (Floating Action Button)
    this.createProgressFAB();
  }
  
  /**
   * Create a floating action button for quick progress view
   */
  createProgressFAB() {
    // Check if FAB already exists
    if (document.getElementById('progress-fab')) return;
    
    // Create the FAB
    const fab = document.createElement('button');
    fab.id = 'progress-fab';
    fab.className = 'progress-fab';
    
    // Calculate progress for the indicator
    const completedCount = Object.values(this.progressData).filter(Boolean).length;
    const totalCount = this.trackableSections.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    // Set content with progress indicator
    fab.innerHTML = `
      <div class="progress-fab-circle">
        <svg viewBox="0 0 36 36">
          <path class="progress-fab-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke-width="2"
          />
          <path class="progress-fab-path"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke-width="2"
            stroke-dasharray="${progressPercentage}, 100"
          />
        </svg>
        <span class="progress-fab-text">${progressPercentage}%</span>
      </div>
    `;
    
    // Add tooltip
    fab.title = `Your Progress: ${progressPercentage}%`;
    
    // Add to document
    document.body.appendChild(fab);
    
    // Add click handler to show progress details dialog
    fab.addEventListener('click', () => this.showProgressDialog());
  }
  
  /**
   * Show a detailed progress dialog
   */
  showProgressDialog() {
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'progress-dialog';
    
    // Calculate progress stats
    const completedCount = Object.values(this.progressData).filter(Boolean).length;
    const totalCount = this.trackableSections.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    // Build section completion list
    let sectionsList = '';
    this.trackableSections.forEach(sectionId => {
      const isCompleted = this.progressData[sectionId] || false;
      const section = document.getElementById(sectionId);
      
      if (section) {
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        const title = heading ? heading.textContent.replace(/^[\d\s.]+/, '').trim() : sectionId;
        
        sectionsList += `
          <div class="progress-dialog-item" data-section-id="${sectionId}">
            <label class="progress-dialog-label">
              <input type="checkbox" ${isCompleted ? 'checked' : ''} data-section-id="${sectionId}">
              <span class="progress-dialog-checkmark"></span>
              <span class="progress-dialog-title">${title}</span>
            </label>
          </div>
        `;
      }
    });
    
    // Add content to the dialog
    dialog.innerHTML = `
      <div class="progress-dialog-content">
        <h3>Your Progress</h3>
        
        <div class="progress-dialog-summary">
          <div class="progress-dialog-chart">
            <svg viewBox="0 0 36 36" class="progress-circular-chart">
              <path class="progress-circular-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="progress-circular-path"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                stroke-dasharray="${progressPercentage}, 100"
              />
              <text x="18" y="20.35" class="progress-circular-text">
                ${progressPercentage}%
              </text>
            </svg>
          </div>
          
          <div class="progress-dialog-stats">
            <div class="progress-stat">
              <span class="progress-stat-value">${completedCount}</span>
              <span class="progress-stat-label">Completed</span>
            </div>
            <div class="progress-stat">
              <span class="progress-stat-value">${totalCount - completedCount}</span>
              <span class="progress-stat-label">Remaining</span>
            </div>
            <div class="progress-stat">
              <span class="progress-stat-value">${totalCount}</span>
              <span class="progress-stat-label">Total</span>
            </div>
          </div>
        </div>
        
        <h4>Section Completion</h4>
        <div class="progress-dialog-sections">
          ${sectionsList}
        </div>
        
        <div class="progress-dialog-actions">
          <button id="dialog-reset-progress" class="dialog-btn dialog-btn-danger">Reset Progress</button>
          <button id="dialog-close" class="dialog-btn dialog-btn-primary">Close</button>
        </div>
      </div>
    `;
    
    // Add dialog to the document
    document.body.appendChild(dialog);
    
    // Add event listeners
    document.getElementById('dialog-close').addEventListener('click', () => {
      dialog.remove();
    });
    
    document.getElementById('dialog-reset-progress').addEventListener('click', () => {
      this.confirmResetProgress();
      dialog.remove();
    });
    
    // Add event listeners to checkboxes
    dialog.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const sectionId = checkbox.dataset.sectionId;
        this.toggleSectionProgress(sectionId, null, checkbox.checked);
        
        // Update UI inside the dialog
        const completedCount = Object.values(this.progressData).filter(Boolean).length;
        const progressPercentage = Math.round((completedCount / totalCount) * 100);
        
        const chartPath = dialog.querySelector('.progress-circular-path');
        chartPath.setAttribute('stroke-dasharray', `${progressPercentage}, 100`);
        
        const chartText = dialog.querySelector('.progress-circular-text');
        chartText.textContent = `${progressPercentage}%`;
        
        const statValues = dialog.querySelectorAll('.progress-stat-value');
        statValues[0].textContent = completedCount;
        statValues[1].textContent = totalCount - completedCount;
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function closeOnEsc(e) {
      if (e.key === 'Escape') {
        dialog.remove();
        document.removeEventListener('keydown', closeOnEsc);
      }
    });
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeOnOutsideClick(e) {
        if (!dialog.querySelector('.progress-dialog-content').contains(e.target) && 
            e.target.id !== 'progress-fab') {
          dialog.remove();
          document.removeEventListener('click', closeOnOutsideClick);
        }
      });
    }, 10);
  }
  
  /**
   * Toggle progress state for a section
   */
  toggleSectionProgress(sectionId, controlElement, forcedState = null) {
    // Get current state
    const currentState = this.progressData[sectionId] || false;
    
    // Determine new state
    const newState = (forcedState !== null) ? forcedState : !currentState;
    
    // Update progress data
    this.progressData[sectionId] = newState;
    
    // Save to localStorage
    this.saveProgress();
    
    // Update UI if control element is provided
    if (controlElement) {
      controlElement.classList.toggle('completed', newState);
      controlElement.setAttribute('aria-checked', newState);
      controlElement.title = newState ? 'Mark as incomplete' : 'Mark as completed';
    }
    
    // Update sidebar link
    this.updateSidebarLink(sectionId, newState);
    
    // Update overall progress indicators
    this.updateProgressIndicators();
  }
  
  /**
   * Update all progress indicators
   */
  updateProgressIndicators() {
    // Update progress bar in sidebar
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && progressText) {
      const completedCount = Object.values(this.progressData).filter(Boolean).length;
      const totalCount = this.trackableSections.length;
      const progressPercentage = Math.round((completedCount / totalCount) * 100);
      
      progressBar.style.width = `${progressPercentage}%`;
      progressText.textContent = `${progressPercentage}% Complete`;
    }
    
    // Update floating progress FAB
    const fab = document.getElementById('progress-fab');
    if (fab) {
      const completedCount = Object.values(this.progressData).filter(Boolean).length;
      const totalCount = this.trackableSections.length;
      const progressPercentage = Math.round((completedCount / totalCount) * 100);
      
      const fabPath = fab.querySelector('.progress-fab-path');
      if (fabPath) {
        fabPath.setAttribute('stroke-dasharray', `${progressPercentage}, 100`);
      }
      
      const fabText = fab.querySelector('.progress-fab-text');
      if (fabText) {
        fabText.textContent = `${progressPercentage}%`;
      }
      
      fab.title = `Your Progress: ${progressPercentage}%`;
    }
  }
  
  /**
   * Update sidebar link to show completion status
   */
  updateSidebarLink(sectionId, isCompleted) {
    const sidebarLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
    if (!sidebarLink) return;
    
    // Remove existing indicator if any
    const existingIndicator = sidebarLink.querySelector('.progress-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Add indicator if completed
    if (isCompleted) {
      const indicator = document.createElement('span');
      indicator.className = 'progress-indicator';
      indicator.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      `;
      sidebarLink.appendChild(indicator);
    }
  }
  
  /**
   * Show confirmation dialog for resetting progress
   */
  confirmResetProgress() {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    
    confirmDialog.innerHTML = `
      <div class="confirm-dialog-content">
        <h3>Reset Progress</h3>
        <p>Are you sure you want to reset all your progress? This cannot be undone.</p>
        <div class="confirm-dialog-actions">
          <button id="cancel-reset" class="dialog-btn">Cancel</button>
          <button id="confirm-reset" class="dialog-btn dialog-btn-danger">Reset All Progress</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Add event listeners
    document.getElementById('cancel-reset').addEventListener('click', () => {
      confirmDialog.remove();
    });
    
    document.getElementById('confirm-reset').addEventListener('click', () => {
      this.resetProgress();
      confirmDialog.remove();
    });
    
    // Close on escape key
    document.addEventListener('keydown', function closeOnEsc(e) {
      if (e.key === 'Escape') {
        confirmDialog.remove();
        document.removeEventListener('keydown', closeOnEsc);
      }
    });
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeOnOutsideClick(e) {
        if (!confirmDialog.querySelector('.confirm-dialog-content').contains(e.target)) {
          confirmDialog.remove();
          document.removeEventListener('click', closeOnOutsideClick);
        }
      });
    }, 10);
  }
  
  /**
   * Reset all progress
   */
  resetProgress() {
    // Clear progress data
    this.progressData = {};
    
    // Save to localStorage
    this.saveProgress();
    
    // Update UI
    this.trackableSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      
      const control = section.querySelector('.progress-control');
      if (control) {
        control.classList.remove('completed');
        control.setAttribute('aria-checked', false);
        control.title = 'Mark as completed';
      }
      
      // Update sidebar link
      this.updateSidebarLink(sectionId, false);
    });
    
    // Update overall progress indicators
    this.updateProgressIndicators();
    
    // Show notification
    this.showNotification('Progress has been reset');
  }
  
  /**
   * Show a notification to the user
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'progress-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after a delay
    setTimeout(() => {
      notification.classList.add('progress-notification-hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  /**
   * Load progress data from localStorage
   */
  loadProgress() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading progress data:', error);
      return {};
    }
  }
  
  /**
   * Save progress data to localStorage
   */
  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progressData));
    } catch (error) {
      console.error('Error saving progress data:', error);
    }
  }
}

// Initialize progress tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.progressTracker = new ProgressTracker();
});
