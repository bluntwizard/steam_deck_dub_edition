/**
 * Settings Component for Steam Deck DUB Edition
 * Provides a unified interface for managing user preferences
 */

import i18n from '../i18n.js';
import accessibilityManager from '../utils/accessibility';

/**
 * Interface for section configuration
 */
interface SettingsSection {
  id: string;
  icon: string;
  label: string;
}

/**
 * Interface for toggle switch callbacks
 */
type ToggleSwitchCallback = (checked: boolean) => void;

/**
 * Interface for cache information
 */
interface CacheInfo {
  name: string;
  size: number;
}

/**
 * Settings Manager class for managing application settings
 */
class SettingsManager {
  /**
   * Whether the settings manager has been initialized
   */
  private initialized: boolean;
  
  /**
   * The main settings container element
   */
  private settingsContainer: HTMLElement | null;
  
  /**
   * The current active settings section
   */
  private currentSection: string;
  
  /**
   * The settings button element
   */
  private settingsButton!: HTMLButtonElement;
  
  /**
   * Creates a new SettingsManager instance
   */
  constructor() {
    this.initialized = false;
    this.settingsContainer = null;
    this.currentSection = 'appearance';
    
    // Cache DOM elements
    this.cacheElements();
    
    // Initialize event listeners for settings dialog
    this.initEventListeners();
  }
  
  /**
   * Cache DOM elements for performance
   */
  private cacheElements(): void {
    this.settingsButton = document.getElementById('settings-button') as HTMLButtonElement || this.createSettingsButton();
  }
  
  /**
   * Create settings button if it doesn't exist
   */
  private createSettingsButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'settings-button';
    button.className = 'icon-button settings-icon';
    button.setAttribute('aria-label', i18n.t('settings.title'));
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
    
    // Append to header if it exists, otherwise to body
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
    
    return button;
  }
  
  /**
   * Initialize settings UI and event listeners
   */
  private initEventListeners(): void {
    // Settings button click
    this.settingsButton.addEventListener('click', () => this.openSettings());
    
    // Initialize service worker message handler for cache operations
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data as { action: string; message: string } | undefined;
        if (data && data.action === 'clearCache') {
          console.log('Cache cleared:', data.message);
          // Update cache status if settings is open
          if (this.initialized && this.settingsContainer) {
            this.updateCacheInfo();
          }
        }
      });
    }
  }
  
  /**
   * Open the settings dialog
   */
  public openSettings(): void {
    // Create settings container if it doesn't exist
    if (!this.settingsContainer) {
      this.createSettingsUI();
    } else {
      // Just show it if it exists
      this.settingsContainer.classList.add('open');
      // Update dynamic content
      this.updateCacheInfo();
    }
    
    // Set focus to first focusable element for accessibility
    setTimeout(() => {
      const firstFocusable = this.settingsContainer?.querySelector('button, [tabindex="0"]');
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    }, 100);
  }
  
  /**
   * Close the settings dialog
   */
  public closeSettings(): void {
    if (this.settingsContainer) {
      this.settingsContainer.classList.remove('open');
      // Return focus to settings button
      this.settingsButton.focus();
    }
  }
  
  /**
   * Create the settings UI
   */
  private createSettingsUI(): void {
    // Create container
    this.settingsContainer = document.createElement('div');
    this.settingsContainer.className = 'settings-container';
    this.settingsContainer.setAttribute('role', 'dialog');
    this.settingsContainer.setAttribute('aria-labelledby', 'settings-title');
    
    // Create header
    const header = document.createElement('header');
    header.className = 'settings-header';
    
    const title = document.createElement('h2');
    title.id = 'settings-title';
    title.textContent = i18n.t('settings.title');
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.setAttribute('aria-label', i18n.t('common.close'));
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.closeSettings());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create main container with sidebar and content
    const mainContainer = document.createElement('div');
    mainContainer.className = 'settings-main';
    
    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'settings-sidebar';
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'settings-content';
    
    // Add sidebar navigation
    this.createSidebarNavigation(sidebar, content);
    
    // Assemble the UI
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(content);
    
    this.settingsContainer.appendChild(header);
    this.settingsContainer.appendChild(mainContainer);
    
    // Add to document
    document.body.appendChild(this.settingsContainer);
    
    // Show settings
    setTimeout(() => {
      if (this.settingsContainer) {
        this.settingsContainer.classList.add('open');
      }
    }, 10);
    
    // Load initial section
    this.showSection(this.currentSection, content);
    
    // Add escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsContainer && this.settingsContainer.classList.contains('open')) {
        this.closeSettings();
      }
    });
    
    // Prevent clicks inside from closing
    this.settingsContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Mark as initialized
    this.initialized = true;
  }
  
  /**
   * Create the sidebar navigation
   */
  private createSidebarNavigation(sidebar: HTMLElement, contentContainer: HTMLElement): void {
    const sections: SettingsSection[] = [
      { id: 'appearance', icon: '🎨', label: i18n.t('settings.appearance') },
      { id: 'language', icon: '🌐', label: i18n.t('settings.language.title') },
      { id: 'accessibility', icon: '♿', label: i18n.t('settings.accessibility.title') },
      { id: 'content', icon: '📚', label: i18n.t('settings.content.title') }
    ];
    
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', i18n.t('settings.title'));
    
    const ul = document.createElement('ul');
    
    sections.forEach(section => {
      const li = document.createElement('li');
      
      const button = document.createElement('button');
      button.className = `settings-nav-item ${section.id === this.currentSection ? 'active' : ''}`;
      button.setAttribute('aria-controls', `settings-section-${section.id}`);
      button.setAttribute('aria-selected', section.id === this.currentSection ? 'true' : 'false');
      
      const icon = document.createElement('span');
      icon.className = 'settings-icon';
      icon.textContent = section.icon;
      
      const label = document.createElement('span');
      label.textContent = section.label;
      
      button.appendChild(icon);
      button.appendChild(label);
      
      // Add event listener to switch sections
      button.addEventListener('click', () => {
        // Update active button in sidebar
        const activeButtons = sidebar.querySelectorAll('.settings-nav-item.active');
        activeButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        
        // Show the selected section
        this.showSection(section.id, contentContainer);
      });
      
      li.appendChild(button);
      ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    sidebar.appendChild(nav);
  }
  
  /**
   * Show a specific settings section
   */
  private showSection(sectionId: string, container: HTMLElement): void {
    // Clear current content
    container.innerHTML = '';
    
    // Store current section
    this.currentSection = sectionId;
    
    // Create section container
    const section = document.createElement('section');
    section.id = `settings-section-${sectionId}`;
    section.className = 'settings-section';
    section.setAttribute('aria-labelledby', `${sectionId}-title`);
    
    // Create section title
    const sectionTitle = document.createElement('h3');
    sectionTitle.id = `${sectionId}-title`;
    sectionTitle.className = 'settings-section-title';
    
    // Load the appropriate section
    switch (sectionId) {
      case 'appearance':
        sectionTitle.textContent = i18n.t('settings.appearance');
        this.createAppearanceSection(section);
        break;
      case 'language':
        sectionTitle.textContent = i18n.t('settings.language.title');
        this.createLanguageSection(section);
        break;
      case 'accessibility':
        sectionTitle.textContent = i18n.t('settings.accessibility.title');
        this.createAccessibilitySection(section);
        break;
      case 'content':
        sectionTitle.textContent = i18n.t('settings.content.title');
        this.createContentSection(section);
        break;
    }
    
    container.appendChild(sectionTitle);
    container.appendChild(section);
  }
  
  /**
   * Create appearance settings section
   */
  private createAppearanceSection(container: HTMLElement): void {
    // Theme selection
    const themeGroup = document.createElement('div');
    themeGroup.className = 'settings-group';
    
    const themeLabel = document.createElement('h4');
    themeLabel.textContent = i18n.t('settings.theme.title');
    
    const themeDesc = document.createElement('p');
    themeDesc.className = 'settings-description';
    themeDesc.textContent = i18n.t('settings.theme.description');
    
    const themeOptions = document.createElement('div');
    themeOptions.className = 'theme-options';
    
    const themes = [
      { id: 'system', label: i18n.t('settings.theme.system') },
      { id: 'light', label: i18n.t('settings.theme.light') },
      { id: 'dark', label: i18n.t('settings.theme.dark') },
      { id: 'steam-deck', label: i18n.t('settings.theme.steam-deck') }
    ];
    
    // Get current theme from localStorage or default to system
    const currentTheme = localStorage.getItem('theme') || 'system';
    
    themes.forEach(theme => {
      const themeButton = document.createElement('button');
      themeButton.className = `theme-option ${theme.id === currentTheme ? 'active' : ''}`;
      themeButton.setAttribute('data-theme', theme.id);
      themeButton.setAttribute('aria-pressed', theme.id === currentTheme ? 'true' : 'false');
      
      const themeIcon = document.createElement('span');
      themeIcon.className = 'theme-icon';
      
      // Add appropriate icon based on theme
      switch (theme.id) {
        case 'system':
          themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/></svg>';
          break;
        case 'light':
          themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/></svg>';
          break;
        case 'dark':
          themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
          break;
        case 'steam-deck':
          themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="4" width="20" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="10" r="2" fill="currentColor"/><circle cx="16" cy="10" r="2" fill="currentColor"/></svg>';
          break;
      }
      
      const themeLabel = document.createElement('span');
      themeLabel.textContent = theme.label;
      
      themeButton.appendChild(themeIcon);
      themeButton.appendChild(themeLabel);
      
      // Add event listener to change theme
      themeButton.addEventListener('click', () => {
        // Update active state
        themeOptions.querySelectorAll('.theme-option').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        
        themeButton.classList.add('active');
        themeButton.setAttribute('aria-pressed', 'true');
        
        // Save preference
        localStorage.setItem('theme', theme.id);
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', theme.id);
        
        // If system theme, check preferences
        if (theme.id === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark-theme', prefersDark);
        } else {
          // Apply theme class directly
          document.documentElement.classList.remove('dark-theme', 'light-theme', 'steam-deck-theme');
          
          if (theme.id === 'dark') {
            document.documentElement.classList.add('dark-theme');
          } else if (theme.id === 'light') {
            document.documentElement.classList.add('light-theme');
          } else if (theme.id === 'steam-deck') {
            document.documentElement.classList.add('steam-deck-theme');
          }
        }
      });
      
      themeOptions.appendChild(themeButton);
    });
    
    themeGroup.appendChild(themeLabel);
    themeGroup.appendChild(themeDesc);
    themeGroup.appendChild(themeOptions);
    
    // Code syntax highlighting
    const syntaxGroup = document.createElement('div');
    syntaxGroup.className = 'settings-group';
    
    const syntaxLabel = document.createElement('h4');
    syntaxLabel.textContent = i18n.t('settings.code.title');
    
    const syntaxDesc = document.createElement('p');
    syntaxDesc.className = 'settings-description';
    syntaxDesc.textContent = i18n.t('settings.code.description');
    
    // Toggle for syntax highlighting
    const syntaxToggleContainer = document.createElement('div');
    syntaxToggleContainer.className = 'toggle-container';
    
    const syntaxToggleLabel = document.createElement('span');
    syntaxToggleLabel.textContent = i18n.t('settings.code.syntax');
    
    // Get current setting from localStorage or default to true
    const syntaxEnabled = localStorage.getItem('syntaxHighlighting') !== 'false';
    
    const syntaxToggle = this.createToggleSwitch(syntaxEnabled, (checked) => {
      localStorage.setItem('syntaxHighlighting', checked.toString());
      document.documentElement.classList.toggle('no-syntax-highlighting', !checked);
    });
    
    syntaxToggleContainer.appendChild(syntaxToggleLabel);
    syntaxToggleContainer.appendChild(syntaxToggle);
    
    syntaxGroup.appendChild(syntaxLabel);
    syntaxGroup.appendChild(syntaxDesc);
    syntaxGroup.appendChild(syntaxToggleContainer);
    
    // Add all groups to container
    container.appendChild(themeGroup);
    container.appendChild(syntaxGroup);
  }
  
  /**
   * Create language settings section
   */
  private createLanguageSection(container: HTMLElement): void {
    // Language selection
    const langGroup = document.createElement('div');
    langGroup.className = 'settings-group';
    
    const langLabel = document.createElement('h4');
    langLabel.textContent = i18n.t('settings.language.select');
    
    const langDesc = document.createElement('p');
    langDesc.className = 'settings-description';
    langDesc.textContent = i18n.t('settings.language.description');
    
    const langSelector = document.createElement('select');
    langSelector.id = 'language-selector';
    langSelector.setAttribute('aria-label', i18n.t('settings.language.select'));
    
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ja', name: '日本語' },
      { code: 'zh', name: '中文' },
      { code: 'ru', name: 'Русский' },
      { code: 'ko', name: '한국어' }
    ];
    
    // Get current language
    const currentLang = i18n.getCurrentLanguage();
    
    // Add options
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.selected = lang.code === currentLang;
      langSelector.appendChild(option);
    });
    
    // Add event listener
    langSelector.addEventListener('change', () => {
      const newLang = langSelector.value;
      i18n.changeLanguage(newLang)
        .then(() => {
          // Update UI with new language strings
          this.closeSettings();
          
          // Reload settings with new language
          setTimeout(() => {
            this.openSettings();
          }, 100);
        })
        .catch((err: Error) => {
          console.error('Failed to change language:', err);
        });
    });
    
    langGroup.appendChild(langLabel);
    langGroup.appendChild(langDesc);
    langGroup.appendChild(langSelector);
    
    // Content Translation
    const translationGroup = document.createElement('div');
    translationGroup.className = 'settings-group';
    
    const translationLabel = document.createElement('h4');
    translationLabel.textContent = i18n.t('settings.translation.title');
    
    const translationDesc = document.createElement('p');
    translationDesc.className = 'settings-description';
    translationDesc.textContent = i18n.t('settings.translation.description');
    
    // Toggle for auto-translation
    const translationToggleContainer = document.createElement('div');
    translationToggleContainer.className = 'toggle-container';
    
    const translationToggleLabel = document.createElement('span');
    translationToggleLabel.textContent = i18n.t('settings.translation.auto');
    
    // Get current setting from localStorage or default to false
    const translationEnabled = localStorage.getItem('autoTranslation') === 'true';
    
    const translationToggle = this.createToggleSwitch(translationEnabled, (checked) => {
      localStorage.setItem('autoTranslation', checked.toString());
      
      // Apply translation if enabled
      if (checked) {
        i18n.translatePageContent();
      }
    });
    
    translationToggleContainer.appendChild(translationToggleLabel);
    translationToggleContainer.appendChild(translationToggle);
    
    translationGroup.appendChild(translationLabel);
    translationGroup.appendChild(translationDesc);
    translationGroup.appendChild(translationToggleContainer);
    
    // Add all groups to container
    container.appendChild(langGroup);
    container.appendChild(translationGroup);
  }
  
  /**
   * Create accessibility settings section
   */
  private createAccessibilitySection(container: HTMLElement): void {
    // Inject accessibility settings UI
    const section = document.createElement('div');
    section.className = 'settings-group accessibility-settings';
    
    // Create accessibility settings - Add type assertion since we know the method exists
    (accessibilityManager as any).createSettingsUI(section, () => {
      // Some settings might change appearance, need to update current theme
      const theme = localStorage.getItem('theme') || 'system';
      document.documentElement.setAttribute('data-theme', theme);
    });
    
    container.appendChild(section);
  }
  
  /**
   * Create content settings section
   */
  private createContentSection(container: HTMLElement): void {
    // Offline Cache Settings
    const cacheGroup = document.createElement('div');
    cacheGroup.className = 'settings-group';
    
    const cacheLabel = document.createElement('h4');
    cacheLabel.textContent = i18n.t('settings.cache.title');
    
    const cacheDesc = document.createElement('p');
    cacheDesc.className = 'settings-description';
    cacheDesc.textContent = i18n.t('settings.cache.description');
    
    // Offline mode toggle
    const offlineToggleContainer = document.createElement('div');
    offlineToggleContainer.className = 'toggle-container';
    
    const offlineToggleLabel = document.createElement('span');
    offlineToggleLabel.textContent = i18n.t('settings.cache.offline');
    
    // Get current setting from localStorage or default to false
    const offlineEnabled = localStorage.getItem('offlineMode') === 'true';
    
    const offlineToggle = this.createToggleSwitch(offlineEnabled, (checked) => {
      localStorage.setItem('offlineMode', checked.toString());
      
      // Update service worker cache strategy
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'setCacheStrategy',
          strategy: checked ? 'offline-first' : 'network-first'
        });
      }
    });
    
    offlineToggleContainer.appendChild(offlineToggleLabel);
    offlineToggleContainer.appendChild(offlineToggle);
    
    // Cache info and controls
    const cacheInfoContainer = document.createElement('div');
    cacheInfoContainer.className = 'cache-info-container';
    cacheInfoContainer.innerHTML = '<div class="cache-size">Loading cache info...</div>';
    
    // Add buttons for cache controls
    const cacheControls = document.createElement('div');
    cacheControls.className = 'cache-controls';
    
    const clearCacheButton = document.createElement('button');
    clearCacheButton.textContent = i18n.t('settings.cache.clear');
    clearCacheButton.className = 'secondary-button';
    clearCacheButton.addEventListener('click', () => this.clearCache());
    
    const updateButton = document.createElement('button');
    updateButton.textContent = i18n.t('settings.cache.update');
    updateButton.className = 'primary-button';
    updateButton.addEventListener('click', () => this.checkForContentUpdates());
    
    cacheControls.appendChild(clearCacheButton);
    cacheControls.appendChild(updateButton);
    
    cacheGroup.appendChild(cacheLabel);
    cacheGroup.appendChild(cacheDesc);
    cacheGroup.appendChild(offlineToggleContainer);
    cacheGroup.appendChild(cacheInfoContainer);
    cacheGroup.appendChild(cacheControls);
    
    // Update cache info
    this.updateCacheInfo();
    
    // Add all groups to container
    container.appendChild(cacheGroup);
  }
  
  /**
   * Create a toggle switch input
   */
  private createToggleSwitch(checked: boolean, onChange: ToggleSwitchCallback): HTMLElement {
    const label = document.createElement('label');
    label.className = 'toggle-switch';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    label.appendChild(input);
    label.appendChild(slider);
    
    // Add event listener
    input.addEventListener('change', () => {
      onChange(input.checked);
    });
    
    return label;
  }
  
  /**
   * Update cache info display
   */
  private updateCacheInfo(): void {
    if (!this.settingsContainer) return;
    
    const cacheInfoEl = this.settingsContainer.querySelector('.cache-info-container');
    if (!cacheInfoEl) return;
    
    cacheInfoEl.innerHTML = '<div class="cache-size">Loading cache info...</div>';
    
    // Function to get cache size
    const getCacheSize = async (cacheName: string): Promise<CacheInfo> => {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        let size = 0;
        
        // Estimate size based on number of cached requests
        // Cannot get exact size due to browser limitations
        const estimatedEntrySize = 50 * 1024; // 50KB average per entry
        size = keys.length * estimatedEntrySize;
        
        return {
          name: cacheName,
          size
        };
      } catch (error) {
        console.error(`Error fetching cache info for ${cacheName}:`, error);
        return {
          name: cacheName,
          size: 0
        };
      }
    };
    
    Promise.all([
      getCacheSize('app-shell'),
      getCacheSize('app-data'),
      getCacheSize('app-images')
    ]).then(cacheData => {
      // Calculate total
      const totalSize = cacheData.reduce((sum, cache) => sum + cache.size, 0);
      
      // Format size
      const formatSize = (bytes: number): string => {
        if (bytes < 1024) {
          return `${bytes} B`;
        } else if (bytes < 1024 * 1024) {
          return `${(bytes / 1024).toFixed(1)} KB`;
        } else {
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
      };
      
      // Update UI
      let html = `<div class="cache-size">${i18n.t('settings.cache.size')}: <strong>${formatSize(totalSize)}</strong></div>`;
      html += '<ul class="cache-breakdown">';
      
      cacheData.forEach(cache => {
        html += `<li>${cache.name}: ${formatSize(cache.size)}</li>`;
      });
      
      html += '</ul>';
      
      cacheInfoEl.innerHTML = html;
    }).catch(error => {
      console.error('Error updating cache info:', error);
      cacheInfoEl.innerHTML = `<div class="cache-error">${i18n.t('settings.cache.error')}</div>`;
    });
  }
  
  /**
   * Clear cache data
   */
  public clearCache(): void {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      console.error('Service worker not available for cache clearing');
      return;
    }
    
    const cacheInfoEl = this.settingsContainer?.querySelector('.cache-info-container');
    if (cacheInfoEl) {
      cacheInfoEl.innerHTML = `<div class="cache-loading">${i18n.t('settings.cache.clearing')}...</div>`;
    }
    
    // Ask the service worker to clear caches
    navigator.serviceWorker.controller.postMessage({
      action: 'clearCache'
    });
    
    // Show feedback
    setTimeout(() => {
      // Service worker will send a message back when done
      // which triggers updateCacheInfo
      
      // However, if no response after 3 seconds, update anyway
      setTimeout(() => {
        this.updateCacheInfo();
      }, 3000);
    }, 500);
  }
  
  /**
   * Check for content updates
   */
  public checkForContentUpdates(): void {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      console.error('Service worker not available for content updates');
      return;
    }
    
    const cacheInfoEl = this.settingsContainer?.querySelector('.cache-info-container');
    if (cacheInfoEl) {
      cacheInfoEl.innerHTML = `<div class="cache-loading">${i18n.t('settings.cache.updating')}...</div>`;
    }
    
    // Ask the service worker to check for updates
    navigator.serviceWorker.controller.postMessage({
      action: 'checkForUpdates'
    });
    
    // Show feedback
    setTimeout(() => {
      // Service worker will handle update and send message when done
      
      // However, if no response after 5 seconds, update anyway
      setTimeout(() => {
        this.updateCacheInfo();
      }, 5000);
    }, 500);
  }
}

// Export singleton instance
const settingsManager = new SettingsManager();
export default settingsManager; 