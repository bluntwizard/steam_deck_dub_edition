/**
 * Version Management System for Steam Deck DUB Edition Guide
 * Tracks content updates and notifies users of changes since their last visit
 * 
 * @module VersionManager
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './VersionManager.module.css';

/**
 * Version Manager
 * @class VersionManager
 */
class VersionManager {
  /**
   * Create a new VersionManager instance
   */
  constructor() {
    // Default values until data is loaded
    this.currentVersion = '20230801.1';
    this.sectionVersions = {};
    this.changelog = {};
    this.isDataLoaded = false;
    
    // Initialize version tracking
    this.init();
  }
  
  /**
   * Initialize version tracking
   */
  async init() {
    // Load version data
    await this.loadVersionData();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initVersionTracking());
    } else {
      this.initVersionTracking();
    }
    
    // Listen for content loaded event
    window.addEventListener('content-loaded', () => {
      // Mark section timestamps and check for updates
      this.markSectionTimestamps();
      this.checkForUpdates();
    });
  }
  
  /**
   * Load version data from external JSON file
   */
  async loadVersionData() {
    try {
      const response = await fetch('version.json');
      if (!response.ok) {
        throw new Error(`Failed to load version data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update version information
      this.currentVersion = data.currentVersion;
      this.sectionVersions = data.sectionVersions;
      this.changelog = data.changelog;
      this.isDataLoaded = true;
      
      console.log('Version data loaded successfully', this.currentVersion);
      
    } catch (error) {
      console.error('Error loading version data:', error);
      // Continue with default values
    }
  }
  
  /**
   * Initialize version tracking after DOM is ready
   */
  initVersionTracking() {
    // Create version display in the sidebar
    this.createVersionDisplay();
    
    // Check for updates after content is loaded
    if (document.body.classList.contains('content-loaded')) {
      this.markSectionTimestamps();
      this.checkForUpdates();
    }
  }
  
  /**
   * Create version display in the sidebar
   */
  createVersionDisplay() {
    const sidebar = document.querySelector('.sidebar-inner');
    if (!sidebar) return;
    
    // Create version display
    const versionDisplay = document.createElement('div');
    versionDisplay.className = styles['version-display'];
    versionDisplay.innerHTML = `
      <p class="${styles['version-number']}">Version ${this.currentVersion}</p>
      <a href="#" id="show-changelog">View Changelog</a>
    `;
    
    // Add to sidebar
    sidebar.appendChild(versionDisplay);
    
    // Set up changelog link
    document.getElementById('show-changelog').addEventListener('click', (e) => {
      e.preventDefault();
      this.showChangelog();
    });
  }
  
  /**
   * Show changelog dialog
   */
  showChangelog() {
    // Create changelog dialog
    const dialog = document.createElement('div');
    dialog.className = styles['changelog-dialog'];
    
    // Generate changelog content
    let changelogContent = `
      <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0; margin-bottom: 20px;">Changelog</h3>
    `;
    
    // Sort changelog entries by version (newest first)
    const sortedVersions = Object.keys(this.changelog).sort((a, b) => {
      return this.compareVersions(b, a);
    });
    
    // Build changelog HTML
    sortedVersions.forEach(version => {
      const entry = this.changelog[version];
      
      changelogContent += `
        <div class="${styles['changelog-entry']}">
          <h4 style="color: var(--dracula-cyan, #8be9fd); margin-bottom: 10px;">
            Version ${version} <span style="color: var(--dracula-comment, #6272a4); font-size: 0.9em; font-weight: normal;">(${entry.date})</span>
          </h4>
          <ul style="margin: 0; padding-left: 20px;">
      `;
      
      entry.changes.forEach(change => {
        changelogContent += `<li style="margin-bottom: 5px;">${change}</li>`;
      });
      
      changelogContent += '</ul></div>';
    });
    
    // Add close button
    changelogContent += `
      <div style="text-align: center; margin-top: 20px;">
        <button id="close-changelog" style="background-color: var(--dracula-purple, #bd93f9); color: var(--dracula-background, #282a36); padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    `;
    
    // Set dialog content
    dialog.innerHTML = changelogContent;
    
    // Add to DOM
    document.body.appendChild(dialog);
    
    // Add event listener to close button
    document.getElementById('close-changelog').addEventListener('click', () => {
      dialog.remove();
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
        if (!dialog.contains(e.target) && e.target.id !== 'show-changelog') {
          dialog.remove();
          document.removeEventListener('click', closeOnOutsideClick);
        }
      });
    }, 10);
  }
  
  /**
   * Mark each section with its last updated timestamp
   */
  markSectionTimestamps() {
    if (!this.isDataLoaded) return;
    
    // Add timestamps to each section
    Object.entries(this.sectionVersions).forEach(([sectionId, versionInfo]) => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      
      // Check if timestamp already exists
      let timestamp = section.querySelector(`.${styles['section-timestamp']}`);
      
      if (!timestamp) {
        // Create timestamp element
        timestamp = document.createElement('div');
        timestamp.className = styles['section-timestamp'];
        
        // Get the section heading
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          // Insert timestamp after heading
          heading.insertAdjacentElement('afterend', timestamp);
        } else {
          // If no heading, insert at the beginning of the section
          section.insertBefore(timestamp, section.firstChild);
        }
      }
      
      // Update timestamp text
      timestamp.textContent = `Last updated: ${versionInfo.lastUpdated}`;
      
      // Add data attributes for version info
      section.dataset.version = versionInfo.version;
      section.dataset.lastUpdated = versionInfo.lastUpdated;
    });
  }
  
  /**
   * Check if there are updates since user's last visit
   */
  checkForUpdates() {
    if (!this.isDataLoaded) return;
    
    // Get last visited version from localStorage
    const lastVisitedVersion = localStorage.getItem('sdde-last-visited-version');
    
    // If this is the first visit or version data was cleared, just save current version
    if (!lastVisitedVersion) {
      localStorage.setItem('sdde-last-visited-version', this.currentVersion);
      return;
    }
    
    // Check if current version is newer than last visited
    if (this.compareVersions(this.currentVersion, lastVisitedVersion) > 0) {
      // Show update notification
      this.showUpdateNotification(lastVisitedVersion);
      
      // Update the stored version
      localStorage.setItem('sdde-last-visited-version', this.currentVersion);
    }
    
    // Mark updated sections
    this.markUpdatedSections(lastVisitedVersion);
  }
  
  /**
   * Show notification about updates since last visit
   */
  showUpdateNotification(lastVisitedVersion) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = styles['update-notification'];
    
    // Generate list of versions since last visit
    const updatedVersions = this.getVersionsSince(lastVisitedVersion);
    let changeCount = 0;
    
    updatedVersions.forEach(version => {
      if (this.changelog[version]) {
        changeCount += this.changelog[version].changes.length;
      }
    });
    
    // Set notification content
    notification.innerHTML = `
      <p style="margin: 0 0 10px 0;">The guide has been updated since your last visit!</p>
      <p style="margin: 0 0 10px 0; font-size: 0.9em; opacity: 0.9;">
        ${changeCount} change${changeCount !== 1 ? 's' : ''} in ${updatedVersions.length} update${updatedVersions.length !== 1 ? 's' : ''}
      </p>
      <div style="display: flex; justify-content: space-between;">
        <button id="view-updates" class="${styles['update-button']}">View Changes</button>
        <button id="dismiss-updates" class="${styles['dismiss-button']}">Dismiss</button>
      </div>
    `;
    
    // Add to document and animate in
    document.body.appendChild(notification);
    
    // Force reflow to ensure transition works
    notification.offsetHeight;
    
    // Animate in
    notification.style.transform = 'translateY(0)';
    
    // Add event listeners
    document.getElementById('view-updates').addEventListener('click', () => {
      notification.remove();
      this.showChangelog();
    });
    
    document.getElementById('dismiss-updates').addEventListener('click', () => {
      // Animate out
      notification.style.transform = 'translateY(-100px)';
      
      // Remove after animation
      setTimeout(() => {
        notification.remove();
      }, 500);
    });
    
    // Auto dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = 'translateY(-100px)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        }, 500);
      }
    }, 10000);
  }
  
  /**
   * Mark sections that have been updated since last visit
   */
  markUpdatedSections(lastVisitedVersion) {
    if (!this.isDataLoaded) return;
    
    // For each section, check if it was updated since last visit
    Object.entries(this.sectionVersions).forEach(([sectionId, versionInfo]) => {
      // If section version is newer than last visited version
      if (this.compareVersions(versionInfo.version, lastVisitedVersion) > 0) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Add "Updated" badge if not already present
        if (!section.querySelector(`.${styles['updated-badge']}`)) {
          // Create badge
          const badge = document.createElement('span');
          badge.className = styles['updated-badge'];
          badge.textContent = 'UPDATED';
          
          // Add badge to heading
          const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) {
            heading.appendChild(badge);
          }
          
          // Also mark the sidebar link
          const sidebarLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
          if (sidebarLink && !sidebarLink.querySelector(`.${styles['updated-dot']}`)) {
            const dot = document.createElement('span');
            dot.className = styles['updated-dot'];
            dot.textContent = '•';
            
            sidebarLink.appendChild(dot);
          }
        }
      }
    });
  }
  
  /**
   * Get all versions released since a specific version
   */
  getVersionsSince(sinceVersion) {
    return Object.keys(this.changelog)
      .filter(version => this.compareVersions(version, sinceVersion) > 0)
      .sort((a, b) => this.compareVersions(b, a)); // Sort descending
  }
  
  /**
   * Compare two version strings
   * @returns {number} 1 if a > b, -1 if a < b, 0 if equal
   */
  compareVersions(a, b) {
    // Simple numeric comparison for our version format (YYYYMMDD.counter)
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    
    if (aNum > bNum) return 1;
    if (aNum < bNum) return -1;
    return 0;
  }
  
  /**
   * Initialize the component
   * This is the public method called from ui-main.js
   */
  initialize() {
    console.log('VersionManager initialized');
    
    // The component automatically initializes in the constructor,
    // so this method exists for API consistency with other components
    
    return this;
  }
}

export default new VersionManager(); 