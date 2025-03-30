/**
 * Accessibility manager for Steam Deck DUB Edition
 * Handles accessibility features like dyslexic font, high contrast mode, and other settings
 * to make the application more accessible to all users.
 */

// We'll handle the i18n import once that module is converted to TypeScript
// import i18n from '../i18n.js';

/**
 * Interface for user accessibility preferences
 */
export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  dyslexicFont: boolean;
  lineSpacing: 'normal' | 'wide' | 'wider';
  readingGuide: boolean;
}

/**
 * Custom event types for accessibility events
 */
interface FontSizeChangedEvent extends CustomEvent {
  detail: { fontSize: AccessibilityPreferences['fontSize'] };
}

interface FeatureToggleEvent extends CustomEvent {
  detail: { enabled: boolean };
}

interface LineSpacingChangedEvent extends CustomEvent {
  detail: { spacing: AccessibilityPreferences['lineSpacing'] };
}

/**
 * Default accessibility preferences
 */
const defaultPreferences: AccessibilityPreferences = {
  fontSize: 'medium',      // small, medium, large, xlarge
  highContrast: false,     // true or false 
  dyslexicFont: false,     // true or false
  lineSpacing: 'normal',   // normal, wide, wider
  readingGuide: false      // true or false
};

/**
 * Manages all accessibility features and user preferences for the application.
 * Provides methods to change font size, toggle high contrast mode, enable dyslexic fonts,
 * adjust line spacing, and enable reading guides.
 */
class AccessibilityManager {
  /**
   * User accessibility preferences
   */
  private preferences: AccessibilityPreferences;
  
  /**
   * Whether the manager has been initialized
   */
  private initialized: boolean;
  
  /**
   * Reference to the reading guide element if active
   */
  private readingGuideElement: HTMLElement | null;
  
  /**
   * Creates a new AccessibilityManager instance
   */
  constructor() {
    this.preferences = { ...defaultPreferences };
    this.initialized = false;
    this.readingGuideElement = null;
  }

  /**
   * Initialize the accessibility manager
   * Loads saved preferences from localStorage and applies them
   * Sets up event listeners for preference changes
   */
  async initialize(): Promise<void> {
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
   */
  private loadPreferences(): void {
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
   */
  private savePreferences(): void {
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
  public applyPreferences(): void {
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
  private setupEventListeners(): void {
    // Listen for font size changes
    document.addEventListener('font-size-changed', ((event: Event) => {
      const customEvent = event as FontSizeChangedEvent;
      const { fontSize } = customEvent.detail;
      this.setFontSize(fontSize);
      this.preferences.fontSize = fontSize;
      this.savePreferences();
    }) as EventListener);
    
    // Listen for high contrast changes
    document.addEventListener('high-contrast-changed', ((event: Event) => {
      const customEvent = event as FeatureToggleEvent;
      const { enabled } = customEvent.detail;
      this.setHighContrast(enabled);
      this.preferences.highContrast = enabled;
      this.savePreferences();
    }) as EventListener);
    
    // Listen for dyslexic font changes
    document.addEventListener('dyslexic-font-changed', ((event: Event) => {
      const customEvent = event as FeatureToggleEvent;
      const { enabled } = customEvent.detail;
      this.setDyslexicFont(enabled);
      this.preferences.dyslexicFont = enabled;
      this.savePreferences();
    }) as EventListener);
    
    // Listen for line spacing changes
    document.addEventListener('line-spacing-changed', ((event: Event) => {
      const customEvent = event as LineSpacingChangedEvent;
      const { spacing } = customEvent.detail;
      this.setLineSpacing(spacing);
      this.preferences.lineSpacing = spacing;
      this.savePreferences();
    }) as EventListener);
    
    // Listen for reading guide changes
    document.addEventListener('reading-guide-changed', ((event: Event) => {
      const customEvent = event as FeatureToggleEvent;
      const { enabled } = customEvent.detail;
      this.setReadingGuide(enabled);
      this.preferences.readingGuide = enabled;
      this.savePreferences();
    }) as EventListener);
  }

  /**
   * Set font size
   * @param size - The font size (small, medium, large, xlarge)
   */
  public setFontSize(size: AccessibilityPreferences['fontSize']): void {
    // Remove existing font size classes
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    
    // Add new font size class
    document.documentElement.classList.add(`font-${size}`);
    console.log(`Font size set to ${size}`);
  }

  /**
   * Toggle high contrast mode
   * @param enabled - Whether high contrast is enabled
   */
  public setHighContrast(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    console.log(`High contrast ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle dyslexic font
   * @param enabled - Whether dyslexic font is enabled
   */
  public setDyslexicFont(enabled: boolean): void {
    if (enabled) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    console.log(`Dyslexic font ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set line spacing
   * @param spacing - Line spacing (normal, wide, wider)
   */
  public setLineSpacing(spacing: AccessibilityPreferences['lineSpacing']): void {
    // Remove existing line spacing classes
    document.documentElement.classList.remove('line-spacing-normal', 'line-spacing-wide', 'line-spacing-wider');
    
    // Add new line spacing class
    document.documentElement.classList.add(`line-spacing-${spacing}`);
    console.log(`Line spacing set to ${spacing}`);
  }

  /**
   * Toggle reading guide
   * @param enabled - Whether reading guide is enabled
   */
  public setReadingGuide(enabled: boolean): void {
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
   * Create reading guide element and attach event listeners
   */
  private createReadingGuide(): void {
    if (this.readingGuideElement) return;
    
    // Create the reading guide element
    this.readingGuideElement = document.createElement('div');
    this.readingGuideElement.className = 'reading-guide-line';
    
    // Add to document
    document.body.appendChild(this.readingGuideElement);
    
    // Position at mouse position
    document.addEventListener('mousemove', this.moveReadingGuide);
  }

  /**
   * Move reading guide to follow mouse position
   */
  private moveReadingGuide = (event: MouseEvent): void => {
    if (!this.readingGuideElement) return;
    
    this.readingGuideElement.style.top = `${event.clientY}px`;
  };

  /**
   * Remove reading guide element and event listeners
   */
  private removeReadingGuide(): void {
    if (!this.readingGuideElement) return;
    
    // Remove event listener
    document.removeEventListener('mousemove', this.moveReadingGuide);
    
    // Remove element
    this.readingGuideElement.remove();
    this.readingGuideElement = null;
  }

  /**
   * Get current accessibility preferences
   * @returns The current preferences
   */
  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Reset all preferences to defaults
   */
  public resetToDefaults(): void {
    this.preferences = { ...defaultPreferences };
    this.applyPreferences();
    this.savePreferences();
    console.log('Accessibility preferences reset to defaults');
  }
}

// Export a singleton instance
const accessibilityManager = new AccessibilityManager();
export default accessibilityManager; 