/**
 * Router Module
 * Steam Deck DUB Edition
 * 
 * Handles client-side routing for single-page application navigation
 */

// Import error handling utility
import { handleError } from '../utils/error-handling';

/**
 * Route configuration interface
 */
export interface Route {
  /**
   * Unique identifier for the route
   */
  id: string;
  
  /**
   * Path pattern to match
   */
  path: string;
  
  /**
   * Title to set when this route is active
   */
  title?: string;
  
  /**
   * Content path to load
   */
  contentPath?: string;
  
  /**
   * Callback to execute when this route is activated
   */
  onActivate?: (params: Record<string, string>) => void | Promise<void>;
  
  /**
   * Whether this route requires authentication
   */
  requiresAuth?: boolean;
}

/**
 * Router configuration options
 */
export interface RouterOptions {
  /**
   * Content container element
   */
  contentContainer: HTMLElement;
  
  /**
   * Base path for the application
   */
  basePath?: string;
  
  /**
   * Default route ID to use when no match is found
   */
  defaultRouteId?: string;
  
  /**
   * Whether to use HTML5 History API
   */
  useHistoryApi?: boolean;
  
  /**
   * Whether to update the page title
   */
  updatePageTitle?: boolean;
  
  /**
   * Base title to prepend to route titles
   */
  baseTitle?: string;
  
  /**
   * Loading indicator settings
   */
  loading?: {
    showSpinner?: boolean;
    message?: string;
    minDisplayTime?: number;
  };
  
  /**
   * Error handling settings
   */
  errorHandling?: {
    showErrors?: boolean;
    defaultErrorMessage?: string;
  };
}

/**
 * Router class for handling client-side navigation
 */
export class Router {
  /**
   * List of registered routes
   */
  private routes: Route[] = [];
  
  /**
   * Current active route
   */
  private currentRoute: Route | null = null;
  
  /**
   * Router configuration options
   */
  private options: RouterOptions;
  
  /**
   * Content loading status
   */
  private isLoading: boolean = false;
  
  /**
   * Create a new router instance
   */
  constructor(options: RouterOptions) {
    this.options = {
      basePath: '',
      defaultRouteId: 'home',
      useHistoryApi: true,
      updatePageTitle: true,
      baseTitle: 'Steam Deck DUB Edition',
      loading: {
        showSpinner: true,
        message: 'Loading content...',
        minDisplayTime: 300
      },
      errorHandling: {
        showErrors: true,
        defaultErrorMessage: 'Failed to load content'
      },
      ...options
    };
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  /**
   * Initialize router event listeners
   */
  private initEventListeners(): void {
    // Handle popstate events (browser back/forward)
    if (this.options.useHistoryApi) {
      window.addEventListener('popstate', (event) => {
        const state = event.state as { routeId?: string } | null;
        if (state && state.routeId) {
          this.navigateTo(state.routeId, false);
        } else {
          // Default to home page if no state
          this.navigateTo(this.options.defaultRouteId || 'home', false);
        }
      });
    } else {
      // Handle hashchange if not using History API
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
          this.navigateTo(hash, false);
        }
      });
    }
  }
  
  /**
   * Register a route
   */
  public registerRoute(route: Route): Router {
    this.routes.push(route);
    return this;
  }
  
  /**
   * Register multiple routes
   */
  public registerRoutes(routes: Route[]): Router {
    this.routes.push(...routes);
    return this;
  }
  
  /**
   * Navigate to a specific route
   */
  public navigateTo(routeId: string, updateHistory: boolean = true): void {
    // Find the route
    const route = this.findRouteById(routeId);
    
    if (!route) {
      console.warn(`Route '${routeId}' not found`);
      if (this.options.defaultRouteId && routeId !== this.options.defaultRouteId) {
        this.navigateTo(this.options.defaultRouteId);
      }
      return;
    }
    
    // Set current route
    this.currentRoute = route;
    
    // Update URL if using History API
    if (updateHistory) {
      if (this.options.useHistoryApi) {
        history.pushState({ routeId }, '', `${this.options.basePath}#${routeId}`);
      } else {
        window.location.hash = `#${routeId}`;
      }
    }
    
    // Update page title
    if (this.options.updatePageTitle && route.title) {
      document.title = this.options.baseTitle 
        ? `${this.options.baseTitle} - ${route.title}`
        : route.title;
    }
    
    // Load content
    this.loadContent(route);
  }
  
  /**
   * Load content for a route
   */
  private async loadContent(route: Route): Promise<void> {
    try {
      // Set loading state
      this.setLoading(true);
      
      // Execute onActivate callback if available
      if (route.onActivate) {
        // Extract route parameters if needed
        const params: Record<string, string> = {};
        await route.onActivate(params);
      }
      
      // If there's a content path, load it
      if (route.contentPath) {
        await this.fetchContent(route.contentPath);
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      handleError(error, { 
        context: { routeId: route.id },
        log: true 
      });
      
      if (this.options.errorHandling?.showErrors) {
        this.showErrorMessage(
          this.options.errorHandling.defaultErrorMessage || 
          'Failed to load content'
        );
      }
    } finally {
      // Clear loading state with a minimum display time
      setTimeout(() => {
        this.setLoading(false);
      }, this.options.loading?.minDisplayTime || 0);
    }
  }
  
  /**
   * Fetch content from a URL
   */
  private async fetchContent(contentPath: string): Promise<void> {
    try {
      const response = await fetch(contentPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Insert content into container
      if (this.options.contentContainer) {
        this.options.contentContainer.innerHTML = content;
        
        // Execute scripts in the loaded content if any
        this.executeScripts(this.options.contentContainer);
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Execute scripts in loaded content
   */
  private executeScripts(container: HTMLElement): void {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }
  
  /**
   * Find a route by ID
   */
  private findRouteById(routeId: string): Route | undefined {
    return this.routes.find(route => route.id === routeId);
  }
  
  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
    
    // Update UI loading indicator here if needed
    if (isLoading && this.options.loading?.showSpinner) {
      // Show loading spinner
      const loadingElement = document.getElementById('loading-indicator');
      if (loadingElement) {
        loadingElement.textContent = this.options.loading.message || 'Loading...';
        loadingElement.style.display = 'block';
      }
    } else {
      // Hide loading spinner
      const loadingElement = document.getElementById('loading-indicator');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }
  }
  
  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    const contentContainer = this.options.contentContainer;
    if (contentContainer) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <button class="retry-button">Retry</button>
      `;
      
      // Add retry button handler
      const retryButton = errorElement.querySelector('.retry-button');
      if (retryButton && this.currentRoute) {
        const currentRouteId = this.currentRoute.id;
        retryButton.addEventListener('click', () => {
          this.navigateTo(currentRouteId);
        });
      }
      
      contentContainer.innerHTML = '';
      contentContainer.appendChild(errorElement);
    }
  }
  
  /**
   * Get current route
   */
  public getCurrentRoute(): Route | null {
    return this.currentRoute;
  }
  
  /**
   * Get all routes
   */
  public getRoutes(): Route[] {
    return [...this.routes];
  }
  
  /**
   * Check if currently loading
   */
  public isContentLoading(): boolean {
    return this.isLoading;
  }
  
  /**
   * Initialize the router
   */
  public init(): void {
    // Check for URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.navigateTo(hash, false);
    } else {
      // Navigate to default route
      this.navigateTo(this.options.defaultRouteId || 'home', false);
    }
  }
}

// Export default instance
export default Router; 