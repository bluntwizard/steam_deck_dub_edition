/**
 * Theme Controller for Steam Deck DUB Edition
 * Handles theme switching and persistence
 * 
 * @module Theme
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './Theme.module.css';

/**
 * @typedef {'dark' | 'light' | 'system'} ThemePreference
 * The user's preferred theme setting
 */

/**
 * @typedef {'dark' | 'light'} ActiveTheme
 * The currently active theme (after system preference is resolved)
 */

/**
 * @typedef {Object} ThemeChangeEvent
 * @property {ActiveTheme} theme - The active theme ('dark' or 'light')
 * @property {ThemePreference} preference - The user preference ('dark', 'light', or 'system')
 */

/**
 * @class ThemeController
 * @classdesc Manages UI theme switching and persistence
 */
class ThemeController {
  constructor() {
    /**
     * Current theme ('dark', 'light', 'system')
     * @type {ThemePreference}
     * @private
     */
    this.currentTheme = 'system';
    
    /**
     * List of available themes
     * @type {Array<ThemePreference>}
     * @private
     */
    this.availableThemes = ['dark', 'light', 'system'];
    
    /**
     * Whether the controller is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Storage key for theme preference
     * @type {string}
     * @private
     */
    this.storageKey = 'sdde_theme_preference';
    
    /**
     * Media query for detecting system color scheme
     * @type {MediaQueryList|null}
     * @private
     */
    this.prefersDarkQuery = null;
  }
  
  /**
   * Initialize the theme controller
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    // Set up system preference detection
    this.prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Load saved preference
    this.loadThemePreference();
    
    // Apply current theme
    this.applyTheme();
    
    // Set up theme toggle event listeners
    this.setupEventListeners();
    
    // Set up system preference change listener
    this.prefersDarkQuery.addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    });
    
    this.initialized = true;
    console.log('Theme controller initialized with theme:', this.currentTheme);
  }
  
  /**
   * Load theme preference from localStorage
   * @private
   * @returns {void}
   */
  loadThemePreference() {
    const savedTheme = localStorage.getItem(this.storageKey);
    
    // Validate saved theme
    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Default to system
      this.currentTheme = 'system';
    }
  }
  
  /**
   * Apply the current theme to the document
   * @private
   * @returns {void}
   */
  applyTheme() {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    
    // Determine which theme to apply
    let themeToApply = this.currentTheme;
    
    // If system preference, check OS setting
    if (themeToApply === 'system') {
      themeToApply = this.prefersDarkQuery.matches ? 'dark' : 'light';
    }
    
    // Apply the appropriate class
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
    
    // Update theme toggle buttons if they exist
    this.updateToggleButtons();
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('theme-changed', {
      detail: {
        theme: themeToApply,
        preference: this.currentTheme
      }
    }));
  }
  
  /**
   * Update UI of theme toggle buttons
   * @private
   * @returns {void}
   */
  updateToggleButtons() {
    // Update standard theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      // Update icon or text based on current theme
      const isDark = document.documentElement.classList.contains('dark-theme');
      
      // If the toggle has an icon inside it
      const toggleIcon = themeToggle.querySelector('svg');
      if (toggleIcon) {
        // Different SVG paths for sun/moon icons
        if (isDark) {
          toggleIcon.innerHTML = `
            <path d="M12 3a9 9 0 0 0 9 9m0-9c0 6.627-5.373 12-12 12S0 15.627 0 9 5.373 0 12 0s12 5.373 12 12ZM12 3a9 9 0 0 1 9 9" />
          `;
        } else {
          toggleIcon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          `;
        }
      } else {
        // Text fallback if no icon
        themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
      
      // Update title/aria-label
      themeToggle.setAttribute('aria-label', 
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    
    // Update any radio buttons for theme selection
    document.querySelectorAll('[name="theme-choice"]').forEach(radio => {
      if (radio.value === this.currentTheme) {
        radio.checked = true;
      }
    });
  }

  /**
   * Set up event listeners for theme controls
   * @private
   * @returns {void}
   */
  setupEventListeners() {
    // Simple theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        // Toggle between light and dark
        const isDark = document.documentElement.classList.contains('dark-theme');
        this.setTheme(isDark ? 'light' : 'dark');
      });
    }
    
    // Theme choice radio buttons
    document.querySelectorAll('[name="theme-choice"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.setTheme(radio.value);
        }
      });
    });
    
    // Listen for theme toggle buttons added dynamically
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-theme-toggle]') || e.target.closest('[data-theme-toggle]')) {
        const toggle = e.target.matches('[data-theme-toggle]') 
          ? e.target 
          : e.target.closest('[data-theme-toggle]');
        
        const theme = toggle.dataset.themeValue || '';
        
        if (theme && this.availableThemes.includes(theme)) {
          // Specific theme
          this.setTheme(theme);
        } else {
          // Toggle current theme
          const isDark = document.documentElement.classList.contains('dark-theme');
          this.setTheme(isDark ? 'light' : 'dark');
        }
      }
    });
  }
  
  /**
   * Set the active theme
   * @param {string} theme - The theme to set ('dark', 'light', or 'system')
   * @returns {void}
   */
  setTheme(theme) {
    // Validate theme
    if (!this.availableThemes.includes(theme)) {
      console.error(`Invalid theme: ${theme}. Must be one of: ${this.availableThemes.join(', ')}`);
      return;
    }
    
    // Update current theme
    this.currentTheme = theme;
    
    // Save preference
    localStorage.setItem(this.storageKey, theme);
    
    // Apply theme
    this.applyTheme();
    
    console.log(`Theme set to: ${theme}`);
  }
  
  /**
   * Get the current active theme
   * @returns {string} The current theme ('dark' or 'light')
   */
  getCurrentTheme() {
    // Return the actual applied theme (not preference)
    return document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
  }
  
  /**
   * Get the user's theme preference
   * @returns {string} The user's preference ('dark', 'light', or 'system')
   */
  getThemePreference() {
    return this.currentTheme;
  }
  
  /**
   * Check if the current theme is dark
   * @returns {boolean} True if dark theme is active
   */
  isDarkTheme() {
    return document.documentElement.classList.contains('dark-theme');
  }

  /**
   * Creates a theme toggle button with accessibility features
   * @returns {HTMLElement} The created theme toggle button
   */
  createToggleButton() {
    // Create button
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = styles['theme-toggle-btn'];
    button.setAttribute('aria-label', `Switch to ${this.getNextTheme()} theme`);
    
    // Create icon container
    const iconContainer = document.createElement('span');
    iconContainer.className = styles['theme-icon-container'];
    iconContainer.setAttribute('aria-hidden', 'true');
    
    // Create light mode icon
    const lightIcon = document.createElement('span');
    lightIcon.className = `${styles['theme-icon']} ${styles['light-icon']}`;
    lightIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
      </svg>
    `;
    
    // Create dark mode icon
    const darkIcon = document.createElement('span');
    darkIcon.className = `${styles['theme-icon']} ${styles['dark-icon']}`;
    darkIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
    
    // Create system mode icon (if needed)
    const systemIcon = document.createElement('span');
    systemIcon.className = `${styles['theme-icon']} ${styles['system-icon']}`;
    systemIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <path d="M8 21h8M12 17v4"></path>
      </svg>
    `;
    
    // Append icons to container
    iconContainer.appendChild(lightIcon);
    iconContainer.appendChild(darkIcon);
    iconContainer.appendChild(systemIcon);
    
    // Add text for screen readers
    const srText = document.createElement('span');
    srText.className = styles['sr-only'];
    srText.textContent = `Current theme: ${this.getCurrentThemeLabel()}`;
    srText.id = 'theme-status';
    
    // Append children to button
    button.appendChild(iconContainer);
    button.appendChild(srText);
  
    // Add event listener
    button.addEventListener('click', () => {
      this.toggleTheme();
      
      // Update the aria-label and status text
      button.setAttribute('aria-label', `Switch to ${this.getNextTheme()} theme`);
      srText.textContent = `Current theme: ${this.getCurrentThemeLabel()}`;
      
      // Announce theme change to screen readers
      this.announceThemeChange();
    });
    
    return button;
  }

  /**
   * Toggle through the available themes
   */
  toggleTheme() {
    const currentIndex = this.availableThemes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.availableThemes.length;
    this.setTheme(this.availableThemes[nextIndex]);
  }

  /**
   * Gets the next theme in rotation
   * @private
   * @returns {string} The name of the next theme
   */
  getNextTheme() {
    const currentIndex = this.availableThemes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.availableThemes.length;
    const nextTheme = this.availableThemes[nextIndex];
    
    return this.getThemeLabel(nextTheme);
  }

  /**
   * Gets a human-readable label for the theme
   * @private
   * @param {ThemePreference} theme - The theme preference
   * @returns {string} A human-readable label
   */
  getThemeLabel(theme) {
    switch (theme) {
      case 'dark': return 'Dark';
      case 'light': return 'Light';
      case 'system': return 'System';
      default: return theme;
    }
  }

  /**
   * Gets the label for the current theme
   * @private
   * @returns {string} A human-readable label for the current theme
   */
  getCurrentThemeLabel() {
    return this.getThemeLabel(this.currentTheme);
  }

  /**
   * Announce theme change to screen readers
   * @private
   */
  announceThemeChange() {
    let announcer = document.getElementById('theme-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'theme-announcer';
      announcer.className = styles['sr-only'];
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = `Theme changed to ${this.getCurrentThemeLabel()}`;
    
    // Clear after a delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// Create singleton instance
const themeController = new ThemeController();

// Export the singleton
export default themeController; 