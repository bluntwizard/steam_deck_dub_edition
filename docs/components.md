# Component Documentation

This document provides an overview of the modular component structure used in the Steam Deck DUB Edition project.

## Component Architecture

Each component follows a consistent directory structure and export pattern:

```
src/components/
  └── ComponentName/
      ├── index.js         - Exports the component for easy importing
      ├── ComponentName.js - Main component implementation
      ├── ComponentName.module.css - Scoped CSS styles for the component
      └── [Additional files] - Tests, utilities, or sub-components
```

## Available Components

### Button

A reusable button component that supports different variants, disabled states, and icons.

**Usage:**

```javascript
import { Button } from './components/Button';

// Create a primary button
const primaryButton = new Button({
  text: 'Primary Button',
  onClick: () => console.log('Button clicked')
});

// Create a secondary button
const secondaryButton = new Button({
  text: 'Secondary Button',
  variant: 'secondary',
  onClick: () => handleSecondaryAction()
});

// Create a disabled button
const disabledButton = new Button({
  text: 'Disabled Button',
  disabled: true
});

// Create a button with an icon
const iconButton = new Button({
  text: 'Button with Icon',
  icon: '/path/to/icon.svg',
  iconAlt: 'Icon description'
});

// Add the button to the DOM
document.querySelector('#container').appendChild(primaryButton.render());
```

**API:**

- `constructor(options)` - Creates a new Button instance with the following options:
  - `text` - The button text
  - `variant` - Button style variant ('primary' or 'secondary')
  - `disabled` - Whether the button is disabled
  - `icon` - Path to an icon image to display
  - `iconAlt` - Alt text for the icon image
  - `onClick` - Click event handler function

- `render()` - Returns the button DOM element
- `setDisabled(disabled)` - Updates the button's disabled state
- `setText(text)` - Updates the button's text content

### CodeBlocks

Component that handles syntax highlighting and copy functionality for code blocks.

### Dialog

A reusable modal dialog component that provides a customizable overlay for displaying content, messages, and action buttons to the user.

**Usage:**

```javascript
import Dialog from './components/Dialog';

// Create a simple dialog
const dialog = new Dialog({
  title: 'Information',
  content: 'This is a simple information dialog',
  onClose: () => console.log('Dialog was closed')
});

// Show the dialog
dialog.show();

// Create a confirmation dialog with actions
const confirmDialog = new Dialog({
  title: 'Confirm Action',
  content: 'Are you sure you want to delete this item?',
  actions: [
    {
      text: 'Delete',
      danger: true,
      onClick: () => {
        deleteItem(itemId);
        return true; // Close the dialog after executing
      }
    },
    {
      text: 'Cancel',
      onClick: () => {
        console.log('Action cancelled');
        return true; // Close the dialog
      }
    }
  ]
});

confirmDialog.show();

// Create a dialog with HTML content
const htmlDialog = new Dialog({
  title: 'HTML Content',
  content: '<div><h3>HTML Content</h3><p>This is <strong>formatted</strong> content.</p></div>'
});

htmlDialog.show();

// Create a dialog with a DOM element as content
const contentElement = document.createElement('div');
contentElement.innerHTML = '<form><label>Name:</label><input type="text"></form>';

const formDialog = new Dialog({
  title: 'Form Dialog',
  content: contentElement,
  maxWidth: '400px',
  closeOnOutsideClick: false, // Prevent closing by clicking outside
  actions: [
    {
      text: 'Submit',
      primary: true,
      onClick: () => {
        // Handle form submission
        const inputValue = contentElement.querySelector('input').value;
        if (!inputValue) {
          alert('Please enter a name');
          return false; // Prevent dialog from closing
        }
        submitForm(inputValue);
        return true; // Close the dialog
      }
    },
    {
      text: 'Cancel'
    }
  ]
});

formDialog.show();

// Update dialog content dynamically
dialog.setContent('Updated content');

// Close the dialog programmatically
dialog.close();

// Destroy the dialog completely when no longer needed
dialog.destroy();
```

**API:**

- `constructor(options)` - Creates a new Dialog instance with the following options:
  - `title` - Dialog title (optional)
  - `content` - Dialog content (string or HTMLElement)
  - `closeOnEscape` - Whether to close on Escape key (default: true)
  - `closeOnOutsideClick` - Whether to close when clicking outside (default: true)
  - `showCloseButton` - Whether to show a close button (default: true)
  - `width` - Custom width (e.g., '600px', optional)
  - `maxWidth` - Maximum width (default: '500px')
  - `onClose` - Callback function when dialog is closed
  - `actions` - Array of action buttons (see Action Configuration below)

- `show()` - Shows the dialog
- `close()` - Closes the dialog
- `setContent(content)` - Updates the dialog content (accepts string or HTMLElement)
- `destroy()` - Removes the dialog completely and cleans up

**Action Configuration:**

Each action in the actions array is an object with the following properties:

```javascript
{
  text: 'Action Text',     // Button text (required)
  primary: true,           // Whether this is a primary action (boolean, optional)
  danger: false,           // Whether this is a destructive action (boolean, optional)
  onClick: () => {         // Click handler function (optional)
    // Action logic
    return true;  // Return true to close dialog, false to keep it open
  }
}
```

**Styling:**

The Dialog component uses CSS modules with the following classes that can be customized:

- `dialogOverlay` - The overlay that covers the page
- `dialog` - The dialog container
- `dialogTitle` - The title element
- `closeButton` - The close button (× icon)
- `dialogContent` - The content container
- `dialogActions` - The container for action buttons
- `buttonPrimary` - Primary action button
- `buttonSecondary` - Secondary action button
- `buttonDanger` - Destructive action button

**Accessibility Features:**

- Traps focus within the dialog when open
- Closes on Escape key by default
- Adds ARIA attributes for screen readers
- Action buttons have appropriate styling for different action types
- Prevents scrolling of background content when dialog is open
- Close button has accessible label

**Visual Examples:**

![Dialog Component - Default State](images/dialog/dialog-default.png)
*A simple dialog with a title, content text, and a close button. The dialog is centered on the screen with a semi-transparent overlay behind it.*

![Dialog Component - With Actions](images/dialog/dialog-actions.png)
*Dialog with multiple action buttons for confirmation, showing primary, secondary, and danger button styles. This example shows a deletion confirmation dialog with "Delete" and "Cancel" buttons.*

![Dialog Component - Custom Content](images/dialog/dialog-custom.png)
*Dialog with custom HTML content, demonstrating how to embed forms or rich content. This example shows a form with input fields embedded in the dialog.*

![Dialog Interaction](images/dialog/dialog-interaction.gif)
*Animated demonstration of opening a dialog, interacting with its content, and closing it. The animation shows focus management and keyboard navigation within the dialog.*

### LazyLoader

Component that handles lazy loading of content sections as they become visible in the viewport.

**Usage:**

```javascript
import { LazyLoader } from './components/LazyLoader';

// Create a new LazyLoader instance with custom options
const lazyLoader = new LazyLoader({
  contentBaseUrl: './content/',  // Base URL for content loading
  loadTimeout: 15000,            // 15 seconds timeout
  autoInit: true                 // Initialize immediately
});

// Or initialize manually
const manualLoader = new LazyLoader();
manualLoader.initialize({
  contentBaseUrl: './content/',
  loadTimeout: 10000
});

// Force load all content sections
lazyLoader.forceLoadAllContent();

// Debug content sections
lazyLoader.debugContentSections();

// Load a specific section
const section = document.querySelector('#my-section');
lazyLoader.loadContent(section);

// Preload content without displaying it
lazyLoader.preloadContent('section1')
  .then(html => {
    console.log('Content preloaded:', html);
  });
```

**HTML Structure:**

```html
<div data-content-src="section1">
  <!-- Content will be loaded here when this element becomes visible -->
</div>

<div data-content-src="section2" data-content-loaded="true">
  <!-- This section is already loaded, so it will be skipped -->
</div>
```

**API:**

- `constructor(options)` - Creates a new LazyLoader instance with the following options:
  - `contentBaseUrl` - Base URL for content loading (default: './content/')
  - `loadTimeout` - Timeout for content loading in ms (default: 10000)
  - `autoInit` - Whether to initialize immediately (default: false)

- `initialize(options)` - Initializes the lazy loader
- `loadContent(section)` - Loads content for a specific section
- `preloadContent(contentSrc)` - Preloads content without displaying it
- `forceLoadAllContent()` - Forces loading of all content sections
- `debugContentSections()` - Logs debug information about content sections

**Events:**

- `content-loaded` - Dispatched on the section element when content is loaded
- `section-content-loaded` - Dispatched on the document with section details
- `content-inserted` - Dispatched on the document when content is inserted

### ProgressTracker

Component that tracks user progress through the documentation.

### Gallery

Component for displaying image galleries.

### KeyboardShortcuts

Component for displaying keyboard shortcuts in a consistent format.

### Theme

Component for handling theme switching and persistence.

**Usage:**

```javascript
import { Theme } from './components/Theme';

// Create a new Theme instance with default options (dark theme default)
const theme = new Theme();

// Initialize theme system (loads saved preferences)
theme.initialize();

// Create with custom options
const customTheme = new Theme({
  themes: ['light', 'dark', 'high-contrast'],  // Available themes
  defaultTheme: 'light',                       // Default theme
  storageKey: 'my_app_theme',                  // localStorage key
  persistSettings: true,                       // Save user preference
  autoInit: true,                              // Initialize immediately
  rootElement: document.documentElement        // Element to apply theme classes
});

// Apply a specific theme
theme.applyTheme('dark');

// Toggle between light and dark themes
theme.toggleTheme();

// Get current theme
const currentTheme = theme.getTheme();

// Create a theme toggle button
theme.createToggleButton({
  position: 'bottom-right',  // 'top-right', 'top-left', 'bottom-left'
  container: document.body   // Where to add the toggle button
});

// Set up system theme detection
theme.setupSystemThemeDetection();
```

**HTML Integration:**

```html
<!-- Theme toggle button (will be auto-initialized) -->
<button class="theme-toggle" data-theme="light">Switch to Light Theme</button>

<!-- The Theme component adds theme classes to the document element -->
<!-- For example: <html class="theme-dark"> -->
```

**API:**

- `constructor(options)` - Creates a new Theme instance with the following options:
  - `themes` - Array of available themes (default: ['light', 'dark', 'dracula', 'high-contrast'])
  - `defaultTheme` - Default theme to use (default: 'dark')
  - `storageKey` - Key for storing theme preference in localStorage (default: 'sdde_theme_preference')
  - `persistSettings` - Whether to save theme preference (default: true)
  - `rootElement` - Element to apply theme classes to (default: document.documentElement)
  - `autoInit` - Whether to initialize immediately (default: false)

- `initialize()` - Initializes the theme system
- `applyTheme(theme)` - Applies a specific theme
- `toggleTheme()` - Toggles between light and dark themes
- `getTheme()` - Returns the current theme
- `setTheme(theme)` - Sets the current theme
- `setupThemeToggles()` - Sets up event listeners for theme toggle buttons
- `setupSystemThemeDetection()` - Sets up system theme preference detection
- `createToggleButton(options)` - Creates a theme toggle button
  - `position` - Position of the button (default: 'bottom-right')
  - `container` - Container element (default: document.body)

**Events:**

- `theme-changed` - Dispatched on the document when theme changes
  - `event.detail.theme` - The new theme

### VersionManager

Component for managing application versions, displaying changelogs, and notifying users of updates.

**Usage:**

```javascript
import { VersionManager } from './components/VersionManager';

// Create a new VersionManager instance with the current version
const versionManager = new VersionManager('1.2.0');

// Initialize (starts auto checking if enabled)
versionManager.init();

// Create with custom options
const customVersionManager = new VersionManager('1.2.0', {
  apiUrl: '/custom/version-api.json',          // API endpoint for version data
  autoCheck: true,                             // Check for updates automatically
  checkInterval: 3600000,                      // Check every hour (in milliseconds)
  notificationPosition: 'bottom-right'         // Position for update notifications
});

// Manually check for updates
versionManager.checkForUpdates().then(hasUpdate => {
  if (hasUpdate) {
    console.log('Update available!');
  }
});

// Show changelog dialog
versionManager.showChangelog();

// Show update notification
versionManager.showUpdateNotification();

// Check if an update is available
if (versionManager.hasUpdate()) {
  console.log('Latest version:', versionManager.getLatestVersion());
}

// Dismiss current update
versionManager.dismissUpdate();
```

**API:**

- `constructor(currentVersion, options)` - Creates a new VersionManager instance with the following options:
  - `apiUrl` - API endpoint for version data (default: '/api/version.json')
  - `autoCheck` - Whether to check for updates automatically (default: true)
  - `checkInterval` - Interval between checks in milliseconds (default: 86400000 - 24 hours)
  - `notificationPosition` - Position for update notifications (default: 'bottom-right')

- `init()` - Initializes the version manager
- `checkForUpdates()` - Checks for updates and returns a Promise that resolves with a boolean
- `hasUpdate()` - Returns true if a newer version is available
- `getLatestVersion()` - Returns the latest version from the API
- `showChangelog()` - Shows the changelog dialog
- `showUpdateNotification()` - Shows the update notification
- `dismissUpdate()` - Dismisses the current update (won't show again)
- `shouldShowNotification()` - Returns true if notification should be shown

**Expected API Response Format:**

```json
{
  "currentVersion": "1.3.0",
  "versions": [
    {
      "version": "1.3.0",
      "date": "2023-08-15",
      "changes": [
        "Added new keyboard shortcuts",
        "Improved performance on lower-end devices",
        "Fixed multiple UI bugs"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2023-07-01",
      "changes": [
        "Redesigned layout",
        "Dark mode support",
        "Added gallery component"
      ]
    }
  ]
}
```

**Events:**

- `version-checked` - Dispatched when version check is complete
  - `event.detail.hasUpdate` - Whether an update is available
  - `event.detail.currentVersion` - The current version
  - `event.detail.latestVersion` - The latest version

- `changelog-opened` - Dispatched when changelog dialog is opened
- `changelog-closed` - Dispatched when changelog dialog is closed
- `update-dismissed` - Dispatched when an update is dismissed

### SvgHeader

Component for displaying SVG headers with proper styling, theme integration, and fallback support.

**Usage:**

```javascript
import { SvgHeader } from './components/SvgHeader';

// Create a new SVG header with default options
const svgHeader = new SvgHeader();

// Create with custom options
const customHeader = new SvgHeader({
  svgPath: 'path/to/header.svg',            // Path to the SVG file
  fallbackText: 'Header Title',             // Text to show if SVG fails to load
  ariaLabel: 'Page Header',                 // Accessibility label
  container: document.querySelector('#app'), // Container to append to
  cssPath: 'path/to/svg-styles.css',        // CSS path for SVG styling
  cssVariables: ['--theme-primary', '--theme-secondary'], // CSS vars to pass to SVG
  autoInit: true                            // Initialize automatically
});

// Initialize manually if autoInit is false
const manualHeader = new SvgHeader({ autoInit: false });
const headerContainer = manualHeader.initialize();

// Change SVG path dynamically
svgHeader.setSvgPath('path/to/new-header.svg');

// Update fallback text
svgHeader.setFallbackText('New Header Title');

// Remove the component from the DOM
svgHeader.destroy();
```

**HTML Structure:**

The component creates the following HTML structure:

```html
<div class="headerContainer header-container svg-loading">
  <object data="sdde.svg" type="image/svg+xml" class="headerSvg header-svg" aria-label="Steam Deck DUB Edition Logo">
    <div class="svgFallback svg-fallback">
      <h2>Steam Deck DUB Edition</h2>
    </div>
  </object>
</div>
```

**API:**

- `constructor(options)` - Creates a new SvgHeader instance with the following options:
  - `svgPath` - Path to the SVG file (default: 'sdde.svg')
  - `fallbackText` - Text to show if SVG fails to load (default: 'Steam Deck DUB Edition')
  - `ariaLabel` - Accessibility label for the SVG (default: 'Steam Deck DUB Edition Logo')
  - `container` - Container element to append the header to (default: document.body)
  - `cssPath` - Path to external CSS for the SVG (default: 'svg-header-styles.css')
  - `cssVariables` - CSS variables to pass to the SVG (default: common theme variables)
  - `autoInit` - Whether to initialize automatically (default: true)

- `initialize()` - Initializes the SVG header and returns the created container
- `setSvgPath(path)` - Updates the SVG path
- `setFallbackText(text)` - Updates the fallback text
- `destroy()` - Removes the component from the DOM

**States:**

The component has several states that are reflected in CSS classes:
- `svg-loading` - When the SVG is loading
- `svg-loaded` - When the SVG has loaded successfully
- `svg-error` - When the SVG failed to load (shows fallback)

**Events:**

- `svg-loaded` - Dispatched when the SVG is loaded successfully
  - `event.detail.svgHeader` - The SvgHeader instance
  - `event.detail.svgDoc` - The SVG document

- `svg-error` - Dispatched when the SVG fails to load
  - `event.detail.svgHeader` - The SvgHeader instance

### SettingsSection

Component for creating and managing settings sections with various input types, designed for settings panels and preference dialogs.

**Usage:**

```javascript
import { SettingsSection } from './components/SettingsSection';

// Create a simple settings section with default options
const settingsSection = new SettingsSection({
  id: 'appearance',
  title: 'Appearance Settings',
  icon: '🎨', // Can be emoji or HTML
  container: document.getElementById('settings-container'),
  onSettingChange: (settingId, value) => {
    console.log(`Setting ${settingId} changed to ${value}`);
  }
});

// Create a section with pre-configured settings
const themeSection = new SettingsSection({
  id: 'theme-settings',
  title: 'Theme',
  icon: '🌙',
  settings: [
    {
      id: 'darkMode',
      type: 'toggle',
      label: 'Dark Mode',
      value: true,
      description: 'Enable dark mode throughout the application'
    },
    {
      id: 'theme',
      type: 'select',
      label: 'Color Theme',
      value: 'dracula',
      options: [
        { value: 'dracula', label: 'Dracula' },
        { value: 'nord', label: 'Nord' },
        { value: 'solarized', label: 'Solarized' }
      ]
    },
    {
      id: 'fontSize',
      type: 'slider',
      label: 'Font Size',
      value: 16,
      min: 12,
      max: 24,
      step: 1
    },
    {
      id: 'resetTheme',
      type: 'button',
      label: 'Reset to Defaults',
      variant: 'secondary',
      onClick: () => resetThemeSettings()
    }
  ]
});

// Add a new setting dynamically
settingsSection.addSetting({
  id: 'notifications',
  type: 'toggle',
  label: 'Enable Notifications',
  value: true
});

// Update a setting value
settingsSection.updateSetting('fontSize', 18);

// Get all current values
const values = settingsSection.getValues();
console.log(values); // { darkMode: true, theme: 'dracula', fontSize: 18, ... }

// Listen for setting changes
document.addEventListener('setting-change', (event) => {
  const { settingId, value } = event.detail;
  saveSettings({ [settingId]: value });
});
```

**API:**

- `constructor(options)` - Creates a new SettingsSection instance with the following options:
  - `id` - Unique identifier for the section (default: auto-generated)
  - `title` - Section title (default: 'Settings')
  - `icon` - Icon for the section, can be emoji or HTML (default: '⚙️')
  - `container` - Container element to append the section to (default: document.body)
  - `onSettingChange` - Callback for setting changes, receives (settingId, value, event)
  - `settings` - Array of setting configurations (see below)
  - `autoInit` - Whether to initialize immediately (default: true)

- `initialize()` - Initializes the settings section and returns the created container
- `updateSetting(id, value, triggerChange)` - Updates a setting value
- `setSettingDisabled(id, disabled)` - Enables/disables a setting
- `addSetting(setting)` - Adds a new setting to the section
- `removeSetting(id)` - Removes a setting from the section
- `getValues()` - Returns all current setting values as an object
- `setValues(values, triggerChange)` - Updates multiple settings at once
- `resetToDefaults(triggerChange)` - Resets all settings to their default values
- `destroy()` - Removes the section from the DOM and cleans up references

**Setting Types:**

The component supports various setting types:

1. **Toggle** (`type: 'toggle'`):
   ```javascript
   {
     id: 'enableFeature',
     type: 'toggle',
     label: 'Enable Feature',
     value: true,                // Current value
     defaultValue: false,        // Default value for reset
     disabled: false,            // Whether the control is disabled
     description: 'Description'  // Optional description text
   }
   ```

2. **Select** (`type: 'select'`):
   ```javascript
   {
     id: 'language',
     type: 'select',
     label: 'Language',
     value: 'en',
     options: [
       { value: 'en', label: 'English' },
       { value: 'es', label: 'Spanish' }
     ],
     disabled: false
   }
   ```

3. **Radio** (`type: 'radio'`):
   ```javascript
   {
     id: 'layout',
     type: 'radio',
     label: 'Layout',
     value: 'grid',
     options: [
       { value: 'grid', label: 'Grid' },
       { value: 'list', label: 'List' }
     ]
   }
   ```

4. **Text Input** (`type: 'text'`):
   ```javascript
   {
     id: 'username',
     type: 'text',
     label: 'Username',
     value: '',
     placeholder: 'Enter username',
     inputType: 'text',         // Can be 'text', 'email', 'password', etc.
     maxLength: 50
   }
   ```

5. **Slider** (`type: 'slider'`):
   ```javascript
   {
     id: 'volume',
     type: 'slider',
     label: 'Volume',
     value: 50,
     min: 0,
     max: 100,
     step: 1
   }
   ```

6. **Button** (`type: 'button'`):
   ```javascript
   {
     id: 'resetSettings',
     type: 'button',
     label: 'Reset Settings',
     variant: 'primary',       // 'primary', 'secondary', 'danger'
     onClick: () => {}         // Click handler
   }
   ```

7. **Custom** (`type: 'custom'`):
   ```javascript
   {
     id: 'custom',
     type: 'custom',
     label: 'Custom Setting',
     customElement: document.createElement('div') // Your custom element
   }
   ```

**Events:**

- `setting-change` - Dispatched when a setting is changed
  - `event.detail.settingId` - The ID of the changed setting
  - `event.detail.value` - The new value
  - `event.detail.section` - The SettingsSection instance
  - `event.detail.originalEvent` - The original event that triggered the change

### SettingsTabs

Component for creating and managing tabbed interfaces in settings panels and preference dialogs.

**Usage:**

```javascript
import { SettingsTabs } from './components/SettingsTabs';

// Create a new tabs component with default options
const tabs = new SettingsTabs({
  id: 'settings-tabs',
  container: document.getElementById('settings-container'),
  tabs: [
    { id: 'general', label: 'General', content: 'General settings content' },
    { id: 'accessibility', label: 'Accessibility', content: document.getElementById('accessibility-settings') },
    { id: 'advanced', label: 'Advanced', icon: '⚙️', content: '<div>Advanced settings</div>' }
  ],
  activeTab: 'general',
  onTabChange: (tabId, prevTabId) => {
    console.log(`Tab changed from ${prevTabId} to ${tabId}`);
  }
});

// Add a new tab dynamically
tabs.addTab({
  id: 'appearance',
  label: 'Appearance',
  icon: '🎨',
  content: createAppearanceSettingsContent()
}, true); // Switch to the new tab

// Remove a tab
tabs.removeTab('advanced');

// Switch to a tab programmatically
tabs.switchToTab('accessibility');

// Update tab content or properties
tabs.updateTab('general', {
  label: 'Main Settings',
  content: updatedSettingsContent
});

// Get currently active tab
const activeTabId = tabs.getActiveTab(); 

// Listen for tab changes
document.addEventListener('tab-change', (event) => {
  const { tabId, previousTabId } = event.detail;
  saveUserPreference('lastActiveTab', tabId);
});

// Destroy the tabs component when no longer needed
tabs.destroy();
```

**HTML Structure:**

The component creates the following HTML structure:

```html
<div id="settings-tabs" class="settingsTabs">
  <div class="tabButtons" role="tablist">
    <button class="tabButton active" data-tab="general" role="tab" aria-controls="general-pane" aria-selected="true" id="tab-button-general">
      <span class="tabIcon">🔧</span>
      <span class="tabLabel">General</span>
    </button>
    <button class="tabButton" data-tab="accessibility" role="tab" aria-controls="accessibility-pane" aria-selected="false" id="tab-button-accessibility">
      <span class="tabLabel">Accessibility</span>
    </button>
    <!-- More tab buttons... -->
  </div>
  
  <div class="tabContent">
    <div id="general-pane" class="tabPane active" role="tabpanel" aria-labelledby="tab-button-general">
      <!-- Tab content here -->
    </div>
    <div id="accessibility-pane" class="tabPane" role="tabpanel" aria-labelledby="tab-button-accessibility" hidden>
      <!-- Tab content here -->
    </div>
    <!-- More tab panes... -->
  </div>
</div>
```

**API:**

- `constructor(options)` - Creates a new SettingsTabs instance with the following options:
  - `id` - Unique identifier for the tabs container (default: auto-generated)
  - `container` - Container element to append the tabs to (default: document.body)
  - `tabs` - Array of tab configurations (see Tab Configuration below)
  - `onTabChange` - Callback for tab changes, receives (tabId, previousTabId)
  - `activeTab` - The initially active tab ID (default: first tab in the tabs array)
  - `autoInit` - Whether to initialize automatically (default: true)

- `initialize()` - Initializes the tabs component if not auto-initialized
- `switchToTab(tabId)` - Switches to the specified tab
- `addTab(tab, switchTo)` - Adds a new tab, optionally switching to it
- `removeTab(tabId)` - Removes a tab
- `updateTab(tabId, tabProps)` - Updates a tab's properties
- `getActiveTab()` - Returns the currently active tab ID
- `getTabs()` - Returns a copy of the tabs configuration array
- `destroy()` - Removes the tabs component from the DOM and cleans up

**Tab Configuration:**

Each tab is configured with an object containing:

```javascript
{
  id: 'tab-id',          // Required: Unique identifier for the tab
  label: 'Tab Label',    // Text label for the tab
  icon: '🔧',            // Optional: Icon (emoji or HTML string)
  content: '...'         // Content for the tab pane (string, HTML element, or DOM node)
}
```

**Events:**

- `tab-change` - Dispatched when the active tab changes
  - `event.detail.tabs` - The SettingsTabs instance
  - `event.detail.tabId` - The new active tab ID
  - `event.detail.previousTabId` - The previously active tab ID

**Accessibility Features:**

- Full keyboard navigation between tabs (Left/Right arrows, Home/End keys)
- Proper ARIA attributes for screen readers
- Focus management for keyboard users
- Support for prefers-reduced-motion media query

## PreferencesDialog

The `PreferencesDialog` component provides a flexible and customizable dialog for managing user preferences. It supports various types of settings controls (toggle, select, slider, etc.) and organizes them into tabbed sections for better usability.

### Usage

```javascript
// Import the component
import PreferencesDialog from '../components/PreferencesDialog';

// Create a simple preferences dialog
const prefsDialog = new PreferencesDialog({
  container: document.getElementById('app'),
  title: 'Application Settings',
  description: 'Customize your experience',
  onSave: (preferences) => {
    console.log('Saved preferences:', preferences);
    localStorage.setItem('app-preferences', JSON.stringify(preferences));
  },
  onReset: () => {
    console.log('Preferences reset to defaults');
    localStorage.removeItem('app-preferences');
  },
  autoInit: true
});

// Open the dialog
prefsDialog.open();
```

### Creating with Predefined Preferences and Tabs

```javascript
// Define preferences structure with multiple tabs and settings
const preferencesConfig = {
  appearance: {
    theme: {
      type: 'select',
      label: 'Theme',
      description: 'Select your preferred color theme',
      value: 'dark',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System Default' }
      ]
    },
    fontSize: {
      type: 'slider',
      label: 'Font Size',
      description: 'Adjust the size of text',
      value: 16,
      min: 12,
      max: 24,
      step: 1
    }
  },
  accessibility: {
    reduceMotion: {
      type: 'toggle',
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      value: false
    },
    highContrast: {
      type: 'toggle',
      label: 'High Contrast',
      description: 'Increase contrast for better visibility',
      value: false
    }
  },
  advanced: {
    enableExperimental: {
      type: 'toggle',
      label: 'Experimental Features',
      description: 'Enable experimental features (may be unstable)',
      value: false
    },
    resetData: {
      type: 'button',
      label: 'Reset User Data',
      buttonText: 'Reset',
      buttonStyle: 'danger',
      description: 'Delete all user data and reset to defaults',
      onClick: () => {
        // Handle data reset logic
        console.log('User data reset initiated');
      }
    }
  }
};

// Define tabs configuration
const tabsConfig = [
  { id: 'appearance', label: 'Appearance', active: true },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'advanced', label: 'Advanced' }
];

// Create dialog with tabs and preferences
const prefsDialog = new PreferencesDialog({
  container: document.getElementById('app'),
  title: 'Settings',
  description: 'Customize your application settings',
  preferences: preferencesConfig,
  tabs: tabsConfig,
  onSave: savePreferences,
  onReset: resetPreferences,
  autoInit: true
});
```

### API

#### Constructor Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `container` | Element | Container element where the dialog will be rendered | Required |
| `title` | String | Dialog title | "Preferences" |
| `description` | String | Dialog description text | "Customize your preferences" |
| `preferences` | Object | Preferences configuration object | `{}` |
| `tabs` | Array | Tab configuration array | `[]` |
| `onSave` | Function | Callback function when preferences are saved | `null` |
| `onReset` | Function | Callback function when preferences are reset | `null` |
| `closeOnOutsideClick` | Boolean | Whether to close the dialog when clicking outside | `true` |
| `showButton` | Boolean | Whether to show a floating button to open preferences | `false` |
| `buttonPosition` | String | Position of the button if shown ('bottom-right', 'bottom-left', 'top-right', 'top-left') | "bottom-right" |
| `autoInit` | Boolean | Whether to initialize the dialog on instantiation | `true` |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `initialize()` | None | Initialize and create the dialog elements |
| `open()` | None | Open the preferences dialog |
| `close()` | None | Close the preferences dialog |
| `setPreference(key, value)` | `key`: String, `value`: Any | Update a single preference |
| `setPreferences(preferencesObj)` | `preferencesObj`: Object | Update multiple preferences at once |
| `getCurrentPreferences()` | None | Get the current preferences state |
| `addPreference(key, config)` | `key`: String, `config`: Object | Add a new preference control |
| `removePreference(key)` | `key`: String | Remove a preference control |
| `addTab(tabConfig)` | `tabConfig`: Object | Add a new tab |
| `removeTab(tabId)` | `tabId`: String | Remove a tab |
| `showNotification(message, [type], [duration])` | `message`: String, `type`: String, `duration`: Number | Show a notification message |
| `destroy()` | None | Destroy the dialog and clean up event listeners |

### Preference Types

The component supports several types of preference controls:

#### Toggle

```javascript
{
  type: 'toggle',
  label: 'Enable Feature',
  description: 'Optional description text',
  value: true
}
```

#### Select

```javascript
{
  type: 'select',
  label: 'Theme',
  description: 'Choose your preferred theme',
  value: 'dark',
  options: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' }
  ]
}
```

#### Radio Group

```javascript
{
  type: 'radio',
  label: 'View Mode',
  description: 'Select how content is displayed',
  value: 'card',
  options: [
    { value: 'list', label: 'List View' },
    { value: 'card', label: 'Card View' },
    { value: 'compact', label: 'Compact View' }
  ]
}
```

#### Slider

```javascript
{
  type: 'slider',
  label: 'Volume',
  description: 'Adjust the sound volume',
  value: 75,
  min: 0,
  max: 100,
  step: 5,
  showValue: true
}
```

#### Text Input

```javascript
{
  type: 'text',
  label: 'Username',
  description: 'Your display name',
  value: 'User123',
  placeholder: 'Enter username',
  maxLength: 20
}
```

#### Button

```
```

### PageLoader

A fullscreen loading overlay component that provides visual feedback during page or content loading operations.

**Usage:**

```javascript
import PageLoader from './components/PageLoader';

// Create a basic page loader
const loader = new PageLoader({
  container: document.getElementById('app'),
  message: 'Loading content...',
  autoInit: true
});

// Show the loader
loader.show();

// Update the message dynamically
loader.setMessage('Loading resources...');

// Track progress (0-100)
loader.setProgress(25);

// Add multiple load steps
loader.addLoadStep('fetchData');
loader.addLoadStep('processImages');
loader.addLoadStep('renderContent');

// Complete a step
loader.completeLoadStep('fetchData'); // Progress will update automatically

// Hide when done
loader.hide();

// Show an error if something goes wrong
loader.showError('Failed to load content. Please try again.');

// Clean up when done
loader.destroy();
```

**API:**

- `constructor(options)` - Creates a new PageLoader instance with the following options:
  - `container` - Container element to append the loader to (default: document.body)
  - `message` - Initial loading message (default: 'Loading...')
  - `showSpinner` - Whether to show the loading spinner (default: true)
  - `showProgress` - Whether to show a progress bar (default: false)
  - `autoHide` - Whether to automatically hide when progress reaches 100% (default: true)
  - `minDisplayTime` - Minimum time in ms to display the loader (default: 500)
  - `fadeOutTime` - Time in ms for the fade-out animation (default: 300)
  - `autoInit` - Whether to initialize immediately (default: false)

- `initialize()` - Initializes the loader
- `show()` - Shows the loader
- `hide()` - Hides the loader
- `setMessage(message)` - Updates the loading message
- `setProgress(percent)` - Updates the progress (0-100)
- `addLoadStep(stepId)` - Adds a load step to track
- `completeLoadStep(stepId)` - Marks a load step as complete
- `showError(message)` - Shows an error message
- `destroy()` - Removes the loader and cleans up

**Events:**

- `pageloader-shown` - Fired when the loader is shown
- `pageloader-hidden` - Fired when the loader is hidden
- `pageloader-progress` - Fired when progress is updated
- `pageloader-error` - Fired when an error is shown
- `pageloader-destroyed` - Fired when the loader is destroyed

**Accessibility Features:**

- Respects `prefers-reduced-motion` media query
- Uses appropriate ARIA attributes
- Provides high-contrast visuals
- Prevents interaction with background content when visible

**Visual Examples:**

![PageLoader - Default](images/pageloader/pageloader-default.png)
*Default PageLoader with spinner and loading message displayed as a fullscreen overlay. The loader shows a centered spinner animation with "Loading..." text below it.*

![PageLoader - With Progress](images/pageloader/pageloader-progress.png)
*PageLoader showing a progress bar at 65% completion with custom status message. This configuration provides users with a visual indication of how long they need to wait.*

![PageLoader - Interaction](images/pageloader/pageloader-interaction.gif)
*Animated demonstration showing the PageLoader in action - appearing, updating progress as content loads, and then smoothly fading out when loading is complete.*

### NotificationSystem

A flexible notification system component that displays various types of notifications to users in a consistent and accessible way.

**Usage:**

```javascript
import NotificationSystem from './components/NotificationSystem';

// Create a notification system with default options
const notifications = new NotificationSystem({
  container: document.body,
  position: 'top-right',
  maxNotifications: 5,
  autoInit: true
});

// Show different types of notifications
notifications.showNotification('This is an information message', 'info');
notifications.showNotification('Operation completed successfully!', 'success');
notifications.showNotification('This might require attention', 'warning');
notifications.showNotification('An error occurred while saving', 'error');

// Show a notification with custom options
notifications.showNotification('File uploaded successfully', 'success', {
  duration: 8000,          // 8 seconds
  closable: true,          // Show close button
  animationDuration: 300,  // Animation speed in ms
  icon: 'check-circle',    // Custom icon
  onClose: () => {
    console.log('Notification was closed');
  }
});

// Add an action button to a notification
notifications.showNotification('Your changes were saved', 'success', {
  actions: [
    {
      text: 'Undo',
      onClick: () => undoChanges()
    }
  ]
});

// Clear all notifications
notifications.clearAll();

// Destroy the notification system when no longer needed
notifications.destroy();
```

**API:**

- `constructor(options)` - Creates a new NotificationSystem instance with the following options:
  - `container` - Container element to append notifications to (default: document.body)
  - `position` - Position for notifications ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center') (default: 'top-right')
  - `maxNotifications` - Maximum number of concurrent notifications (default: 5)
  - `duration` - Default display duration in milliseconds (default: 5000)
  - `closable` - Whether notifications show a close button by default (default: true)
  - `pauseOnHover` - Whether to pause auto-close timer when hovering (default: true)
  - `animations` - Whether to enable animations (default: true)
  - `animationDuration` - Duration of animations in milliseconds (default: 300)
  - `autoInit` - Whether to initialize immediately (default: true)

- `initialize()` - Initializes the notification system
- `showNotification(message, type, options)` - Shows a notification
  - `message` - Notification message (string or HTMLElement)
  - `type` - Notification type ('info', 'success', 'warning', 'error')
  - `options` - Optional configuration for this specific notification
- `clearAll()` - Removes all current notifications
- `setPosition(position)` - Updates the position of the notification container
- `destroy()` - Removes the notification system and cleans up

**Notification Options:**

```javascript
{
  duration: 5000,           // Display duration in ms (0 for no auto-close)
  closable: true,           // Whether to show a close button
  animationDuration: 300,   // Animation speed in ms
  icon: 'info-circle',      // Icon to display
  actions: [],              // Action buttons (see below)
  className: '',            // Additional CSS class
  onShow: () => {},         // Callback when notification is shown
  onClose: () => {}         // Callback when notification is closed
}
```

**Action Configuration:**

```javascript
{
  actions: [
    {
      text: 'Action Text',  // Button text
      primary: true,        // Whether this is the primary action (optional)
      onClick: () => {      // Click handler
        // Action logic
        return true;  // Return true to close notification
      }
    }
  ]
}
```

**Events:**

- `notification-shown` - Fired when a notification is shown
  - `event.detail.notification` - The notification element
  - `event.detail.type` - The notification type
  - `event.detail.id` - Unique ID of the notification
- `notification-closed` - Fired when a notification is closed
  - `event.detail.notification` - The notification element
  - `event.detail.id` - Unique ID of the notification
- `notification-action` - Fired when a notification action is clicked
  - `event.detail.notification` - The notification element
  - `event.detail.action` - The action configuration object
  - `event.detail.id` - Unique ID of the notification

**Accessibility Features:**

- Uses appropriate ARIA roles and attributes
- Color combinations meet WCAG contrast requirements
- Keyboard accessible (notifications can be closed with keyboard)
- Respects `prefers-reduced-motion` media query
- Screen reader friendly

**Visual Examples:**

![Notification System - Info](images/notification/notification-info.png)
*Information notification with blue styling and info icon. Used for general messages and updates that don't require immediate action.*

![Notification System - Success](images/notification/notification-success.png)
*Success notification with green styling and checkmark icon. Used to confirm actions have completed successfully.*

![Notification System - Warning](images/notification/notification-warning.png)
*Warning notification with amber/yellow styling and warning icon. Used for important messages that require attention but aren't critical errors.*

![Notification System - Error](images/notification/notification-error.png)
*Error notification with red styling and error icon. Used to alert users to problems that need addressing.*

![Notification System - Interaction](images/notification/notification-interaction.gif)
*Animated demonstration showing multiple notifications appearing, stacking, and automatically dismissing. The animation also shows hover pause functionality and manual dismissal.*

### ErrorHandler

A centralized error handling component that provides consistent error management, logging, and user feedback across the application.

**Usage:**

```javascript
import ErrorHandler from './components/ErrorHandler';

// Create an error handler with default options
const errorHandler = new ErrorHandler({
  captureGlobalErrors: true,  // Catch unhandled errors
  logErrors: true,            // Log errors to console
  showNotifications: true,    // Show user-friendly notifications
  notificationType: 'toast',  // 'toast' or 'modal'
  autoInit: true              // Initialize immediately
});

// Wrap a function with error handling
const safeFunction = errorHandler.createErrorWrapper(
  async function riskyFunction() {
    // Function that might throw errors
    const data = await fetchData();
    return processData(data);
  },
  {
    userMessage: 'Failed to load data',
    fallbackValue: []
  }
);

// Call the wrapped function safely
const result = await safeFunction();

// Handle a specific error
try {
  // Code that might throw an error
  await saveUserData(userData);
} catch (error) {
  errorHandler.handleError(error, {
    displayMode: 'modal',
    userMessage: 'Failed to save your profile',
    includeErrorDetails: process.env.NODE_ENV === 'development',
    actionButtons: [
      {
        text: 'Try Again',
        onClick: () => saveUserData(userData)
      },
      {
        text: 'Cancel'
      }
    ]
  });
}

// Check the error history
const recentErrors = errorHandler.getErrorHistory();
console.log(`There have been ${recentErrors.length} errors recently`);

// Clean up when no longer needed
errorHandler.destroy();
```

**API:**

- `constructor(options)` - Creates a new ErrorHandler instance with the following options:
  - `captureGlobalErrors` - Whether to capture unhandled errors and rejections (default: true)
  - `logErrors` - Whether to log errors to the console (default: true)
  - `showNotifications` - Whether to show user-facing notifications (default: true)
  - `notificationType` - Default notification type ('toast' or 'modal') (default: 'toast')
  - `notificationDuration` - Duration for toast notifications in ms (default: 5000)
  - `includeStackTrace` - Whether to include stack trace in logs (default: true)
  - `onError` - Global callback function for all errors (optional)
  - `errorMessages` - Custom error messages for specific error types (optional)
  - `maxErrorHistory` - Maximum number of errors to keep in history (default: 10)
  - `autoInit` - Whether to initialize immediately (default: true)

- `init()` - Initializes the error handler
- `handleError(error, options)` - Handles a specific error with custom options
  - `error` - The error object to handle
  - `options` - Custom handling options for this error (see Error Options below)
- `createErrorWrapper(fn, options)` - Creates a wrapped function with error handling
- `getErrorHistory()` - Returns the recent error history
- `clearErrorHistory()` - Clears the error history
- `destroy()` - Removes global handlers and cleans up

**Error Options:**

```javascript
{
  displayMode: 'toast',         // 'toast', 'modal', 'inline', or 'none'
  userMessage: 'An error occurred', // User-friendly message
  errorId: 'unique-id',         // Optional error ID for tracking
  includeErrorDetails: false,   // Whether to include technical details
  logLevel: 'error',            // 'error', 'warn', 'info'
  context: { page: 'settings' }, // Additional context for logging
  actionButtons: [],            // Action buttons for modal display
  element: null,                // Target element for inline errors
  onClose: () => {}             // Callback when notification is closed
}
```

**Events:**

- `error-handled` - Fired when an error is handled
  - `event.detail.error` - The original error object
  - `event.detail.errorId` - Unique ID for the error
  - `event.detail.context` - Error context if provided
- `error-notification-closed` - Fired when an error notification is closed
  - `event.detail.errorId` - Unique ID for the error
- `error-action-clicked` - Fired when an action button is clicked
  - `event.detail.errorId` - Unique ID for the error
  - `event.detail.action` - The action configuration object

**Visual Examples:**

![Error Handler - Toast Error](images/errorhandler/errorhandler-toast.png)
*Error handler showing a toast notification for a non-critical error. These notifications appear briefly and automatically dismiss after a set duration.*

![Error Handler - Modal Error](images/errorhandler/errorhandler-modal.png)
*Error handler displaying a modal dialog for a critical error. The modal includes the error message, additional details (expandable in development mode), and action buttons for users to resolve the issue.*

![Error Handler - Interaction](images/errorhandler/errorhandler-interaction.gif)
*Animated demonstration showing the ErrorHandler capturing an unhandled exception, displaying the appropriate notification, and providing recovery options to the user.*

### HelpCenter

A comprehensive help center component that provides contextual documentation, search functionality, and navigation for users seeking assistance.

**Usage:**

```javascript
import HelpCenter from './components/HelpCenter';

// Create a help center with default options
const helpCenter = new HelpCenter({
  container: document.body,
  helpContentUrl: './help-content/',
  defaultTopic: 'getting-started',
  autoInit: true
});

// Open the help center
helpCenter.open();

// Open the help center to a specific topic
helpCenter.openTopic('keyboard-shortcuts');

// Search for specific content
helpCenter.search('how to upload files');

// Close the help center
helpCenter.close();

// Get the currently active topic
const currentTopic = helpCenter.getCurrentTopic();

// Programmatically navigate through the help content
helpCenter.navigateBack();
helpCenter.navigateForward();

// Refresh the help content
helpCenter.refreshContent();

// Destroy the help center when no longer needed
helpCenter.destroy();
```

**API:**

- `constructor(options)` - Creates a new HelpCenter instance with the following options:
  - `container` - Container element to append the help center to (default: document.body)
  - `helpContentUrl` - Base URL for help content (default: './help-content/')
  - `defaultTopic` - Default topic to show when opened (default: 'home')
  - `searchEnabled` - Whether to enable search functionality (default: true)
  - `navigateHistoryEnabled` - Whether to enable back/forward navigation (default: true)
  - `animationDuration` - Duration for animations in milliseconds (default: 300)
  - `showFloatingButton` - Whether to show a floating help button (default: false)
  - `floatingButtonPosition` - Position for the floating button ('bottom-right', 'bottom-left', 'top-right', 'top-left') (default: 'bottom-right')
  - `onOpen` - Callback function when help center is opened (optional)
  - `onClose` - Callback function when help center is closed (optional)
  - `onTopicChange` - Callback function when the topic changes (optional)
  - `autoInit` - Whether to initialize immediately (default: true)

- `initialize()` - Initializes the help center
- `open()` - Opens the help center
- `close()` - Closes the help center
- `openTopic(topicId)` - Opens a specific topic
- `getCurrentTopic()` - Returns the current topic ID
- `search(query)` - Searches for content and displays results
- `navigateBack()` - Navigates to the previous topic in history
- `navigateForward()` - Navigates to the next topic in history
- `refreshContent()` - Refreshes the current content
- `destroy()` - Removes the help center and cleans up

**Events:**

- `helpcenter-opened` - Fired when the help center is opened
- `helpcenter-closed` - Fired when the help center is closed
- `helpcenter-topic-changed` - Fired when the topic is changed
  - `event.detail.topic` - The new topic ID
  - `event.detail.previousTopic` - The previous topic ID
- `helpcenter-search` - Fired when a search is performed
  - `event.detail.query` - The search query
  - `event.detail.resultsCount` - Number of results found

**Help Content Structure:**

The help content is expected to be organized as follows:

```
help-content/
  ├── index.json        - Contains topic listing and metadata
  ├── getting-started/  - Topic folder
  │   ├── index.html    - Topic content
  │   └── assets/       - Topic-specific assets
  ├── keyboard-shortcuts/
  │   └── index.html
  └── troubleshooting/
      └── index.html
```

The `index.json` file should have the following structure:

```json
{
  "topics": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "description": "Learn the basics",
      "icon": "rocket"
    },
    {
      "id": "keyboard-shortcuts",
      "title": "Keyboard Shortcuts",
      "description": "Boost your productivity",
      "icon": "keyboard"
    }
  ],
  "categories": [
    {
      "id": "basics",
      "title": "Basics",
      "topics": ["getting-started", "keyboard-shortcuts"]
    },
    {
      "id": "advanced",
      "title": "Advanced",
      "topics": ["troubleshooting"]
    }
  ]
}
```

**Accessibility Features:**

- Fully keyboard navigable
- Proper focus management
- ARIA attributes for screen readers
- Respects user's color scheme and motion preferences

**Visual Examples:**

![Help Center - Main View](images/helpcenter/helpcenter-main.png)
*Main view of the Help Center showing the navigation sidebar on the left and content area on the right. The sidebar displays categorized topics for easy navigation.*

![Help Center - Search](images/helpcenter/helpcenter-search.png)
*Help Center search functionality showing search results highlighting matching terms. The search provides instant results as users type their query.*

![Help Center - Topic View](images/helpcenter/helpcenter-topic.png)
*A specific topic view in the Help Center with structured content including headings, paragraphs, lists, code examples, and images.*

![Help Center - Navigation](images/helpcenter/helpcenter-navigation.gif)
*Animated demonstration showing navigation between topics, searching for content, and using the back/forward navigation. The animation highlights the smooth transitions between different help sections.*