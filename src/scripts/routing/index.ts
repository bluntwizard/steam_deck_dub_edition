/**
 * Routing Module Index
 * Steam Deck DUB Edition
 * 
 * Exports the router, routes, and related types
 */

// Export router class and types
export { Router } from './router';
export type { Route, RouterOptions } from './router';
export { default as routes } from './routes';

// Export a createRouter helper function
import { Router, RouterOptions } from './router';
import routes from './routes';

/**
 * Create a new router instance with default routes
 * @param options Router options
 * @returns Configured router instance
 */
export function createRouter(options: RouterOptions): Router {
  const router = new Router(options);
  router.registerRoutes(routes);
  return router;
}

// Export a default instance
export default createRouter; 