/**
 * VersionDisplay Component for Steam Deck DUB Edition
 * Displays the current version and provides update functionality
 * 
 * @module VersionDisplay
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './VersionDisplay.module.css';

/**
 * Class for managing version display and update functionality
 */
class VersionDisplay {
  /**
   * Creates a new VersionDisplay instance
   */
  constructor() {
    /**
     * DOM element containing the version display
     * @type {HTMLElement|null}
     * @private
     */
    this.element = null;
    
    /**
     * Current version of the application
     * @type {string|null}
     * @private
     */
    this.version = null;
    
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
  }
  
  /**
   * Initialize the version display component
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Get the current version - try electron method first
      if (typeof window.electron !== 'undefined' && window.electron.ipcRenderer) {
        // Electron environment
        this.version = await window.electron.ipcRenderer.invoke('get-version');
      } else {
        // Fallback for non-electron environments
        this.version = await this.getVersionFallback();
      }
      
      // Create version display element
      this.element = document.createElement('div');
      this.element.className = styles['version-display'];
      this.element.innerHTML = `
        <span class="${styles['version-text']}">v${this.version}</span>
        <button class="${styles['check-updates-btn']}">Check for Updates</button>
      `;
      
      // Add click handler for update check
      const updateBtn = this.element.querySelector(`.${styles['check-updates-btn']}`);
      if (updateBtn) {
        updateBtn.addEventListener('click', () => this.checkForUpdates());
      }
      
      // Add to the page
      document.body.appendChild(this.element);
      
      this.initialized = true;
      console.log('Version display initialized:', this.version);
    } catch (error) {
      console.error('Failed to initialize version display:', error);
    }
  }
  
  /**
   * Check for updates
   * @private
   */
  async checkForUpdates() {
    try {
      if (typeof window.electron !== 'undefined' && window.electron.ipcRenderer) {
        // Electron environment
        await window.electron.ipcRenderer.invoke('check-for-updates');
      } else {
        // Fallback for non-electron environments
        console.log('Update check not available in this environment');
        this.showUpdateNotification('Update check not available in this environment');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      this.showUpdateNotification('Failed to check for updates');
    }
  }
  
  /**
   * Get the version from a fallback method
   * @private
   * @returns {Promise<string>}
   */
  async getVersionFallback() {
    return new Promise((resolve) => {
      // Try to get the version from meta tag
      const metaVersion = document.querySelector('meta[name="app-version"]');
      if (metaVersion && metaVersion.getAttribute('content')) {
        resolve(metaVersion.getAttribute('content'));
        return;
      }
      
      // Fallback to a default version
      resolve('0.0.0');
    });
  }
  
  /**
   * Show a notification about updates
   * @param {string} message - Message to display
   * @private
   */
  showUpdateNotification(message) {
    // Check if we have access to the global notification system
    if (window.showNotification) {
      window.showNotification(message);
      return;
    }
    
    // Fallback to creating our own notification
    const notification = document.createElement('div');
    notification.className = styles['update-notification'];
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation by setting a timeout
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after a delay
    setTimeout(() => {
      notification.style.transform = 'translateY(-100px)';
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 4000);
  }
}

// Export a singleton instance
export default new VersionDisplay(); 