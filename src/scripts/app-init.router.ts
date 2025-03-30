/**
 * App Initialization Router Integration
 * Steam Deck DUB Edition
 * 
 * Links the app initialization module with the new Router implementation
 */

import { createRouter } from './routing';

/**
 * Initialize the router for the application
 * @param contentContainer Element to load content into
 * @returns Configured router instance
 */
export function initializeRouter(contentContainer: HTMLElement): any {
  // Create router with application configuration
  const router = createRouter({
    contentContainer,
    baseTitle: 'Steam Deck DUB Edition',
    defaultRouteId: 'home',
    useHistoryApi: true,
    updatePageTitle: true,
    loading: {
      showSpinner: true,
      message: 'Loading guide content...',
      minDisplayTime: 500
    },
    errorHandling: {
      showErrors: true,
      defaultErrorMessage: 'Failed to load guide content'
    }
  });

  // Initialize the router
  router.init();
  
  return router;
}

/**
 * Create an app-init compatible interface using the router
 * This allows for a seamless transition from the existing loadContent method
 * to the new router-based navigation
 */
export default {
  /**
   * Load content by section ID
   * Bridge between old app-init.loadContent and new router.navigateTo
   * @param sectionId Section to load
   */
  loadContent(sectionId: string): void {
    const dynamicContent = document.getElementById('dynamic-content');
    if (!dynamicContent) {
      console.error('Dynamic content container not found');
      return;
    }
    
    // Get or create router instance
    if (!(window as any).__appRouter) {
      (window as any).__appRouter = initializeRouter(dynamicContent);
    }
    
    // Navigate to the requested section
    (window as any).__appRouter.navigateTo(sectionId);
  },
  
  /**
   * Show update notification
   * Required for service worker updates
   */
  showUpdateNotification(): void {
    // Implementation depends on notification system
    console.log('Update available! Refresh to get the latest version.');
    
    // Example implementation using alert (replace with actual notification system)
    if (confirm('A new version is available. Reload now to update?')) {
      window.location.reload();
    }
  }
}; 