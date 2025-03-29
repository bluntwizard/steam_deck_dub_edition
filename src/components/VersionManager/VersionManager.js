/**
 * Steam Deck DUB Edition
 * VersionManager Component
 * 
 * Manages version tracking, changelog display, and update notifications
 */

import styles from './VersionManager.module.css';

class VersionManager {
  constructor(options = {}) {
    /**
     * Current version of the application
     * @type {string}
     */
    this.currentVersion = options.currentVersion || '1.0.0';
    
    /**
     * URL to fetch version information
     * @type {string}
     */
    this.versionJsonUrl = options.versionJsonUrl || 'version.json';
    
    /**
     * Version data including changelog
     * @type {Object}
     */
    this.versionData = null;
    
    /**
     * Storage key for last visited version
     * @type {string}
     */
    this.storageKey = options.storageKey || 'sdde-last-visited-version';
    
    /**
     * Whether the component is initialized
     * @type {boolean}
     */
    this.initialized = false;
    
    /**
     * Changelog dialog element
     * @type {HTMLElement}
     */
    this.changelogDialog = null;
    
    /**
     * Update notification element
     * @type {HTMLElement}
     */
    this.updateNotification = null;
    
    /**
     * Whether to automatically check for updates
     * @type {boolean}
     */
    this.autoCheckUpdates = options.autoCheckUpdates !== false;
    
    // Auto-initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the version manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Fetch version data
      await this.fetchVersionData();
      
      // Create UI elements
      this.createChangelogDialog();
      this.createUpdateNotification();
      
      // Check for updates if auto-check is enabled
      if (this.autoCheckUpdates) {
        this.checkForUpdates();
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.initialized = true;
      console.log(`VersionManager initialized (current version: ${this.currentVersion})`);
    } catch (error) {
      console.error('Error initializing VersionManager:', error);
    }
  }
  
  /**
   * Fetch version data from the server
   * @private
   * @returns {Promise<void>}
   */
  async fetchVersionData() {
    try {
      const response = await fetch(this.versionJsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch version data: ${response.status} ${response.statusText}`);
      }
      
      this.versionData = await response.json();
      
      // Update current version if provided in the data
      if (this.versionData.current) {
        this.currentVersion = this.versionData.current;
      }
      
      console.log('Version data fetched successfully');
    } catch (error) {
      console.error('Error fetching version data:', error);
      // Create minimal version data to avoid errors
      this.versionData = {
        current: this.currentVersion,
        versions: {
          [this.currentVersion]: {
            date: new Date().toISOString().split('T')[0],
            changes: ['Initial version']
          }
        }
      };
    }
  }
  
  /**
   * Create the changelog dialog
   * @private
   */
  createChangelogDialog() {
    // Check if changelog dialog already exists
    let existingDialog = document.getElementById('changelog-dialog');
    if (existingDialog) {
      this.changelogDialog = existingDialog;
      return;
    }
    
    // Create new dialog
    this.changelogDialog = document.createElement('div');
    this.changelogDialog.id = 'changelog-dialog';
    this.changelogDialog.className = styles.changelogDialog;
    this.changelogDialog.setAttribute('aria-modal', 'true');
    this.changelogDialog.setAttribute('role', 'dialog');
    this.changelogDialog.setAttribute('aria-labelledby', 'changelog-title');
    this.changelogDialog.style.display = 'none';
    
    // Create dialog content
    this.changelogDialog.innerHTML = `
      <div class="${styles.changelogContent}">
        <div class="${styles.changelogHeader}">
          <h2 id="changelog-title" class="${styles.changelogTitle}">Changelog</h2>
          <button id="close-changelog" class="${styles.closeButton}" aria-label="Close changelog">×</button>
        </div>
        <div class="${styles.changelogBody}">
          <div id="changelog-content" class="${styles.changelogItems}"></div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.changelogDialog);
  }
  
  /**
   * Create the update notification element
   * @private
   */
  createUpdateNotification() {
    // Check if notification already exists
    let existingNotification = document.getElementById('update-notification');
    if (existingNotification) {
      this.updateNotification = existingNotification;
      return;
    }
    
    // Create new notification
    this.updateNotification = document.createElement('div');
    this.updateNotification.id = 'update-notification';
    this.updateNotification.className = styles.updateNotification;
    this.updateNotification.style.display = 'none';
    
    // Create notification content
    this.updateNotification.innerHTML = `
      <div class="${styles.updateIcon}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="${styles.updateMessage}">
        <h3>New Version Available</h3>
        <p id="update-message">A new version is available with new features and bug fixes.</p>
      </div>
      <div class="${styles.updateActions}">
        <button id="view-updates" class="${styles.viewUpdatesButton}">View Updates</button>
        <button id="dismiss-updates" class="${styles.dismissButton}">Dismiss</button>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.updateNotification);
  }
  
  /**
   * Set up event listeners
   * @private
   */
  setupEventListeners() {
    try {
      // DOM content loaded event
      window.addEventListener('DOMContentLoaded', () => {
        this.initVersionTracking();
      });
      
      // Show changelog button
      const showChangelogButton = document.getElementById('show-changelog');
      if (showChangelogButton) {
        showChangelogButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.showChangelog();
        });
      }
      
      // Close changelog button
      const closeChangelogButton = document.getElementById('close-changelog');
      if (closeChangelogButton) {
        closeChangelogButton.addEventListener('click', () => {
          this.hideChangelog();
        });
      }
      
      // View updates button
      const viewUpdatesButton = document.getElementById('view-updates');
      if (viewUpdatesButton) {
        viewUpdatesButton.addEventListener('click', () => {
          this.hideUpdateNotification();
          this.showChangelog();
        });
      }
      
      // Dismiss updates button
      const dismissUpdatesButton = document.getElementById('dismiss-updates');
      if (dismissUpdatesButton) {
        dismissUpdatesButton.addEventListener('click', () => {
          this.hideUpdateNotification();
          this.acknowledgeUpdate();
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }
  
  /**
   * Show the changelog dialog
   */
  showChangelog() {
    try {
      if (!this.changelogDialog) {
        this.createChangelogDialog();
      }
      
      // Update changelog content
      this.updateChangelogContent();
      
      // Show dialog
      this.changelogDialog.style.display = 'flex';
      document.body.classList.add('modal-open');
      
      // Add keyboard event listener to close on Escape
      document.addEventListener('keydown', this.handleEscapeKey);
      
      // Add click outside listener
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick);
      }, 100);
    } catch (error) {
      console.error('Error showing changelog:', error);
    }
  }
  
  /**
   * Hide the changelog dialog
   */
  hideChangelog() {
    try {
      if (!this.changelogDialog) return;
      
      this.changelogDialog.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // Remove event listeners
      document.removeEventListener('keydown', this.handleEscapeKey);
      document.removeEventListener('click', this.handleOutsideClick);
    } catch (error) {
      console.error('Error hiding changelog:', error);
    }
  }
  
  /**
   * Handle Escape key press to close the changelog
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      this.hideChangelog();
    }
  };
  
  /**
   * Handle clicks outside the changelog to close it
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  handleOutsideClick = (e) => {
    if (
      this.changelogDialog &&
      !this.changelogDialog.querySelector(`.${styles.changelogContent}`).contains(e.target)
    ) {
      this.hideChangelog();
    }
  };
  
  /**
   * Update the changelog content with version data
   * @private
   */
  updateChangelogContent() {
    try {
      if (!this.changelogDialog || !this.versionData) return;
      
      const contentElement = this.changelogDialog.querySelector('#changelog-content');
      if (!contentElement) return;
      
      let html = '';
      
      // Sort versions in descending order (newest first)
      const sortedVersions = Object.keys(this.versionData.versions).sort((a, b) => {
        const versionA = a.split('.').map(Number);
        const versionB = b.split('.').map(Number);
        
        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
          const numA = versionA[i] || 0;
          const numB = versionB[i] || 0;
          if (numA !== numB) {
            return numB - numA; // Descending order
          }
        }
        
        return 0;
      });
      
      sortedVersions.forEach(version => {
        const versionInfo = this.versionData.versions[version];
        if (!versionInfo) return;
        
        html += `
          <div class="${styles.versionEntry}" id="version-${version}">
            <h3 class="${styles.versionTitle}">Version ${version}</h3>
            ${versionInfo.date ? `<span class="${styles.versionDate}">${versionInfo.date}</span>` : ''}
            <ul class="${styles.changesList}">
              ${versionInfo.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
          </div>
        `;
      });
      
      contentElement.innerHTML = html;
    } catch (error) {
      console.error('Error updating changelog content:', error);
    }
  }
  
  /**
   * Show the update notification
   * @param {string} message - Optional custom message
   */
  showUpdateNotification(message) {
    try {
      if (!this.updateNotification) {
        this.createUpdateNotification();
      }
      
      // Update message if provided
      if (message) {
        const messageElement = this.updateNotification.querySelector('#update-message');
        if (messageElement) {
          messageElement.textContent = message;
        }
      }
      
      // Show notification
      this.updateNotification.style.display = 'flex';
      
      // Animate in
      setTimeout(() => {
        this.updateNotification.classList.add(styles.visible);
      }, 10);
    } catch (error) {
      console.error('Error showing update notification:', error);
    }
  }
  
  /**
   * Hide the update notification
   */
  hideUpdateNotification() {
    try {
      if (!this.updateNotification) return;
      
      // Animate out
      this.updateNotification.classList.remove(styles.visible);
      
      // Hide after animation
      setTimeout(() => {
        this.updateNotification.style.display = 'none';
      }, 300);
    } catch (error) {
      console.error('Error hiding update notification:', error);
    }
  }
  
  /**
   * Initialize version tracking
   */
  initVersionTracking() {
    try {
      // Compare current version with last visited version
      const lastVisitedVersion = this.getLastVisitedVersion();
      
      if (lastVisitedVersion) {
        if (this.isNewerVersion(this.currentVersion, lastVisitedVersion)) {
          // Show update notification
          const message = `Updated to version ${this.currentVersion}`;
          this.showUpdateNotification(message);
        }
      }
      
      // Save current version as last visited
      this.saveLastVisitedVersion();
    } catch (error) {
      console.error('Error initializing version tracking:', error);
    }
  }
  
  /**
   * Get the last visited version from localStorage
   * @private
   * @returns {string|null} Last visited version
   */
  getLastVisitedVersion() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('Could not access localStorage for version tracking', error);
      return null;
    }
  }
  
  /**
   * Save the current version as last visited version
   * @private
   */
  saveLastVisitedVersion() {
    try {
      localStorage.setItem(this.storageKey, this.currentVersion);
    } catch (error) {
      console.warn('Could not save version to localStorage', error);
    }
  }
  
  /**
   * Acknowledge the update (mark as seen)
   */
  acknowledgeUpdate() {
    try {
      this.saveLastVisitedVersion();
    } catch (error) {
      console.error('Error acknowledging update:', error);
    }
  }
  
  /**
   * Check if version1 is newer than version2
   * @private
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {boolean} True if version1 is newer than version2
   */
  isNewerVersion(version1, version2) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      
      if (num1 > num2) return true;
      if (num1 < num2) return false;
    }
    
    return false; // Equal versions
  }
  
  /**
   * Check for updates manually
   * @returns {Promise<boolean>} True if updates are available
   */
  async checkForUpdates() {
    try {
      await this.fetchVersionData();
      
      // Check if there's a newer version available
      if (this.versionData && this.versionData.latest) {
        const isNewer = this.isNewerVersion(this.versionData.latest, this.currentVersion);
        
        if (isNewer) {
          // Show update notification
          const latestVersion = this.versionData.latest;
          const message = `Version ${latestVersion} is available (you have ${this.currentVersion})`;
          this.showUpdateNotification(message);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }
  
  /**
   * Navigate to a specific version section in the changelog
   * @param {string} version - Version to navigate to
   */
  navigateToVersion(version) {
    try {
      this.showChangelog();
      
      setTimeout(() => {
        const versionElement = document.getElementById(`version-${version}`);
        if (versionElement) {
          versionElement.scrollIntoView({ behavior: 'smooth' });
          versionElement.classList.add(styles.highlight);
          
          // Remove highlight after animation
          setTimeout(() => {
            versionElement.classList.remove(styles.highlight);
          }, 2000);
        }
      }, 300);
    } catch (error) {
      console.error('Error navigating to version:', error);
    }
  }
}

export default VersionManager; 