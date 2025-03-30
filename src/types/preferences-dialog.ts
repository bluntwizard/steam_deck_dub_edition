/**
 * Grimoire
 * PreferencesDialog Component Types
 */

/**
 * Preference item configuration
 */
export interface PreferenceItem {
  /**
   * Unique identifier for the preference item
   */
  id: string;

  /**
   * Display label for the preference
   */
  label: string;

  /**
   * Type of the preference control (select, toggle, button, radio, slider)
   */
  type: 'select' | 'toggle' | 'button' | 'radio' | 'slider';

  /**
   * Current value of the preference
   */
  value: any;

  /**
   * Description text explaining the preference
   */
  description?: string;

  /**
   * Options for select or radio controls
   */
  options?: Array<{
    value: string;
    label: string;
  }>;

  /**
   * Minimum value for slider
   */
  min?: number;

  /**
   * Maximum value for slider
   */
  max?: number;

  /**
   * Step increment for slider
   */
  step?: number;

  /**
   * Icon for the preference item
   */
  icon?: string;

  /**
   * Callback function for buttons
   */
  onClick?: () => void;
}

/**
 * Preference group configuration
 */
export interface PreferenceGroup {
  /**
   * Title of the group
   */
  title: string;

  /**
   * Preference items in the group
   */
  items: PreferenceItem[];
}

/**
 * Tab configuration for preferences dialog
 */
export interface PreferenceTabConfig {
  /**
   * Display label for the tab
   */
  label: string;

  /**
   * SVG icon for the tab (HTML string)
   */
  icon?: string;

  /**
   * Groups of preferences in this tab
   */
  groups: PreferenceGroup[];
}

/**
 * Mapping of tab IDs to tab configurations
 */
export interface PreferenceTabsConfig {
  [tabId: string]: PreferenceTabConfig;
}

/**
 * PreferencesDialog options
 */
export interface PreferencesDialogOptions {
  /**
   * Container element to append the dialog to
   */
  container: HTMLElement;

  /**
   * Initial preferences object
   */
  preferences?: Record<string, any>;

  /**
   * Dialog title
   */
  title?: string;

  /**
   * Dialog description
   */
  description?: string;

  /**
   * Callback for when preferences are saved
   */
  onSave?: (preferences: Record<string, any>) => void;

  /**
   * Callback for when preferences are reset
   */
  onReset?: (preferences: Record<string, any>) => void;

  /**
   * Tab configurations
   */
  tabConfigs?: PreferenceTabsConfig;

  /**
   * Whether to show the dialog on init
   */
  show?: boolean;

  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * PreferencesDialog component interface
 */
export interface PreferencesDialogInterface {
  /**
   * Initialize the preferences dialog
   */
  initialize(): HTMLElement;

  /**
   * Open the preferences dialog
   */
  open(): void;

  /**
   * Close the preferences dialog
   */
  close(): void;

  /**
   * Toggle the preferences dialog visibility
   */
  toggle(): void;

  /**
   * Set preferences programmatically
   */
  setPreferences(preferences: Record<string, any>): void;

  /**
   * Get current preferences
   */
  getPreferences(): Record<string, any>;

  /**
   * Create a button to open the preferences dialog
   */
  createPreferencesButton(options?: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    text?: string;
    container?: HTMLElement;
  }): HTMLElement;

  /**
   * Clean up event listeners and remove elements
   */
  destroy(): void;
} 