/**
 * Grimoire
 * Main TypeScript
 */

// Import the Theme class
import Theme from '../../components/Theme/Theme';

// Create an interface for theme changed event
interface ThemeChangedEvent extends CustomEvent {
  detail: {
    theme: string;
  };
}

// Create a theme manager instance
const themeManager = new Theme({
  autoInit: true
});

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', (): void => {
  // Theme manager is already initialized in its module
  // You can now use it throughout your application
  
  // Example: Add theme toggle button functionality
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', (): void => {
      themeManager.toggleTheme();
    });
  }
  
  // Listen for theme changes
  window.addEventListener('themeChanged', ((event: ThemeChangedEvent): void => {
    const { theme } = event.detail;
    // Update any theme-dependent UI elements
    console.log(`Theme changed to: ${theme}`);
  }) as EventListener);
}); 