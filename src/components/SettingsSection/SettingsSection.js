/**
 * Steam Deck DUB Edition
 * SettingsSection Component
 * 
 * A component for creating and managing settings sections with configurable options
 */

import styles from './SettingsSection.module.css';

class SettingsSection {
  /**
   * Create a new settings section
   * @param {Object} options - Configuration options
   * @param {string} options.id - Unique identifier for the section
   * @param {string} options.title - Section title
   * @param {string} options.icon - Icon for the section (emoji or HTML)
   * @param {HTMLElement} options.container - Container element to append the section to
   * @param {Function} options.onSettingChange - Callback for setting changes
   * @param {Array} options.settings - Array of setting configurations
   * @param {boolean} options.autoInit - Whether to initialize automatically (default: true)
   */
  constructor(options = {}) {
    this.options = {
      id: options.id || `settings-section-${Date.now()}`,
      title: options.title || 'Settings',
      icon: options.icon || '⚙️',
      container: options.container || document.body,
      onSettingChange: options.onSettingChange || (() => {}),
      settings: options.settings || [],
      autoInit: options.autoInit !== false
    };
    
    // Section element
    this.sectionElement = null;
    
    // Track the initialized state
    this.initialized = false;
    
    // Setting element references
    this.settingElements = new Map();
    
    // Auto-initialize if specified
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the settings section
   * @returns {HTMLElement} The created section element
   */
  initialize() {
    if (this.initialized) return this.sectionElement;
    
    // Create section element
    this.sectionElement = document.createElement('section');
    this.sectionElement.id = this.options.id;
    this.sectionElement.className = styles.settingsSection;
    this.sectionElement.setAttribute('aria-labelledby', `${this.options.id}-title`);
    
    // Create header with title
    this.createHeader();
    
    // Create settings elements
    this.createSettings();
    
    // Add to container
    this.options.container.appendChild(this.sectionElement);
    
    this.initialized = true;
    return this.sectionElement;
  }
  
  /**
   * Create section header with title
   * @private
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = styles.sectionHeader;
    
    // Icon if provided
    if (this.options.icon) {
      const iconElement = document.createElement('span');
      iconElement.className = styles.sectionIcon;
      iconElement.innerHTML = this.options.icon;
      header.appendChild(iconElement);
    }
    
    // Title
    const title = document.createElement('h3');
    title.id = `${this.options.id}-title`;
    title.className = styles.sectionTitle;
    title.textContent = this.options.title;
    header.appendChild(title);
    
    this.sectionElement.appendChild(header);
  }
  
  /**
   * Create settings elements based on configuration
   * @private
   */
  createSettings() {
    if (!this.options.settings.length) return;
    
    const settingsContainer = document.createElement('div');
    settingsContainer.className = styles.settingsContainer;
    
    this.options.settings.forEach(setting => {
      const settingElement = this.createSetting(setting);
      if (settingElement) {
        settingsContainer.appendChild(settingElement);
      }
    });
    
    this.sectionElement.appendChild(settingsContainer);
  }
  
  /**
   * Create a setting element based on type
   * @private
   * @param {Object} setting - Setting configuration
   * @returns {HTMLElement} The setting element
   */
  createSetting(setting) {
    if (!setting.id || !setting.type) return null;
    
    const settingContainer = document.createElement('div');
    settingContainer.className = styles.settingItem;
    settingContainer.dataset.settingId = setting.id;
    
    // Add setting label
    if (setting.label) {
      const label = document.createElement('label');
      label.className = styles.settingLabel;
      label.textContent = setting.label;
      label.htmlFor = `setting-${setting.id}`;
      settingContainer.appendChild(label);
    }
    
    // Add description if provided
    if (setting.description) {
      const description = document.createElement('p');
      description.className = styles.settingDescription;
      description.textContent = setting.description;
      settingContainer.appendChild(description);
    }
    
    // Create control based on type
    let control;
    switch (setting.type) {
      case 'toggle':
        control = this.createToggle(setting);
        break;
      case 'select':
        control = this.createSelect(setting);
        break;
      case 'radio':
        control = this.createRadioGroup(setting);
        break;
      case 'text':
        control = this.createTextInput(setting);
        break;
      case 'slider':
        control = this.createSlider(setting);
        break;
      case 'button':
        control = this.createButton(setting);
        break;
      case 'custom':
        control = setting.customElement || null;
        break;
      default:
        control = null;
    }
    
    if (control) {
      const controlContainer = document.createElement('div');
      controlContainer.className = styles.settingControl;
      controlContainer.appendChild(control);
      settingContainer.appendChild(controlContainer);
      
      // Store reference to the container
      this.settingElements.set(setting.id, {
        container: settingContainer,
        control: control
      });
    }
    
    return settingContainer;
  }
  
  /**
   * Create a toggle switch
   * @private
   * @param {Object} setting - Toggle setting configuration
   * @returns {HTMLElement} The toggle element
   */
  createToggle(setting) {
    const label = document.createElement('label');
    label.className = styles.toggleSwitch;
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `setting-${setting.id}`;
    input.checked = setting.value || false;
    input.disabled = setting.disabled || false;
    
    input.addEventListener('change', (e) => {
      this.handleSettingChange(setting.id, e.target.checked, e);
    });
    
    const slider = document.createElement('span');
    slider.className = styles.slider;
    
    label.appendChild(input);
    label.appendChild(slider);
    
    return label;
  }
  
  /**
   * Create a select dropdown
   * @private
   * @param {Object} setting - Select setting configuration
   * @returns {HTMLElement} The select element
   */
  createSelect(setting) {
    const select = document.createElement('select');
    select.id = `setting-${setting.id}`;
    select.className = styles.select;
    select.disabled = setting.disabled || false;
    
    if (setting.options && Array.isArray(setting.options)) {
      setting.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        
        if (option.value === setting.value) {
          optionElement.selected = true;
        }
        
        select.appendChild(optionElement);
      });
    }
    
    select.addEventListener('change', (e) => {
      this.handleSettingChange(setting.id, e.target.value, e);
    });
    
    return select;
  }
  
  /**
   * Create a radio button group
   * @private
   * @param {Object} setting - Radio setting configuration
   * @returns {HTMLElement} The radio group element
   */
  createRadioGroup(setting) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = styles.radioGroup;
    
    const legend = document.createElement('legend');
    legend.className = styles.srOnly;
    legend.textContent = setting.label || setting.id;
    fieldset.appendChild(legend);
    
    if (setting.options && Array.isArray(setting.options)) {
      setting.options.forEach(option => {
        const radioContainer = document.createElement('div');
        radioContainer.className = styles.radioItem;
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `setting-${setting.id}`;
        radio.id = `setting-${setting.id}-${option.value}`;
        radio.value = option.value;
        radio.checked = option.value === setting.value;
        radio.disabled = setting.disabled || false;
        
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.handleSettingChange(setting.id, e.target.value, e);
          }
        });
        
        const label = document.createElement('label');
        label.htmlFor = `setting-${setting.id}-${option.value}`;
        label.textContent = option.label;
        
        radioContainer.appendChild(radio);
        radioContainer.appendChild(label);
        fieldset.appendChild(radioContainer);
      });
    }
    
    return fieldset;
  }
  
  /**
   * Create a text input
   * @private
   * @param {Object} setting - Text setting configuration
   * @returns {HTMLElement} The input element
   */
  createTextInput(setting) {
    const input = document.createElement('input');
    input.type = setting.inputType || 'text';
    input.id = `setting-${setting.id}`;
    input.className = styles.textInput;
    input.value = setting.value || '';
    input.placeholder = setting.placeholder || '';
    input.disabled = setting.disabled || false;
    
    if (setting.maxLength) {
      input.maxLength = setting.maxLength;
    }
    
    input.addEventListener('change', (e) => {
      this.handleSettingChange(setting.id, e.target.value, e);
    });
    
    return input;
  }
  
  /**
   * Create a slider
   * @private
   * @param {Object} setting - Slider setting configuration
   * @returns {HTMLElement} The slider element
   */
  createSlider(setting) {
    const container = document.createElement('div');
    container.className = styles.sliderContainer;
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `setting-${setting.id}`;
    slider.className = styles.slider;
    slider.min = setting.min || 0;
    slider.max = setting.max || 100;
    slider.step = setting.step || 1;
    slider.value = setting.value || slider.min;
    slider.disabled = setting.disabled || false;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = styles.sliderValue;
    valueDisplay.textContent = slider.value;
    
    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
    });
    
    slider.addEventListener('change', (e) => {
      this.handleSettingChange(setting.id, Number(e.target.value), e);
    });
    
    container.appendChild(slider);
    container.appendChild(valueDisplay);
    
    return container;
  }
  
  /**
   * Create a button
   * @private
   * @param {Object} setting - Button setting configuration
   * @returns {HTMLElement} The button element
   */
  createButton(setting) {
    const button = document.createElement('button');
    button.id = `setting-${setting.id}`;
    button.className = `${styles.button} ${setting.variant ? styles[setting.variant] : ''}`;
    button.textContent = setting.label || setting.id;
    button.disabled = setting.disabled || false;
    
    button.addEventListener('click', (e) => {
      if (setting.onClick) {
        setting.onClick(e);
      }
      
      this.handleSettingChange(setting.id, null, e);
    });
    
    return button;
  }
  
  /**
   * Handle setting change
   * @private
   * @param {string} id - Setting ID
   * @param {*} value - New setting value
   * @param {Event} event - Original event
   */
  handleSettingChange(id, value, event) {
    // Call the onChange callback
    this.options.onSettingChange(id, value, event);
    
    // Dispatch custom event
    const customEvent = new CustomEvent('setting-change', {
      bubbles: true,
      detail: {
        settingId: id,
        value: value,
        originalEvent: event,
        section: this
      }
    });
    
    this.sectionElement.dispatchEvent(customEvent);
    document.dispatchEvent(customEvent);
  }
  
  /**
   * Update a setting value
   * @param {string} id - Setting ID
   * @param {*} value - New value
   * @param {boolean} triggerChange - Whether to trigger the change event
   */
  updateSetting(id, value, triggerChange = false) {
    const settingData = this.settingElements.get(id);
    if (!settingData) return;
    
    const control = settingData.control;
    
    // Update the control based on type
    if (control.type === 'checkbox') {
      control.checked = !!value;
    } else if (control.type === 'radio') {
      const radio = this.sectionElement.querySelector(`input[name="setting-${id}"][value="${value}"]`);
      if (radio) {
        radio.checked = true;
      }
    } else if (control.type === 'range') {
      control.value = value;
      const valueDisplay = control.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    } else if (control.tagName === 'SELECT') {
      control.value = value;
    } else if (control.type === 'text' || control.type === 'email' || control.type === 'number') {
      control.value = value;
    }
    
    // Trigger change event if requested
    if (triggerChange) {
      this.handleSettingChange(id, value, { target: control });
    }
  }
  
  /**
   * Set setting disabled state
   * @param {string} id - Setting ID
   * @param {boolean} disabled - Whether the setting should be disabled
   */
  setSettingDisabled(id, disabled) {
    const settingData = this.settingElements.get(id);
    if (!settingData) return;
    
    const control = settingData.control;
    
    if (control.tagName === 'FIELDSET') {
      // For radio groups, disable all inputs
      const radios = control.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.disabled = disabled;
      });
    } else {
      // For other controls
      control.disabled = disabled;
    }
  }
  
  /**
   * Add a new setting to the section
   * @param {Object} setting - Setting configuration
   */
  addSetting(setting) {
    if (!this.initialized || !setting.id || !setting.type) return;
    
    // Add to settings array
    this.options.settings.push(setting);
    
    // Create setting element
    const settingElement = this.createSetting(setting);
    if (settingElement) {
      const settingsContainer = this.sectionElement.querySelector(`.${styles.settingsContainer}`);
      if (settingsContainer) {
        settingsContainer.appendChild(settingElement);
      } else {
        const newContainer = document.createElement('div');
        newContainer.className = styles.settingsContainer;
        newContainer.appendChild(settingElement);
        this.sectionElement.appendChild(newContainer);
      }
    }
  }
  
  /**
   * Remove a setting from the section
   * @param {string} id - Setting ID to remove
   */
  removeSetting(id) {
    const settingData = this.settingElements.get(id);
    if (!settingData) return;
    
    // Remove from DOM
    settingData.container.remove();
    
    // Remove from settings array
    const index = this.options.settings.findIndex(s => s.id === id);
    if (index !== -1) {
      this.options.settings.splice(index, 1);
    }
    
    // Remove from settingElements map
    this.settingElements.delete(id);
  }
  
  /**
   * Get all current setting values
   * @returns {Object} Key-value pairs of settings
   */
  getValues() {
    const values = {};
    
    this.options.settings.forEach(setting => {
      const settingData = this.settingElements.get(setting.id);
      if (!settingData) return;
      
      const control = settingData.control;
      
      if (control.type === 'checkbox') {
        values[setting.id] = control.checked;
      } else if (control.type === 'radio') {
        const checkedRadio = this.sectionElement.querySelector(`input[name="setting-${setting.id}"]:checked`);
        if (checkedRadio) {
          values[setting.id] = checkedRadio.value;
        }
      } else if (control.type === 'range') {
        values[setting.id] = Number(control.value);
      } else if (control.tagName === 'SELECT') {
        values[setting.id] = control.value;
      } else if (control.type === 'text' || control.type === 'email' || control.type === 'number') {
        values[setting.id] = control.value;
      }
    });
    
    return values;
  }
  
  /**
   * Update multiple settings at once
   * @param {Object} values - Key-value pairs of settings
   * @param {boolean} triggerChange - Whether to trigger change events
   */
  setValues(values, triggerChange = false) {
    if (typeof values !== 'object') return;
    
    Object.entries(values).forEach(([id, value]) => {
      this.updateSetting(id, value, triggerChange);
    });
  }
  
  /**
   * Reset all settings to default values
   * @param {boolean} triggerChange - Whether to trigger change events
   */
  resetToDefaults(triggerChange = true) {
    this.options.settings.forEach(setting => {
      if ('defaultValue' in setting) {
        this.updateSetting(setting.id, setting.defaultValue, triggerChange);
      }
    });
  }
  
  /**
   * Destroy the settings section
   */
  destroy() {
    if (!this.initialized) return;
    
    // Remove from DOM
    this.sectionElement.remove();
    
    // Clear references
    this.settingElements.clear();
    this.sectionElement = null;
    this.initialized = false;
  }
}

export default SettingsSection; 