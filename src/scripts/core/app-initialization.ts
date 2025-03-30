/**
 * app-initialization.ts - Core application initialization module
 * Handles base settings, accessibility, i18n and cross-cutting concerns
 */

// Import core modules
import { initializeI18n, getTranslation } from '../i18n/i18n-manager';
import { settingsManager } from '../settings/settings-manager';
import { accessibilityManager } from '../accessibility/accessibility-manager';
import { progressTracker } from '../progress/progress-tracker';

// Define initialization options interface
interface InitializationOptions {
  enableI18n?: boolean;
  enableAccessibility?: boolean;
  enableSettings?: boolean;
  enableProgressTracking?: boolean;
  onInitialized?: () => void;
}

/**
 * Initialize the application with the provided options
 * @param options Initialization options
 */
export async function initializeApplication(options: InitializationOptions = {}): Promise<void> {
  console.log('Initializing core application modules...');
  
  const {
    enableI18n = true,
    enableAccessibility = true,
    enableSettings = true,
    enableProgressTracking = true,
    onInitialized
  } = options;
  
  try {
    // Initialize internationalization first
    if (enableI18n) {
      await initializeI18n();
      console.log(getTranslation('initialization.i18n_ready'));
    }
    
    // Initialize accessibility features
    if (enableAccessibility) {
      accessibilityManager.initialize();
      console.log(getTranslation('initialization.accessibility_ready'));
    }
    
    // Initialize settings
    if (enableSettings) {
      settingsManager.initialize();
      console.log(getTranslation('initialization.settings_ready'));
    }
    
    // Track progress last (depends on settings)
    if (enableProgressTracking) {
      // Wait for DOM content to be loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          progressTracker.initialize();
          console.log(getTranslation('initialization.progress_tracking_ready'));
        });
      } else {
        progressTracker.initialize();
        console.log(getTranslation('initialization.progress_tracking_ready'));
      }
    }
    
    // Listen for theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        updateTheme(e.matches ? 'dark' : 'light');
      });
    }
    
    // Register with service worker if available
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registration successful:', registration.scope);
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
    
    // Append progress tracker stylesheet
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/assets/css/progress-tracker.css';
    document.head.appendChild(linkElement);
    
    // Call onInitialized callback if provided
    if (onInitialized) {
      onInitialized();
    }
    
    console.log('Core application modules initialized successfully');
  } catch (error) {
    console.error('Failed to initialize core application modules:', error);
    throw error; // Re-throw to allow calling code to handle it
  }
}

/**
 * Update the theme across the application
 * @param theme The theme to apply ('light' or 'dark')
 */
export function updateTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  settingsManager.setSetting('theme', theme);
  
  // Dispatch theme change event
  document.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme }
  }));
  
  console.log(`Theme updated to: ${theme}`);
}

/**
 * Reset application settings to defaults
 */
export function resetApplication(): Promise<void> {
  return new Promise<void>((resolve) => {
    // Clear all settings
    settingsManager.resetAllSettings();
    
    // Reset progress
    progressTracker.resetProgress();
    
    // Reset accessibility preferences
    accessibilityManager.resetPreferences();
    
    // Set default theme
    updateTheme('light');
    
    console.log('Application has been reset to default state');
    resolve();
  });
}

/**
 * Check if application has been initialized
 */
export function isInitialized(): boolean {
  return settingsManager.isInitialized() && 
         accessibilityManager.isInitialized();
}

// Export managers for direct access
export { settingsManager, accessibilityManager, progressTracker }; 