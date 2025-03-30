/**
 * Font Loader Script
 * Handles font loading and accessibility preferences
 * Grimoire Guide
 */

/**
 * Font preference options
 */
export type FontPreference = 'default' | 'readable' | 'dyslexic';

/**
 * Font Loader class for handling font preferences and accessibility options
 */
export class FontLoader {
  /** The current font preference */
  private fontPreference: FontPreference;
  
  /** Whether dyslexic mode is enabled */
  private dyslexicMode: boolean;

  /**
   * Initialize the font loader
   */
  constructor() {
    const savedPreference = localStorage.getItem('fontPreference');
    this.fontPreference = (savedPreference as FontPreference) || 'default';
    this.dyslexicMode = localStorage.getItem('dyslexicMode') === 'true';
    this.initFontOptions();
  }

  /**
   * Initialize font preference options
   */
  private initFontOptions(): void {
    document.addEventListener('DOMContentLoaded', () => {
      // Apply saved preferences
      this.applyFontPreference(this.fontPreference);
      
      // Apply dyslexic mode if enabled
      if (this.dyslexicMode) {
        document.body.classList.add('dyslexic-mode');
      }

      // Add font preference controls to preferences panel if it exists
      this.addFontControlsToPreferences();
    });
  }

  /**
   * Apply selected font preference
   * @param preference - The font preference to apply
   */
  public applyFontPreference(preference: FontPreference): void {
    // Remove existing font classes
    document.body.classList.remove('font-default', 'font-readable', 'font-dyslexic');
    
    // Apply selected preference
    switch (preference) {
      case 'readable':
        document.body.classList.add('font-readable');
        break;
      case 'dyslexic':
        document.body.classList.add('font-dyslexic');
        break;
      default:
        document.body.classList.add('font-default');
    }
    
    // Save preference
    this.fontPreference = preference;
    localStorage.setItem('fontPreference', preference);
  }

  /**
   * Toggle dyslexic mode
   * @param enabled - Whether to enable dyslexic mode
   */
  public toggleDyslexicMode(enabled: boolean): void {
    this.dyslexicMode = enabled;
    document.body.classList.toggle('dyslexic-mode', this.dyslexicMode);
    localStorage.setItem('dyslexicMode', this.dyslexicMode.toString());
  }

  /**
   * Get the current font preference
   * @returns The current font preference
   */
  public getFontPreference(): FontPreference {
    return this.fontPreference;
  }

  /**
   * Check if dyslexic mode is enabled
   * @returns True if dyslexic mode is enabled
   */
  public isDyslexicModeEnabled(): boolean {
    return this.dyslexicMode;
  }

  /**
   * Add font controls to preferences panel
   */
  private addFontControlsToPreferences(): void {
    // Check if preferences panel exists
    const preferencesPanel = document.querySelector('.preferences-content');
    if (!preferencesPanel) return;
    
    // Create font section
    const fontSection = document.createElement('div');
    fontSection.className = 'preferences-section';
    fontSection.innerHTML = `
      <h3>Font Options</h3>
      <div class="preferences-option">
        <label>Font Style:</label>
        <select id="font-preference">
          <option value="default">Default</option>
          <option value="readable">High Readability</option>
          <option value="dyslexic">OpenDyslexic</option>
        </select>
      </div>
      <div class="preferences-option">
        <label>
          <input type="checkbox" id="dyslexic-mode" ${this.dyslexicMode ? 'checked' : ''}>
          Enable Dyslexic Mode (Adds extra spacing)
        </label>
      </div>
    `;
    
    // Add to preferences panel
    preferencesPanel.appendChild(fontSection);
    
    // Add event listeners
    const fontSelect = document.getElementById('font-preference') as HTMLSelectElement;
    if (fontSelect) {
      fontSelect.value = this.fontPreference;
      fontSelect.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.applyFontPreference(target.value as FontPreference);
      });
    }
    
    const dyslexicCheck = document.getElementById('dyslexic-mode') as HTMLInputElement;
    if (dyslexicCheck) {
      dyslexicCheck.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.toggleDyslexicMode(target.checked);
      });
    }
  }
}

// Initialize the font loader
export const fontLoader = new FontLoader(); 