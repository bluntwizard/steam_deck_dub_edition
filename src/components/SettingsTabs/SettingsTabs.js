/**
 * SettingsTabs Component for Steam Deck DUB Edition
 * Provides tabbed navigation for settings and configuration sections
 * 
 * @module SettingsTabs
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './SettingsTabs.module.css';

/**
 * Class for managing settings tabs navigation
 */
class SettingsTabs {
  /**
   * Creates a new SettingsTabs instance
   */
  constructor() {
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Currently active tab
     * @type {string|null}
     * @private
     */
    this.activeTab = null;
    
    /**
     * Collection of tab buttons
     * @type {NodeList|Array}
     * @private
     */
    this.tabButtons = [];
    
    /**
     * Collection of tab panes (content)
     * @type {NodeList|Array}
     * @private
     */
    this.tabPanes = [];
    
    /**
     * Event listeners to be removed on destroy
     * @type {Array}
     * @private
     */
    this.eventListeners = [];
  }
  
  /**
   * Initialize the settings tabs component
   * @param {Object} options - Configuration options
   * @param {string} [options.container='.settings-tabs-container'] - CSS selector for the tabs container
   * @param {string} [options.defaultTab] - ID of the default tab to activate
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    const settings = {
      container: '.settings-tabs-container',
      defaultTab: null,
      ...options
    };
    
    // Find tabs container
    const container = document.querySelector(settings.container);
    if (!container) {
      console.warn(`SettingsTabs: Container '${settings.container}' not found`);
      return;
    }
    
    // Apply module styles to container
    container.classList.add(styles['settings-tabs-container']);
    
    // Find tab buttons and panes
    this.tabButtons = container.querySelectorAll(`.${styles['tab-button']}, [data-tab]`);
    this.tabPanes = document.querySelectorAll(`.${styles['tab-pane']}, [data-tab-content]`);
    
    // If no tab buttons or panes found, try to find by default classes
    if (!this.tabButtons.length) {
      this.tabButtons = container.querySelectorAll('.tab-button, [data-tab]');
      // Apply styles to buttons
      this.tabButtons.forEach(button => {
        button.classList.add(styles['tab-button']);
      });
    }
    
    if (!this.tabPanes.length) {
      this.tabPanes = document.querySelectorAll('.tab-pane, [data-tab-content]');
      // Apply styles to panes
      this.tabPanes.forEach(pane => {
        pane.classList.add(styles['tab-pane']);
      });
    }
    
    // Set up event listeners for tab buttons
    this.setupTabNavigation();
    
    // Activate default tab or first tab
    const defaultTabId = settings.defaultTab || 
                        this.tabButtons.length ? this.tabButtons[0].getAttribute('data-tab') : null;
    
    if (defaultTabId) {
      this.switchToTab(defaultTabId);
    }
    
    this.initialized = true;
    console.log('SettingsTabs component initialized');
  }
  
  /**
   * Set up event listeners for tab navigation
   * @private
   */
  setupTabNavigation() {
    this.tabButtons.forEach(button => {
      const handler = () => {
        const tabId = button.getAttribute('data-tab');
        if (tabId) {
          this.switchToTab(tabId);
        }
      };
      
      button.addEventListener('click', handler);
      
      // Store for cleanup
      this.eventListeners.push({
        element: button,
        type: 'click',
        handler
      });
    });
  }
  
  /**
   * Switch to a specific tab
   * @param {string} tabId - ID of the tab to switch to
   * @returns {void}
   */
  switchToTab(tabId) {
    if (!tabId) return;
    
    // Update active state
    this.activeTab = tabId;
    
    // Update tab button active states
    this.tabButtons.forEach(button => {
      const isActive = button.getAttribute('data-tab') === tabId;
      button.classList.toggle(styles.active, isActive);
      button.setAttribute('aria-selected', isActive.toString());
    });
    
    // Update tab pane visibility
    this.tabPanes.forEach(pane => {
      // Check for matching tab content ID
      const paneTabId = pane.getAttribute('data-tab-content') || pane.id.replace('-content', '');
      const isActive = paneTabId === tabId;
      
      pane.classList.toggle(styles.active, isActive);
      pane.setAttribute('aria-hidden', (!isActive).toString());
      
      // Trigger custom event for content visibility change
      if (isActive) {
        const event = new CustomEvent('tab:shown', { detail: { tabId } });
        pane.dispatchEvent(event);
      }
    });
    
    // Dispatch tab change event
    const event = new CustomEvent('tab:changed', { 
      detail: { tabId, previousTab: this.activeTab !== tabId ? this.activeTab : null } 
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Get the currently active tab ID
   * @returns {string|null} The active tab ID
   */
  getActiveTab() {
    return this.activeTab;
  }
  
  /**
   * Refresh tab layouts (useful after dynamic content changes)
   * @returns {void}
   */
  refresh() {
    // Re-apply active tab
    if (this.activeTab) {
      this.switchToTab(this.activeTab);
    }
  }
  
  /**
   * Clean up event listeners and prepare for destruction
   * @returns {void}
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    
    this.eventListeners = [];
    this.initialized = false;
  }
}

// Export a singleton instance
export default new SettingsTabs(); 