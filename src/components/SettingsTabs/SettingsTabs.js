/**
 * Steam Deck DUB Edition
 * SettingsTabs Component
 * 
 * A component for managing tabbed interfaces in settings panels
 */

import styles from './SettingsTabs.module.css';

class SettingsTabs {
  /**
   * Create a new settings tabs component
   * @param {Object} options - Configuration options
   * @param {string} options.id - Unique identifier for the tabs container
   * @param {HTMLElement} options.container - Container element to append the tabs to
   * @param {Array} options.tabs - Array of tab configurations
   * @param {Function} options.onTabChange - Callback for tab changes
   * @param {string} options.activeTab - The initially active tab ID
   * @param {boolean} options.autoInit - Whether to initialize automatically (default: true)
   */
  constructor(options = {}) {
    this.options = {
      id: options.id || `settings-tabs-${Date.now()}`,
      container: options.container || document.body,
      tabs: options.tabs || [],
      onTabChange: options.onTabChange || (() => {}),
      activeTab: options.activeTab || (options.tabs && options.tabs.length > 0 ? options.tabs[0].id : null),
      autoInit: options.autoInit !== false
    };
    
    // Element references
    this.tabsElement = null;
    this.buttonsContainer = null;
    this.contentContainer = null;
    this.tabButtons = new Map();
    this.tabPanes = new Map();
    
    // Track the initialized state
    this.initialized = false;
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the settings tabs
   * @returns {HTMLElement} The created tabs element
   */
  initialize() {
    if (this.initialized) return this.tabsElement;
    
    // Create wrapper element
    this.tabsElement = document.createElement('div');
    this.tabsElement.id = this.options.id;
    this.tabsElement.className = styles.settingsTabs;
    
    // Create tab buttons container
    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.className = styles.tabButtons;
    this.buttonsContainer.setAttribute('role', 'tablist');
    this.tabsElement.appendChild(this.buttonsContainer);
    
    // Create tab content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = styles.tabContent;
    this.tabsElement.appendChild(this.contentContainer);
    
    // Create tabs
    this.createTabs();
    
    // Add to container
    this.options.container.appendChild(this.tabsElement);
    
    // Activate initial tab
    if (this.options.activeTab && this.tabButtons.has(this.options.activeTab)) {
      this.switchToTab(this.options.activeTab);
    }
    
    this.initialized = true;
    return this.tabsElement;
  }
  
  /**
   * Create tab buttons and panes based on configuration
   * @private
   */
  createTabs() {
    if (!this.options.tabs.length) return;
    
    this.options.tabs.forEach(tab => {
      this.createTab(tab);
    });
  }
  
  /**
   * Create a single tab with its button and pane
   * @private
   * @param {Object} tab - Tab configuration
   */
  createTab(tab) {
    if (!tab.id) return;
    
    // Create tab button
    const button = document.createElement('button');
    button.className = styles.tabButton;
    button.dataset.tab = tab.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${tab.id}-pane`);
    button.setAttribute('aria-selected', 'false');
    button.id = `tab-button-${tab.id}`;
    
    // Add icon if provided
    if (tab.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = styles.tabIcon;
      iconSpan.innerHTML = tab.icon;
      button.appendChild(iconSpan);
    }
    
    // Add label
    const labelSpan = document.createElement('span');
    labelSpan.className = styles.tabLabel;
    labelSpan.textContent = tab.label || tab.id;
    button.appendChild(labelSpan);
    
    // Add click event
    button.addEventListener('click', () => {
      this.switchToTab(tab.id);
    });
    
    // Create tab pane
    const pane = document.createElement('div');
    pane.className = styles.tabPane;
    pane.id = `${tab.id}-pane`;
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', `tab-button-${tab.id}`);
    pane.hidden = true;
    
    // Add tab content if provided
    if (tab.content) {
      if (typeof tab.content === 'string') {
        pane.innerHTML = tab.content;
      } else if (tab.content instanceof HTMLElement) {
        pane.appendChild(tab.content);
      }
    }
    
    // Store references
    this.tabButtons.set(tab.id, button);
    this.tabPanes.set(tab.id, pane);
    
    // Add to containers
    this.buttonsContainer.appendChild(button);
    this.contentContainer.appendChild(pane);
  }
  
  /**
   * Switch to a specific tab
   * @param {string} tabId - ID of the tab to switch to
   * @returns {boolean} Whether the tab switch was successful
   */
  switchToTab(tabId) {
    if (!this.initialized || !this.tabButtons.has(tabId)) return false;
    
    // Update active tab
    const prevTabId = this.options.activeTab;
    this.options.activeTab = tabId;
    
    // Update button states
    this.tabButtons.forEach((button, id) => {
      const isActive = id === tabId;
      button.classList.toggle(styles.active, isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    
    // Update pane visibility
    this.tabPanes.forEach((pane, id) => {
      const isActive = id === tabId;
      pane.classList.toggle(styles.active, isActive);
      pane.hidden = !isActive;
    });
    
    // Call tab change callback
    if (prevTabId !== tabId) {
      this.options.onTabChange(tabId, prevTabId);
      
      // Dispatch custom event
      const event = new CustomEvent('tab-change', {
        bubbles: true,
        detail: {
          tabs: this,
          tabId: tabId,
          previousTabId: prevTabId
        }
      });
      this.tabsElement.dispatchEvent(event);
    }
    
    return true;
  }
  
  /**
   * Add a new tab to the tabs component
   * @param {Object} tab - Tab configuration
   * @param {boolean} switchTo - Whether to switch to the new tab
   * @returns {boolean} Whether the tab was added successfully
   */
  addTab(tab, switchTo = false) {
    if (!this.initialized || !tab.id || this.tabButtons.has(tab.id)) return false;
    
    this.createTab(tab);
    this.options.tabs.push(tab);
    
    if (switchTo) {
      this.switchToTab(tab.id);
    }
    
    return true;
  }
  
  /**
   * Remove a tab from the tabs component
   * @param {string} tabId - ID of the tab to remove
   * @returns {boolean} Whether the tab was removed successfully
   */
  removeTab(tabId) {
    if (!this.initialized || !this.tabButtons.has(tabId)) return false;
    
    // Get references
    const button = this.tabButtons.get(tabId);
    const pane = this.tabPanes.get(tabId);
    
    // Remove from DOM
    button.remove();
    pane.remove();
    
    // Remove from references
    this.tabButtons.delete(tabId);
    this.tabPanes.delete(tabId);
    
    // Remove from tabs array
    const tabIndex = this.options.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      this.options.tabs.splice(tabIndex, 1);
    }
    
    // Switch to another tab if the active tab was removed
    if (this.options.activeTab === tabId && this.options.tabs.length > 0) {
      this.switchToTab(this.options.tabs[0].id);
    }
    
    return true;
  }
  
  /**
   * Update a tab's properties
   * @param {string} tabId - ID of the tab to update
   * @param {Object} tabProps - Tab properties to update
   * @returns {boolean} Whether the tab was updated successfully
   */
  updateTab(tabId, tabProps) {
    if (!this.initialized || !this.tabButtons.has(tabId)) return false;
    
    // Get references
    const button = this.tabButtons.get(tabId);
    const pane = this.tabPanes.get(tabId);
    
    // Update tab data
    const tabIndex = this.options.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      this.options.tabs[tabIndex] = { ...this.options.tabs[tabIndex], ...tabProps };
      const tab = this.options.tabs[tabIndex];
      
      // Update button label
      if (tabProps.label) {
        const labelSpan = button.querySelector(`.${styles.tabLabel}`);
        if (labelSpan) {
          labelSpan.textContent = tabProps.label;
        }
      }
      
      // Update button icon
      if (tabProps.icon) {
        let iconSpan = button.querySelector(`.${styles.tabIcon}`);
        if (!iconSpan) {
          iconSpan = document.createElement('span');
          iconSpan.className = styles.tabIcon;
          button.insertBefore(iconSpan, button.firstChild);
        }
        iconSpan.innerHTML = tabProps.icon;
      }
      
      // Update content
      if (tabProps.content) {
        pane.innerHTML = '';
        if (typeof tabProps.content === 'string') {
          pane.innerHTML = tabProps.content;
        } else if (tabProps.content instanceof HTMLElement) {
          pane.appendChild(tabProps.content);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get the currently active tab ID
   * @returns {string} Active tab ID
   */
  getActiveTab() {
    return this.options.activeTab;
  }
  
  /**
   * Get all tabs configuration
   * @returns {Array} Array of tab configurations
   */
  getTabs() {
    return [...this.options.tabs];
  }
  
  /**
   * Set up keyboard navigation for tabs
   * @private
   */
  setupKeyboardNavigation() {
    if (!this.initialized) return;
    
    this.buttonsContainer.addEventListener('keydown', (event) => {
      // Only handle keyboard events for our tab buttons
      if (!event.target.classList.contains(styles.tabButton)) return;
      
      const tabs = this.options.tabs;
      const tabIds = tabs.map(tab => tab.id);
      const currentIdx = tabIds.indexOf(this.options.activeTab);
      
      // Get the tab to navigate to based on key press
      let nextIdx;
      switch (event.key) {
        case 'ArrowRight':
          nextIdx = (currentIdx + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = tabs.length - 1;
          break;
        default:
          return; // Do nothing for other keys
      }
      
      // Switch to the tab and focus its button
      const nextTabId = tabIds[nextIdx];
      this.switchToTab(nextTabId);
      this.tabButtons.get(nextTabId).focus();
      
      // Prevent default behavior (like scrolling)
      event.preventDefault();
    });
  }
  
  /**
   * Destroy the tabs component and remove it from the DOM
   */
  destroy() {
    if (!this.initialized) return;
    
    // Remove from DOM
    this.tabsElement.remove();
    
    // Clear references
    this.tabButtons.clear();
    this.tabPanes.clear();
    this.tabsElement = null;
    this.buttonsContainer = null;
    this.contentContainer = null;
    
    this.initialized = false;
  }
}

export default SettingsTabs; 