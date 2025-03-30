/**
 * User Preferences Manager for SDDE Guide
 * Handles user preferences including theme, accessibility, and display options
 */

// Define interfaces for type safety
interface UserPreference {
  // Theme preferences
  theme: string;
  
  // Text preferences
  fontSize: string;
  lineHeight: string;
  
  // Code block preferences
  codeHeight: string;
  syntaxHighlighting: boolean;
  darkCodeBlocks: boolean;
  
  // Accessibility preferences
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  
  // Navigation preferences
  compactSidebar: boolean;
  markVisitedLinks: boolean;
  
  // Added preferences
  autoExpandCode: boolean;
  smoothScrolling: boolean;
  contentWidth: string;
  codeBlockFontSize: string;
}

interface NotificationOptions {
  isError?: boolean;
  duration?: number;
}

// Default user preferences with descriptions for documentation
const defaultPreferences: UserPreference = {
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

// Current user preferences
let userPreferences: UserPreference = {...defaultPreferences};

// Track real-time preview changes to avoid saving unwanted changes
let previewChanges = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function(): void {
  console.log('Initializing preferences manager...');
  
  // Load saved preferences from localStorage
  loadPreferences();
  
  // Create preferences button if it doesn't exist
  createPreferencesButton();
  
  // Apply preferences to current page
  applyPreferences();
  
  // Apply preferences to dynamically loaded content
  window.addEventListener('content-loaded', function(): void {
    if (!previewChanges) {
      applyPreferences();
    }
  });
  
  // Apply preferences on theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function(): void {
      // Wait for theme toggle to complete
      setTimeout(function(): void {
        applyPreferences();
      }, 50);
    });
  }
  
  // Also apply when window is resized (for responsive layouts)
  window.addEventListener('resize', debounce(function(): void {
    if (!previewChanges) {
      applyPreferencesToLayout();
    }
  }, 250));
});

/**
 * Debounce function to limit execution frequency
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    clearTimeout(timeout as ReturnType<typeof setTimeout>);
    timeout = setTimeout(function(): void {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Create preferences button if it doesn't exist
 */
function createPreferencesButton(): void {
  if (document.getElementById('preferences-button')) return;
  
  const header = document.querySelector('.sdde-header') || document.body;
  
  const prefsButton = document.createElement('button');
  prefsButton.id = 'preferences-button';
  prefsButton.className = 'preferences-button';
  prefsButton.setAttribute('aria-label', 'Preferences');
  prefsButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>';
  
  // Add click handler to open preferences dialog
  prefsButton.addEventListener('click', showPreferencesDialog);
  
  // Add button to header
  header.appendChild(prefsButton);
}

/**
 * Show the preferences dialog
 */
function showPreferencesDialog(): void {
  // Check if dialog already exists
  if (document.getElementById('preferences-dialog')) {
    return;
  }
  
  // Create dialog element
  const dialog = document.createElement('div');
  dialog.id = 'preferences-dialog';
  dialog.className = 'preferences-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-labelledby', 'prefs-dialog-title');
  
  // Create dialog content
  dialog.innerHTML = `
    <div class="preferences-dialog-content">
      <header class="preferences-dialog-header">
        <h2 id="prefs-dialog-title">Preferences</h2>
        <button id="prefs-close-btn" class="preferences-close-btn" aria-label="Close preferences">×</button>
      </header>
      
      <div class="preferences-dialog-body">
        <div class="prefs-tabs">
          <button id="prefs-tab-display" class="prefs-tab-btn active" data-tab="display">Display</button>
          <button id="prefs-tab-text" class="prefs-tab-btn" data-tab="text">Text</button>
          <button id="prefs-tab-code" class="prefs-tab-btn" data-tab="code">Code</button>
          <button id="prefs-tab-accessibility" class="prefs-tab-btn" data-tab="accessibility">Accessibility</button>
          <button id="prefs-tab-advanced" class="prefs-tab-btn" data-tab="advanced">Advanced</button>
        </div>
        
        <div class="prefs-tab-content">
          <!-- Display Tab -->
          <div id="prefs-tab-display-content" class="prefs-tab-pane active">
            <div class="preference-item">
              <span class="preference-label">Theme</span>
              <div class="preference-control">
                <select id="theme-select">
                  <option value="theme-light">Light</option>
                  <option value="theme-dark">Dark</option>
                  <option value="theme-dracula">Dracula</option>
                  <option value="theme-cyberdeck">Cyberdeck</option>
                </select>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Content Width</span>
              <div class="preference-control">
                <select id="content-width-select">
                  <option value="width-narrow">Narrow</option>
                  <option value="width-standard">Standard</option>
                  <option value="width-wide">Wide</option>
                  <option value="width-full">Full Width</option>
                </select>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Compact Sidebar</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="compact-sidebar-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Mark Visited Links</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="mark-visited-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Smooth Scrolling</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="smooth-scroll-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Text Tab -->
          <div id="prefs-tab-text-content" class="prefs-tab-pane">
            <div class="preference-item">
              <span class="preference-label">Font Size</span>
              <div class="preference-control">
                <select id="font-size-select">
                  <option value="font-size-small">Small</option>
                  <option value="font-size-medium">Medium</option>
                  <option value="font-size-large">Large</option>
                  <option value="font-size-x-large">Extra Large</option>
                </select>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Line Height</span>
              <div class="preference-control">
                <select id="line-height-select">
                  <option value="line-height-compact">Compact</option>
                  <option value="line-height-normal">Normal</option>
                  <option value="line-height-relaxed">Relaxed</option>
                  <option value="line-height-spacious">Spacious</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Code Tab -->
          <div id="prefs-tab-code-content" class="prefs-tab-pane">
            <div class="preference-item">
              <span class="preference-label">Code Block Height</span>
              <div class="preference-control">
                <select id="code-height-select">
                  <option value="code-height-compact">Compact</option>
                  <option value="code-height-standard">Standard</option>
                  <option value="code-height-tall">Tall</option>
                  <option value="code-height-full">Full Height</option>
                </select>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Code Font Size</span>
              <div class="preference-control">
                <select id="code-font-size-select">
                  <option value="code-font-small">Small</option>
                  <option value="code-font-medium">Medium</option>
                  <option value="code-font-large">Large</option>
                </select>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Syntax Highlighting</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="syntax-highlight-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Dark Code Blocks</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="dark-code-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Auto-Expand Code</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="auto-expand-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Accessibility Tab -->
          <div id="prefs-tab-accessibility-content" class="prefs-tab-pane">
            <div class="preference-item">
              <span class="preference-label">High Contrast</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="high-contrast-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Dyslexic Font</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="dyslexic-font-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Reduced Motion</span>
              <div class="preference-control">
                <label class="toggle">
                  <input type="checkbox" id="reduced-motion-toggle">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Advanced Tab -->
          <div id="prefs-tab-advanced-content" class="prefs-tab-pane">
            <div class="preference-item">
              <span class="preference-label">Reset to Defaults</span>
              <div class="preference-control">
                <button id="reset-prefs-btn" class="reset-button">Reset</button>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Export Preferences</span>
              <div class="preference-control">
                <button id="export-prefs-btn" class="export-button">Export</button>
              </div>
            </div>
            
            <div class="preference-item">
              <span class="preference-label">Import Preferences</span>
              <div class="preference-control">
                <button id="import-prefs-btn" class="import-button">Import</button>
                <input type="file" id="import-prefs-file" accept=".json" style="display:none;">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer class="preferences-dialog-footer">
        <button id="prefs-save-btn" class="save-button">Save Changes</button>
      </footer>
    </div>
  `;
  
  // Add dialog to document body
  document.body.appendChild(dialog);
  
  // Initialize tab switching
  initTabSwitching();
  
  // Fill form fields with current preferences
  updateFormFromPreferences();
  
  // Set up event handlers
  setupFormEventHandlers();
  
  // Make preference items clickable for easier access
  makePreferenceItemsClickable();
  
  // Enable preview mode
  previewChanges = true;
  
  // Add ESC key handler
  document.addEventListener('keydown', function escapeHandler(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      closePreferencesDialog();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
  
  // Add close button handler
  const closeBtn = document.getElementById('prefs-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePreferencesDialog);
  }
  
  // Add save button handler
  const saveBtn = document.getElementById('prefs-save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', savePreferences);
  }
  
  // Set up advanced features
  const resetBtn = document.getElementById('reset-prefs-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetPreferences);
  }
  
  const exportBtn = document.getElementById('export-prefs-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportPreferences);
  }
  
  const importBtn = document.getElementById('import-prefs-btn');
  const importFile = document.getElementById('import-prefs-file') as HTMLInputElement;
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importPreferences);
  }
}

/**
 * Initialize tab switching in preferences dialog
 */
function initTabSwitching(): void {
  const tabBtns = document.querySelectorAll('.prefs-tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Get the tab ID
      const tabId = (btn as HTMLElement).dataset.tab;
      
      // Remove active class from all tabs and panes
      document.querySelectorAll('.prefs-tab-btn').forEach(tb => {
        tb.classList.remove('active');
      });
      
      document.querySelectorAll('.prefs-tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      
      // Add active class to clicked tab and corresponding pane
      btn.classList.add('active');
      
      const tabContent = document.getElementById(`prefs-tab-${tabId}-content`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Set up form event handlers for preferences dialog
 */
function setupFormEventHandlers(): void {
  // Theme select
  setupSelectControl('theme-select', 'theme');
  
  // Text preferences
  setupSelectControl('font-size-select', 'fontSize');
  setupSelectControl('line-height-select', 'lineHeight');
  
  // Code preferences
  setupSelectControl('code-height-select', 'codeHeight');
  setupSelectControl('code-font-size-select', 'codeBlockFontSize');
  setupToggleControl('syntax-highlight-toggle', 'syntaxHighlighting');
  setupToggleControl('dark-code-toggle', 'darkCodeBlocks');
  setupToggleControl('auto-expand-toggle', 'autoExpandCode');
  
  // Display preferences
  setupSelectControl('content-width-select', 'contentWidth');
  setupToggleControl('compact-sidebar-toggle', 'compactSidebar');
  setupToggleControl('mark-visited-toggle', 'markVisitedLinks');
  setupToggleControl('smooth-scroll-toggle', 'smoothScrolling');
  
  // Accessibility preferences
  setupToggleControl('high-contrast-toggle', 'highContrast');
  setupToggleControl('dyslexic-font-toggle', 'dyslexicFont');
  setupToggleControl('reduced-motion-toggle', 'reducedMotion');
}

/**
 * Set up a select control with proper event handling
 */
function setupSelectControl(elementId: string, preferenceKey: keyof UserPreference): void {
  const select = document.getElementById(elementId) as HTMLSelectElement;
  if (!select) return;
  
  // Set initial value from preferences
  select.value = userPreferences[preferenceKey] as string;
  
  // Add change handler
  select.addEventListener('change', function(): void {
    const newValue = select.value;
    previewPreference(preferenceKey, newValue);
  });
}

/**
 * Set up a toggle control with proper event handling
 */
function setupToggleControl(elementId: string, preferenceKey: keyof UserPreference): void {
  const toggle = document.getElementById(elementId) as HTMLInputElement;
  if (!toggle) return;
  
  // Set initial value from preferences
  toggle.checked = userPreferences[preferenceKey] as boolean;
  
  // Add change handler
  toggle.addEventListener('change', function(): void {
    const newValue = toggle.checked;
    previewPreference(preferenceKey, newValue);
  });
}

/**
 * Make preference items clickable for easier access
 */
function makePreferenceItemsClickable(): void {
  document.querySelectorAll('.preference-item').forEach(item => {
    item.addEventListener('click', function(e: Event): void {
      // Ignore if clicked directly on the control
      if ((e.target as HTMLElement).classList.contains('preference-control') || 
          (e.target as HTMLElement).closest('.preference-control')) {
        return;
      }
      
      // Find the control element
      const control = (item as HTMLElement).querySelector('.preference-control')?.firstElementChild;
      
      // Trigger click or focus on the control
      if (control) {
        if (control.tagName === 'SELECT') {
          (control as HTMLSelectElement).focus();
        } else if (control.tagName === 'LABEL' && control.classList.contains('toggle')) {
          // Find and click the checkbox inside the toggle
          const checkbox = control.querySelector('input[type="checkbox"]');
          if (checkbox) {
            (checkbox as HTMLInputElement).click();
          }
        } else if (control.tagName === 'BUTTON') {
          (control as HTMLButtonElement).click();
        }
      }
    });
  });
}

/**
 * Preview a preference change without saving
 */
function previewPreference(key: keyof UserPreference, value: any): void {
  // Store the previous value for this preference
  const previousValue = userPreferences[key];
  
  // Update the preference value
  userPreferences[key] = value;
  
  // Apply the preference change for preview
  switch (key) {
    case 'theme':
      // Remove all theme classes
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-dracula', 'theme-cyberdeck');
      // Add the new theme class
      document.body.classList.add(value);
      break;
      
    case 'fontSize':
      // Remove all font size classes
      document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-x-large');
      // Add the new font size class
      document.body.classList.add(value);
      break;
      
    case 'lineHeight':
      // Remove all line height classes
      document.body.classList.remove('line-height-compact', 'line-height-normal', 'line-height-relaxed', 'line-height-spacious');
      // Add the new line height class
      document.body.classList.add(value);
      break;
      
    case 'codeHeight':
      // Remove all code height classes
      document.body.classList.remove('code-height-compact', 'code-height-standard', 'code-height-tall', 'code-height-full');
      // Add the new code height class
      document.body.classList.add(value);
      break;
      
    case 'codeBlockFontSize':
      // Remove all code font size classes
      document.body.classList.remove('code-font-small', 'code-font-medium', 'code-font-large');
      // Add the new code font size class
      document.body.classList.add(value);
      break;
      
    case 'contentWidth':
      // Preview content width change
      previewContentWidth(value);
      break;
      
    case 'highContrast':
      if (value) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      break;
      
    case 'dyslexicFont':
      if (value) {
        document.body.classList.add('dyslexic-font');
      } else {
        document.body.classList.remove('dyslexic-font');
      }
      break;
      
    case 'reducedMotion':
      if (value) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
      break;
      
    case 'compactSidebar':
      // Update sidebar compactness
      updateSidebarCompactness(value);
      break;
      
    case 'markVisitedLinks':
      if (value) {
        document.body.classList.add('mark-visited-links');
      } else {
        document.body.classList.remove('mark-visited-links');
      }
      break;
      
    case 'syntaxHighlighting':
      if (value) {
        document.body.classList.remove('no-syntax-highlighting');
      } else {
        document.body.classList.add('no-syntax-highlighting');
      }
      break;
      
    case 'darkCodeBlocks':
      if (value) {
        document.body.classList.add('dark-code-blocks');
      } else {
        document.body.classList.remove('dark-code-blocks');
      }
      break;
      
    case 'autoExpandCode':
      // Update code block expansion
      updateExpandedCodeBlocks(value);
      break;
      
    case 'smoothScrolling':
      if (value) {
        document.body.classList.add('smooth-scrolling');
      } else {
        document.body.classList.remove('smooth-scrolling');
      }
      break;
  }
}

/**
 * Preview content width changes
 */
function previewContentWidth(widthClass: string): void {
  // Remove all width classes
  document.body.classList.remove('width-narrow', 'width-standard', 'width-wide', 'width-full');
  // Add the new width class
  document.body.classList.add(widthClass);
  
  // Apply to main content area if it exists
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    // Remove existing width classes
    mainContent.classList.remove('width-narrow', 'width-standard', 'width-wide', 'width-full');
    // Add new width class
    mainContent.classList.add(widthClass);
    
    // If using full width, adjust sidebar
    if (widthClass === 'width-full') {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.add('compact');
      }
    }
  }
}

/**
 * Update sidebar compactness based on preference
 */
function updateSidebarCompactness(isCompact: boolean): void {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  if (isCompact) {
    sidebar.classList.add('compact');
    
    // Add icon-only labels for compact view
    document.querySelectorAll('.sidebar-item').forEach(item => {
      if (!item.querySelector('.sidebar-icon')) {
        const icon = document.createElement('span');
        icon.className = 'sidebar-icon';
        icon.innerHTML = '•';
        item.prepend(icon);
      }
    });
  } else {
    sidebar.classList.remove('compact');
  }
}

/**
 * Update code blocks expansion based on preference
 */
function updateExpandedCodeBlocks(autoExpand: boolean): void {
  document.querySelectorAll('pre code, .code-block').forEach(block => {
    if (autoExpand) {
      // Remove height limitations
      (block as HTMLElement).style.maxHeight = 'none';
      (block.parentElement as HTMLElement).classList.add('expanded');
    } else {
      // Apply default height limitations
      (block as HTMLElement).style.maxHeight = '';
      (block.parentElement as HTMLElement).classList.remove('expanded');
    }
  });
}

/**
 * Update form fields from current preferences
 */
function updateFormFromPreferences(): void {
  // Update select controls
  const selectControls: [string, keyof UserPreference][] = [
    ['theme-select', 'theme'],
    ['font-size-select', 'fontSize'],
    ['line-height-select', 'lineHeight'],
    ['code-height-select', 'codeHeight'],
    ['code-font-size-select', 'codeBlockFontSize'],
    ['content-width-select', 'contentWidth']
  ];
  
  selectControls.forEach(([id, key]) => {
    const select = document.getElementById(id) as HTMLSelectElement;
    if (select) {
      select.value = userPreferences[key] as string;
    }
  });
  
  // Update toggle controls
  const toggleControls: [string, keyof UserPreference][] = [
    ['syntax-highlight-toggle', 'syntaxHighlighting'],
    ['dark-code-toggle', 'darkCodeBlocks'],
    ['auto-expand-toggle', 'autoExpandCode'],
    ['compact-sidebar-toggle', 'compactSidebar'],
    ['mark-visited-toggle', 'markVisitedLinks'],
    ['smooth-scroll-toggle', 'smoothScrolling'],
    ['high-contrast-toggle', 'highContrast'],
    ['dyslexic-font-toggle', 'dyslexicFont'],
    ['reduced-motion-toggle', 'reducedMotion']
  ];
  
  toggleControls.forEach(([id, key]) => {
    const toggle = document.getElementById(id) as HTMLInputElement;
    if (toggle) {
      toggle.checked = userPreferences[key] as boolean;
    }
  });
}

/**
 * Close the preferences dialog
 */
function closePreferencesDialog(): void {
  const dialog = document.getElementById('preferences-dialog');
  if (!dialog) return;
  
  // Disable preview mode
  previewChanges = false;
  
  // Remove dialog
  dialog.remove();
  
  // Reload preferences from localStorage (discard changes)
  loadPreferences();
  
  // Re-apply preferences
  applyPreferences();
}

/**
 * Save preferences to localStorage
 */
function savePreferences(): void {
  try {
    localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
    showNotification('Preferences saved successfully');
    
    // Disable preview mode
    previewChanges = false;
    
    // Close dialog
    closePreferencesDialog();
  } catch (error) {
    console.error('Failed to save preferences:', error);
    showNotification('Failed to save preferences', { isError: true });
  }
}

/**
 * Load preferences from localStorage
 */
function loadPreferences(): void {
  try {
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      // Parse saved preferences
      const parsedPrefs = JSON.parse(savedPrefs);
      
      // Merge with default preferences to ensure no missing properties
      userPreferences = {
        ...defaultPreferences,
        ...parsedPrefs
      };
    } else {
      // Use default preferences if none saved
      userPreferences = {...defaultPreferences};
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
    userPreferences = {...defaultPreferences};
  }
}

/**
 * Apply all preferences to the current page
 */
function applyPreferences(): void {
  // Apply theme
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-dracula', 'theme-cyberdeck');
  document.body.classList.add(userPreferences.theme);
  
  // Apply font size
  document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-x-large');
  document.body.classList.add(userPreferences.fontSize);
  
  // Apply line height
  document.body.classList.remove('line-height-compact', 'line-height-normal', 'line-height-relaxed', 'line-height-spacious');
  document.body.classList.add(userPreferences.lineHeight);
  
  // Apply code height
  document.body.classList.remove('code-height-compact', 'code-height-standard', 'code-height-tall', 'code-height-full');
  document.body.classList.add(userPreferences.codeHeight);
  
  // Apply code font size
  document.body.classList.remove('code-font-small', 'code-font-medium', 'code-font-large');
  document.body.classList.add(userPreferences.codeBlockFontSize);
  
  // Apply syntax highlighting
  if (userPreferences.syntaxHighlighting) {
    document.body.classList.remove('no-syntax-highlighting');
  } else {
    document.body.classList.add('no-syntax-highlighting');
  }
  
  // Apply dark code blocks
  if (userPreferences.darkCodeBlocks) {
    document.body.classList.add('dark-code-blocks');
  } else {
    document.body.classList.remove('dark-code-blocks');
  }
  
  // Apply high contrast
  if (userPreferences.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
  
  // Apply dyslexic font
  if (userPreferences.dyslexicFont) {
    document.body.classList.add('dyslexic-font');
  } else {
    document.body.classList.remove('dyslexic-font');
  }
  
  // Apply reduced motion
  if (userPreferences.reducedMotion) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
  
  // Apply mark visited links
  if (userPreferences.markVisitedLinks) {
    document.body.classList.add('mark-visited-links');
  } else {
    document.body.classList.remove('mark-visited-links');
  }
  
  // Apply smooth scrolling
  if (userPreferences.smoothScrolling) {
    document.body.classList.add('smooth-scrolling');
  } else {
    document.body.classList.remove('smooth-scrolling');
  }
  
  // Apply content width
  previewContentWidth(userPreferences.contentWidth);
  
  // Apply sidebar compactness
  updateSidebarCompactness(userPreferences.compactSidebar);
  
  // Apply code block expansion
  updateExpandedCodeBlocks(userPreferences.autoExpandCode);
}

/**
 * Apply just layout preferences - used during window resize
 */
function applyPreferencesToLayout(): void {
  // Apply content width
  previewContentWidth(userPreferences.contentWidth);
  
  // Apply sidebar compactness
  updateSidebarCompactness(userPreferences.compactSidebar);
}

/**
 * Reset preferences to defaults
 */
function resetPreferences(): void {
  if (confirm('Are you sure you want to reset all preferences to defaults?')) {
    userPreferences = {...defaultPreferences};
    
    // Update form fields
    updateFormFromPreferences();
    
    // Apply preferences for preview
    applyPreferences();
    
    showNotification('Preferences reset to defaults');
  }
}

/**
 * Export preferences to a JSON file
 */
function exportPreferences(): void {
  try {
    // Create a JSON string with the current preferences
    const prefsJSON = JSON.stringify(userPreferences, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([prefsJSON], { type: 'application/json' });
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'sdde-preferences.json';
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showNotification('Preferences exported successfully');
  } catch (error) {
    console.error('Failed to export preferences:', error);
    showNotification('Failed to export preferences', { isError: true });
  }
}

/**
 * Import preferences from a file
 */
function importPreferences(event: Event): void {
  const fileInput = event.target as HTMLInputElement;
  
  if (!fileInput.files || fileInput.files.length === 0) {
    return;
  }
  
  const file = fileInput.files[0];
  
  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    showNotification('Error importing preferences: Invalid file type', { isError: true });
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e: ProgressEvent<FileReader>): void {
    try {
      // Parse the JSON data
      const importedPrefs = JSON.parse(e.target?.result as string);
      
      // Validate the imported preferences (simple check)
      if (!importedPrefs || typeof importedPrefs !== 'object') {
        throw new Error('Invalid preferences format');
      }
      
      // Confirm import
      if (confirm('Are you sure you want to import these preferences? This will override your current settings.')) {
        // Merge with default preferences to ensure no missing properties
        userPreferences = {
          ...defaultPreferences,
          ...importedPrefs
        };
        
        // Save the imported preferences
        localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
        
        // Update form fields
        updateFormFromPreferences();
        
        // Apply preferences for preview
        applyPreferences();
        
        showNotification('Preferences imported successfully');
      }
    } catch (error) {
      console.error('Error importing preferences:', error);
      showNotification('Error importing preferences: Invalid file format', { isError: true });
    }
  };
  
  reader.readAsText(file);
  
  // Reset the file input for future imports
  fileInput.value = '';
}

/**
 * Show a notification message
 */
function showNotification(message: string, options: NotificationOptions = {}): void {
  // Remove any existing notification
  const existingNotification = document.querySelector('.preferences-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'preferences-notification';
  if (options.isError) {
    notification.classList.add('error');
  }
  
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after a timeout
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, options.duration || 3000);
}

// Export the functions for use in other modules
export {
  loadPreferences,
  applyPreferences,
  userPreferences,
  showPreferencesDialog
}; 