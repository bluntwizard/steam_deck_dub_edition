/**
 * Steam Deck DUB Edition
 * SettingsTabs Component
 * 
 * A component for managing tabbed interfaces in settings panels
 */

import styles from './SettingsTabs.module.css';
import type { 
  SettingsTabsOptions, 
  TabConfig, 
  SettingsTabsInterface,
  TabChangeEventDetail
} from '../../types/settings-tabs';

export class SettingsTabs implements SettingsTabsInterface {
  /**
   * Component options
   */
  private options: Required<SettingsTabsOptions>;
  
  /**
   * Root element for the tabs component
   */
  private tabsElement: HTMLElement | null = null;
  
  /**
   * Container for tab buttons
   */
  private buttonsContainer: HTMLElement | null = null;
  
  /**
   * Container for tab content panes
   */
  private contentContainer: HTMLElement | null = null;
  
  /**
   * Map of tab IDs to button elements
   */
  private tabButtons: Map<string, HTMLButtonElement> = new Map();
  
  /**
   * Map of tab IDs to content pane elements
   */
  private tabPanes: Map<string, HTMLElement> = new Map();
  
  /**
   * Whether the component has been initialized
   */
  private initialized: boolean = false;
  
  /**
   * Create a new settings tabs component
   * @param options - Configuration options
   */
  constructor(options: SettingsTabsOptions) {
    this.options = {
      id: options.id || `settings-tabs-${Date.now()}`,
      container: options.container || document.body,
      tabs: options.tabs || [],
      onTabChange: options.onTabChange || (() => {}),
      activeTab: options.activeTab || (options.tabs?.length > 0 ? options.tabs[0].id : ''),
      autoInit: options.autoInit !== false
    };
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the settings tabs
   * @returns The created tabs element
   */
  initialize(): HTMLElement {
    if (this.initialized && this.tabsElement) return this.tabsElement;
    
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
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    this.initialized = true;
    return this.tabsElement;
  }
  
  /**
   * Create tab buttons and panes based on configuration
   * @private
   */
  private createTabs(): void {
    if (!this.options.tabs.length) return;
    
    this.options.tabs.forEach(tab => {
      this.createTab(tab);
    });
  }
  
  /**
   * Create a single tab with its button and pane
   * @param tab - Tab configuration
   * @private
   */
  private createTab(tab: TabConfig): void {
    if (!tab.id || !this.buttonsContainer || !this.contentContainer) return;
    
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
   * @param tabId - ID of the tab to switch to
   * @returns Whether the tab switch was successful
   */
  switchToTab(tabId: string): boolean {
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
      if (this.tabsElement) {
        const eventDetail: TabChangeEventDetail = {
          tabs: this,
          tabId: tabId,
          previousTabId: prevTabId
        };
        
        const event = new CustomEvent('tab-change', {
          bubbles: true,
          detail: eventDetail
        });
        
        this.tabsElement.dispatchEvent(event);
      }
    }
    
    return true;
  }
  
  /**
   * Add a new tab to the tabs component
   * @param tab - Tab configuration
   * @param switchTo - Whether to switch to the new tab
   * @returns Whether the tab was added successfully
   */
  addTab(tab: TabConfig, switchTo = false): boolean {
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
   * @param tabId - ID of the tab to remove
   * @returns Whether the tab was removed successfully
   */
  removeTab(tabId: string): boolean {
    if (!this.initialized || !this.tabButtons.has(tabId)) return false;
    
    // Get references
    const button = this.tabButtons.get(tabId);
    const pane = this.tabPanes.get(tabId);
    
    if (!button || !pane) return false;
    
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
   * Update an existing tab's properties
   * @param tabId - ID of the tab to update
   * @param tabProps - New properties for the tab
   * @returns Whether the tab was updated successfully
   */
  updateTab(tabId: string, tabProps: Partial<TabConfig>): boolean {
    if (!this.initialized || !this.tabButtons.has(tabId)) return false;
    
    const button = this.tabButtons.get(tabId);
    const pane = this.tabPanes.get(tabId);
    
    if (!button || !pane) return false;
    
    // Update tab in the array
    const tabIndex = this.options.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      this.options.tabs[tabIndex] = { ...this.options.tabs[tabIndex], ...tabProps };
    }
    
    // Update label if provided
    if (tabProps.label) {
      const labelSpan = button.querySelector(`.${styles.tabLabel}`);
      if (labelSpan) {
        labelSpan.textContent = tabProps.label;
      }
    }
    
    // Update icon if provided
    if (tabProps.icon) {
      let iconSpan = button.querySelector(`.${styles.tabIcon}`);
      
      if (!iconSpan) {
        iconSpan = document.createElement('span');
        iconSpan.className = styles.tabIcon;
        button.prepend(iconSpan);
      }
      
      iconSpan.innerHTML = tabProps.icon;
    }
    
    // Update content if provided
    if (tabProps.content) {
      if (typeof tabProps.content === 'string') {
        pane.innerHTML = tabProps.content;
      } else if (tabProps.content instanceof HTMLElement) {
        pane.innerHTML = '';
        pane.appendChild(tabProps.content);
      }
    }
    
    return true;
  }
  
  /**
   * Get the ID of the currently active tab
   * @returns ID of the active tab, or null if no tab is active
   */
  getActiveTab(): string | null {
    return this.options.activeTab || null;
  }
  
  /**
   * Get all tab configurations
   * @returns Array of tab configurations
   */
  getTabs(): TabConfig[] {
    return [...this.options.tabs];
  }
  
  /**
   * Set up keyboard navigation for the tabs
   * @private
   */
  private setupKeyboardNavigation(): void {
    if (!this.buttonsContainer) return;
    
    this.buttonsContainer.addEventListener('keydown', (event: KeyboardEvent) => {
      // Only handle keyboard events when a tab button is focused
      const target = event.target as HTMLElement;
      if (!target.classList.contains(styles.tabButton)) return;
      
      const tabButtons = Array.from(this.tabButtons.values());
      const currentIndex = tabButtons.indexOf(target as HTMLButtonElement);
      
      let nextIndex: number;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % tabButtons.length;
          tabButtons[nextIndex].focus();
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
          tabButtons[nextIndex].focus();
          break;
          
        case 'Home':
          event.preventDefault();
          tabButtons[0].focus();
          break;
          
        case 'End':
          event.preventDefault();
          tabButtons[tabButtons.length - 1].focus();
          break;
          
        case 'Enter':
        case ' ':
          event.preventDefault();
          const tabId = target.getAttribute('data-tab');
          if (tabId) this.switchToTab(tabId);
          break;
          
        default:
          break;
      }
    });
  }
  
  /**
   * Clean up event listeners and remove from DOM
   */
  destroy(): void {
    // Remove click event listeners from tab buttons
    this.tabButtons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
    
    // Remove keydown event listener from buttons container
    if (this.buttonsContainer) {
      const newButtonsContainer = this.buttonsContainer.cloneNode(true);
      if (this.buttonsContainer.parentNode) {
        this.buttonsContainer.parentNode.replaceChild(newButtonsContainer, this.buttonsContainer);
      }
    }
    
    // Remove element from DOM
    if (this.tabsElement && this.tabsElement.parentNode) {
      this.tabsElement.parentNode.removeChild(this.tabsElement);
    }
    
    // Clear references
    this.tabButtons.clear();
    this.tabPanes.clear();
    this.tabsElement = null;
    this.buttonsContainer = null;
    this.contentContainer = null;
    this.initialized = false;
  }
} 