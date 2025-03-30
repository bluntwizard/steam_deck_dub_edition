/**
 * User Preferences Manager for Grimoire Guide
 * Handles user preferences including theme, accessibility, and display options
 */

// Default user preferences with descriptions for documentation
const defaultPreferences = {
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
let userPreferences = {...defaultPreferences};

// Track real-time preview changes to avoid saving unwanted changes
let previewChanges = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing preferences manager...');
    
    // Load saved preferences from localStorage
    loadPreferences();
    
    // Create preferences button if it doesn't exist
    createPreferencesButton();
    
    // Apply preferences to current page
    applyPreferences();
    
    // Apply preferences to dynamically loaded content
    window.addEventListener('content-loaded', function() {
        if (!previewChanges) {
            applyPreferences();
        }
    });
    
    // Apply preferences on theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Wait for theme toggle to complete
            setTimeout(function() {
                applyPreferences();
            }, 50);
        });
    }
    
    // Also apply when window is resized (for responsive layouts)
    window.addEventListener('resize', debounce(function() {
        if (!previewChanges) {
            applyPreferencesToLayout();
        }
    }, 250));
});

/**
 * Debounce function to limit execution frequency
 */
function debounce(func, wait) {
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
 */
function createPreferencesButton() {
    if (document.getElementById('preferences-button')) return;
    
    const button = document.createElement('button');
    button.id = 'preferences-button';
    button.className = 'preferences-button';
    button.innerHTML = '⚙️';
    button.title = 'Preferences';
    button.setAttribute('aria-label', 'Open user preferences');
    
    button.addEventListener('click', showPreferencesDialog);
    document.body.appendChild(button);
    
    // Add keyboard shortcut (Alt+P)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            showPreferencesDialog();
        }
    });
    
    console.log('Preferences button created');
}

/**
 * Show preferences dialog
 */
function showPreferencesDialog() {
    console.log('Opening preferences dialog');
    
    // Enable preview changes mode
    previewChanges = true;
    
    // Check if dialog already exists
    let dialogElement = document.querySelector('.preferences-dialog');
    if (dialogElement) {
        dialogElement.style.display = 'flex';
        
        // Update form values in case preferences changed elsewhere
        updateFormFromPreferences();
        return;
    }
    
    // Create dialog element
    dialogElement = document.createElement('div');
    dialogElement.className = 'preferences-dialog';
    dialogElement.setAttribute('role', 'dialog');
    dialogElement.setAttribute('aria-labelledby', 'preferences-title');
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = 'preferences-dialog-content';
    
    // Add dialog header
    dialogContent.innerHTML = `
        <h3 id="preferences-title">User Preferences</h3>
        <p class="dialog-description">Customize your reading experience with these settings.</p>
        
        <div class="preferences-tabs" role="tablist">
            <button class="tab-button active" data-tab="appearance" role="tab" aria-selected="true" aria-controls="appearance-tab">Appearance</button>
            <button class="tab-button" data-tab="accessibility" role="tab" aria-selected="false" aria-controls="accessibility-tab">Accessibility</button>
            <button class="tab-button" data-tab="reading" role="tab" aria-selected="false" aria-controls="reading-tab">Reading</button>
            <button class="tab-button" data-tab="advanced" role="tab" aria-selected="false" aria-controls="advanced-tab">Advanced</button>
        </div>
    `;
    
    // Create appearance tab
    const appearanceTab = document.createElement('div');
    appearanceTab.id = 'appearance-tab';
    appearanceTab.className = 'preferences-tab-content active';
    appearanceTab.setAttribute('role', 'tabpanel');
    appearanceTab.innerHTML = `
        <div class="preference-group">
            <h4>Theme</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Theme</span>
                    <span class="preference-description">Choose your preferred color theme</span>
                </div>
                <div class="select-wrapper">
                    <select id="theme-select" aria-label="Select theme">
                        <option value="theme-dracula">Dracula (Default)</option>
                        <option value="theme-light">Light</option>
                        <option value="theme-dark">Dark</option>
                        <option value="theme-high-contrast">High Contrast</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="preference-group">
            <h4>Text Appearance</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Font Size</span>
                    <span class="preference-description">Adjust the size of text</span>
                </div>
                <div class="select-wrapper">
                    <select id="font-size-select" aria-label="Select font size">
                        <option value="font-size-small">Small</option>
                        <option value="font-size-medium">Medium (Default)</option>
                        <option value="font-size-large">Large</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Line Height</span>
                    <span class="preference-description">Adjust spacing between lines</span>
                </div>
                <div class="select-wrapper">
                    <select id="line-height-select" aria-label="Select line height">
                        <option value="line-height-compact">Compact</option>
                        <option value="line-height-normal">Normal (Default)</option>
                        <option value="line-height-relaxed">Relaxed</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Content Width</span>
                    <span class="preference-description">Adjust the maximum width of content</span>
                </div>
                <div class="select-wrapper">
                    <select id="content-width-select" aria-label="Select content width">
                        <option value="width-narrow">Narrow</option>
                        <option value="width-standard">Standard (Default)</option>
                        <option value="width-wide">Wide</option>
                        <option value="width-full">Full Width</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="preference-group">
            <h4>Code Blocks</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Code Block Height</span>
                    <span class="preference-description">Maximum height of code blocks before scrolling</span>
                </div>
                <div class="select-wrapper">
                    <select id="code-height-select" aria-label="Select code block height">
                        <option value="code-height-compact">Compact</option>
                        <option value="code-height-standard">Standard (Default)</option>
                        <option value="code-height-expanded">Expanded</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Code Font Size</span>
                    <span class="preference-description">Adjust size of text in code blocks</span>
                </div>
                <div class="select-wrapper">
                    <select id="code-font-size-select" aria-label="Select code font size">
                        <option value="code-font-small">Small</option>
                        <option value="code-font-medium">Medium (Default)</option>
                        <option value="code-font-large">Large</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-item" id="syntax-highlighting-container">
                <div>
                    <span class="preference-label">Syntax Highlighting</span>
                    <span class="preference-description">Colorize code for better readability</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="syntax-highlighting-toggle" aria-label="Toggle syntax highlighting">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Dark Code Blocks</span>
                    <span class="preference-description">Always use dark background for code</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="dark-code-blocks-toggle" aria-label="Toggle dark code blocks">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Auto-Expand Long Code</span>
                    <span class="preference-description">Automatically expand long code blocks</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="auto-expand-code-toggle" aria-label="Toggle auto-expand code blocks">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `;
    
    // Create accessibility tab
    const accessibilityTab = document.createElement('div');
    accessibilityTab.id = 'accessibility-tab';
    accessibilityTab.className = 'preferences-tab-content';
    accessibilityTab.setAttribute('role', 'tabpanel');
    accessibilityTab.setAttribute('hidden', '');
    accessibilityTab.innerHTML = `
        <div class="preference-group">
            <h4>Visual Adjustments</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">High Contrast</span>
                    <span class="preference-description">Increase contrast for better readability</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="high-contrast-toggle" aria-label="Toggle high contrast">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Dyslexic-Friendly Font</span>
                    <span class="preference-description">Use font designed for readers with dyslexia</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="dyslexic-font-toggle" aria-label="Toggle dyslexic font">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="preference-group">
            <h4>Motion & Animation</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Reduce Motion</span>
                    <span class="preference-description">Minimize animations and transitions</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="reduced-motion-toggle" aria-label="Toggle reduced motion">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Smooth Scrolling</span>
                    <span class="preference-description">Use smooth animations when navigating</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="smooth-scrolling-toggle" aria-label="Toggle smooth scrolling">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `;
    
    // Create reading tab
    const readingTab = document.createElement('div');
    readingTab.id = 'reading-tab';
    readingTab.className = 'preferences-tab-content';
    readingTab.setAttribute('role', 'tabpanel');
    readingTab.setAttribute('hidden', '');
    readingTab.innerHTML = `
        <div class="preference-group">
            <h4>Navigation</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Compact Sidebar</span>
                    <span class="preference-description">Use narrow sidebar with icons only</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="compact-sidebar-toggle" aria-label="Toggle compact sidebar">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Mark Visited Links</span>
                    <span class="preference-description">Show different color for links you've visited</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="mark-visited-links-toggle" aria-label="Toggle mark visited links">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `;
    
    // Create advanced tab
    const advancedTab = document.createElement('div');
    advancedTab.id = 'advanced-tab';
    advancedTab.className = 'preferences-tab-content';
    advancedTab.setAttribute('role', 'tabpanel');
    advancedTab.setAttribute('hidden', '');
    advancedTab.innerHTML = `
        <div class="preference-group">
            <h4>Experimental Features</h4>
            <div class="preference-item">
                <div>
                    <span class="preference-label">Auto-Save Preferences</span>
                    <span class="preference-description">Automatically save changes as you make them</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="auto-save-toggle" aria-label="Toggle auto-save preferences">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Export Preferences</span>
                    <span class="preference-description">Save your preferences to a file</span>
                </div>
                <button class="action-button" id="export-prefs-btn">Export</button>
            </div>
            
            <div class="preference-item">
                <div>
                    <span class="preference-label">Import Preferences</span>
                    <span class="preference-description">Load preferences from a file</span>
                </div>
                <button class="action-button" id="import-prefs-btn">Import</button>
            </div>
        </div>
    `;
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'preferences-actions';
    actionButtons.innerHTML = `
        <button class="preferences-btn preferences-btn-danger" id="reset-preferences-btn">Reset to Default</button>
        <button class="preferences-btn preferences-btn-primary" id="save-preferences-btn">Save Changes</button>
    `;
    
    // Assemble dialog content
    dialogContent.appendChild(appearanceTab);
    dialogContent.appendChild(accessibilityTab);
    dialogContent.appendChild(readingTab);
    dialogContent.appendChild(advancedTab);
    dialogContent.appendChild(actionButtons);
    dialogElement.appendChild(dialogContent);
    
    // Add dialog to document
    document.body.appendChild(dialogElement);
    
    // Set up event handlers for tabs
    initTabSwitching();
    
    // Set form values from current preferences
    updateFormFromPreferences();
    
    // Add event handlers for form controls
    setupFormEventHandlers();
    
    // Add keyboard support for dialog (Escape to close)
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            hidePreferencesDialog();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Add click handler for background to close dialog
    dialogElement.addEventListener('click', function(e) {
        if (e.target === dialogElement) {
            hidePreferencesDialog();
        }
    });
    
    // Save button event handler
    document.getElementById('save-preferences-btn').addEventListener('click', function() {
        savePreferences();
        hidePreferencesDialog();
        showNotification('Preferences saved successfully!');
    });
    
    // Reset button event handler
    document.getElementById('reset-preferences-btn').addEventListener('click', function() {
        showConfirmDialog('Reset Preferences', 
            'Are you sure you want to reset all preferences to default values?',
            function() {
                resetPreferences();
                updateFormFromPreferences();
                applyPreferences();
                showNotification('Preferences reset to defaults');
            }
        );
    });
    
    // Export button handler
    document.getElementById('export-prefs-btn').addEventListener('click', exportPreferences);
    
    // Import button handler
    document.getElementById('import-prefs-btn').addEventListener('click', importPreferences);
}

/**
 * Set up tab switching in preferences dialog
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and content tabs
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            document.querySelectorAll('.preferences-tab-content').forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('hidden', '');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId + '-tab');
            tabContent.classList.add('active');
            tabContent.removeAttribute('hidden');
        });
    });
}

/**
 * Set up event handlers for form controls
 */
function setupFormEventHandlers() {
    // Selection controls
    setupSelectControl('theme-select', 'theme');
    setupSelectControl('font-size-select', 'fontSize');
    setupSelectControl('line-height-select', 'lineHeight');
    setupSelectControl('code-height-select', 'codeHeight');
    setupSelectControl('code-font-size-select', 'codeBlockFontSize');
    setupSelectControl('content-width-select', 'contentWidth');
    
    // Toggle controls - fixed for proper functionality
    setupToggleControl('syntax-highlighting-toggle', 'syntaxHighlighting');
    setupToggleControl('dark-code-blocks-toggle', 'darkCodeBlocks');
    setupToggleControl('high-contrast-toggle', 'highContrast');
    setupToggleControl('dyslexic-font-toggle', 'dyslexicFont');
    setupToggleControl('reduced-motion-toggle', 'reducedMotion');
    setupToggleControl('compact-sidebar-toggle', 'compactSidebar');
    setupToggleControl('mark-visited-links-toggle', 'markVisitedLinks');
    setupToggleControl('auto-expand-code-toggle', 'autoExpandCode');
    setupToggleControl('smooth-scrolling-toggle', 'smoothScrolling');
    
    // Make preference items clickable
    makePreferenceItemsClickable();
    
    // Setup auto-save toggle with special behavior
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
        // Checked state based on local storage
        autoSaveToggle.checked = localStorage.getItem('autoSavePreferences') === 'true';
        
        autoSaveToggle.addEventListener('change', function() {
            localStorage.setItem('autoSavePreferences', this.checked);
            
            // If enabled, save preferences immediately
            if (this.checked) {
                savePreferences();
                showNotification('Auto-save enabled. Preferences will save automatically.');
            }
        });
    }
    
    // Also make the preference items clickable to toggle switches
    document.querySelectorAll('.preference-item').forEach(item => {
        const toggle = item.querySelector('input[type="checkbox"]');
        if (toggle) {
            // Exclude the container element of the toggle itself to prevent double-firing
            item.addEventListener('click', function(e) {
                if (e.target !== toggle && !toggle.contains(e.target) && 
                    e.target !== item.querySelector('.toggle-slider') &&
                    !item.querySelector('.toggle-slider').contains(e.target)) {
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

/**
 * Set up a select control
 */
function setupSelectControl(elementId, preferenceKey) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    // Set initial value
    select.value = userPreferences[preferenceKey];
    
    // Add change event handler
    select.addEventListener('change', function() {
        userPreferences[preferenceKey] = this.value;
        
        // Preview the change immediately
        previewPreference(preferenceKey, this.value);
        
        // Auto-save if enabled
        if (localStorage.getItem('autoSavePreferences') === 'true') {
            savePreferences(true); // silent save
        }
    });
}

/**
 * Set up a toggle control with proper event handling
 */
function setupToggleControl(elementId, preferenceKey) {
    const toggle = document.getElementById(elementId);
    if (!toggle) return;
    
    // Set initial state based on user preferences
    toggle.checked = userPreferences[preferenceKey];
    
    // Add change event handler that updates the user preferences
    toggle.addEventListener('change', function() {
        userPreferences[preferenceKey] = this.checked;
        
        // Provide visual feedback on change
        const slider = this.nextElementSibling;
        if (slider) {
            slider.classList.add('toggled');
            setTimeout(() => {
                slider.classList.remove('toggled');
            }, 300);
        }
        
        // Preview the change immediately
        previewPreference(preferenceKey, this.checked);
        
        // Auto-save if enabled
        if (localStorage.getItem('autoSavePreferences') === 'true') {
            savePreferences(true); // silent save
        }
    });
    
    // Add better keyboard support
    toggle.addEventListener('keydown', function(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.checked = !this.checked;
            this.dispatchEvent(new Event('change'));
        }
    });
}

/**
 * Also make the preference items clickable to toggle switches
 */
function makePreferenceItemsClickable() {
    document.querySelectorAll('.preference-item').forEach(item => {
        const toggle = item.querySelector('input[type="checkbox"]');
        if (toggle) {
            // More robust event handling for clicks on the preference item
            item.addEventListener('click', function(e) {
                // Verify we're not clicking on the toggle itself or other controls
                const isToggleElement = e.target === toggle || toggle.contains(e.target);
                const isSliderElement = e.target.classList.contains('toggle-slider');
                const isSelectElement = e.target.tagName === 'SELECT';
                const isButtonElement = e.target.tagName === 'BUTTON';
                
                // Only toggle if clicking on the item text or container
                if (!isToggleElement && !isSliderElement && !isSelectElement && !isButtonElement) {
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                    
                    // Provide additional visual feedback
                    item.classList.add('clicked');
                    setTimeout(() => {
                        item.classList.remove('clicked');
                    }, 200);
                }
            });
            
            // Add keyboard support for the preference item
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-pressed', toggle.checked.toString());
            
            // Update aria-pressed when toggle changes
            toggle.addEventListener('change', function() {
                item.setAttribute('aria-pressed', this.checked.toString());
            });
            
            // Allow toggling with keyboard on the item
            item.addEventListener('keydown', function(e) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

/**
 * Apply a single preference change as a preview
 */
function previewPreference(key, value) {
    // Special handling for different preference types
    switch (key) {
        case 'theme':
            document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');
            document.body.classList.add(value);
            break;
            
        case 'fontSize':
            document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
            document.body.classList.add(value);
            break;
            
        case 'lineHeight':
            document.body.classList.remove('line-height-compact', 'line-height-normal', 'line-height-relaxed');
            document.body.classList.add(value);
            break;
            
        case 'codeHeight':
            document.body.classList.remove('code-height-compact', 'code-height-standard', 'code-height-expanded');
            document.body.classList.add(value);
            break;
            
        case 'codeBlockFontSize':
            document.body.classList.remove('code-font-small', 'code-font-medium', 'code-font-large');
            document.body.classList.add(value);
            break;
            
        case 'contentWidth':
            document.body.classList.remove('width-narrow', 'width-standard', 'width-wide', 'width-full');
            document.body.classList.add(value);
            previewContentWidth(value);
            break;
            
        // Boolean toggles
        case 'highContrast':
            document.body.classList.toggle('high-contrast', value);
            break;
            
        case 'dyslexicFont':
            document.body.classList.toggle('dyslexic-font', value);
            break;
            
        case 'reducedMotion':
            document.body.classList.toggle('reduced-motion', value);
            break;
            
        case 'markVisitedLinks':
            document.body.classList.toggle('mark-visited-links', value);
            break;
            
        case 'compactSidebar':
            document.body.classList.toggle('compact-sidebar', value);
            updateSidebarCompactness(value);
            break;
            
        case 'darkCodeBlocks':
            document.body.classList.toggle('dark-code-blocks', value);
            break;
            
        case 'syntaxHighlighting':
            document.body.classList.toggle('syntax-highlighting', value);
            break;
            
        case 'autoExpandCode':
            document.body.classList.toggle('auto-expand-code', value);
            updateExpandedCodeBlocks(value);
            break;
            
        case 'smoothScrolling':
            document.body.classList.toggle('smooth-scrolling', value);
            document.documentElement.style.scrollBehavior = value ? 'smooth' : 'auto';
            break;
    }
}

/**
 * Preview content width changes
 */
function previewContentWidth(widthClass) {
    let maxWidth;
    
    switch (widthClass) {
        case 'width-narrow':
            maxWidth = '800px';
            break;
        case 'width-standard':
            maxWidth = '1200px';
            break;
        case 'width-wide':
            maxWidth = '1600px';
            break;
        case 'width-full':
            maxWidth = '100%';
            break;
        default:
            maxWidth = '1200px';
    }
    
    // Update main content max-width
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.maxWidth = maxWidth;
    }
}

/**
 * Update sidebar to be compact or full
 */
function updateSidebarCompactness(isCompact) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const links = sidebar.querySelectorAll('a');
    
    if (isCompact) {
        // Add data-title attributes with the link text
        links.forEach(link => {
            if (!link.hasAttribute('data-title')) {
                link.setAttribute('data-title', link.textContent.trim());
            }
            
            // If we don't already have an icon, add a generic one
            if (!link.querySelector('i, svg') && !link.innerHTML.includes('<!--icon-->')) {
                const text = link.textContent.trim();
                const firstChar = text.charAt(0).toUpperCase();
                link.innerHTML = `<span class="nav-icon">${firstChar}</span> <span class="nav-text">${text}</span>`;
            }
        });
    } else {
        // Make sure full text is showing
        links.forEach(link => {
            if (link.querySelector('.nav-icon') && link.querySelector('.nav-text')) {
                const text = link.querySelector('.nav-text').textContent;
                link.innerHTML = text;
            }
        });
    }
}

/**
 * Update code blocks expanded state
 */
function updateExpandedCodeBlocks(autoExpand) {
    document.querySelectorAll('.code-block').forEach(block => {
        const codeElement = block.querySelector('pre');
        if (!codeElement) return;
        
        // If code block is long
        if (codeElement.scrollHeight > 300) {
            if (autoExpand) {
                block.classList.add('expanded');
                block.classList.remove('expandable');
            } else {
                block.classList.remove('expanded');
                if (!block.classList.contains('expandable')) {
                    block.classList.add('expandable');
                }
            }
        }
    });
}

/**
 * Update form values from current preferences
 */
function updateFormFromPreferences() {
    // Update select controls
    const selects = {
        'theme-select': userPreferences.theme,
        'font-size-select': userPreferences.fontSize,
        'line-height-select': userPreferences.lineHeight,
        'code-height-select': userPreferences.codeHeight,
        'code-font-size-select': userPreferences.codeBlockFontSize,
        'content-width-select': userPreferences.contentWidth
    };
    
    Object.entries(selects).forEach(([id, value]) => {
        const select = document.getElementById(id);
        if (select) select.value = value;
    });
    
    // Update toggle controls
    const toggles = {
        'syntax-highlighting-toggle': userPreferences.syntaxHighlighting,
        'dark-code-blocks-toggle': userPreferences.darkCodeBlocks,
        'high-contrast-toggle': userPreferences.highContrast,
        'dyslexic-font-toggle': userPreferences.dyslexicFont,
        'reduced-motion-toggle': userPreferences.reducedMotion,
        'compact-sidebar-toggle': userPreferences.compactSidebar,
        'mark-visited-links-toggle': userPreferences.markVisitedLinks,
        'auto-expand-code-toggle': userPreferences.autoExpandCode,
        'smooth-scrolling-toggle': userPreferences.smoothScrolling
    };
    
    Object.entries(toggles).forEach(([id, value]) => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = value;
    });
}

/**
 * Hide preferences dialog
 */
function hidePreferencesDialog() {
    const dialog = document.querySelector('.preferences-dialog');
    if (dialog) {
        dialog.style.display = 'none';
        // Disable preview changes mode
        previewChanges = false;
    }
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, onConfirm) {
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.setAttribute('aria-describedby', 'confirm-message');
    
    dialog.innerHTML = `
        <div class="confirm-dialog-content">
            <h3 id="confirm-title">${title}</h3>
            <p id="confirm-message">${message}</p>
            <div class="confirm-dialog-actions">
                <button class="preferences-btn" id="cancel-btn">Cancel</button>
                <button class="preferences-btn preferences-btn-danger" id="confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Focus the confirm button (for accessibility)
    setTimeout(() => {
        document.getElementById('confirm-btn').focus();
    }, 100);
    
    // Add event listeners
    document.getElementById('cancel-btn').addEventListener('click', () => {
        dialog.remove();
    });
    
    document.getElementById('confirm-btn').addEventListener('click', () => {
        onConfirm();
        dialog.remove();
    });
    
    // Close on click outside
    dialog.addEventListener('click', e => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            dialog.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

/**
 * Export preferences to a file
 */
function exportPreferences() {
    try {
        // Create a JSON string of the preferences
        const prefsJson = JSON.stringify(userPreferences, null, 2);
        
        // Create a blob with the data
        const blob = new Blob([prefsJson], { type: 'application/json' });
        
        // Create a link to download the blob
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sdde-preferences.json';
        
        // Append the link to the body
        document.body.appendChild(a);
        
        // Trigger a click on the link
        a.click();
        
        // Remove the link
        document.body.removeChild(a);
        
        showNotification('Preferences exported successfully!');
    } catch (error) {
        console.error('Error exporting preferences:', error);
        showNotification('Error exporting preferences', true);
    }
}

/**
 * Import preferences from a file
 */
function importPreferences() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // Add the file input to the body
    document.body.appendChild(fileInput);
    
    // Add a change event listener to the file input
    fileInput.addEventListener('change', function() {
        // Get the file
        const file = fileInput.files[0];
        if (!file) return;
        
        // Create a file reader
        const reader = new FileReader();
        
        // Add a load event listener to the file reader
        reader.addEventListener('load', function() {
            try {
                // Parse the JSON
                const importedPrefs = JSON.parse(reader.result);
                
                // Validate the imported preferences (simple check)
                if (!importedPrefs || typeof importedPrefs !== 'object') {
                    throw new Error('Invalid preferences file');
                }
                
                // Merge with default preferences to ensure all keys exist
                userPreferences = { ...defaultPreferences, ...importedPrefs };
                
                // Update form and apply preferences
                updateFormFromPreferences();
                applyPreferences();
                
                // Save the imported preferences
                savePreferences();
                
                showNotification('Preferences imported successfully!');
            } catch (error) {
                console.error('Error importing preferences:', error);
                showNotification('Error importing preferences: Invalid file format', true);
            }
            
            // Remove the file input
            document.body.removeChild(fileInput);
        });
        
        // Read the file
        reader.readAsText(file);
    });
    
    // Trigger a click on the file input
    fileInput.click();
}

/**
 * Load preferences from localStorage
 */
function loadPreferences() {
    try {
        const storedPrefs = localStorage.getItem('userPreferences');
        if (storedPrefs) {
            userPreferences = {...defaultPreferences, ...JSON.parse(storedPrefs)};
            console.log('Loaded preferences from storage');
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
        // On error, revert to defaults
        userPreferences = {...defaultPreferences};
    }
}

/**
 * Save preferences to localStorage
 * @param {boolean} silent - Don't show notification
 */
function savePreferences(silent = false) {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        console.log('Saved preferences to storage');
        
        // Apply the saved preferences
        applyPreferences();
        
        if (!silent) {
            showNotification('Preferences saved successfully!');
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
        showNotification('Error saving preferences', true);
    }
}

/**
 * Reset preferences to defaults
 */
function resetPreferences() {
    userPreferences = {...defaultPreferences};
}

/**
 * Apply all current preferences to the document
 */
function applyPreferences() {
    // Remove all preference classes first
    removeAllPreferenceClasses();
    
    // Apply each preference
    Object.entries(userPreferences).forEach(([key, value]) => {
        previewPreference(key, value);
    });
    
    // Additional layout adjustments
    applyPreferencesToLayout();
    
    console.log('Applied all user preferences');
}

/**
 * Remove all preference-related classes
 */
function removeAllPreferenceClasses() {
    const classes = [
        'theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast',
        'font-size-small', 'font-size-medium', 'font-size-large',
        'line-height-compact', 'line-height-normal', 'line-height-relaxed',
        'code-height-compact', 'code-height-standard', 'code-height-expanded',
        'code-font-small', 'code-font-medium', 'code-font-large',
        'width-narrow', 'width-standard', 'width-wide', 'width-full',
        'high-contrast', 'dyslexic-font', 'reduced-motion', 'smooth-scrolling',
        'mark-visited-links', 'compact-sidebar', 'dark-code-blocks', 
        'syntax-highlighting', 'auto-expand-code'
    ];
    
    document.body.classList.remove(...classes);
}

/**
 * Apply preferences specifically affecting layout
 */
function applyPreferencesToLayout() {
    // Update sidebar for compact mode
    updateSidebarCompactness(userPreferences.compactSidebar);
    
    // Update content width
    previewContentWidth(userPreferences.contentWidth);
    
    // Update code blocks expanded state
    updateExpandedCodeBlocks(userPreferences.autoExpandCode);
    
    // Set smooth scrolling
    document.documentElement.style.scrollBehavior = 
        userPreferences.smoothScrolling ? 'smooth' : 'auto';
}

/**
 * Show notification message
 */
function showNotification(message, isError = false) {
    // Remove existing notification
    const existingNotification = document.querySelector('.preferences-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'preferences-notification' + (isError ? ' error' : '');
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    
    // Ensure notification styles exist
    ensureNotificationStyles();
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

/**
 * Ensure notification styles are defined
 */
function ensureNotificationStyles() {
    if (!document.querySelector('style[data-id="notification-style"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-id', 'notification-style');
        style.textContent = `
            .preferences-notification {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background-color: var(--dracula-green, #50fa7b);
                color: var(--dracula-background, #282a36);
                padding: 10px 15px;
                border-radius: 4px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
                animation: fadeOut 3s forwards 1s;
            }
            
            .preferences-notification.error {
                background-color: var(--dracula-red, #ff5555);
            }
            
            @keyframes fadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
}
