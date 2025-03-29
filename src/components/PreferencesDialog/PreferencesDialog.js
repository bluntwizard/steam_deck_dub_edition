/**
 * Steam Deck DUB Edition
 * PreferencesDialog Component
 * 
 * A dialog component for managing user preferences with tabbed interface
 */

import styles from './PreferencesDialog.module.css';
import SettingsTabs from '../SettingsTabs';

class PreferencesDialog {
  /**
   * Create a new preferences dialog
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element to append the dialog to
   * @param {Object} options.preferences - Initial preferences object
   * @param {Function} options.onSave - Callback for when preferences are saved
   * @param {Function} options.onReset - Callback for when preferences are reset
   * @param {Object} options.tabConfigs - Custom configuration for tabs
   * @param {boolean} options.autoInit - Whether to initialize automatically
   */
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      preferences: options.preferences || {},
      onSave: options.onSave || (() => {}),
      onReset: options.onReset || (() => {}),
      tabConfigs: options.tabConfigs || this.getDefaultTabConfigs(),
      autoInit: options.autoInit !== false
    };
    
    // Element references
    this.dialogElement = null;
    this.dialogContent = null;
    this.tabs = null;
    this.formControls = new Map();
    this.isOpen = false;
    this.previewChanges = false;
    
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
    }
  }
  
  /**
   * Initialize the preferences dialog
   * @returns {HTMLElement} The created dialog element
   */
  initialize() {
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
      <h3 id="preferences-title" class="${styles.dialogTitle}">User Preferences</h3>
      <p class="${styles.dialogDescription}">Customize your reading experience with these settings.</p>
      <button class="${styles.closeButton}" aria-label="Close preferences dialog">✕</button>
    `;
    
    // Add close button event handler
    const closeButton = header.querySelector(`.${styles.closeButton}`);
    closeButton.addEventListener('click', () => this.close());
    
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
    
    saveButton.addEventListener('click', this.handleSave);
    resetButton.addEventListener('click', this.handleReset);
    
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
   * @param {HTMLElement} container - Container for the tabs
   * @private
   */
  createTabs(container) {
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
   * @param {string} tabId - ID of the tab
   * @param {Object} tabConfig - Configuration for the tab
   * @private
   * @returns {HTMLElement} The tab content element
   */
  createTabContent(tabId, tabConfig) {
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
      exportItem.querySelector('#export-prefs-btn').addEventListener('click', this.handleExport);
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
      importItem.querySelector('#import-prefs-btn').addEventListener('click', this.handleImport);
      exportGroup.appendChild(importItem);
      
      tabContent.appendChild(exportGroup);
    }
    
    return tabContent;
  }
  
  /**
   * Create a preference item with the appropriate control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The preference item element
   */
  createPreferenceItem(item) {
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
    let control;
    
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
        control.textContent = 'Unknown control type';
    }
    
    itemElement.appendChild(control);
    
    // Store reference to the control for later use
    this.formControls.set(item.id, {
      element: control.querySelector('input, select, button'),
      type: item.type,
      config: item
    });
    
    // Make the entire item clickable for toggles
    if (item.type === 'toggle') {
      itemElement.addEventListener('click', (event) => {
        // Don't trigger if clicking on the toggle itself
        if (event.target.tagName !== 'INPUT') {
          const toggle = control.querySelector('input[type="checkbox"]');
          toggle.checked = !toggle.checked;
          toggle.dispatchEvent(new Event('change', { bubbles: true }));
          itemElement.classList.add(styles.clicked);
          setTimeout(() => {
            itemElement.classList.remove(styles.clicked);
          }, 300);
        }
      });
    }
    
    return itemElement;
  }
  
  /**
   * Create a select control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The select control element
   */
  createSelectControl(item) {
    const controlWrapper = document.createElement('div');
    controlWrapper.className = styles.selectWrapper;
    
    const select = document.createElement('select');
    select.id = `${item.id}-select`;
    select.setAttribute('aria-label', `Select ${item.label.toLowerCase()}`);
    select.className = styles.select;
    
    item.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });
    
    // Set initial value
    const currentValue = this.getCurrentPreferenceValue(item.id);
    if (currentValue) {
      select.value = currentValue;
    }
    
    // Add change event listener
    select.addEventListener('change', () => {
      this.handleFormControlChange(item.id, select.value);
    });
    
    controlWrapper.appendChild(select);
    return controlWrapper;
  }
  
  /**
   * Create a toggle control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The toggle control element
   */
  createToggleControl(item) {
    const label = document.createElement('label');
    label.className = styles.toggleSwitch;
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `${item.id}-toggle`;
    input.setAttribute('aria-label', `Toggle ${item.label.toLowerCase()}`);
    
    // Set initial value
    const currentValue = this.getCurrentPreferenceValue(item.id);
    input.checked = currentValue === true;
    
    // Add change event listener
    input.addEventListener('change', () => {
      this.handleFormControlChange(item.id, input.checked);
    });
    
    const slider = document.createElement('span');
    slider.className = styles.toggleSlider;
    
    label.appendChild(input);
    label.appendChild(slider);
    
    return label;
  }
  
  /**
   * Create a button control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The button control element
   */
  createButtonControl(item) {
    const button = document.createElement('button');
    button.className = `${styles.button} ${styles[item.variant + 'Button'] || styles.secondaryButton}`;
    button.id = `${item.id}-btn`;
    button.textContent = item.label;
    
    // Add click event listener
    button.addEventListener('click', () => {
      if (typeof item.onClick === 'function') {
        item.onClick();
      }
    });
    
    return button;
  }
  
  /**
   * Create a radio control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The radio control element
   */
  createRadioControl(item) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = styles.radioGroup;
    fieldset.setAttribute('aria-label', item.label);
    
    // Current value
    const currentValue = this.getCurrentPreferenceValue(item.id);
    
    item.options.forEach(option => {
      const radioItem = document.createElement('div');
      radioItem.className = styles.radioItem;
      
      const input = document.createElement('input');
      input.type = 'radio';
      input.id = `${item.id}-${option.value}`;
      input.name = item.id;
      input.value = option.value;
      input.checked = currentValue === option.value;
      
      input.addEventListener('change', () => {
        if (input.checked) {
          this.handleFormControlChange(item.id, option.value);
        }
      });
      
      const label = document.createElement('label');
      label.htmlFor = `${item.id}-${option.value}`;
      label.textContent = option.label;
      
      radioItem.appendChild(input);
      radioItem.appendChild(label);
      fieldset.appendChild(radioItem);
    });
    
    return fieldset;
  }
  
  /**
   * Create a slider control
   * @param {Object} item - Preference item configuration
   * @private
   * @returns {HTMLElement} The slider control element
   */
  createSliderControl(item) {
    const controlWrapper = document.createElement('div');
    controlWrapper.className = styles.sliderWrapper;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.className = styles.slider;
    input.id = `${item.id}-slider`;
    input.min = item.min || 0;
    input.max = item.max || 100;
    input.step = item.step || 1;
    
    // Set initial value
    const currentValue = this.getCurrentPreferenceValue(item.id);
    input.value = currentValue !== undefined ? currentValue : (item.defaultValue || 50);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = styles.sliderValue;
    valueDisplay.textContent = input.value;
    
    // Add change event listener
    input.addEventListener('input', () => {
      valueDisplay.textContent = input.value;
    });
    
    input.addEventListener('change', () => {
      this.handleFormControlChange(item.id, Number(input.value));
    });
    
    controlWrapper.appendChild(input);
    controlWrapper.appendChild(valueDisplay);
    return controlWrapper;
  }
  
  /**
   * Handle form control change events
   * @param {string} id - Preference ID
   * @param {any} value - New value
   * @private
   */
  handleFormControlChange(id, value) {
    // Update internal preferences object
    const preferencePath = id.split('.');
    let current = this.options.preferences;
    
    for (let i = 0; i < preferencePath.length - 1; i++) {
      if (!current[preferencePath[i]]) {
        current[preferencePath[i]] = {};
      }
      current = current[preferencePath[i]];
    }
    
    current[preferencePath[preferencePath.length - 1]] = value;
    
    // Apply preview if enabled
    if (this.previewChanges) {
      this.previewPreferenceChange(id, value);
    }
    
    // Dispatch event
    const event = new CustomEvent('preference-change', {
      bubbles: true,
      detail: {
        id,
        value,
        preferences: this.options.preferences
      }
    });
    this.dialogElement.dispatchEvent(event);
  }
  
  /**
   * Preview a preference change
   * @param {string} id - Preference ID
   * @param {any} value - New value
   * @private
   */
  previewPreferenceChange(id, value) {
    // This method can be overridden or extended by child classes
    // for specific preview behaviors
  }
  
  /**
   * Get the current value of a preference
   * @param {string} id - Preference ID
   * @private
   * @returns {any} The current value
   */
  getCurrentPreferenceValue(id) {
    const preferencePath = id.split('.');
    let current = this.options.preferences;
    
    for (let i = 0; i < preferencePath.length; i++) {
      if (current === undefined || current === null) return undefined;
      current = current[preferencePath[i]];
    }
    
    return current;
  }
  
  /**
   * Handle save button click
   * @private
   */
  handleSave() {
    // Call the onSave callback with current preferences
    this.options.onSave(this.options.preferences);
    
    // Show confirmation and close
    this.showNotification('Preferences saved successfully!');
    this.close();
  }
  
  /**
   * Handle reset button click
   * @private
   */
  handleReset() {
    this.showConfirmDialog(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      () => {
        // Call the onReset callback
        this.options.onReset();
        
        // Update the form controls with the new values
        this.updateFormFromPreferences();
        
        // Show confirmation
        this.showNotification('Preferences reset to defaults');
      }
    );
  }
  
  /**
   * Handle export button click
   * @private
   */
  handleExport() {
    // Create a JSON string of the preferences
    const preferencesJson = JSON.stringify(this.options.preferences, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([preferencesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdde-preferences.json';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    this.showNotification('Preferences exported successfully!');
  }
  
  /**
   * Handle import button click
   * @private
   */
  handleImport() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPrefs = JSON.parse(e.target.result);
          
          // Confirm before importing
          this.showConfirmDialog(
            'Import Preferences',
            'Are you sure you want to replace your current preferences with the imported ones?',
            () => {
              // Update preferences
              this.options.preferences = importedPrefs;
              
              // Update form controls
              this.updateFormFromPreferences();
              
              // Preview changes
              if (this.previewChanges) {
                Object.entries(this.formControls).forEach(([id, control]) => {
                  const value = this.getCurrentPreferenceValue(id);
                  if (value !== undefined) {
                    this.previewPreferenceChange(id, value);
                  }
                });
              }
              
              this.showNotification('Preferences imported successfully!');
            }
          );
        } catch (error) {
          this.showNotification('Error importing preferences: Invalid JSON file', true);
          console.error('Error importing preferences:', error);
        }
      };
      
      reader.readAsText(file);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(fileInput);
    }, 100);
  }
  
  /**
   * Update form controls based on current preferences
   */
  updateFormFromPreferences() {
    this.formControls.forEach((control, id) => {
      const value = this.getCurrentPreferenceValue(id);
      if (value === undefined) return;
      
      const element = control.element;
      
      switch (control.type) {
        case 'select':
          element.value = value;
          break;
        case 'toggle':
          element.checked = value === true;
          break;
        case 'slider':
          element.value = value;
          element.parentNode.querySelector(`.${styles.sliderValue}`).textContent = value;
          break;
        case 'radio':
          const radio = document.querySelector(`input[name="${id}"][value="${value}"]`);
          if (radio) radio.checked = true;
          break;
      }
    });
  }
  
  /**
   * Show a notification message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether this is an error message
   * @private
   */
  showNotification(message, isError = false) {
    // Remove any existing notifications
    const existingNotification = document.querySelector(`.${styles.notification}`);
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${isError ? styles.errorNotification : ''}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after timeout
    setTimeout(() => {
      notification.classList.add(styles.notificationHide);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  /**
   * Show a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onConfirm - Callback when confirmed
   * @private
   */
  showConfirmDialog(title, message, onConfirm) {
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = styles.confirmDialog;
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.setAttribute('aria-describedby', 'confirm-message');
    
    dialog.innerHTML = `
      <div class="${styles.confirmDialogContent}">
        <h3 id="confirm-title" class="${styles.confirmTitle}">${title}</h3>
        <p id="confirm-message" class="${styles.confirmMessage}">${message}</p>
        <div class="${styles.confirmActions}">
          <button class="${styles.button} ${styles.secondaryButton}" id="cancel-btn">Cancel</button>
          <button class="${styles.button} ${styles.dangerButton}" id="confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Focus the confirm button (for accessibility)
    setTimeout(() => {
      dialog.querySelector('#confirm-btn').focus();
    }, 100);
    
    // Add event listeners
    dialog.querySelector('#cancel-btn').addEventListener('click', () => {
      dialog.remove();
    });
    
    dialog.querySelector('#confirm-btn').addEventListener('click', () => {
      onConfirm();
      dialog.remove();
    });
    
    // Close on click outside
    dialog.addEventListener('click', e => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        dialog.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
  }
  
  /**
   * Handle Escape key press
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
  
  /**
   * Handle click on the dialog backdrop
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  handleBackdropClick(event) {
    if (event.target === this.dialogElement) {
      this.close();
    }
  }
  
  /**
   * Get default tab configurations
   * @private
   * @returns {Object} Default tab configs
   */
  getDefaultTabConfigs() {
    return {
      appearance: {
        label: 'Appearance',
        icon: '🎨',
        groups: [
          {
            title: 'Theme',
            items: [
              {
                id: 'theme',
                type: 'select',
                label: 'Theme',
                description: 'Choose your preferred color theme',
                options: [
                  { value: 'theme-dracula', label: 'Dracula (Default)' },
                  { value: 'theme-light', label: 'Light' },
                  { value: 'theme-dark', label: 'Dark' },
                  { value: 'theme-high-contrast', label: 'High Contrast' }
                ]
              }
            ]
          },
          {
            title: 'Text Appearance',
            items: [
              {
                id: 'fontSize',
                type: 'select',
                label: 'Font Size',
                description: 'Adjust the size of text',
                options: [
                  { value: 'font-size-small', label: 'Small' },
                  { value: 'font-size-medium', label: 'Medium (Default)' },
                  { value: 'font-size-large', label: 'Large' }
                ]
              },
              {
                id: 'lineHeight',
                type: 'select',
                label: 'Line Height',
                description: 'Adjust spacing between lines',
                options: [
                  { value: 'line-height-compact', label: 'Compact' },
                  { value: 'line-height-normal', label: 'Normal (Default)' },
                  { value: 'line-height-relaxed', label: 'Relaxed' }
                ]
              },
              {
                id: 'contentWidth',
                type: 'select',
                label: 'Content Width',
                description: 'Adjust the maximum width of content',
                options: [
                  { value: 'width-narrow', label: 'Narrow' },
                  { value: 'width-standard', label: 'Standard (Default)' },
                  { value: 'width-wide', label: 'Wide' },
                  { value: 'width-full', label: 'Full Width' }
                ]
              }
            ]
          },
          {
            title: 'Code Blocks',
            items: [
              {
                id: 'codeHeight',
                type: 'select',
                label: 'Code Block Height',
                description: 'Maximum height of code blocks before scrolling',
                options: [
                  { value: 'code-height-compact', label: 'Compact' },
                  { value: 'code-height-standard', label: 'Standard (Default)' },
                  { value: 'code-height-expanded', label: 'Expanded' }
                ]
              },
              {
                id: 'codeFontSize',
                type: 'select',
                label: 'Code Font Size',
                description: 'Adjust size of text in code blocks',
                options: [
                  { value: 'code-font-small', label: 'Small' },
                  { value: 'code-font-medium', label: 'Medium (Default)' },
                  { value: 'code-font-large', label: 'Large' }
                ]
              },
              {
                id: 'syntaxHighlighting',
                type: 'toggle',
                label: 'Syntax Highlighting',
                description: 'Colorize code for better readability'
              },
              {
                id: 'darkCodeBlocks',
                type: 'toggle',
                label: 'Dark Code Blocks',
                description: 'Always use dark background for code'
              },
              {
                id: 'autoExpandCode',
                type: 'toggle',
                label: 'Auto-Expand Long Code',
                description: 'Automatically expand long code blocks'
              }
            ]
          }
        ]
      },
      accessibility: {
        label: 'Accessibility',
        icon: '♿',
        groups: [
          {
            title: 'Visual Adjustments',
            items: [
              {
                id: 'highContrast',
                type: 'toggle',
                label: 'High Contrast',
                description: 'Increase contrast for better readability'
              },
              {
                id: 'dyslexicFont',
                type: 'toggle',
                label: 'Dyslexic-Friendly Font',
                description: 'Use font designed for readers with dyslexia'
              }
            ]
          },
          {
            title: 'Motion & Animation',
            items: [
              {
                id: 'reducedMotion',
                type: 'toggle',
                label: 'Reduce Motion',
                description: 'Minimize animations and transitions'
              },
              {
                id: 'smoothScrolling',
                type: 'toggle',
                label: 'Smooth Scrolling',
                description: 'Use smooth animations when navigating'
              }
            ]
          }
        ]
      },
      reading: {
        label: 'Reading',
        icon: '📖',
        groups: [
          {
            title: 'Reading Experience',
            items: [
              {
                id: 'sidebarCompact',
                type: 'toggle',
                label: 'Compact Sidebar',
                description: 'Make the sidebar more compact'
              },
              {
                id: 'showLineNumbers',
                type: 'toggle',
                label: 'Show Line Numbers',
                description: 'Display line numbers in code blocks'
              },
              {
                id: 'preserveScroll',
                type: 'toggle',
                label: 'Preserve Scroll Position',
                description: 'Remember scroll position between pages'
              }
            ]
          },
          {
            title: 'Reading Aids',
            items: [
              {
                id: 'readingGuide',
                type: 'toggle',
                label: 'Reading Guide',
                description: 'Highlight the line you are reading'
              }
            ]
          }
        ]
      },
      advanced: {
        label: 'Advanced',
        icon: '⚙️',
        groups: [
          {
            title: 'Experimental Features',
            items: [
              {
                id: 'autoSavePreferences',
                type: 'toggle',
                label: 'Auto-Save Preferences',
                description: 'Automatically save changes as you make them'
              }
            ]
          }
        ]
      }
    };
  }
  
  /**
   * Open the preferences dialog
   */
  open() {
    if (!this.dialogElement) {
      this.initialize();
    }
    
    this.dialogElement.hidden = false;
    this.dialogElement.classList.add(styles.open);
    this.isOpen = true;
    
    // Enable preview changes
    this.previewChanges = true;
    
    // Update form values in case preferences changed elsewhere
    this.updateFormFromPreferences();
    
    // Add keyboard listener for Escape
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Focus the dialog (for keyboard navigation)
    this.dialogElement.focus();
    
    // Dispatch open event
    this.dialogElement.dispatchEvent(new CustomEvent('preferences-dialog-open', { bubbles: true }));
  }
  
  /**
   * Close the preferences dialog
   */
  close() {
    if (!this.dialogElement || !this.isOpen) return;
    
    this.dialogElement.classList.remove(styles.open);
    
    // Hide after animation
    setTimeout(() => {
      this.dialogElement.hidden = true;
    }, 300);
    
    this.isOpen = false;
    
    // Disable preview changes
    this.previewChanges = false;
    
    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleEscapeKey);
    
    // Dispatch close event
    this.dialogElement.dispatchEvent(new CustomEvent('preferences-dialog-close', { bubbles: true }));
  }
  
  /**
   * Toggle the preferences dialog
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Create a preferences button
   * @param {Object} options - Button options
   * @param {HTMLElement} options.container - Container for the button
   * @param {string} options.position - Position of the button ('top-right', 'bottom-right', etc.)
   * @returns {HTMLElement} The created button
   */
  createPreferencesButton(options = {}) {
    const container = options.container || document.body;
    const position = options.position || 'bottom-right';
    
    const button = document.createElement('button');
    button.id = 'preferences-button';
    button.className = `${styles.preferencesButton} ${styles[position]}`;
    button.innerHTML = '⚙️';
    button.title = 'Preferences';
    button.setAttribute('aria-label', 'Open user preferences');
    
    button.addEventListener('click', () => this.toggle());
    container.appendChild(button);
    
    // Add keyboard shortcut (Alt+P)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    return button;
  }
  
  /**
   * Set preferences data
   * @param {Object} preferences - New preferences object
   */
  setPreferences(preferences) {
    this.options.preferences = preferences;
    if (this.isOpen) {
      this.updateFormFromPreferences();
    }
  }
  
  /**
   * Get current preferences
   * @returns {Object} Current preferences
   */
  getPreferences() {
    return { ...this.options.preferences };
  }
  
  /**
   * Destroy the preferences dialog and clean up
   */
  destroy() {
    if (this.dialogElement) {
      document.removeEventListener('keydown', this.handleEscapeKey);
      this.dialogElement.remove();
      this.dialogElement = null;
    }
    
    this.formControls.clear();
    
    if (this.tabs) {
      this.tabs.destroy();
      this.tabs = null;
    }
  }
}

export default PreferencesDialog; 