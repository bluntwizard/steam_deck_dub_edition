/**
 * Settings Manager Component
 * Grimoire
 * 
 * Handles settings tab navigation and integration with accessibility features
 */

import { store, actions, selectors, type UserPreferences } from '../state';
// Import as default if accessibilityManager is the default export
import accessibilityManager from '../utils/accessibility';

/**
 * SettingsManager class for handling application settings
 */
class SettingsManager {
  /**
   * Whether the settings manager has been initialized
   */
  private initialized: boolean = false;
  
  /**
   * References to DOM elements
   */
  private settingsSection: HTMLElement | null = null;
  private tabButtons: NodeListOf<HTMLElement> | [] = [];
  private tabPanes: NodeListOf<HTMLElement> | [] = [];
  
  /**
   * Initialize the settings manager
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Get elements
    this.settingsSection = document.getElementById('settings-section');
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabPanes = document.querySelectorAll('.tab-pane');
    
    // Set up tab navigation
    this.setupTabNavigation();
    
    // Set up language selector
    this.setupLanguageSelector();
    
    // Set up theme selector
    this.setupThemeSelector();
    
    // Add settings toggle to header
    this.createSettingsToggle();
    
    // Subscribe to store updates
    this.subscribeToStoreUpdates();
    
    this.initialized = true;
    console.log('Settings manager initialized');
  }
  
  /**
   * Set up event listeners for tab navigation
   */
  private setupTabNavigation(): void {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        if (tabName) {
          this.switchToTab(tabName);
        }
      });
    });
  }
  
  /**
   * Switch to a specific settings tab
   */
  public switchToTab(tabName: string): void {
    // Update active tab in store
    actions.setActiveTab(tabName);
    
    // Update tab button active states
    this.tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
      
      // Update ARIA attributes
      if (button.dataset.tab === tabName) {
        button.setAttribute('aria-selected', 'true');
        button.setAttribute('tabindex', '0');
      } else {
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('tabindex', '-1');
      }
    });
    
    // Update tab pane visibility
    this.tabPanes.forEach(pane => {
      const isActive = pane.id === `${tabName}-settings`;
      pane.classList.toggle('active', isActive);
      pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      
      // Set focus on the active pane for screen readers
      if (isActive) {
        pane.setAttribute('tabindex', '0');
      } else {
        pane.setAttribute('tabindex', '-1');
      }
    });
  }
  
  /**
   * Set up language selector functionality
   */
  private setupLanguageSelector(): void {
    const languageSelector = document.getElementById('language-selector') as HTMLSelectElement | null;
    if (!languageSelector) return;
    
    // Set initial value
    const currentLanguage = selectors.getLanguage();
    languageSelector.value = currentLanguage;
    
    // Add change event listener
    languageSelector.addEventListener('change', () => {
      const newLanguage = languageSelector.value;
      actions.setLanguage(newLanguage);
      
      // Show notification about language change
      this.showNotification('Language changed. Page reload required for full effect.', true);
    });
  }
  
  /**
   * Set up theme selector functionality
   */
  private setupThemeSelector(): void {
    const themeSelector = document.getElementById('theme-selector') as HTMLSelectElement | null;
    if (!themeSelector) return;
    
    // Set initial value from store
    const currentTheme = selectors.getTheme();
    themeSelector.value = currentTheme;
    
    // Add change event listener
    themeSelector.addEventListener('change', () => {
      const newTheme = themeSelector.value as 'light' | 'dark' | 'system';
      actions.setTheme(newTheme);
    });
  }
  
  /**
   * Create settings toggle button in the header
   */
  private createSettingsToggle(): void {
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // Create settings link
    const settingsLi = document.createElement('li');
    settingsLi.className = 'nav-item';
    
    const settingsLink = document.createElement('a');
    settingsLink.className = 'nav-link';
    settingsLink.href = '#settings';
    settingsLink.setAttribute('aria-label', 'Settings');
    settingsLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="nav-icon" aria-hidden="true">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg> <span>Settings</span>`;
    
    settingsLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleSettingsVisibility();
    });
    
    // Make settings link accessible
    settingsLink.setAttribute('role', 'button');
    settingsLink.setAttribute('aria-haspopup', 'dialog');
    
    settingsLi.appendChild(settingsLink);
    navbar.appendChild(settingsLi);
  }
  
  /**
   * Toggle settings section visibility
   */
  public toggleSettingsVisibility(): void {
    const isVisible = selectors.isSettingsVisible();
    actions.setShowSettings(!isVisible);
  }
  
  /**
   * Subscribe to store updates
   */
  private subscribeToStoreUpdates(): void {
    // Subscribe to UI state changes
    store.subscribe('ui', state => {
      // Update settings visibility
      this.updateSettingsVisibility(state.showSettings);
      
      // Update active tab
      if (state.activeTab !== selectors.getActiveTab()) {
        this.switchToTab(state.activeTab);
      }
    });
    
    // Subscribe to preference changes
    store.subscribe('preferences', state => {
      // Update theme
      this.updateThemeSelector(state.theme);
      
      // Update language
      this.updateLanguageSelector(state.language);
    });
  }
  
  /**
   * Update settings visibility based on store state
   */
  private updateSettingsVisibility(isVisible: boolean): void {
    if (!this.settingsSection) return;
    
    const homeContent = document.getElementById('home-content');
    
    if (isVisible) {
      // Show settings
      this.settingsSection.style.display = 'block';
      if (homeContent) homeContent.style.display = 'none';
      
      // Set focus on the settings section for accessibility
      this.settingsSection.setAttribute('tabindex', '-1');
      this.settingsSection.focus();
    } else {
      // Hide settings
      this.settingsSection.style.display = 'none';
      if (homeContent) homeContent.style.display = 'block';
    }
  }
  
  /**
   * Update theme selector UI
   */
  private updateThemeSelector(theme: 'light' | 'dark' | 'system'): void {
    const themeSelector = document.getElementById('theme-selector') as HTMLSelectElement | null;
    if (themeSelector && themeSelector.value !== theme) {
      themeSelector.value = theme;
    }
  }
  
  /**
   * Update language selector UI
   */
  private updateLanguageSelector(language: string): void {
    const languageSelector = document.getElementById('language-selector') as HTMLSelectElement | null;
    if (languageSelector && languageSelector.value !== language) {
      languageSelector.value = language;
    }
  }
  
  /**
   * Show a notification to the user
   */
  public showNotification(message: string, isAction: boolean = false): void {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('settings-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'settings-notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Set notification content
    notification.textContent = message;
    
    // Add action button if needed
    if (isAction) {
      const actionButton = document.createElement('button');
      actionButton.className = 'notification-action';
      actionButton.textContent = 'Reload Now';
      actionButton.onclick = () => window.location.reload();
      notification.appendChild(actionButton);
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Ensure notification is accessible
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // Hide after a delay
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (!isAction) notification.remove();
      }, 300);
    }, isAction ? 10000 : 3000);
  }
  
  /**
   * Get a setting value
   */
  public getSetting<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return selectors.getPreferences()[key];
  }
  
  /**
   * Set a setting value
   */
  public setSetting<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    store.setState('preferences', { [key]: value });
  }
  
  /**
   * Reset all settings to defaults
   */
  public resetAllSettings(): void {
    actions.resetAll();
  }
  
  /**
   * Check if settings manager is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Create singleton instance
const settingsManager = new SettingsManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  settingsManager.initialize();
});

// Export the singleton instance
export default settingsManager; 