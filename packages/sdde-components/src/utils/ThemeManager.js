/**
 * ThemeManager utility for handling component theming
 */
class ThemeManager {
  /**
   * Create a new ThemeManager instance
   * @param {Object} options - Theme manager options
   * @param {string} [options.storageKey='sdde-theme'] - Local storage key for theme preference
   * @param {string} [options.defaultTheme='light'] - Default theme if none is set
   * @param {string[]} [options.availableThemes=['light', 'dark']] - Available themes
   * @param {string} [options.dataAttribute='data-theme'] - HTML attribute for theme
   * @param {HTMLElement} [options.rootElement=document.documentElement] - Root element to apply theme to
   * @param {boolean} [options.preferSystemTheme=true] - Whether to prefer system theme by default
   */
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'sdde-theme';
    this.defaultTheme = options.defaultTheme || 'light';
    this.availableThemes = options.availableThemes || ['light', 'dark'];
    this.dataAttribute = options.dataAttribute || 'data-theme';
    this.rootElement = options.rootElement || document.documentElement;
    this.preferSystemTheme = options.preferSystemTheme !== false;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = new Set();
    
    // Initialize theme
    this.initialize();
  }
  
  /**
   * Initialize the theme manager
   */
  initialize() {
    // Set up media query listener
    if (this.preferSystemTheme) {
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }
    
    // Apply initial theme
    this.applyTheme(this.getCurrentTheme());
  }
  
  /**
   * Get the current theme
   * @returns {string} The current theme
   */
  getCurrentTheme() {
    // Check stored preference
    const storedTheme = localStorage.getItem(this.storageKey);
    
    if (storedTheme && this.availableThemes.includes(storedTheme)) {
      return storedTheme;
    }
    
    // If system preference is enabled, check system theme
    if (this.preferSystemTheme) {
      return this.getSystemTheme();
    }
    
    // Fall back to default theme
    return this.defaultTheme;
  }
  
  /**
   * Get the system theme based on prefers-color-scheme
   * @returns {string} The system theme ('dark' or 'light')
   */
  getSystemTheme() {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }
  
  /**
   * Set the theme
   * @param {string} theme - Theme to set
   * @returns {boolean} Whether the theme was set successfully
   */
  setTheme(theme) {
    if (!this.availableThemes.includes(theme)) {
      console.error(`Theme "${theme}" is not available. Available themes: ${this.availableThemes.join(', ')}`);
      return false;
    }
    
    // Store in local storage
    localStorage.setItem(this.storageKey, theme);
    
    // Apply the theme
    this.applyTheme(theme);
    
    return true;
  }
  
  /**
   * Apply a theme to the root element
   * @param {string} theme - Theme to apply
   */
  applyTheme(theme) {
    // Set attribute on root element
    this.rootElement.setAttribute(this.dataAttribute, theme);
    
    // Notify listeners
    this.notifyListeners(theme);
  }
  
  /**
   * Toggle between light and dark themes
   * @returns {string} The new theme
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.setTheme(newTheme);
    return newTheme;
  }
  
  /**
   * Use the system theme
   */
  useSystemTheme() {
    // Remove stored preference
    localStorage.removeItem(this.storageKey);
    
    // Apply system theme
    this.applyTheme(this.getSystemTheme());
  }
  
  /**
   * Handle system theme change
   * @param {MediaQueryListEvent} event - Media query change event
   */
  handleSystemThemeChange(event) {
    // Only apply if using system theme
    if (!localStorage.getItem(this.storageKey)) {
      this.applyTheme(event.matches ? 'dark' : 'light');
    }
  }
  
  /**
   * Add a theme change listener
   * @param {Function} listener - Function to call when theme changes
   * @returns {Function} Function to remove the listener
   */
  addThemeChangeListener(listener) {
    this.listeners.add(listener);
    
    // Call listener immediately with current theme
    listener(this.getCurrentTheme());
    
    // Return function to remove listener
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of a theme change
   * @param {string} theme - The new theme
   */
  notifyListeners(theme) {
    for (const listener of this.listeners) {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    }
  }
  
  /**
   * Clean up resources used by the ThemeManager
   */
  destroy() {
    // Remove event listener
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    
    // Clear listeners
    this.listeners.clear();
  }
  
  /**
   * Get a singleton instance of ThemeManager
   * @param {Object} options - Theme manager options
   * @returns {ThemeManager} Theme manager instance
   */
  static getInstance(options = {}) {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager(options);
    }
    return ThemeManager.instance;
  }
}

export default ThemeManager; 