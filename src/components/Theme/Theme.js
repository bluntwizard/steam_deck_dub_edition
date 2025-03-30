/**
 * Grimoire
 * Theme Component
 * 
 * Manages theme settings and switching between light and dark themes
 */

import styles from './Theme.module.css';

class Theme {
  constructor(options = {}) {
    /**
     * Available themes in the application
     * @type {Array<string>}
     */
    this.availableThemes = options.themes || ['light', 'dark', 'dracula', 'high-contrast'];
    
    /**
     * Current active theme
     * @type {string}
     */
    this.currentTheme = options.defaultTheme || 'dark';
    
    /**
     * Storage key for saving theme preference
     * @type {string}
     */
    this.storageKey = options.storageKey || 'sdde_theme_preference';
    
    /**
     * Whether the component is initialized
     * @type {boolean}
     */
    this.initialized = false;
    
    /**
     * Whether to use localStorage for persistent settings
     * @type {boolean}
     */
    this.persistSettings = options.persistSettings !== false;
    
    /**
     * Element that will have the data-theme attribute
     * @type {HTMLElement}
     */
    this.rootElement = options.rootElement || document.documentElement;
    
    // Auto initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the theme controller
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    // Load saved theme from localStorage
    this.loadSavedTheme();
    
    // Apply the current theme
    this.applyTheme(this.currentTheme);
    
    // Set up system theme detection if needed
    this.setupSystemThemeDetection();
    
    // Set up theme toggle buttons
    this.setupThemeToggles();
    
    console.log(`Theme initialized with ${this.currentTheme} theme`);
    this.initialized = true;
  }
  
  /**
   * Load the saved theme from localStorage
   * @private
   * @returns {void}
   */
  loadSavedTheme() {
    if (!this.persistSettings) return;
    
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && this.availableThemes.includes(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Could not access localStorage for theme settings', error);
    }
  }
  
  /**
   * Apply the specified theme to the document
   * @param {string} theme - Theme name to apply
   * @returns {boolean} Success status
   */
  applyTheme(theme) {
    // Validate theme
    if (!this.availableThemes.includes(theme)) {
      console.error(`Theme "${theme}" is not available`);
      return false;
    }
    
    // Remove all theme classes first
    this.availableThemes.forEach(t => {
      this.rootElement.classList.remove(`theme-${t}`);
    });
    
    // Set data-theme attribute
    this.rootElement.setAttribute('data-theme', theme);
    
    // Add theme class
    this.rootElement.classList.add(`theme-${theme}`);
    
    // Update current theme
    this.currentTheme = theme;
    
    // Save to localStorage if enabled
    this.saveThemePreference();
    
    // Dispatch theme change event
    this.dispatchThemeChangeEvent();
    
    return true;
  }
  
  /**
   * Save the current theme preference to localStorage
   * @private
   * @returns {void}
   */
  saveThemePreference() {
    if (!this.persistSettings) return;
    
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Could not save theme setting to localStorage', error);
    }
  }
  
  /**
   * Toggle between light and dark themes
   * @returns {string} The new active theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  }
  
  /**
   * Switch to a specific theme
   * @param {string} theme - The theme to switch to
   * @returns {boolean} Success status
   */
  setTheme(theme) {
    return this.applyTheme(theme);
  }
  
  /**
   * Get the current active theme
   * @returns {string} The current theme
   */
  getTheme() {
    return this.currentTheme;
  }
  
  /**
   * Set up detection for system theme preference changes
   * @private
   * @returns {void}
   */
  setupSystemThemeDetection() {
    // Check if the browser supports prefers-color-scheme
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Define handler function
      const handleSystemThemeChange = (e) => {
        // Only auto-switch if no explicit user preference is saved
        if (!localStorage.getItem(this.storageKey)) {
          const systemTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(systemTheme);
        }
      };
      
      // Set initial theme based on system preference if no saved preference
      if (!localStorage.getItem(this.storageKey)) {
        const systemTheme = darkModeMediaQuery.matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
      }
      
      // Add listener for changes
      try {
        // Try using the modern API (newer browsers)
        darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
      } catch (error) {
        // Fall back to deprecated API (older browsers)
        darkModeMediaQuery.addListener(handleSystemThemeChange);
      }
    }
  }
  
  /**
   * Set up event listeners for theme toggle buttons
   * @private
   * @returns {void}
   */
  setupThemeToggles() {
    // Find theme toggle elements
    const toggles = document.querySelectorAll(
      '.theme-toggle, [data-theme-toggle], #theme-toggle'
    );
    
    // Add click handlers
    toggles.forEach(toggle => {
      // Skip if already initialized
      if (toggle.dataset.themeInitialized === 'true') return;
      
      toggle.addEventListener('click', () => {
        // If a specific theme is specified in the data attribute, use it
        if (toggle.dataset.theme && this.availableThemes.includes(toggle.dataset.theme)) {
          this.applyTheme(toggle.dataset.theme);
        } else {
          // Otherwise toggle between light and dark
          this.toggleTheme();
        }
      });
      
      // Mark as initialized
      toggle.dataset.themeInitialized = 'true';
    });
  }
  
  /**
   * Create a theme toggle button
   * @param {Object} options - Button options
   * @param {string} [options.position='bottom-right'] - Position of the button
   * @param {HTMLElement} [options.container] - Container to append the button to
   * @returns {HTMLElement} The created button
   */
  createToggleButton(options = {}) {
    const position = options.position || 'bottom-right';
    const container = options.container || document.body;
    
    // Create container if not exists
    let toggleContainer = document.querySelector(`.${styles.themeToggleContainer}`);
    
    if (!toggleContainer) {
      toggleContainer = document.createElement('div');
      toggleContainer.className = styles.themeToggleContainer;
      toggleContainer.classList.add(styles[`position-${position}`]);
      
      // Create button
      const button = document.createElement('button');
      button.id = 'theme-toggle';
      button.className = styles.themeToggleButton;
      button.setAttribute('aria-label', 'Toggle theme');
      button.setAttribute('title', 'Toggle light/dark theme');
      
      // Create icons
      const lightIcon = document.createElement('span');
      lightIcon.className = styles.themeToggleLight;
      lightIcon.innerHTML = '☀️';
      
      const darkIcon = document.createElement('span');
      darkIcon.className = styles.themeToggleDark;
      darkIcon.innerHTML = '🌙';
      
      // Add click handler
      button.addEventListener('click', () => this.toggleTheme());
      
      // Assemble button
      button.appendChild(lightIcon);
      button.appendChild(darkIcon);
      toggleContainer.appendChild(button);
      
      // Add to container
      container.appendChild(toggleContainer);
    }
    
    return toggleContainer;
  }
  
  /**
   * Dispatch a theme change event
   * @private
   * @returns {void}
   */
  dispatchThemeChangeEvent() {
    document.dispatchEvent(new CustomEvent('theme-changed', {
      detail: {
        theme: this.currentTheme
      }
    }));
  }
}

export default Theme; 