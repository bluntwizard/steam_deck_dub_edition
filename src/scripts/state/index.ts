/**
 * State Management Index
 * Grimoire
 * 
 * Exports the store and its types for use throughout the application
 */

// Export the store and interfaces
export { default as store } from './store';
export {
  Store,
  type UserPreferences,
  type ProgressState,
  type UIState,
  type ApplicationState,
  type StateChangeListener
} from './store';

// Export store functions
export { default as selectors } from './selectors';
export { default as actions } from './actions'; 