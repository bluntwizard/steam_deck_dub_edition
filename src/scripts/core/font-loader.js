/**
 * Font Loader Script
 * Handles font loading and accessibility preferences
 */

class FontLoader {
  constructor() {
    this.fontPreference = localStorage.getItem('fontPreference') || 'default';
    this.dyslexicMode = localStorage.getItem('dyslexicMode') === 'true';
    this.initFontOptions();
  }

  /**
   * Initialize font preference options
   */
  initFontOptions() {
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
   * @param {string} preference - The font preference to apply
   */
  applyFontPreference(preference) {
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
   * Add font controls to preferences panel
   */
  addFontControlsToPreferences() {
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
    const fontSelect = document.getElementById('font-preference');
    fontSelect.value = this.fontPreference;
    fontSelect.addEventListener('change', (e) => {
      this.applyFontPreference(e.target.value);
    });
    
    const dyslexicCheck = document.getElementById('dyslexic-mode');
    dyslexicCheck.addEventListener('change', (e) => {
      this.dyslexicMode = e.target.checked;
      document.body.classList.toggle('dyslexic-mode', this.dyslexicMode);
      localStorage.setItem('dyslexicMode', this.dyslexicMode);
    });
  }
}

// Initialize the font loader
const fontLoader = new FontLoader();
