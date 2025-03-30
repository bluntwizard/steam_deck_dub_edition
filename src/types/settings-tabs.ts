/**
 * Grimoire
 * SettingsTabs Component Types
 */

/**
 * Configuration for a single tab
 */
export interface TabConfig {
  /**
   * Unique identifier for the tab
   */
  id: string;
  
  /**
   * Display label for the tab
   */
  label: string;
  
  /**
   * HTML string or SVG icon for the tab
   */
  icon?: string;
  
  /**
   * HTML string or DOM element for the tab content
   */
  content?: string | HTMLElement;
}

/**
 * Options for the SettingsTabs component
 */
export interface SettingsTabsOptions {
  /**
   * Unique identifier for the tabs container
   */
  id?: string;
  
  /**
   * Container element to append the tabs to
   */
  container: HTMLElement;
  
  /**
   * Array of tab configurations
   */
  tabs: TabConfig[];
  
  /**
   * Callback for tab changes
   */
  onTabChange?: (tabId: string, previousTabId: string | null) => void;
  
  /**
   * Initially active tab ID
   */
  activeTab?: string;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * Event detail for tab change events
 */
export interface TabChangeEventDetail {
  /**
   * Reference to the SettingsTabs instance
   */
  tabs: SettingsTabsInterface;
  
  /**
   * ID of the active tab
   */
  tabId: string;
  
  /**
   * ID of the previously active tab
   */
  previousTabId: string | null;
}

/**
 * SettingsTabs component interface
 */
export interface SettingsTabsInterface {
  /**
   * Initialize the settings tabs
   */
  initialize(): HTMLElement;
  
  /**
   * Switch to a specific tab
   */
  switchToTab(tabId: string): boolean;
  
  /**
   * Add a new tab to the tabs component
   */
  addTab(tab: TabConfig, switchTo?: boolean): boolean;
  
  /**
   * Remove a tab from the tabs component
   */
  removeTab(tabId: string): boolean;
  
  /**
   * Update an existing tab's properties
   */
  updateTab(tabId: string, tabProps: Partial<TabConfig>): boolean;
  
  /**
   * Get the ID of the currently active tab
   */
  getActiveTab(): string | null;
  
  /**
   * Get all tab configurations
   */
  getTabs(): TabConfig[];
  
  /**
   * Clean up event listeners and remove from DOM
   */
  destroy(): void;
} 