/**
 * SettingsSection Component for Steam Deck DUB Edition
 * Provides structured layout for application settings
 * 
 * @module SettingsSection
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './SettingsSection.module.css';
import i18n from '../../scripts/i18n.js';
import settingsManager from '../../scripts/core/settings-manager.js';

/**
 * Class for managing the settings section component
 */
class SettingsSection {
  /**
   * Creates a new SettingsSection instance
   */
  constructor() {
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Reference to the settings section element
     * @type {HTMLElement|null}
     * @private
     */
    this.sectionElement = null;
    
    /**
     * Reference to the settings tabs component
     * @type {Object|null}
     * @private
     */
    this.settingsTabs = null;
  }
  
  /**
   * Initialize the settings section component
   * @param {Object} options - Configuration options
   * @param {string} [options.settingsSectionId='settings-section'] - ID of the settings section element
   * @param {Object} [options.settingsTabs=null] - Reference to the settings tabs component
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    const settings = {
      settingsSectionId: 'settings-section',
      settingsTabs: null,
      ...options
    };
    
    // Find settings section element
    this.sectionElement = document.getElementById(settings.settingsSectionId);
    if (!this.sectionElement) {
      console.warn(`SettingsSection: Element with ID '${settings.settingsSectionId}' not found`);
      return;
    }
    
    // Apply module styles
    this.sectionElement.classList.add(styles['settings-section']);
    
    // Find all settings group containers and apply styles
    const settingsGroups = this.sectionElement.querySelectorAll('.settings-group');
    settingsGroups.forEach(group => {
      group.classList.add(styles['settings-group']);
    });
    
    // Find all setting items and apply styles
    const settingItems = this.sectionElement.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
      item.classList.add(styles['setting-item']);
    });
    
    // Find all toggle switches and apply styles
    const toggleSwitches = this.sectionElement.querySelectorAll('.toggle-switch');
    toggleSwitches.forEach(toggle => {
      toggle.classList.add(styles['toggle-switch']);
    });
    
    // Find all buttons and apply styles
    const buttons = this.sectionElement.querySelectorAll('.btn-secondary');
    buttons.forEach(button => {
      button.classList.add(styles['btn-secondary']);
    });
    
    // Find all button groups and apply styles
    const buttonGroups = this.sectionElement.querySelectorAll('.button-group');
    buttonGroups.forEach(group => {
      group.classList.add(styles['button-group']);
    });
    
    // Store reference to settings tabs component if provided
    this.settingsTabs = settings.settingsTabs;
    
    // Initialize settings toggle in header
    this.createSettingsToggle();
    
    this.initialized = true;
    console.log('SettingsSection component initialized');
  }
  
  /**
   * Create settings toggle button in the header
   * @private
   */
  createSettingsToggle() {
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // Check if toggle already exists
    if (document.querySelector('.settings-toggle')) return;
    
    // Create settings link
    const settingsLi = document.createElement('li');
    settingsLi.className = 'nav-item';
    
    const settingsLink = document.createElement('a');
    settingsLink.className = `nav-link settings-toggle ${styles['settings-toggle']}`;
    settingsLink.href = '#settings';
    settingsLink.setAttribute('data-i18n', 'nav.settings');
    settingsLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="nav-icon">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg> <span>${i18n.t('nav.settings') || 'Settings'}</span>`;
    
    settingsLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleSettingsVisibility();
    });
    
    settingsLi.appendChild(settingsLink);
    navbar.appendChild(settingsLi);
  }
  
  /**
   * Toggle settings section visibility
   * @public
   */
  toggleSettingsVisibility() {
    const homeContent = document.getElementById('home-content');
    
    if (this.sectionElement.style.display === 'none') {
      // Show settings
      this.sectionElement.style.display = 'block';
      if (homeContent) homeContent.style.display = 'none';
    } else {
      // Hide settings
      this.sectionElement.style.display = 'none';
      if (homeContent) homeContent.style.display = 'block';
    }
    
    // Switch to the active tab if tabs component is available
    if (this.settingsTabs && typeof this.settingsTabs.refresh === 'function') {
      this.settingsTabs.refresh();
    }

    // Dispatch event for other components to respond to
    const event = new CustomEvent('settings:visibility:changed', {
      detail: { visible: this.sectionElement.style.display !== 'none' }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Show notification to the user
   * @param {string} message - Message to display
   * @param {boolean} [isAction=false] - Whether to show action button
   * @param {string} [actionText=''] - Text for the action button
   * @param {Function} [actionCallback=null] - Callback for the action button
   * @param {number} [duration=3000] - Duration to show notification in ms
   * @public
   */
  showNotification(message, isAction = false, actionText = '', actionCallback = null, duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('settings-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'settings-notification';
      notification.className = `notification ${styles.notification}`;
      document.body.appendChild(notification);
    }
    
    // Set notification content
    notification.textContent = message;
    
    // Add action button if needed
    if (isAction && actionText) {
      const actionButton = document.createElement('button');
      actionButton.className = `notification-action ${styles['notification-action']}`;
      actionButton.textContent = actionText;
      if (typeof actionCallback === 'function') {
        actionButton.onclick = actionCallback;
      }
      notification.appendChild(actionButton);
    }
    
    // Show notification
    notification.classList.add(styles.show);
    
    // Hide after a delay
    setTimeout(() => {
      notification.classList.remove(styles.show);
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (notification.parentNode && !isAction) notification.remove();
      }, 300);
    }, duration);
  }
}

// Export singleton instance
export default new SettingsSection(); 