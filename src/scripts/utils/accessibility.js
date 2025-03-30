/**
 * Accessibility Settings Component for Grimoire
 * Provides UI and logic for managing accessibility preferences
 */

import accessibilityManager from '../accessibility.js';
import i18n from '../i18n.js';

class AccessibilityComponent {
  constructor() {
    this.initialized = false;
    this.container = null;
  }
  
  /**
   * Initialize the accessibility component
   * @param {string} containerId - ID of the container element
   */
  async initialize(containerId = 'accessibility-settings') {
    if (this.initialized) return;
    
    // Get container element
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Accessibility settings container #${containerId} not found`);
      return;
    }
    
    // Create settings UI
    this.createSettingsUI();
    
    // Listen for preference changes from other components
    document.addEventListener('accessibility-changed', () => {
      this.updateUI();
    });
    
    this.initialized = true;
    console.log('Accessibility component initialized');
  }
  
  /**
   * Create settings UI in the container
   */
  createSettingsUI() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create section header
    const header = document.createElement('h2');
    header.textContent = i18n.t('settings.accessibility.title');
    this.container.appendChild(header);
    
    // Font size control
    this.createFontSizeControls();
    
    // Dyslexic font toggle
    this.createDyslexicFontToggle();
    
    // High contrast toggle
    this.createHighContrastToggle();
    
    // Line spacing control
    this.createLineSpacingControls();
    
    // Reading guide toggle
    this.createReadingGuideToggle();
    
    // Reset button
    this.createResetButton();
  }
  
  /**
   * Create font size controls
   */
  createFontSizeControls() {
    const fontSizeGroup = document.createElement('div');
    fontSizeGroup.className = 'settings-group';
    
    const fontSizeLabel = document.createElement('label');
    fontSizeLabel.className = 'settings-label';
    fontSizeLabel.textContent = i18n.t('settings.accessibility.fontSize');
    fontSizeGroup.appendChild(fontSizeLabel);
    
    const fontSizeControls = document.createElement('div');
    fontSizeControls.className = 'button-group';
    
    // Create buttons for different font sizes
    const sizes = [
      { value: 'small', label: 'settings.accessibility.fontSizeSmall' },
      { value: 'medium', label: 'settings.accessibility.fontSizeMedium' },
      { value: 'large', label: 'settings.accessibility.fontSizeLarge' },
      { value: 'xlarge', label: 'settings.accessibility.fontSizeXLarge' }
    ];
    
    const currentSize = accessibilityManager.getPreferences().fontSize;
    
    sizes.forEach(size => {
      const button = document.createElement('button');
      button.className = `btn btn-size ${currentSize === size.value ? 'active' : ''}`;
      button.textContent = i18n.t(size.label);
      button.dataset.size = size.value;
      button.onclick = () => {
        // Update active button
        fontSizeControls.querySelectorAll('.btn-size').forEach(btn => 
          btn.classList.toggle('active', btn === button)
        );
        
        // Dispatch font size change event
        document.dispatchEvent(new CustomEvent('font-size-changed', {
          detail: { fontSize: size.value }
        }));
      };
      
      fontSizeControls.appendChild(button);
    });
    
    fontSizeGroup.appendChild(fontSizeControls);
    this.container.appendChild(fontSizeGroup);
  }
  
  /**
   * Create dyslexic font toggle
   */
  createDyslexicFontToggle() {
    const dyslexicGroup = document.createElement('div');
    dyslexicGroup.className = 'settings-group';
    
    const dyslexicLabel = document.createElement('label');
    dyslexicLabel.className = 'settings-label';
    dyslexicLabel.textContent = i18n.t('settings.accessibility.dyslexicFont');
    dyslexicGroup.appendChild(dyslexicLabel);
    
    const dyslexicDescription = document.createElement('p');
    dyslexicDescription.className = 'settings-description';
    dyslexicDescription.textContent = i18n.t('settings.accessibility.dyslexicFontDescription');
    dyslexicGroup.appendChild(dyslexicDescription);
    
    const dyslexicToggle = this.createToggleSwitch(
      accessibilityManager.getPreferences().dyslexicFont,
      (checked) => {
        document.dispatchEvent(new CustomEvent('dyslexic-font-changed', {
          detail: { enabled: checked }
        }));
      }
    );
    
    dyslexicGroup.appendChild(dyslexicToggle);
    this.container.appendChild(dyslexicGroup);
  }
  
  /**
   * Create high contrast toggle
   */
  createHighContrastToggle() {
    const contrastGroup = document.createElement('div');
    contrastGroup.className = 'settings-group';
    
    const contrastLabel = document.createElement('label');
    contrastLabel.className = 'settings-label';
    contrastLabel.textContent = i18n.t('settings.accessibility.highContrast');
    contrastGroup.appendChild(contrastLabel);
    
    const contrastDescription = document.createElement('p');
    contrastDescription.className = 'settings-description';
    contrastDescription.textContent = i18n.t('settings.accessibility.highContrastDescription');
    contrastGroup.appendChild(contrastDescription);
    
    const contrastToggle = this.createToggleSwitch(
      accessibilityManager.getPreferences().highContrast,
      (checked) => {
        document.dispatchEvent(new CustomEvent('high-contrast-changed', {
          detail: { enabled: checked }
        }));
      }
    );
    
    contrastGroup.appendChild(contrastToggle);
    this.container.appendChild(contrastGroup);
  }
  
  /**
   * Create line spacing controls
   */
  createLineSpacingControls() {
    const lineSpacingGroup = document.createElement('div');
    lineSpacingGroup.className = 'settings-group';
    
    const lineSpacingLabel = document.createElement('label');
    lineSpacingLabel.className = 'settings-label';
    lineSpacingLabel.textContent = i18n.t('settings.accessibility.lineSpacing');
    lineSpacingGroup.appendChild(lineSpacingLabel);
    
    const lineSpacingControls = document.createElement('div');
    lineSpacingControls.className = 'button-group';
    
    // Create buttons for different line spacings
    const spacings = [
      { value: 'normal', label: 'settings.accessibility.lineSpacingNormal' },
      { value: 'wide', label: 'settings.accessibility.lineSpacingWide' },
      { value: 'wider', label: 'settings.accessibility.lineSpacingWider' }
    ];
    
    const currentSpacing = accessibilityManager.getPreferences().lineSpacing;
    
    spacings.forEach(spacing => {
      const button = document.createElement('button');
      button.className = `btn btn-spacing ${currentSpacing === spacing.value ? 'active' : ''}`;
      button.textContent = i18n.t(spacing.label);
      button.dataset.spacing = spacing.value;
      button.onclick = () => {
        // Update active button
        lineSpacingControls.querySelectorAll('.btn-spacing').forEach(btn => 
          btn.classList.toggle('active', btn === button)
        );
        
        // Dispatch line spacing change event
        document.dispatchEvent(new CustomEvent('line-spacing-changed', {
          detail: { spacing: spacing.value }
        }));
      };
      
      lineSpacingControls.appendChild(button);
    });
    
    lineSpacingGroup.appendChild(lineSpacingControls);
    this.container.appendChild(lineSpacingGroup);
  }
  
  /**
   * Create reading guide toggle
   */
  createReadingGuideToggle() {
    const readingGuideGroup = document.createElement('div');
    readingGuideGroup.className = 'settings-group';
    
    const readingGuideLabel = document.createElement('label');
    readingGuideLabel.className = 'settings-label';
    readingGuideLabel.textContent = i18n.t('settings.accessibility.readingGuide');
    readingGuideGroup.appendChild(readingGuideLabel);
    
    const readingGuideDescription = document.createElement('p');
    readingGuideDescription.className = 'settings-description';
    readingGuideDescription.textContent = i18n.t('settings.accessibility.readingGuideDescription');
    readingGuideGroup.appendChild(readingGuideDescription);
    
    const readingGuideToggle = this.createToggleSwitch(
      accessibilityManager.getPreferences().readingGuide,
      (checked) => {
        document.dispatchEvent(new CustomEvent('reading-guide-changed', {
          detail: { enabled: checked }
        }));
      }
    );
    
    readingGuideGroup.appendChild(readingGuideToggle);
    this.container.appendChild(readingGuideGroup);
  }
  
  /**
   * Create reset button
   */
  createResetButton() {
    const resetGroup = document.createElement('div');
    resetGroup.className = 'settings-group button-container';
    
    const resetButton = document.createElement('button');
    resetButton.className = 'btn btn-secondary';
    resetButton.textContent = i18n.t('settings.accessibility.resetDefaults');
    resetButton.onclick = () => {
      accessibilityManager.resetToDefaults();
      this.updateUI();
    };
    
    resetGroup.appendChild(resetButton);
    this.container.appendChild(resetGroup);
  }
  
  /**
   * Create a toggle switch
   * @param {boolean} checked - Initial state
   * @param {Function} onChange - Change handler
   * @returns {HTMLElement} The toggle switch element
   */
  createToggleSwitch(checked, onChange) {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-switch-container';
    
    const label = document.createElement('label');
    label.className = 'toggle-switch';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.onchange = () => {
      onChange(input.checked);
    };
    
    const slider = document.createElement('span');
    slider.className = 'slider round';
    
    label.appendChild(input);
    label.appendChild(slider);
    
    const statusText = document.createElement('span');
    statusText.className = 'toggle-status';
    statusText.textContent = checked ? 
      i18n.t('common.enabled') : 
      i18n.t('common.disabled');
    
    toggleContainer.appendChild(label);
    toggleContainer.appendChild(statusText);
    
    // Update status text when toggle changes
    input.addEventListener('change', () => {
      statusText.textContent = input.checked ? 
        i18n.t('common.enabled') : 
        i18n.t('common.disabled');
    });
    
    return toggleContainer;
  }
  
  /**
   * Update UI to reflect current preferences
   */
  updateUI() {
    // Re-create the UI to reflect updated preferences
    this.createSettingsUI();
  }
}

// Create singleton instance
const accessibilityComponent = new AccessibilityComponent();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  accessibilityComponent.initialize();
});

// Export the instance
export default accessibilityComponent;
