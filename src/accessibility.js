/**
 * Accessibility manager for Steam Deck DUB Edition
 * Handles accessibility features like dyslexic font, high contrast mode, and other settings
 * to make the application more accessible to all users.
 * 
 * @module AccessibilityManager
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import i18n from './i18n.js';

/**
 * @class AccessibilityManager
 * @classdesc Manages all accessibility features and user preferences for the application.
 * Provides methods to change font size, toggle high contrast mode, enable dyslexic fonts,
 * adjust line spacing, and enable reading guides.
 */
class AccessibilityManager {
  /**
   * Creates a new AccessibilityManager instance
   * @constructor
   */
  constructor() {
    /**
     * User accessibility preferences
     * @type {Object}
     * @property {string} fontSize - Current font size (small, medium, large, xlarge)
     * @property {boolean} highContrast - Whether high contrast mode is enabled
     * @property {boolean} dyslexicFont - Whether dyslexic font is enabled
     * @property {string} lineSpacing - Current line spacing (normal, wide, wider)
     * @property {boolean} readingGuide - Whether reading guide is enabled
     */
    this.preferences = {
      fontSize: 'medium',      // small, medium, large, xlarge
      highContrast: false,     // true or false 
      dyslexicFont: false,     // true or false
      lineSpacing: 'normal',   // normal, wide, wider
      readingGuide: false      // true or false
    };
    
    /**
     * Whether the manager has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
  }

  /**
   * Initialize the accessibility manager
   * Loads saved preferences from localStorage and applies them
   * Sets up event listeners for preference changes
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * // Initialize the accessibility manager
   * const accessibilityManager = new AccessibilityManager();
   * await accessibilityManager.initialize();
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load saved preferences
      this.loadPreferences();
      
      // Apply saved preferences
      this.applyPreferences();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.initialized = true;
      console.log('Accessibility manager initialized');
    } catch (error) {
      console.error('Error initializing accessibility manager:', error);
    }
  }

  /**
   * Load saved preferences from localStorage
   * If no preferences are found, defaults are used
   * 
   * @private
   * @returns {void}
   */
  loadPreferences() {
    try {
      const savedPrefs = localStorage.getItem('accessibilityPreferences');
      if (savedPrefs) {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPrefs) };
        console.log('Loaded accessibility preferences:', this.preferences);
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    }
  }

  /**
   * Save current preferences to localStorage for persistence
   * between user sessions
   * 
   * @private
   * @returns {void}
   */
  savePreferences() {
    try {
      localStorage.setItem('accessibilityPreferences', JSON.stringify(this.preferences));
      console.log('Saved accessibility preferences:', this.preferences);
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
    }
  }

  /**
   * Apply current preferences to the UI
   */
  applyPreferences() {
    // Apply font size
    this.setFontSize(this.preferences.fontSize);
    
    // Apply high contrast
    this.setHighContrast(this.preferences.highContrast);
    
    // Apply dyslexic font
    this.setDyslexicFont(this.preferences.dyslexicFont);
    
    // Apply line spacing
    this.setLineSpacing(this.preferences.lineSpacing);
    
    // Apply reading guide
    this.setReadingGuide(this.preferences.readingGuide);
    
    // Dispatch event for other components to respond
    document.dispatchEvent(new CustomEvent('accessibility-changed', {
      detail: { preferences: this.preferences }
    }));
  }

  /**
   * Set up event listeners for settings changes
   */
  setupEventListeners() {
    // Listen for font size changes
    document.addEventListener('font-size-changed', (event) => {
      const { fontSize } = event.detail;
      this.setFontSize(fontSize);
      this.preferences.fontSize = fontSize;
      this.savePreferences();
    });
    
    // Listen for high contrast changes
    document.addEventListener('high-contrast-changed', (event) => {
      const { enabled } = event.detail;
      this.setHighContrast(enabled);
      this.preferences.highContrast = enabled;
      this.savePreferences();
    });
    
    // Listen for dyslexic font changes
    document.addEventListener('dyslexic-font-changed', (event) => {
      const { enabled } = event.detail;
      this.setDyslexicFont(enabled);
      this.preferences.dyslexicFont = enabled;
      this.savePreferences();
    });
    
    // Listen for line spacing changes
    document.addEventListener('line-spacing-changed', (event) => {
      const { spacing } = event.detail;
      this.setLineSpacing(spacing);
      this.preferences.lineSpacing = spacing;
      this.savePreferences();
    });
    
    // Listen for reading guide changes
    document.addEventListener('reading-guide-changed', (event) => {
      const { enabled } = event.detail;
      this.setReadingGuide(enabled);
      this.preferences.readingGuide = enabled;
      this.savePreferences();
    });
  }

  /**
   * Set font size
   * @param {string} size - The font size (small, medium, large, xlarge)
   */
  setFontSize(size) {
    // Remove existing font size classes
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    
    // Add new font size class
    document.documentElement.classList.add(`font-${size}`);
    console.log(`Font size set to ${size}`);
  }

  /**
   * Toggle high contrast mode
   * @param {boolean} enabled - Whether high contrast is enabled
   */
  setHighContrast(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    console.log(`High contrast ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle dyslexic font
   * @param {boolean} enabled - Whether dyslexic font is enabled
   */
  setDyslexicFont(enabled) {
    if (enabled) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    console.log(`Dyslexic font ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set line spacing
   * @param {string} spacing - Line spacing (normal, wide, wider)
   */
  setLineSpacing(spacing) {
    // Remove existing line spacing classes
    document.documentElement.classList.remove('line-spacing-normal', 'line-spacing-wide', 'line-spacing-wider');
    
    // Add new line spacing class
    document.documentElement.classList.add(`line-spacing-${spacing}`);
    console.log(`Line spacing set to ${spacing}`);
  }

  /**
   * Toggle reading guide
   * @param {boolean} enabled - Whether reading guide is enabled
   */
  setReadingGuide(enabled) {
    if (enabled) {
      document.documentElement.classList.add('reading-guide');
      this.createReadingGuide();
    } else {
      document.documentElement.classList.remove('reading-guide');
      this.removeReadingGuide();
    }
    console.log(`Reading guide ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create reading guide element
   */
  createReadingGuide() {
    // Remove existing guide if any
    this.removeReadingGuide();
    
    // Create new guide
    const guide = document.createElement('div');
    guide.id = 'reading-guide-element';
    guide.className = 'reading-guide-element';
    document.body.appendChild(guide);
    
    // Add mouse move listener
    document.addEventListener('mousemove', this.moveReadingGuide);
  }

  /**
   * Move reading guide with cursor
   * @param {MouseEvent} event - Mouse event
   */
  moveReadingGuide = (event) => {
    const guide = document.getElementById('reading-guide-element');
    if (guide) {
      guide.style.top = `${event.clientY}px`;
    }
  };

  /**
   * Remove reading guide element
   */
  removeReadingGuide() {
    const guide = document.getElementById('reading-guide-element');
    if (guide) {
      guide.remove();
      document.removeEventListener('mousemove', this.moveReadingGuide);
    }
  }

  /**
   * Get current accessibility preferences
   * @returns {Object} Current preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Reset preferences to defaults
   */
  resetToDefaults() {
    this.preferences = {
      fontSize: 'medium',
      highContrast: false,
      dyslexicFont: false,
      lineSpacing: 'normal',
      readingGuide: false
    };
    
    this.applyPreferences();
    this.savePreferences();
    console.log('Accessibility preferences reset to defaults');
  }
}

// Create singleton instance
const accessibilityManager = new AccessibilityManager();

// Export the instance
export default accessibilityManager;
