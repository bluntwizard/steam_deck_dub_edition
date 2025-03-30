/**
 * Settings Component for Grimoire
 * Provides a unified interface for managing user preferences
 */

import i18n from '../i18n.js';
import accessibilityManager from './accessibility.js';

class SettingsManager {
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
  cacheElements() {
    this.settingsButton = document.getElementById('settings-button') || this.createSettingsButton();
  }
  
  /**
   * Create settings button if it doesn't exist
   */
  createSettingsButton() {
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
  initEventListeners() {
    // Settings button click
    this.settingsButton.addEventListener('click', () => this.openSettings());
    
    // Initialize service worker message handler for cache operations
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.action === 'clearCache') {
          console.log('Cache cleared:', event.data.message);
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
  openSettings() {
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
      const firstFocusable = this.settingsContainer.querySelector('button, [tabindex="0"]');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
  }
  
  /**
   * Close the settings dialog
   */
  closeSettings() {
    if (this.settingsContainer) {
      this.settingsContainer.classList.remove('open');
      // Return focus to settings button
      this.settingsButton.focus();
    }
  }
  
  /**
   * Create the settings UI
   */
  createSettingsUI() {
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
      this.settingsContainer.classList.add('open');
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
  createSidebarNavigation(sidebar, contentContainer) {
    const sections = [
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
      button.className = `settings-nav-button ${section.id === this.currentSection ? 'active' : ''}`;
      button.setAttribute('aria-selected', section.id === this.currentSection ? 'true' : 'false');
      
      button.innerHTML = `<span class="settings-icon">${section.icon}</span> ${section.label}`;
      
      button.addEventListener('click', () => {
        // Update active button
        ul.querySelectorAll('.settings-nav-button').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        
        // Show corresponding section
        this.showSection(section.id, contentContainer);
      });
      
      li.appendChild(button);
      ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    sidebar.appendChild(nav);
  }
  
  /**
   * Show the specified settings section
   */
  showSection(sectionId, container) {
    this.currentSection = sectionId;
    
    // Clear container
    container.innerHTML = '';
    
    // Create section content
    switch (sectionId) {
      case 'appearance':
        this.createAppearanceSection(container);
        break;
      case 'language':
        this.createLanguageSection(container);
        break;
      case 'accessibility':
        this.createAccessibilitySection(container);
        break;
      case 'content':
        this.createContentSection(container);
        break;
    }
  }
  
  /**
   * Create appearance settings section
   */
  createAppearanceSection(container) {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'appearance-title');
    
    const title = document.createElement('h3');
    title.id = 'appearance-title';
    title.textContent = i18n.t('settings.appearance');
    
    section.appendChild(title);
    
    // Theme selection
    const themeGroup = document.createElement('div');
    themeGroup.className = 'settings-group';
    
    const themeLabel = document.createElement('label');
    themeLabel.className = 'settings-label';
    themeLabel.textContent = i18n.t('settings.theme.title');
    
    themeGroup.appendChild(themeLabel);
    
    // Theme radio buttons
    const themes = [
      { id: 'light', label: i18n.t('settings.theme.light') },
      { id: 'dark', label: i18n.t('settings.theme.dark') },
      { id: 'system', label: i18n.t('settings.theme.system') }
    ];
    
    const currentTheme = localStorage.getItem('theme') || 'system';
    
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group';
    radioGroup.setAttribute('role', 'radiogroup');
    radioGroup.setAttribute('aria-labelledby', 'theme-label');
    
    themes.forEach(theme => {
      const radio = document.createElement('label');
      radio.className = 'radio-label';
      
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'theme';
      input.value = theme.id;
      input.checked = currentTheme === theme.id;
      
      input.addEventListener('change', () => {
        if (input.checked) {
          if (theme.id === 'system') {
            localStorage.removeItem('theme');
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          } else {
            localStorage.setItem('theme', theme.id);
            document.documentElement.setAttribute('data-theme', theme.id);
          }
        }
      });
      
      const span = document.createElement('span');
      span.textContent = theme.label;
      
      radio.appendChild(input);
      radio.appendChild(span);
      radioGroup.appendChild(radio);
    });
    
    themeGroup.appendChild(radioGroup);
    section.appendChild(themeGroup);
    
    container.appendChild(section);
  }
  
  /**
   * Create language settings section
   */
  createLanguageSection(container) {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'language-title');
    
    const title = document.createElement('h3');
    title.id = 'language-title';
    title.textContent = i18n.t('settings.language.title');
    
    section.appendChild(title);
    
    // Language selection
    const langGroup = document.createElement('div');
    langGroup.className = 'settings-group';
    
    const langLabel = document.createElement('label');
    langLabel.className = 'settings-label';
    langLabel.textContent = i18n.t('settings.language.selectLanguage');
    
    langGroup.appendChild(langLabel);
    
    // Get current language
    const currentLang = i18n.getCurrentLocale();
    
    // Language selector
    const selectContainer = document.createElement('div');
    selectContainer.className = 'select-container';
    
    const select = document.createElement('select');
    select.id = 'language-select';
    
    // Add available languages
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ];
    
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      option.selected = currentLang === lang.code;
      select.appendChild(option);
    });
    
    select.addEventListener('change', () => {
      i18n.setLocale(select.value);
      
      // Show message about reloading
      const message = document.createElement('div');
      message.className = 'settings-message';
      message.textContent = i18n.t('settings.language.reloadMessage');
      
      const reloadButton = document.createElement('button');
      reloadButton.className = 'button';
      reloadButton.textContent = i18n.t('settings.language.reloadNow');
      reloadButton.addEventListener('click', () => window.location.reload());
      
      message.appendChild(document.createElement('br'));
      message.appendChild(reloadButton);
      
      // Remove existing message if any
      const existingMsg = section.querySelector('.settings-message');
      if (existingMsg) {
        section.removeChild(existingMsg);
      }
      
      section.appendChild(message);
    });
    
    selectContainer.appendChild(select);
    langGroup.appendChild(selectContainer);
    section.appendChild(langGroup);
    
    container.appendChild(section);
  }
  
  /**
   * Create accessibility settings section
   */
  createAccessibilitySection(container) {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'accessibility-title');
    
    // Use the accessibility manager to create the UI
    accessibilityManager.createSettingsUI(section, () => {
      // Callback when settings change
      // Could be used to update other UI elements or save to server
    });
    
    container.appendChild(section);
  }
  
  /**
   * Create content settings section
   */
  createContentSection(container) {
    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', 'content-title');
    
    const title = document.createElement('h3');
    title.id = 'content-title';
    title.textContent = i18n.t('settings.content.title');
    
    section.appendChild(title);
    
    // Offline mode toggle
    const offlineGroup = document.createElement('div');
    offlineGroup.className = 'settings-group';
    
    const offlineLabel = document.createElement('label');
    offlineLabel.className = 'settings-label';
    offlineLabel.textContent = i18n.t('settings.content.offlineMode');
    
    const offlineToggle = this.createToggleSwitch(
      localStorage.getItem('offlineMode') === 'true',
      (checked) => {
        localStorage.setItem('offlineMode', checked.toString());
      }
    );
    
    offlineGroup.appendChild(offlineLabel);
    offlineGroup.appendChild(offlineToggle);
    section.appendChild(offlineGroup);
    
    // Cache info
    const cacheInfo = document.createElement('div');
    cacheInfo.className = 'settings-group';
    cacheInfo.id = 'cache-info';
    section.appendChild(cacheInfo);
    
    // Cache control buttons
    const cacheControls = document.createElement('div');
    cacheControls.className = 'button-group';
    
    const clearCacheBtn = document.createElement('button');
    clearCacheBtn.className = 'button';
    clearCacheBtn.textContent = i18n.t('settings.content.clearCache');
    clearCacheBtn.addEventListener('click', () => this.clearCache());
    
    const updateContentBtn = document.createElement('button');
    updateContentBtn.className = 'button';
    updateContentBtn.textContent = i18n.t('settings.content.updateContent');
    updateContentBtn.addEventListener('click', () => this.checkForContentUpdates());
    
    cacheControls.appendChild(clearCacheBtn);
    cacheControls.appendChild(updateContentBtn);
    section.appendChild(cacheControls);
    
    // Update cache info
    this.updateCacheInfo();
    
    container.appendChild(section);
  }
  
  /**
   * Create a toggle switch element
   */
  createToggleSwitch(checked, onChange) {
    const label = document.createElement('label');
    label.className = 'toggle-switch';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    
    const span = document.createElement('span');
    span.className = 'slider round';
    
    label.appendChild(input);
    label.appendChild(span);
    
    return label;
  }
  
  /**
   * Update cache information display
   */
  updateCacheInfo() {
    if (!this.initialized) return;
    
    const cacheInfo = document.getElementById('cache-info');
    if (!cacheInfo) return;
    
    cacheInfo.innerHTML = '<p class="loading-text">' + i18n.t('common.loading') + '</p>';
    
    if ('caches' in window) {
      // Get cache names based on service worker version
      const getCacheSize = async (cacheName) => {
        try {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          return keys.length;
        } catch (e) {
          console.error('Error getting cache size:', e);
          return 0;
        }
      };
      
      // Get all caches
      caches.keys().then(async (cacheNames) => {
        let html = '<h4>' + i18n.t('settings.content.cachedResources') + '</h4><ul class="cache-list">';
        
        let totalItems = 0;
        for (const cacheName of cacheNames) {
          const size = await getCacheSize(cacheName);
          totalItems += size;
          
          // Format cache name for display
          let displayName = cacheName.replace(/^(\w+)-cache-v\d+$/, '$1');
          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          
          html += `<li>${displayName}: ${size} ${i18n.t('settings.content.items')}</li>`;
        }
        
        html += '</ul>';
        html += `<p class="cache-summary">${i18n.t('settings.content.totalCached')}: ${totalItems} ${i18n.t('settings.content.items')}</p>`;
        
        cacheInfo.innerHTML = html;
      }).catch(error => {
        console.error('Error getting cache info:', error);
        cacheInfo.innerHTML = '<p class="error-text">' + i18n.t('settings.content.cacheError') + '</p>';
      });
    } else {
      cacheInfo.innerHTML = '<p class="error-text">' + i18n.t('settings.content.cacheNotSupported') + '</p>';
    }
  }
  
  /**
   * Clear application cache
   */
  clearCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      // Display loading state
      const cacheInfo = document.getElementById('cache-info');
      if (cacheInfo) {
        cacheInfo.innerHTML = '<p class="loading-text">' + i18n.t('settings.content.clearingCache') + '</p>';
      }
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.action === 'clearCache') {
          console.log('Cache cleared:', event.data.message);
          this.updateCacheInfo();
        }
      };
      
      navigator.serviceWorker.controller.postMessage({
        action: 'clearCache',
        cacheName: 'all'
      }, [messageChannel.port2]);
    }
  }
  
  /**
   * Check for content updates
   */
  checkForContentUpdates() {
    // Show checking message
    const updateBtn = document.querySelector('button:contains("' + i18n.t('settings.content.updateContent') + '")');
    const originalText = updateBtn ? updateBtn.textContent : '';
    
    if (updateBtn) {
      updateBtn.disabled = true;
      updateBtn.textContent = i18n.t('settings.content.checkingUpdates');
    }
    
    // Force reload to check for service worker updates
    window.location.reload();
  }
}

// Initialize and export settings manager
const settingsManager = new SettingsManager();
export default settingsManager;
