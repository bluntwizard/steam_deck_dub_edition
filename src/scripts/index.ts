/**
 * Main application initialization entry point
 */
import appInit from './app-init';

// Export for direct access
export default appInit;

// Auto-initialize when script is loaded
document.addEventListener('DOMContentLoaded', () => {
  appInit.initialize()
    .catch(error => {
      console.error('Failed to initialize application:', error);
    });
}); 