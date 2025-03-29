/**
 * Accessibility Controls Component for Steam Deck DUB Edition
 * Provides user interface elements for controlling accessibility features
 * 
 * @module AccessibilityControls
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './AccessibilityControls.module.css';
import accessibilityManager from '../../scripts/accessibility.js';

/**
 * Manages accessibility UI controls and interactions
 */
class AccessibilityControls {
  /**
   * Creates a new AccessibilityControls instance
   */
  constructor() {
    /**
     * Whether the UI has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Reference to the accessibility panel element
     * @type {HTMLElement|null}
     * @private
     */
    this.accessibilityPanel = null;
  }

  /**
   * Initialize the accessibility UI
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('Initializing accessibility UI...');
    
    // Initialize accessibility manager first
    accessibilityManager.initialize();
    
    // Find or create accessibility panel
    this.accessibilityPanel = document.getElementById('accessibility-panel');
    
    if (!this.accessibilityPanel) {
      this.createAccessibilityPanel();
    }
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update UI to match current preferences
    this.updateUI(accessibilityManager.preferences);
    
    this.initialized = true;
    console.log('Accessibility UI initialized');
  }
  
  /**
   * Create the accessibility panel in the DOM
   * @private
   */
  createAccessibilityPanel() {
    // Create the panel if it doesn't exist
    this.accessibilityPanel = document.createElement('div');
    this.accessibilityPanel.id = 'accessibility-panel';
    this.accessibilityPanel.className = styles['accessibility-panel'];
    this.accessibilityPanel.setAttribute('aria-label', 'Accessibility Options');
    
    // Create the panel content
    const header = document.createElement('div');
    header.className = styles['accessibility-header'];
    
    const title = document.createElement('h2');
    title.textContent = 'Accessibility Options';
    header.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.id = 'close-accessibility';
    closeButton.setAttribute('aria-label', 'Close accessibility panel');
    closeButton.textContent = '×';
    header.appendChild(closeButton);
    
    this.accessibilityPanel.appendChild(header);
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = styles['accessibility-options'];
    
    // Font size option
    const fontSizeGroup = this.createOptionGroup('Font Size', 'select', 'font-size', [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xlarge', label: 'Extra Large' }
    ]);
    optionsContainer.appendChild(fontSizeGroup);
    
    // High contrast option
    const highContrastGroup = this.createOptionGroup('High Contrast', 'checkbox', 'high-contrast');
    optionsContainer.appendChild(highContrastGroup);
    
    // Dyslexic font option
    const dyslexicFontGroup = this.createOptionGroup('Dyslexic Font', 'checkbox', 'dyslexic-font');
    optionsContainer.appendChild(dyslexicFontGroup);
    
    // Line spacing option
    const lineSpacingGroup = this.createOptionGroup('Line Spacing', 'select', 'line-spacing', [
      { value: 'normal', label: 'Normal' },
      { value: 'wide', label: 'Wide' },
      { value: 'wider', label: 'Wider' }
    ]);
    optionsContainer.appendChild(lineSpacingGroup);
    
    // Reading guide option
    const readingGuideGroup = this.createOptionGroup('Reading Guide', 'checkbox', 'reading-guide');
    optionsContainer.appendChild(readingGuideGroup);
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-accessibility';
    resetButton.className = styles['btn-secondary'];
    resetButton.textContent = 'Reset to Defaults';
    optionsContainer.appendChild(resetButton);
    
    this.accessibilityPanel.appendChild(optionsContainer);
    
    // Append to body
    document.body.appendChild(this.accessibilityPanel);
  }
  
  /**
   * Create an option group element
   * @private
   * @param {string} label - The label text
   * @param {string} type - The input type (select, checkbox)
   * @param {string} id - The element ID
   * @param {Array<Object>} [options] - Options for select elements
   * @returns {HTMLElement} The created option group
   */
  createOptionGroup(label, type, id, options = []) {
    const group = document.createElement('div');
    group.className = styles['option-group'];
    
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', id);
    labelElement.textContent = label;
    group.appendChild(labelElement);
    
    let inputElement;
    
    if (type === 'select') {
      inputElement = document.createElement('select');
      inputElement.id = id;
      
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        inputElement.appendChild(optionElement);
      });
    } else if (type === 'checkbox') {
      inputElement = document.createElement('input');
      inputElement.type = 'checkbox';
      inputElement.id = id;
    }
    
    group.appendChild(inputElement);
    return group;
  }
  
  /**
   * Set up event listeners for the accessibility UI
   * @private
   */
  setupEventListeners() {
    // Close button
    const closeButton = document.getElementById('close-accessibility');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.togglePanel(false);
      });
    }
    
    // Toggle accessibility panel button
    const toggleButton = document.getElementById('toggle-accessibility');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.togglePanel();
      });
    } else {
      // Create toggle button if it doesn't exist
      this.createToggleButton();
    }
    
    // Font size
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        const fontSize = e.target.value;
        document.dispatchEvent(new CustomEvent('font-size-changed', {
          detail: { fontSize }
        }));
      });
    }
    
    // High contrast
    const highContrastCheck = document.getElementById('high-contrast');
    if (highContrastCheck) {
      highContrastCheck.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        document.dispatchEvent(new CustomEvent('high-contrast-changed', {
          detail: { enabled }
        }));
      });
    }
    
    // Dyslexic font
    const dyslexicFontCheck = document.getElementById('dyslexic-font');
    if (dyslexicFontCheck) {
      dyslexicFontCheck.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        document.dispatchEvent(new CustomEvent('dyslexic-font-changed', {
          detail: { enabled }
        }));
      });
    }
    
    // Line spacing
    const lineSpacingSelect = document.getElementById('line-spacing');
    if (lineSpacingSelect) {
      lineSpacingSelect.addEventListener('change', (e) => {
        const spacing = e.target.value;
        document.dispatchEvent(new CustomEvent('line-spacing-changed', {
          detail: { spacing }
        }));
      });
    }
    
    // Reading guide
    const readingGuideCheck = document.getElementById('reading-guide');
    if (readingGuideCheck) {
      readingGuideCheck.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        document.dispatchEvent(new CustomEvent('reading-guide-changed', {
          detail: { enabled }
        }));
      });
    }
    
    // Reset button
    const resetButton = document.getElementById('reset-accessibility');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        accessibilityManager.resetToDefaults();
        this.updateUI(accessibilityManager.preferences);
      });
    }
  }
  
  /**
   * Create a toggle button for the accessibility panel
   * @private
   */
  createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-accessibility';
    toggleButton.className = styles['accessibility-toggle'];
    toggleButton.setAttribute('aria-label', 'Toggle accessibility options');
    toggleButton.setAttribute('title', 'Accessibility Options');
    toggleButton.innerHTML = '<span class="visually-hidden">Accessibility</span>♿';
    
    // Add to the page
    const headerTools = document.querySelector('.header-tools');
    if (headerTools) {
      headerTools.appendChild(toggleButton);
    } else {
      document.body.appendChild(toggleButton);
    }
    
    // Add event listener
    toggleButton.addEventListener('click', () => {
      this.togglePanel();
    });
  }
  
  /**
   * Toggle the accessibility panel
   * @param {boolean} [force] - Force a specific state
   */
  togglePanel(force) {
    const isVisible = window.getComputedStyle(this.accessibilityPanel).display !== 'none';
    const newState = force !== undefined ? force : !isVisible;
    
    this.accessibilityPanel.style.display = newState ? 'block' : 'none';
    
    // Add/remove class to body to indicate if panel is open
    if (newState) {
      document.body.classList.add('a11y-panel-open');
    } else {
      document.body.classList.remove('a11y-panel-open');
    }
  }
  
  /**
   * Update UI to match current accessibility preferences
   * @param {Object} preferences - Current accessibility preferences
   */
  updateUI(preferences) {
    // Font size
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect && preferences.fontSize) {
      fontSizeSelect.value = preferences.fontSize;
    }
    
    // High contrast
    const highContrastCheck = document.getElementById('high-contrast');
    if (highContrastCheck) {
      highContrastCheck.checked = preferences.highContrast || false;
    }
    
    // Dyslexic font
    const dyslexicFontCheck = document.getElementById('dyslexic-font');
    if (dyslexicFontCheck) {
      dyslexicFontCheck.checked = preferences.dyslexicFont || false;
    }
    
    // Line spacing
    const lineSpacingSelect = document.getElementById('line-spacing');
    if (lineSpacingSelect && preferences.lineSpacing) {
      lineSpacingSelect.value = preferences.lineSpacing;
    }
    
    // Reading guide
    const readingGuideCheck = document.getElementById('reading-guide');
    if (readingGuideCheck) {
      readingGuideCheck.checked = preferences.readingGuide || false;
    }
  }
}

export default AccessibilityControls; 