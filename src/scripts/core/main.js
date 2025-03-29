/**
 * Steam Deck DUB Edition
 * Main JavaScript
 */

import themeManager from '../../components/Theme';

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
  // Theme manager is already initialized in its module
  // You can now use it throughout your application
  
  // Example: Add theme toggle button functionality
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
  
  // Listen for theme changes
  window.addEventListener('themeChanged', (event) => {
    const { theme } = event.detail;
    // Update any theme-dependent UI elements
    console.log(`Theme changed to: ${theme}`);
  });
}); 