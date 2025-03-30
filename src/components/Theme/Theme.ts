/**
 * Grimoire
 * Theme Component
 * 
 * Manages theme settings and switching between light and dark themes
 */

import styles from './Theme.module.css';

// Define theme options interface
interface ThemeOptions {
  themes?: string[];
  defaultTheme?: string;
  storageKey?: string;
  persistSettings?: boolean;
  rootElement?: HTMLElement;
  autoInit?: boolean;
}

// Define custom event interface
interface ThemeChangedEventDetail {
  theme: string;
  previousTheme: string;
}

class Theme {
  /**
   * Available themes in the application
   */
  private availableThemes: string[];
  
  /**
   * Current active theme
   */
  private currentTheme: string;
  
  /**
   * Storage key for saving theme preference
   */
  private storageKey: string;
  
  /**
   * Whether the component is initialized
   */
  private initialized: boolean;
  
  /**
   * Whether to use localStorage for persistent settings
   */
  private persistSettings: boolean;
  
  /**
   * Element that will have the data-theme attribute
   */
  private rootElement: HTMLElement;
  
  /**
   * Initialize a new theme manager
   */
  constructor(options: ThemeOptions = {}) {
    this.availableThemes = options.themes || ['light', 'dark', 'dracula', 'high-contrast'];
    this.currentTheme = options.defaultTheme || 'dark';
    this.storageKey = options.storageKey || 'sdde_theme_preference';
    this.initialized = false;
    this.persistSettings = options.persistSettings !== false;
    this.rootElement = options.rootElement || document.documentElement;
    
    // Auto initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the theme controller
   */
  initialize(): void {
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
   */
  private loadSavedTheme(): void {
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
   * @param theme - Theme name to apply
   * @returns Success status
   */
  applyTheme(theme: string): boolean {
    // Validate theme
    if (!this.availableThemes.includes(theme)) {
      console.error(`Theme "${theme}" is not available`);
      return false;
    }
    
    // Store previous theme for event
    const previousTheme = this.currentTheme;
    
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
    this.dispatchThemeChangeEvent(previousTheme);
    
    return true;
  }
  
  /**
   * Save the current theme preference to localStorage
   * @private
   */
  private saveThemePreference(): void {
    if (!this.persistSettings) return;
    
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Could not save theme setting to localStorage', error);
    }
  }
  
  /**
   * Toggle between light and dark themes
   * @returns The new active theme
   */
  toggleTheme(): string {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  }
  
  /**
   * Switch to a specific theme
   * @param theme - The theme to switch to
   * @returns Success status
   */
  setTheme(theme: string): boolean {
    return this.applyTheme(theme);
  }
  
  /**
   * Get the current active theme
   * @returns The current theme
   */
  getTheme(): string {
    return this.currentTheme;
  }
  
  /**
   * Set up detection for system theme preference changes
   * @private
   */
  private setupSystemThemeDetection(): void {
    // Check if the browser supports prefers-color-scheme
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Define handler function
      const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
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
      } catch (e) {
        // Fallback for older browsers
        // @ts-ignore: Older browsers MediaQueryList implementation
        darkModeMediaQuery.addListener(handleSystemThemeChange);
      }
    }
  }
  
  /**
   * Set up theme toggle buttons
   * @private
   */
  private setupThemeToggles(): void {
    // Find all toggle buttons with data-theme-toggle attribute
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Update button state
      this.updateToggleButtonState(button as HTMLElement);
    });
  }
  
  /**
   * Create a theme toggle button with icon and label
   * @param options - Button creation options
   * @returns The created button element
   */
  createToggleButton(options: {
    parent?: HTMLElement;
    className?: string;
    lightIcon?: string;
    darkIcon?: string;
    lightText?: string;
    darkText?: string;
  } = {}): HTMLButtonElement {
    const button = document.createElement('button');
    
    // Add classes
    button.classList.add('theme-toggle');
    if (options.className) {
      button.classList.add(options.className);
    }
    
    // Set data attribute
    button.setAttribute('data-theme-toggle', '');
    button.setAttribute('aria-label', 'Toggle theme');
    
    // Create icon and text elements
    const iconEl = document.createElement('span');
    iconEl.classList.add('theme-toggle-icon');
    
    const textEl = document.createElement('span');
    textEl.classList.add('theme-toggle-text');
    
    // Add to button
    button.appendChild(iconEl);
    button.appendChild(textEl);
    
    // Add click handler
    button.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Update initial state
    this.updateToggleButtonState(button);
    
    // Add to parent if specified
    if (options.parent) {
      options.parent.appendChild(button);
    }
    
    return button;
  }
  
  /**
   * Update a toggle button to reflect current theme
   * @private
   * @param button - The button element to update
   */
  private updateToggleButtonState(button: HTMLElement): void {
    const isDark = this.currentTheme === 'dark';
    const iconEl = button.querySelector('.theme-toggle-icon') as HTMLElement | null;
    const textEl = button.querySelector('.theme-toggle-text') as HTMLElement | null;
    
    if (isDark) {
      button.setAttribute('data-theme-state', 'dark');
      if (iconEl) iconEl.textContent = '🌙';
      if (textEl) textEl.textContent = 'Dark Mode';
    } else {
      button.setAttribute('data-theme-state', 'light');
      if (iconEl) iconEl.textContent = '☀️';
      if (textEl) textEl.textContent = 'Light Mode';
    }
  }
  
  /**
   * Dispatch a custom event when theme changes
   * @private
   * @param previousTheme - The theme that was active before the change
   */
  private dispatchThemeChangeEvent(previousTheme: string = ''): void {
    const event = new CustomEvent<ThemeChangedEventDetail>('themeChanged', {
      bubbles: true,
      detail: {
        theme: this.currentTheme,
        previousTheme: previousTheme
      }
    });
    
    window.dispatchEvent(event);
  }
}

export default Theme; 