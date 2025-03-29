/**
 * CSS Entry Point for Webpack Bundling
 * 
 * This file imports all CSS files in the correct order to ensure proper styling.
 * The order is important to maintain style specificity and cascading rules.
 */

// Core styles (variables, reset, base)
import './core/fonts.css';
import './core/variables.css';
import './core/base.css';
import './core/consolidated.css';

// Layout styles
import './layouts/main-layout.css';
import './layouts/header.css';
import './layouts/sections.css';

// Component styles
// SvgHeader is now imported via CSS modules
// import './components/svg-header.css';
// Search is now imported via CSS modules
// import './components/search.css';
// VersionDisplay is now imported via CSS modules
// import './components/version-manager.css';
// VersionManager is now imported via CSS modules
// import './components/version-manager.css';
// Progress Tracker is now imported via CSS modules
// import './components/progress-tracker.css';
// PreferencesDialog is now imported via CSS modules
// import './components/preferences-dialog.css';
// Lightbox/Gallery is now imported via CSS modules
// import './components/lightbox.css';
// AccessibilityControls is now imported via CSS modules
// import './components/accessibility-controls.css';
// SettingsTabs is now imported via CSS modules
// import './components/settings-tabs.css';
// Notifications is now imported via CSS modules
// import './components/notifications.css';
// SettingsSection is now imported via CSS modules
// import './components/settings-section.css';
// CodeBlocks is now imported via CSS modules
// import './components/code-blocks.css';
// Theme is now imported via CSS modules
// import './components/theme.css';

// Animation styles
import './animations/background.css';
import './animations/preferences.css';

// Utility styles (should come last for highest specificity)
import './utilities/pseudo-elements.css';
import './utilities/debug.css';

// Global styles
import './theme.css';

// Note: Theme files will be loaded separately with webpack
console.log('CSS files loaded'); 