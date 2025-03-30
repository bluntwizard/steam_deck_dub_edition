/**
 * Steam Deck DUB Edition
 * PreferencesDialog Component
 * 
 * A dialog component for managing user preferences with tabbed interface
 */

import styles from './PreferencesDialog.module.css';
import { SettingsTabs } from '../SettingsTabs';
import type { 
  PreferencesDialogOptions,
  PreferenceTabsConfig,
  PreferenceTabConfig,
  PreferenceItem
} from '../../types/preferences-dialog';

/**
 * PreferencesDialog Component
 */
export class PreferencesDialog {
  /**
   * Component options
   */
  private options: Required<PreferencesDialogOptions>;
  
  /**
   * Dialog element
   */
  private dialogElement: HTMLElement | null = null;
  
  /**
   * Dialog content element
   */
  private dialogContent: HTMLElement | null = null;
  
  /**
   * Tabs component
   */
  private tabs: SettingsTabs | null = null;
  
  /**
   * Map of form controls and their values
   */
  private formControls: Map<string, HTMLElement> = new Map();
  
  /**
   * Whether the dialog is open
   */
  private isOpen: boolean = false;
  
  /**
   * Whether to preview changes immediately
   */
  private previewChanges: boolean = false;
  
  /**
   * Create a new preferences dialog
   * @param options - Configuration options
   */
  constructor(options: PreferencesDialogOptions) {
    this.options = {
      container: options.container || document.body,
      preferences: options.preferences || {},
      title: options.title || 'User Preferences',
      description: options.description || 'Customize your reading experience with these settings.',
      onSave: options.onSave || (() => {}),
      onReset: options.onReset || (() => {}),
      tabConfigs: options.tabConfigs || this.getDefaultTabConfigs(),
      show: options.show || false,
      autoInit: options.autoInit !== false
    };
    
    // Bind methods
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleImport = this.handleImport.bind(this);
    this.handleFormControlChange = this.handleFormControlChange.bind(this);
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
      
      if (this.options.show) {
        this.open();
      }
    }
  }
  
  /**
   * Initialize the preferences dialog
   * @returns The created dialog element
   */
  initialize(): HTMLElement {
    if (this.dialogElement) return this.dialogElement;
    
    // Create dialog element
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = styles.preferencesDialog;
    this.dialogElement.setAttribute('role', 'dialog');
    this.dialogElement.setAttribute('aria-labelledby', 'preferences-title');
    this.dialogElement.setAttribute('aria-modal', 'true');
    this.dialogElement.setAttribute('tabindex', '-1');
    this.dialogElement.hidden = true;
    
    // Create dialog content
    this.dialogContent = document.createElement('div');
    this.dialogContent.className = styles.preferencesDialogContent;
    
    // Add dialog header
    const header = document.createElement('div');
    header.className = styles.dialogHeader;
    header.innerHTML = `
      <h3 id="preferences-title" class="${styles.dialogTitle}">${this.options.title}</h3>
      <p class="${styles.dialogDescription}">${this.options.description}</p>
      <button class="${styles.closeButton}" aria-label="Close preferences dialog">✕</button>
    `;
    
    // Add close button event handler
    const closeButton = header.querySelector(`.${styles.closeButton}`);
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }
    
    this.dialogContent.appendChild(header);
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = styles.tabsContainer;
    this.dialogContent.appendChild(tabsContainer);
    
    // Create tabs
    this.createTabs(tabsContainer);
    
    // Create action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = styles.actionButtons;
    actionButtons.innerHTML = `
      <button id="reset-preferences-btn" class="${styles.button} ${styles.dangerButton}">Reset to Default</button>
      <button id="save-preferences-btn" class="${styles.button} ${styles.primaryButton}">Save Changes</button>
    `;
    
    // Add button event handlers
    const saveButton = actionButtons.querySelector('#save-preferences-btn');
    const resetButton = actionButtons.querySelector('#reset-preferences-btn');
    
    if (saveButton) {
      saveButton.addEventListener('click', this.handleSave);
    }
    
    if (resetButton) {
      resetButton.addEventListener('click', this.handleReset);
    }
    
    this.dialogContent.appendChild(actionButtons);
    this.dialogElement.appendChild(this.dialogContent);
    
    // Add dialog to container
    this.options.container.appendChild(this.dialogElement);
    
    // Add backdrop click event
    this.dialogElement.addEventListener('click', this.handleBackdropClick);
    
    return this.dialogElement;
  }
  
  /**
   * Create and initialize tabs with content
   * @param container - Container for the tabs
   * @private
   */
  private createTabs(container: HTMLElement): void {
    const tabConfigs = this.options.tabConfigs;
    
    // Initialize SettingsTabs component
    this.tabs = new SettingsTabs({
      container: container,
      tabs: Object.keys(tabConfigs).map(tabId => ({
        id: tabId,
        label: tabConfigs[tabId].label,
        icon: tabConfigs[tabId].icon,
        content: this.createTabContent(tabId, tabConfigs[tabId])
      })),
      activeTab: Object.keys(tabConfigs)[0]
    });
  }
  
  /**
   * Create content for a specific tab
   * @param tabId - ID of the tab
   * @param tabConfig - Configuration for the tab
   * @private
   * @returns The tab content element
   */
  private createTabContent(tabId: string, tabConfig: PreferenceTabConfig): HTMLElement {
    const tabContent = document.createElement('div');
    tabContent.className = styles.tabContent;
    
    // Create preference groups
    tabConfig.groups.forEach(group => {
      const groupElement = document.createElement('div');
      groupElement.className = styles.preferenceGroup;
      
      // Add group header
      const groupHeader = document.createElement('h4');
      groupHeader.className = styles.groupTitle;
      groupHeader.textContent = group.title;
      groupElement.appendChild(groupHeader);
      
      // Add preference items
      group.items.forEach(item => {
        const itemElement = this.createPreferenceItem(item);
        groupElement.appendChild(itemElement);
      });
      
      tabContent.appendChild(groupElement);
    });
    
    // Add special content for advanced tab
    if (tabId === 'advanced') {
      const exportGroup = document.createElement('div');
      exportGroup.className = styles.preferenceGroup;
      
      const exportHeader = document.createElement('h4');
      exportHeader.className = styles.groupTitle;
      exportHeader.textContent = 'Preferences Data';
      exportGroup.appendChild(exportHeader);
      
      // Export button
      const exportItem = document.createElement('div');
      exportItem.className = styles.preferenceItem;
      exportItem.innerHTML = `
        <div>
          <span class="${styles.preferenceLabel}">Export Preferences</span>
          <span class="${styles.preferenceDescription}">Save your preferences to a file</span>
        </div>
        <button id="export-prefs-btn" class="${styles.button} ${styles.secondaryButton}">Export</button>
      `;
      
      const exportBtn = exportItem.querySelector('#export-prefs-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', this.handleExport);
      }
      
      exportGroup.appendChild(exportItem);
      
      // Import button
      const importItem = document.createElement('div');
      importItem.className = styles.preferenceItem;
      importItem.innerHTML = `
        <div>
          <span class="${styles.preferenceLabel}">Import Preferences</span>
          <span class="${styles.preferenceDescription}">Load preferences from a file</span>
        </div>
        <button id="import-prefs-btn" class="${styles.button} ${styles.secondaryButton}">Import</button>
      `;
      
      const importBtn = importItem.querySelector('#import-prefs-btn');
      if (importBtn) {
        importBtn.addEventListener('click', this.handleImport);
      }
      
      exportGroup.appendChild(importItem);
      tabContent.appendChild(exportGroup);
    }
    
    return tabContent;
  }
  
  /**
   * Create a preference item with the appropriate control
   * @param item - Preference item configuration
   * @private
   * @returns The preference item element
   */
  private createPreferenceItem(item: PreferenceItem): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = styles.preferenceItem;
    itemElement.setAttribute('data-pref-item', item.id);
    
    // Create label and description
    const labelContainer = document.createElement('div');
    labelContainer.className = styles.labelContainer;
    
    const label = document.createElement('span');
    label.className = styles.preferenceLabel;
    label.textContent = item.label;
    labelContainer.appendChild(label);
    
    if (item.description) {
      const description = document.createElement('span');
      description.className = styles.preferenceDescription;
      description.textContent = item.description;
      labelContainer.appendChild(description);
    }
    
    itemElement.appendChild(labelContainer);
    
    // Create control based on type
    let control: HTMLElement;
    
    switch (item.type) {
      case 'select':
        control = this.createSelectControl(item);
        break;
        
      case 'toggle':
        control = this.createToggleControl(item);
        break;
        
      case 'button':
        control = this.createButtonControl(item);
        break;
        
      case 'radio':
        control = this.createRadioControl(item);
        break;
        
      case 'slider':
        control = this.createSliderControl(item);
        break;
        
      default:
        control = document.createElement('div');
        control.textContent = 'Unsupported control type';
    }
    
    itemElement.appendChild(control);
    
    // Add animation on click
    itemElement.addEventListener('click', () => {
      itemElement.classList.add(styles.clicked);
      setTimeout(() => {
        itemElement.classList.remove(styles.clicked);
      }, 300);
    });
    
    return itemElement;
  }
  
  /**
   * Create a select dropdown control
   * @param item - Preference item configuration
   * @private
   * @returns The select control element
   */
  private createSelectControl(item: PreferenceItem): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = styles.selectWrapper;
    
    const select = document.createElement('select');
    select.className = styles.select;
    select.name = item.id;
    select.setAttribute('aria-label', item.label);
    
    // Add options
    if (item.options && item.options.length) {
      item.options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.label;
        select.appendChild(optElement);
      });
    }
    
    // Set value from preferences
    select.value = this.getCurrentPreferenceValue(item.id) || item.value;
    
    // Add change event
    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.handleFormControlChange(item.id, target.value);
    });
    
    wrapper.appendChild(select);
    this.formControls.set(item.id, select);
    
    return wrapper;
  }
  
  /**
   * Create a toggle switch control
   * @param item - Preference item configuration
   * @private
   * @returns The toggle control element
   */
  private createToggleControl(item: PreferenceItem): HTMLElement {
    const label = document.createElement('label');
    label.className = styles.toggleSwitch;
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = item.id;
    input.checked = !!this.getCurrentPreferenceValue(item.id) || !!item.value;
    
    const slider = document.createElement('span');
    slider.className = styles.toggleSlider;
    
    label.appendChild(input);
    label.appendChild(slider);
    
    // Add change event
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.handleFormControlChange(item.id, target.checked);
    });
    
    this.formControls.set(item.id, input);
    
    return label;
  }
  
  /**
   * Create a button control
   * @param item - Preference item configuration
   * @private
   * @returns The button control element
   */
  private createButtonControl(item: PreferenceItem): HTMLElement {
    const button = document.createElement('button');
    button.className = `${styles.button} ${styles.secondaryButton}`;
    button.textContent = item.label;
    
    if (item.onClick) {
      button.addEventListener('click', item.onClick);
    }
    
    this.formControls.set(item.id, button);
    
    return button;
  }
  
  /**
   * Create a radio button group control
   * @param item - Preference item configuration
   * @private
   * @returns The radio control element
   */
  private createRadioControl(item: PreferenceItem): HTMLElement {
    const fieldset = document.createElement('fieldset');
    fieldset.className = styles.radioGroup;
    fieldset.setAttribute('aria-label', item.label);
    
    const currentValue = this.getCurrentPreferenceValue(item.id) || item.value;
    
    // Add radio options
    if (item.options && item.options.length) {
      item.options.forEach((option, index) => {
        const radioItem = document.createElement('div');
        radioItem.className = styles.radioItem;
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = item.id;
        input.id = `${item.id}-${option.value}`;
        input.value = option.value;
        input.checked = option.value === currentValue;
        
        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `${item.id}-${option.value}`;
        radioLabel.textContent = option.label;
        
        // Add change event
        input.addEventListener('change', (e) => {
          if ((e.target as HTMLInputElement).checked) {
            this.handleFormControlChange(item.id, option.value);
          }
        });
        
        radioItem.appendChild(input);
        radioItem.appendChild(radioLabel);
        fieldset.appendChild(radioItem);
        
        if (index === 0) {
          this.formControls.set(item.id, input);
        }
      });
    }
    
    return fieldset;
  }
  
  /**
   * Create a slider control
   * @param item - Preference item configuration
   * @private
   * @returns The slider control element
   */
  private createSliderControl(item: PreferenceItem): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = styles.sliderWrapper;
    
    const currentValue = this.getCurrentPreferenceValue(item.id) || item.value;
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = styles.slider;
    slider.name = item.id;
    slider.min = String(item.min || 0);
    slider.max = String(item.max || 100);
    slider.step = String(item.step || 1);
    slider.value = String(currentValue);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = styles.sliderValue;
    valueDisplay.textContent = String(currentValue);
    
    // Add input event
    slider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseFloat(target.value);
      valueDisplay.textContent = String(value);
      this.handleFormControlChange(item.id, value);
    });
    
    wrapper.appendChild(slider);
    wrapper.appendChild(valueDisplay);
    
    this.formControls.set(item.id, slider);
    
    return wrapper;
  }
  
  /**
   * Handle form control changes
   * @param id - Preference item ID
   * @param value - New value
   * @private
   */
  private handleFormControlChange(id: string, value: any): void {
    // Update in-memory preferences
    const path = id.split('.');
    let current = this.options.preferences as any;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    
    // Preview change if enabled
    if (this.previewChanges) {
      this.previewPreferenceChange(id, value);
    }
  }
  
  /**
   * Preview a preference change
   * @param id - Preference item ID
   * @param value - New value
   * @private
   */
  private previewPreferenceChange(id: string, value: any): void {
    // Implementation would depend on specific preferences
    // and how they affect the UI
  }
  
  /**
   * Get the current value of a preference item
   * @param id - Preference item ID
   * @private
   * @returns The current value
   */
  private getCurrentPreferenceValue(id: string): any {
    const path = id.split('.');
    let current = this.options.preferences as any;
    
    for (const segment of path) {
      if (current === undefined || current === null) return undefined;
      current = current[segment];
    }
    
    return current;
  }
  
  /**
   * Handle save button click
   * @private
   */
  private handleSave(): void {
    // Call the onSave callback with current preferences
    this.options.onSave(this.options.preferences);
    
    // Close the dialog
    this.close();
    
    // Show a success notification
    this.showNotification('Preferences saved successfully');
  }
  
  /**
   * Handle reset button click
   * @private
   */
  private handleReset(): void {
    this.showConfirmDialog(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to their default values? This action cannot be undone.',
      () => {
        // Reset preferences to defaults
        this.options.preferences = {};
        
        // Call the onReset callback
        this.options.onReset(this.options.preferences);
        
        // Update form controls
        this.updateFormFromPreferences();
        
        // Show a notification
        this.showNotification('Preferences reset to defaults');
      }
    );
  }
  
  /**
   * Handle export button click
   * @private
   */
  private handleExport(): void {
    try {
      // Convert preferences to JSON
      const prefsJson = JSON.stringify(this.options.preferences, null, 2);
      
      // Create a blob
      const blob = new Blob([prefsJson], { type: 'application/json' });
      
      // Create a temporary URL
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `preferences-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show a notification
      this.showNotification('Preferences exported successfully');
    } catch (err) {
      console.error('Failed to export preferences:', err);
      this.showNotification('Failed to export preferences', true);
    }
  }
  
  /**
   * Handle import button click
   * @private
   */
  private handleImport(): void {
    try {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      // Handle file selection
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;
        
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            if (!event.target || typeof event.target.result !== 'string') {
              throw new Error('Failed to read file');
            }
            
            // Parse JSON
            const importedPrefs = JSON.parse(event.target.result);
            
            // Confirm import
            this.showConfirmDialog(
              'Import Preferences',
              'Are you sure you want to import these preferences? This will override your current settings.',
              () => {
                // Apply imported preferences
                this.options.preferences = importedPrefs;
                
                // Update form controls
                this.updateFormFromPreferences();
                
                // Show a notification
                this.showNotification('Preferences imported successfully');
              }
            );
          } catch (err) {
            console.error('Failed to parse preferences file:', err);
            this.showNotification('Invalid preferences file', true);
          }
        };
        
        reader.onerror = () => {
          this.showNotification('Failed to read the file', true);
        };
        
        reader.readAsText(file);
      });
      
      // Trigger file selection
      input.click();
    } catch (err) {
      console.error('Failed to import preferences:', err);
      this.showNotification('Failed to import preferences', true);
    }
  }
  
  /**
   * Update form controls with current preference values
   * @private
   */
  private updateFormFromPreferences(): void {
    this.formControls.forEach((control, id) => {
      const value = this.getCurrentPreferenceValue(id);
      
      if (value === undefined) return;
      
      if (control instanceof HTMLInputElement) {
        if (control.type === 'checkbox') {
          control.checked = !!value;
        } else if (control.type === 'radio') {
          const radioGroup = document.querySelectorAll(`input[name="${id}"]`);
          radioGroup.forEach((radio) => {
            (radio as HTMLInputElement).checked = (radio as HTMLInputElement).value === value;
          });
        } else if (control.type === 'range') {
          control.value = String(value);
          
          // Update value display if it exists
          const wrapper = control.closest(`.${styles.sliderWrapper}`);
          if (wrapper) {
            const valueDisplay = wrapper.querySelector(`.${styles.sliderValue}`);
            if (valueDisplay) {
              valueDisplay.textContent = String(value);
            }
          }
        } else {
          control.value = value;
        }
      } else if (control instanceof HTMLSelectElement) {
        control.value = value;
      }
    });
  }
  
  /**
   * Show a notification message
   * @param message - Message to display
   * @param isError - Whether this is an error notification
   * @private
   */
  private showNotification(message: string, isError = false): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = styles.notification;
    
    if (isError) {
      notification.classList.add(styles.errorNotification);
    }
    
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Set timeout to remove
    setTimeout(() => {
      notification.classList.add(styles.notificationHide);
      
      // Remove after animation completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  /**
   * Show a confirmation dialog
   * @param title - Dialog title
   * @param message - Dialog message
   * @param onConfirm - Callback for confirmation
   * @private
   */
  private showConfirmDialog(title: string, message: string, onConfirm: () => void): void {
    // Disable current dialog temporarily
    if (this.dialogElement) {
      this.dialogElement.style.pointerEvents = 'none';
    }
    
    // Create confirm dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = styles.confirmDialog;
    
    const content = document.createElement('div');
    content.className = styles.confirmDialogContent;
    
    content.innerHTML = `
      <h4 class="${styles.confirmTitle}">${title}</h4>
      <p class="${styles.confirmMessage}">${message}</p>
      <div class="${styles.confirmActions}">
        <button class="${styles.button} ${styles.secondaryButton}">Cancel</button>
        <button class="${styles.button} ${styles.dangerButton}">Confirm</button>
      </div>
    `;
    
    confirmDialog.appendChild(content);
    document.body.appendChild(confirmDialog);
    
    // Handle buttons
    const buttons = content.querySelectorAll(`.${styles.button}`);
    const cancelButton = buttons[0] as HTMLButtonElement;
    const confirmButton = buttons[1] as HTMLButtonElement;
    
    const closeConfirmDialog = () => {
      // Re-enable main dialog
      if (this.dialogElement) {
        this.dialogElement.style.pointerEvents = '';
      }
      
      // Remove confirm dialog
      document.body.removeChild(confirmDialog);
    };
    
    cancelButton.addEventListener('click', closeConfirmDialog);
    
    confirmButton.addEventListener('click', () => {
      onConfirm();
      closeConfirmDialog();
    });
    
    // Handle escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeConfirmDialog();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
  }
  
  /**
   * Handle escape key press
   * @param event - Keyboard event
   * @private
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
  
  /**
   * Handle backdrop click
   * @param event - Mouse event
   * @private
   */
  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogElement) {
      this.close();
    }
  }
  
  /**
   * Open the preferences dialog
   */
  open(): void {
    if (!this.dialogElement || this.isOpen) return;
    
    // Show dialog
    this.dialogElement.hidden = false;
    this.dialogElement.classList.add(styles.open);
    
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Set focus to the dialog
    if (this.dialogContent) {
      const focusableElement = this.dialogContent.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (focusableElement) {
        setTimeout(() => {
          focusableElement.focus();
        }, 100);
      }
    }
    
    this.isOpen = true;
  }
  
  /**
   * Close the preferences dialog
   */
  close(): void {
    if (!this.dialogElement || !this.isOpen) return;
    
    // Hide dialog
    this.dialogElement.classList.remove(styles.open);
    
    // Wait for animation to complete
    setTimeout(() => {
      if (this.dialogElement) {
        this.dialogElement.hidden = true;
      }
    }, 300);
    
    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscapeKey);
    
    this.isOpen = false;
  }
  
  /**
   * Toggle the preferences dialog visibility
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Create a button to open the preferences dialog
   * @param options - Button options
   * @returns The created button element
   */
  createPreferencesButton(options: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    text?: string;
    container?: HTMLElement;
  } = {}): HTMLElement {
    const position = options.position || 'bottom-right';
    const text = options.text || 'Preferences';
    const container = options.container || document.body;
    
    const button = document.createElement('button');
    button.className = `${styles.preferencesButton} ${styles[position]}`;
    button.textContent = text;
    button.setAttribute('aria-label', 'Open preferences dialog');
    
    button.addEventListener('click', () => {
      this.open();
    });
    
    container.appendChild(button);
    
    return button;
  }
  
  /**
   * Set preferences programmatically
   * @param preferences - New preferences object
   */
  setPreferences(preferences: Record<string, any>): void {
    this.options.preferences = preferences;
    this.updateFormFromPreferences();
  }
  
  /**
   * Get current preferences
   * @returns The current preferences object
   */
  getPreferences(): Record<string, any> {
    return { ...this.options.preferences };
  }
  
  /**
   * Clean up event listeners and remove elements
   */
  destroy(): void {
    // Close dialog if open
    if (this.isOpen) {
      this.close();
    }
    
    // Remove event listeners
    if (this.dialogElement) {
      this.dialogElement.removeEventListener('click', this.handleBackdropClick);
      document.removeEventListener('keydown', this.handleEscapeKey);
      
      // Remove from DOM
      if (this.dialogElement.parentNode) {
        this.dialogElement.parentNode.removeChild(this.dialogElement);
      }
    }
    
    // Destroy tabs component
    if (this.tabs) {
      this.tabs.destroy();
      this.tabs = null;
    }
    
    // Clear form controls
    this.formControls.clear();
    
    // Clear references
    this.dialogElement = null;
    this.dialogContent = null;
  }
  
  /**
   * Get default tab configurations
   * @private
   * @returns Default tab configurations
   */
  private getDefaultTabConfigs(): PreferenceTabsConfig {
    return {
      'appearance': {
        label: 'Appearance',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6H12C9.79 6 8 7.79 8 10V15.5H12Z" fill="currentColor"/>
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
        </svg>`,
        groups: [
          {
            title: 'Theme',
            items: [
              {
                id: 'appearance.theme',
                type: 'select',
                label: 'Color Theme',
                value: 'system',
                options: [
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System Default' }
                ],
                description: 'Choose the color theme for the interface'
              },
              {
                id: 'appearance.fontScale',
                type: 'slider',
                label: 'Font Size',
                value: 100,
                min: 80,
                max: 150,
                step: 5,
                description: 'Adjust the overall font size (in %)'
              }
            ]
          }
        ]
      },
      'reading': {
        label: 'Reading',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="currentColor"/>
        </svg>`,
        groups: [
          {
            title: 'Display',
            items: [
              {
                id: 'reading.lineSpacing',
                type: 'slider',
                label: 'Line Spacing',
                value: 1.5,
                min: 1,
                max: 2.5,
                step: 0.1,
                description: 'Adjust the space between lines of text'
              },
              {
                id: 'reading.paragraphSpacing',
                type: 'slider',
                label: 'Paragraph Spacing',
                value: 1,
                min: 0.5,
                max: 3,
                step: 0.5,
                description: 'Adjust the space between paragraphs'
              }
            ]
          }
        ]
      },
      'accessibility': {
        label: 'Accessibility',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z" fill="currentColor"/>
        </svg>`,
        groups: [
          {
            title: 'Motion',
            items: [
              {
                id: 'accessibility.reduceMotion',
                type: 'toggle',
                label: 'Reduce Motion',
                value: false,
                description: 'Minimize animations throughout the interface'
              },
              {
                id: 'accessibility.reducedTransparency',
                type: 'toggle',
                label: 'Reduce Transparency',
                value: false,
                description: 'Reduce translucent effects'
              }
            ]
          },
          {
            title: 'Content',
            items: [
              {
                id: 'accessibility.highContrast',
                type: 'toggle',
                label: 'High Contrast',
                value: false,
                description: 'Increase contrast for better readability'
              }
            ]
          }
        ]
      },
      'advanced': {
        label: 'Advanced',
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
        </svg>`,
        groups: [
          {
            title: 'Performance',
            items: [
              {
                id: 'advanced.enableCache',
                type: 'toggle',
                label: 'Enable Caching',
                value: true,
                description: 'Cache content for faster loading'
              },
              {
                id: 'advanced.prefetchPages',
                type: 'toggle',
                label: 'Prefetch Pages',
                value: true,
                description: 'Preload linked pages for faster navigation'
              }
            ]
          }
        ]
      }
    };
  }
} 