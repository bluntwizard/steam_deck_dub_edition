/**
 * Settings Manager Component
 * Handles settings tab navigation and integration with accessibility features
 * For Grimoire
 */

import i18n from '../i18n.js';
import { accessibilityManager } from '../utils/accessibility.js';

class SettingsManager {
  constructor() {
    this.initialized = false;
    this.activeTab = 'general';
    this.settingsSection = null;
    this.tabButtons = [];
    this.tabPanes = [];
  }

  /**
   * Initialize the settings manager
   */
  async initialize() {
    if (this.initialized) return;
    
    // Get elements
    this.settingsSection = document.getElementById('settings-section');
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabPanes = document.querySelectorAll('.tab-pane');
    
    // Setup event listeners for tab buttons
    this.setupTabNavigation();
    
    // Setup language selector
    this.setupLanguageSelector();
    
    // Setup theme selector
    this.setupThemeSelector();
    
    // Add settings toggle to header
    this.createSettingsToggle();
    
    this.initialized = true;
    console.log('Settings manager initialized');
  }
  
  /**
   * Set up event listeners for tab navigation
   */
  setupTabNavigation() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        this.switchToTab(tabName);
      });
    });
  }
  
  /**
   * Switch to a specific settings tab
   * @param {string} tabName - Name of the tab to switch to
   */
  switchToTab(tabName) {
    // Update active tab
    this.activeTab = tabName;
    
    // Update tab button active states
    this.tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    // Update tab pane visibility
    this.tabPanes.forEach(pane => {
      const isActive = pane.id === `${tabName}-settings`;
      pane.classList.toggle('active', isActive);
    });
  }
  
  /**
   * Set up language selector functionality
   */
  setupLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    if (!languageSelector) return;
    
    // Set initial value
    languageSelector.value = i18n.getCurrentLocale();
    
    // Add change event listener
    languageSelector.addEventListener('change', async () => {
      const newLocale = languageSelector.value;
      const success = await i18n.setLocale(newLocale);
      
      if (success) {
        this.showNotification(i18n.t('settings.language.reloadMessage'), true);
      }
    });
  }
  
  /**
   * Set up theme selector functionality
   */
  setupThemeSelector() {
    const themeSelector = document.getElementById('theme-selector');
    if (!themeSelector) return;
    
    // Set initial value from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelector.value = savedTheme;
    
    // Apply the theme
    this.applyTheme(savedTheme);
    
    // Add change event listener
    themeSelector.addEventListener('change', () => {
      const newTheme = themeSelector.value;
      this.applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
  
  /**
   * Apply the selected theme to the document
   * @param {string} theme - Theme to apply (light, dark, or system)
   */
  applyTheme(theme) {
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      // Use selected theme
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }
  
  /**
   * Create settings toggle button in the header
   */
  createSettingsToggle() {
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // Create settings link
    const settingsLi = document.createElement('li');
    settingsLi.className = 'nav-item';
    
    const settingsLink = document.createElement('a');
    settingsLink.className = 'nav-link';
    settingsLink.href = '#settings';
    settingsLink.setAttribute('data-i18n', 'nav.settings');
    settingsLink.textContent = i18n.t('nav.settings');
    settingsLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="nav-icon">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg> <span>${i18n.t('nav.settings')}</span>`;
    
    settingsLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleSettingsVisibility();
    });
    
    settingsLi.appendChild(settingsLink);
    navbar.appendChild(settingsLi);
  }
  
  /**
   * Toggle settings section visibility
   */
  toggleSettingsVisibility() {
    const homeContent = document.getElementById('home-content');
    
    if (this.settingsSection.style.display === 'none') {
      // Show settings
      this.settingsSection.style.display = 'block';
      if (homeContent) homeContent.style.display = 'none';
    } else {
      // Hide settings
      this.settingsSection.style.display = 'none';
      if (homeContent) homeContent.style.display = 'block';
    }
    
    // Switch to the active tab
    this.switchToTab(this.activeTab);
  }
  
  /**
   * Show a notification to the user
   * @param {string} message - Message to show
   * @param {boolean} isAction - Whether an action button should be shown
   */
  showNotification(message, isAction = false) {
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
      actionButton.textContent = i18n.t('settings.language.reloadNow');
      actionButton.onclick = () => window.location.reload();
      notification.appendChild(actionButton);
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after a delay
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (!isAction) notification.remove();
      }, 300);
    }, isAction ? 10000 : 3000);
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
