/**
 * Accessibility UI component for Steam Deck DUB Edition
 * Provides user interface elements for controlling accessibility features
 * 
 * @module AccessibilityUI
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import accessibilityManager from '../accessibility.js';

/**
 * Manages accessibility UI controls and interactions
 */
class AccessibilityUI {
  /**
   * Creates a new AccessibilityUI instance
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
    this.accessibilityPanel.className = 'accessibility-panel';
    this.accessibilityPanel.setAttribute('aria-label', 'Accessibility Options');
    
    // Create the panel content
    this.accessibilityPanel.innerHTML = `
      <div class="accessibility-header">
        <h2>Accessibility Options</h2>
        <button id="close-accessibility" aria-label="Close accessibility panel">×</button>
      </div>
      <div class="accessibility-options">
        <div class="option-group">
          <label for="font-size">Font Size</label>
          <select id="font-size">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="high-contrast">High Contrast</label>
          <input type="checkbox" id="high-contrast">
        </div>
        
        <div class="option-group">
          <label for="dyslexic-font">Dyslexic Font</label>
          <input type="checkbox" id="dyslexic-font">
        </div>
        
        <div class="option-group">
          <label for="line-spacing">Line Spacing</label>
          <select id="line-spacing">
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
            <option value="wider">Wider</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="reading-guide">Reading Guide</label>
          <input type="checkbox" id="reading-guide">
        </div>
        
        <button id="reset-accessibility" class="btn-secondary">Reset to Defaults</button>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(this.accessibilityPanel);
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
      });
    }
    
    // Listen for accessibility changes to update UI
    document.addEventListener('accessibility-changed', (e) => {
      this.updateUI(e.detail.preferences);
    });
    
    // Keyboard shortcut for accessibility panel (Alt+A)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'a') {
        this.togglePanel();
        e.preventDefault();
      }
    });
  }
  
  /**
   * Create the toggle button for accessibility panel
   * @private
   */
  createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-accessibility';
    toggleButton.className = 'btn-accessibility';
    toggleButton.setAttribute('aria-label', 'Accessibility Options');
    toggleButton.innerHTML = `<span class="sr-only">Accessibility Options</span>
                             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                               <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 8c0-3.31 2.69-6 6-6s6 2.69 6 6H6z"/>
                             </svg>`;
    
    // Add to the document
    document.body.appendChild(toggleButton);
    
    // Add event listener
    toggleButton.addEventListener('click', () => {
      this.togglePanel();
    });
  }
  
  /**
   * Toggle the visibility of the accessibility panel
   * @param {boolean} [force] - Force panel to open or close
   */
  togglePanel(force) {
    if (!this.accessibilityPanel) return;
    
    const isVisible = !this.accessibilityPanel.classList.contains('hidden');
    const newState = force !== undefined ? force : !isVisible;
    
    if (newState) {
      this.accessibilityPanel.classList.remove('hidden');
    } else {
      this.accessibilityPanel.classList.add('hidden');
    }
  }
  
  /**
   * Update UI to match current preferences
   * @param {Object} preferences - Current accessibility preferences
   * @private
   */
  updateUI(preferences) {
    // Update font size select
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
      fontSizeSelect.value = preferences.fontSize;
    }
    
    // Update high contrast checkbox
    const highContrastCheck = document.getElementById('high-contrast');
    if (highContrastCheck) {
      highContrastCheck.checked = preferences.highContrast;
    }
    
    // Update dyslexic font checkbox
    const dyslexicFontCheck = document.getElementById('dyslexic-font');
    if (dyslexicFontCheck) {
      dyslexicFontCheck.checked = preferences.dyslexicFont;
    }
    
    // Update line spacing select
    const lineSpacingSelect = document.getElementById('line-spacing');
    if (lineSpacingSelect) {
      lineSpacingSelect.value = preferences.lineSpacing;
    }
    
    // Update reading guide checkbox
    const readingGuideCheck = document.getElementById('reading-guide');
    if (readingGuideCheck) {
      readingGuideCheck.checked = preferences.readingGuide;
    }
  }
}

// Create and export singleton instance
const accessibilityUI = new AccessibilityUI();
export default accessibilityUI;
