/**
 * PreferencesDialog Component for Steam Deck DUB Edition
 * Handles user preferences including theme, accessibility, and display options
 * 
 * @module PreferencesDialog
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './PreferencesDialog.module.css';

/**
 * Class for managing user preferences
 */
class PreferencesDialog {
  /**
   * Creates a new PreferencesDialog instance
   */
  constructor() {
    /**
     * Default user preferences with descriptions
     * @type {Object}
     * @private
     */
    this.defaultPreferences = {
      // Theme preferences
      theme: 'theme-dracula',           // Color theme for the application
      
      // Text preferences
      fontSize: 'font-size-medium',     // Base font size for text content
      lineHeight: 'line-height-normal', // Spacing between lines of text
      
      // Code block preferences
      codeHeight: 'code-height-standard', // Maximum height of code blocks
      syntaxHighlighting: true,           // Enable syntax highlighting in code
      darkCodeBlocks: true,               // Always use dark background for code
      
      // Accessibility preferences
      highContrast: false,            // Increase contrast for better readability
      dyslexicFont: false,            // Use font designed for readers with dyslexia
      reducedMotion: false,           // Minimize animations and transitions
      
      // Navigation preferences
      compactSidebar: false,          // Use narrow sidebar with icons only
      markVisitedLinks: false,        // Show different color for visited links
      
      // Added preferences
      autoExpandCode: false,          // Auto-expand long code blocks
      smoothScrolling: true,          // Use smooth scrolling for navigation
      contentWidth: 'width-standard', // Control the width of content
      codeBlockFontSize: 'code-font-medium' // Font size specific to code blocks
    };
    
    /**
     * Current user preferences
     * @type {Object}
     * @private
     */
    this.userPreferences = {...this.defaultPreferences};
    
    /**
     * Track real-time preview changes to avoid saving unwanted changes
     * @type {boolean}
     * @private
     */
    this.previewChanges = false;
    
    /**
     * DOM element for the preferences button
     * @type {HTMLElement|null}
     * @private
     */
    this.button = null;
    
    /**
     * DOM element for the preferences dialog
     * @type {HTMLElement|null}
     * @private
     */
    this.dialogElement = null;
    
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Whether auto-save is enabled
     * @type {boolean}
     * @private
     */
    this.autoSave = false;
  }
  
  /**
   * Initialize the preferences manager
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('Initializing preferences manager...');
    
    // Load saved preferences from localStorage
    this.loadPreferences();
    
    // Create preferences button if it doesn't exist
    this.createPreferencesButton();
    
    // Apply preferences to current page
    this.applyPreferences();
    
    // Apply preferences to dynamically loaded content
    window.addEventListener('content-loaded', () => {
      if (!this.previewChanges) {
        this.applyPreferences();
      }
    });
    
    // Apply preferences on theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        // Wait for theme toggle to complete
        setTimeout(() => {
          this.applyPreferences();
        }, 50);
      });
    }
    
    // Also apply when window is resized (for responsive layouts)
    window.addEventListener('resize', this.debounce(() => {
      if (!this.previewChanges) {
        this.applyPreferencesToLayout();
      }
    }, 250));
    
    this.initialized = true;
  }
  
  /**
   * Debounce function to limit execution frequency
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   * @private
   */
  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
  
  /**
   * Create preferences button if it doesn't exist
   * @private
   */
  createPreferencesButton() {
    if (document.getElementById('preferences-button')) {
      this.button = document.getElementById('preferences-button');
      // Update event listener to use this class
      this.button.removeEventListener('click', null);
      this.button.addEventListener('click', () => this.showPreferencesDialog());
      return;
    }
    
    this.button = document.createElement('button');
    this.button.id = 'preferences-button';
    this.button.className = styles['preferences-button'];
    this.button.innerHTML = '⚙️';
    this.button.title = 'Preferences';
    this.button.setAttribute('aria-label', 'Open user preferences');
    
    this.button.addEventListener('click', () => this.showPreferencesDialog());
    document.body.appendChild(this.button);
    
    // Add keyboard shortcut (Alt+P)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        this.showPreferencesDialog();
      }
    });
    
    console.log('Preferences button created');
  }
  
  /**
   * Show preferences dialog
   */
  showPreferencesDialog() {
    console.log('Opening preferences dialog');
    
    // Enable preview changes mode
    this.previewChanges = true;
    
    // Check if dialog already exists
    if (this.dialogElement) {
      this.dialogElement.style.display = 'flex';
      
      // Update form values in case preferences changed elsewhere
      this.updateFormFromPreferences();
      return;
    }
    
    // Create dialog element
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = styles['preferences-dialog'];
    this.dialogElement.setAttribute('role', 'dialog');
    this.dialogElement.setAttribute('aria-labelledby', 'preferences-title');
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = styles['preferences-dialog-content'];
    
    // Add dialog header
    dialogContent.innerHTML = `
      <h3 id="preferences-title">User Preferences</h3>
      <p class="${styles['dialog-description']}">Customize your reading experience with these settings.</p>
      
      <div class="${styles['preferences-tabs']}" role="tablist">
        <button class="${styles['tab-button']} ${styles['active']}" data-tab="appearance" role="tab" aria-selected="true" aria-controls="appearance-tab">Appearance</button>
        <button class="${styles['tab-button']}" data-tab="accessibility" role="tab" aria-selected="false" aria-controls="accessibility-tab">Accessibility</button>
        <button class="${styles['tab-button']}" data-tab="reading" role="tab" aria-selected="false" aria-controls="reading-tab">Reading</button>
        <button class="${styles['tab-button']}" data-tab="advanced" role="tab" aria-selected="false" aria-controls="advanced-tab">Advanced</button>
      </div>
    `;
    
    // Add tabs content
    dialogContent.appendChild(this.createAppearanceTab());
    dialogContent.appendChild(this.createAccessibilityTab());
    dialogContent.appendChild(this.createReadingTab());
    dialogContent.appendChild(this.createAdvancedTab());
    
    // Add action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = styles['preferences-actions'];
    actionsDiv.innerHTML = `
      <button id="reset-preferences" class="${styles['preferences-btn']} ${styles['preferences-btn-danger']}">Reset to Default</button>
      <div>
        <button id="cancel-preferences" class="${styles['preferences-btn']}">Cancel</button>
        <button id="save-preferences" class="${styles['preferences-btn']} ${styles['preferences-btn-primary']}">Save Changes</button>
      </div>
    `;
    dialogContent.appendChild(actionsDiv);
    
    // Add content to dialog
    this.dialogElement.appendChild(dialogContent);
    
    // Add to document
    document.body.appendChild(this.dialogElement);
    
    // Setup event listeners
    this.setupDialogEventListeners();
    
    // Update form values from current preferences
    this.updateFormFromPreferences();
  }
  
  /**
   * Create the appearance tab content
   * @returns {HTMLElement} The tab content
   * @private
   */
  createAppearanceTab() {
    const tab = document.createElement('div');
    tab.id = 'appearance-tab';
    tab.className = `${styles['preferences-tab-content']} ${styles['active']}`;
    tab.setAttribute('role', 'tabpanel');
    tab.innerHTML = `
      <div class="${styles['preference-group']}">
        <h4>Theme</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Theme</span>
            <span class="${styles['preference-description']}">Choose your preferred color theme</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="theme-select" aria-label="Select theme">
              <option value="theme-dracula">Dracula (Default)</option>
              <option value="theme-light">Light</option>
              <option value="theme-dark">Dark</option>
              <option value="theme-high-contrast">High Contrast</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="${styles['preference-group']}">
        <h4>Text Appearance</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Font Size</span>
            <span class="${styles['preference-description']}">Adjust the size of text</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="font-size-select" aria-label="Select font size">
              <option value="font-size-small">Small</option>
              <option value="font-size-medium">Medium (Default)</option>
              <option value="font-size-large">Large</option>
            </select>
          </div>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Line Height</span>
            <span class="${styles['preference-description']}">Adjust spacing between lines of text</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="line-height-select" aria-label="Select line height">
              <option value="line-height-compact">Compact</option>
              <option value="line-height-normal">Normal (Default)</option>
              <option value="line-height-relaxed">Relaxed</option>
            </select>
          </div>
        </div>
      </div>
    `;
    return tab;
  }
  
  /**
   * Create the accessibility tab content
   * @returns {HTMLElement} The tab content
   * @private
   */
  createAccessibilityTab() {
    const tab = document.createElement('div');
    tab.id = 'accessibility-tab';
    tab.className = styles['preferences-tab-content'];
    tab.setAttribute('role', 'tabpanel');
    tab.innerHTML = `
      <div class="${styles['preference-group']}">
        <h4>Reading Assistance</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">High Contrast</span>
            <span class="${styles['preference-description']}">Increase contrast for better readability</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="high-contrast-toggle" aria-label="Toggle high contrast">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Dyslexic Font</span>
            <span class="${styles['preference-description']}">Use font designed for readers with dyslexia</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="dyslexic-font-toggle" aria-label="Toggle dyslexic font">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Reduced Motion</span>
            <span class="${styles['preference-description']}">Minimize animations and transitions</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="reduced-motion-toggle" aria-label="Toggle reduced motion">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
      </div>
    `;
    return tab;
  }
  
  /**
   * Create the reading tab content
   * @returns {HTMLElement} The tab content
   * @private
   */
  createReadingTab() {
    const tab = document.createElement('div');
    tab.id = 'reading-tab';
    tab.className = styles['preferences-tab-content'];
    tab.setAttribute('role', 'tabpanel');
    tab.innerHTML = `
      <div class="${styles['preference-group']}">
        <h4>Reading Experience</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Content Width</span>
            <span class="${styles['preference-description']}">Control the width of content area</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="content-width-select" aria-label="Select content width">
              <option value="width-narrow">Narrow</option>
              <option value="width-standard">Standard (Default)</option>
              <option value="width-wide">Wide</option>
              <option value="width-full">Full Width</option>
            </select>
          </div>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Smooth Scrolling</span>
            <span class="${styles['preference-description']}">Enable smooth scrolling for navigation</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="smooth-scrolling-toggle" aria-label="Toggle smooth scrolling">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Mark Visited Links</span>
            <span class="${styles['preference-description']}">Show different color for visited links</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="mark-visited-links-toggle" aria-label="Toggle mark visited links">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
      </div>
    `;
    return tab;
  }
  
  /**
   * Create the advanced tab content
   * @returns {HTMLElement} The tab content
   * @private
   */
  createAdvancedTab() {
    const tab = document.createElement('div');
    tab.id = 'advanced-tab';
    tab.className = styles['preferences-tab-content'];
    tab.setAttribute('role', 'tabpanel');
    tab.innerHTML = `
      <div class="${styles['preference-group']}">
        <h4>Code Display</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Code Block Height</span>
            <span class="${styles['preference-description']}">Maximum height of code blocks</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="code-height-select" aria-label="Select code block height">
              <option value="code-height-compact">Compact</option>
              <option value="code-height-standard">Standard (Default)</option>
              <option value="code-height-expanded">Expanded</option>
            </select>
          </div>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Code Font Size</span>
            <span class="${styles['preference-description']}">Font size for code blocks</span>
          </div>
          <div class="${styles['select-wrapper']}">
            <select id="code-font-size-select" aria-label="Select code font size">
              <option value="code-font-small">Small</option>
              <option value="code-font-medium">Medium (Default)</option>
              <option value="code-font-large">Large</option>
            </select>
          </div>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Auto-expand Code</span>
            <span class="${styles['preference-description']}">Automatically expand all code blocks</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="auto-expand-code-toggle" aria-label="Toggle auto-expand code">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
        
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Syntax Highlighting</span>
            <span class="${styles['preference-description']}">Enable syntax highlighting in code</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="syntax-highlighting-toggle" aria-label="Toggle syntax highlighting">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
      </div>
      
      <div class="${styles['preference-group']}">
        <h4>Data Management</h4>
        <div class="${styles['preference-item']}">
          <div>
            <span class="${styles['preference-label']}">Auto-save Preferences</span>
            <span class="${styles['preference-description']}">Save changes automatically without confirmation</span>
          </div>
          <label class="${styles['toggle-switch']}">
            <input type="checkbox" id="auto-save-toggle" aria-label="Toggle auto-save">
            <span class="${styles['toggle-slider']} ${styles['round']}"></span>
          </label>
        </div>
        <div class="${styles['action-button']}" id="export-preferences">Export Preferences</div>
        <div class="${styles['action-button']}" id="import-preferences">Import Preferences</div>
      </div>
    `;
    return tab;
  }
  
  /**
   * Setup event listeners for dialog elements
   * @private
   */
  setupDialogEventListeners() {
    // Tab switching
    const tabButtons = this.dialogElement.querySelectorAll(`.${styles['tab-button']}`);
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => {
          btn.classList.remove(styles['active']);
          btn.setAttribute('aria-selected', 'false');
        });
        
        // Add active class to clicked tab
        e.target.classList.add(styles['active']);
        e.target.setAttribute('aria-selected', 'true');
        
        // Hide all tab content
        const tabContents = this.dialogElement.querySelectorAll(`.${styles['preferences-tab-content']}`);
        tabContents.forEach(content => {
          content.classList.remove(styles['active']);
        });
        
        // Show active tab content
        const tabId = e.target.getAttribute('data-tab');
        const activeContent = this.dialogElement.querySelector(`#${tabId}-tab`);
        if (activeContent) {
          activeContent.classList.add(styles['active']);
        }
      });
    });
    
    // Form element change handlers - apply changes for preview
    const formElements = this.dialogElement.querySelectorAll('select, input');
    formElements.forEach(element => {
      element.addEventListener('change', () => {
        this.updatePreferencesFromForm();
        this.applyPreferences(true); // Preview mode
      });
    });
    
    // Close dialog when clicking outside
    this.dialogElement.addEventListener('click', (e) => {
      if (e.target === this.dialogElement) {
        this.closeDialog();
      }
    });
    
    // Button handlers
    const saveButton = this.dialogElement.querySelector('#save-preferences');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.savePreferences();
        this.closeDialog();
      });
    }
    
    const cancelButton = this.dialogElement.querySelector('#cancel-preferences');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.closeDialog(true); // Cancel changes
      });
    }
    
    const resetButton = this.dialogElement.querySelector('#reset-preferences');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.confirmAction(
          'Reset to Default',
          'Are you sure you want to reset all preferences to default settings? This cannot be undone.',
          () => {
            this.resetPreferences();
            this.updateFormFromPreferences();
            this.applyPreferences(true);
          }
        );
      });
    }
    
    // Advanced tab actions
    const exportButton = this.dialogElement.querySelector('#export-preferences');
    if (exportButton) {
      exportButton.addEventListener('click', () => this.exportPreferences());
    }
    
    const importButton = this.dialogElement.querySelector('#import-preferences');
    if (importButton) {
      importButton.addEventListener('click', () => this.importPreferences());
    }
    
    const autoSaveToggle = this.dialogElement.querySelector('#auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.addEventListener('change', (e) => {
        this.autoSave = e.target.checked;
        if (this.autoSave) {
          this.showNotification('Auto-save enabled. Preferences will save automatically.');
        }
      });
    }
    
    // Keyboard handling
    this.dialogElement.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDialog(true);
      } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT' && !e.target.closest(`.${styles['preferences-actions']}`)) {
        if (saveButton) {
          saveButton.click();
        }
      }
    });
  }
  
  /**
   * Update form elements with current preference values
   * @private
   */
  updateFormFromPreferences() {
    if (!this.dialogElement) return;
    
    // Update select elements
    const selectMappings = {
      'theme-select': 'theme',
      'font-size-select': 'fontSize',
      'line-height-select': 'lineHeight',
      'code-height-select': 'codeHeight',
      'content-width-select': 'contentWidth',
      'code-font-size-select': 'codeBlockFontSize'
    };
    
    Object.entries(selectMappings).forEach(([elementId, prefKey]) => {
      const element = this.dialogElement.querySelector(`#${elementId}`);
      if (element && this.userPreferences[prefKey]) {
        element.value = this.userPreferences[prefKey];
      }
    });
    
    // Update toggle elements
    const toggleMappings = {
      'high-contrast-toggle': 'highContrast',
      'dyslexic-font-toggle': 'dyslexicFont',
      'reduced-motion-toggle': 'reducedMotion',
      'smooth-scrolling-toggle': 'smoothScrolling',
      'mark-visited-links-toggle': 'markVisitedLinks',
      'auto-expand-code-toggle': 'autoExpandCode',
      'syntax-highlighting-toggle': 'syntaxHighlighting',
      'auto-save-toggle': 'autoSave'
    };
    
    Object.entries(toggleMappings).forEach(([elementId, prefKey]) => {
      const element = this.dialogElement.querySelector(`#${elementId}`);
      if (element) {
        element.checked = this.userPreferences[prefKey] === true;
      }
    });
  }
  
  /**
   * Update preferences object from form values
   * @private
   */
  updatePreferencesFromForm() {
    if (!this.dialogElement) return;
    
    // Create new preferences object
    const newPreferences = {...this.userPreferences};
    
    // Update from select elements
    const selectMappings = {
      'theme-select': 'theme',
      'font-size-select': 'fontSize',
      'line-height-select': 'lineHeight',
      'code-height-select': 'codeHeight',
      'content-width-select': 'contentWidth',
      'code-font-size-select': 'codeBlockFontSize'
    };
    
    Object.entries(selectMappings).forEach(([elementId, prefKey]) => {
      const element = this.dialogElement.querySelector(`#${elementId}`);
      if (element) {
        newPreferences[prefKey] = element.value;
      }
    });
    
    // Update from toggle elements
    const toggleMappings = {
      'high-contrast-toggle': 'highContrast',
      'dyslexic-font-toggle': 'dyslexicFont',
      'reduced-motion-toggle': 'reducedMotion',
      'smooth-scrolling-toggle': 'smoothScrolling',
      'mark-visited-links-toggle': 'markVisitedLinks',
      'auto-expand-code-toggle': 'autoExpandCode',
      'syntax-highlighting-toggle': 'syntaxHighlighting'
    };
    
    Object.entries(toggleMappings).forEach(([elementId, prefKey]) => {
      const element = this.dialogElement.querySelector(`#${elementId}`);
      if (element) {
        newPreferences[prefKey] = element.checked;
      }
    });
    
    // Update auto-save setting
    const autoSaveToggle = this.dialogElement.querySelector('#auto-save-toggle');
    if (autoSaveToggle) {
      this.autoSave = autoSaveToggle.checked;
    }
    
    // Update the preferences object
    this.userPreferences = newPreferences;
    
    // Auto-save if enabled
    if (this.autoSave) {
      this.savePreferences(true);
    }
  }
  
  /**
   * Apply current preferences to the page
   * @param {boolean} [previewMode=false] - Whether this is for preview only
   */
  applyPreferences(previewMode = false) {
    if (previewMode) {
      this.previewChanges = true;
    }
    
    // Create a clean html element for class manipulation
    const html = document.documentElement;
    
    // Helper to remove and add classes in a group
    const updateClassGroup = (element, classPrefix, newClass) => {
      // Remove existing classes with this prefix
      const classes = Array.from(element.classList).filter(cls => cls.startsWith(classPrefix));
      classes.forEach(cls => element.classList.remove(cls));
      
      // Add the new class
      if (newClass) {
        element.classList.add(newClass);
      }
    };
    
    // Apply theme
    updateClassGroup(html, 'theme-', this.userPreferences.theme);
    
    // Apply font size
    updateClassGroup(html, 'font-size-', this.userPreferences.fontSize);
    
    // Apply line height
    updateClassGroup(html, 'line-height-', this.userPreferences.lineHeight);
    
    // Apply code block height
    updateClassGroup(html, 'code-height-', this.userPreferences.codeHeight);
    
    // Apply content width
    updateClassGroup(html, 'width-', this.userPreferences.contentWidth);
    
    // Apply code font size
    updateClassGroup(html, 'code-font-', this.userPreferences.codeBlockFontSize);
    
    // Apply toggle preferences
    const toggleClasses = {
      highContrast: 'high-contrast',
      dyslexicFont: 'dyslexic-font',
      reducedMotion: 'reduced-motion',
      smoothScrolling: 'smooth-scrolling',
      autoExpandCode: 'auto-expand-code',
      markVisitedLinks: 'mark-visited-links'
    };
    
    Object.entries(toggleClasses).forEach(([prefKey, className]) => {
      if (this.userPreferences[prefKey]) {
        html.classList.add(className);
      } else {
        html.classList.remove(className);
      }
    });
    
    // Apply syntax highlighting preferences
    if (!previewMode) {
      this.applySyntaxHighlightingPreference();
    }
    
    // Apply layout-specific preferences
    this.applyPreferencesToLayout();
  }
  
  /**
   * Apply preferences related to layout and positioning
   * @private
   */
  applyPreferencesToLayout() {
    // Handle sidebar compactness
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      if (this.userPreferences.compactSidebar) {
        sidebar.classList.add('compact');
      } else {
        sidebar.classList.remove('compact');
      }
    }
  }
  
  /**
   * Apply syntax highlighting preferences
   * @private
   */
  applySyntaxHighlightingPreference() {
    // Find all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    if (codeBlocks.length > 0) {
      if (this.userPreferences.syntaxHighlighting) {
        // Enable syntax highlighting if a highlighter library is available
        if (typeof window.highlightAll === 'function') {
          window.highlightAll();
        } else if (typeof window.hljs !== 'undefined' && typeof window.hljs.highlightAll === 'function') {
          window.hljs.highlightAll();
        }
      } else {
        // Disable syntax highlighting
        codeBlocks.forEach(block => {
          block.className = ''; // Remove highlighting classes
        });
      }
    }
  }
  
  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        
        // Only update with valid values, use defaults for any missing ones
        this.userPreferences = {...this.defaultPreferences, ...parsed};
        console.log('Loaded user preferences:', this.userPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Use default preferences if there was an error
      this.userPreferences = {...this.defaultPreferences};
    }
  }
  
  /**
   * Save current preferences to localStorage
   * @param {boolean} [silent=false] - Don't show notification
   */
  savePreferences(silent = false) {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
      
      this.previewChanges = false;
      
      if (!silent) {
        this.showNotification('Preferences saved successfully!');
      }
      
      console.log('Saved preferences:', this.userPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      this.showNotification('Error saving preferences', true);
    }
  }
  
  /**
   * Reset preferences to default values
   */
  resetPreferences() {
    this.userPreferences = {...this.defaultPreferences};
    this.savePreferences();
    this.showNotification('Preferences reset to defaults');
  }

  /**
   * Close the preferences dialog
   * @param {boolean} [cancel=false] - Whether to cancel changes
   */
  closeDialog(cancel = false) {
    if (!this.dialogElement) return;
    
    // If canceling, revert to saved preferences
    if (cancel) {
      this.loadPreferences();
      this.applyPreferences();
    }
    
    // Hide dialog
    this.dialogElement.style.display = 'none';
    
    // Disable preview mode
    this.previewChanges = false;
  }

  /**
   * Show a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onConfirm - Function to call when confirmed
   * @private
   */
  confirmAction(title, message, onConfirm) {
    // Create confirm dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = styles['confirm-dialog'];
    confirmDialog.innerHTML = `
      <div class="${styles['confirm-dialog-content']}">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="${styles['confirm-dialog-actions']}">
          <button class="${styles['preferences-btn']}">Cancel</button>
          <button class="${styles['preferences-btn']} ${styles['preferences-btn-danger']}">Confirm</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(confirmDialog);
    
    // Get action buttons
    const cancelButton = confirmDialog.querySelector(`.${styles['preferences-btn']}`);
    const confirmButton = confirmDialog.querySelector(`.${styles['preferences-btn-danger']}`);
    
    // Add event listeners
    cancelButton.addEventListener('click', () => {
      confirmDialog.remove();
    });
    
    confirmButton.addEventListener('click', () => {
      onConfirm();
      confirmDialog.remove();
    });
    
    // Close when clicking outside
    confirmDialog.addEventListener('click', (e) => {
      if (e.target === confirmDialog) {
        confirmDialog.remove();
      }
    });
  }

  /**
   * Export preferences to a JSON file
   * @private
   */
  exportPreferences() {
    try {
      // Create JSON data
      const data = JSON.stringify(this.userPreferences, null, 2);
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sdde_preferences.json';
      a.style.display = 'none';
      
      // Click the link to start download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      this.showNotification('Preferences exported successfully!');
    } catch (error) {
      console.error('Error exporting preferences:', error);
      this.showNotification('Error exporting preferences', true);
    }
  }

  /**
   * Import preferences from a JSON file
   * @private
   */
  importPreferences() {
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedPrefs = JSON.parse(event.target.result);
            
            // Validate imported preferences
            if (typeof importedPrefs !== 'object') {
              throw new Error('Invalid format');
            }
            
            // Merge with defaults
            this.userPreferences = {...this.defaultPreferences, ...importedPrefs};
            
            // Update UI and save
            this.updateFormFromPreferences();
            this.applyPreferences(true);
            this.savePreferences();
            
            this.showNotification('Preferences imported successfully!');
          } catch (parseError) {
            console.error('Error parsing preferences file:', parseError);
            this.showNotification('Error importing preferences: Invalid file format', true);
          }
        };
        
        reader.readAsText(file);
      });
      
      // Click the input to open file dialog
      document.body.appendChild(input);
      input.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(input);
      }, 100);
    } catch (error) {
      console.error('Error importing preferences:', error);
      this.showNotification('Error importing preferences', true);
    }
  }

  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {boolean} [isError=false] - Whether this is an error message
   */
  showNotification(message, isError = false) {
    // Use global notification service if available
    if (window.showNotification) {
      if (isError) {
        window.showNotification(message, { type: 'error' });
      } else {
        window.showNotification(message, { type: 'success' });
      }
      return;
    }
    
    // Remove existing notification
    const existingNotification = document.querySelector(`.${styles['preferences-notification']}`);
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `${styles['preferences-notification']}${isError ? ` ${styles['error']}` : ''}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}

// Export a singleton instance
export default new PreferencesDialog(); 