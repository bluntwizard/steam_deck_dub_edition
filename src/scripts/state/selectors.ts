/**
 * State Selectors
 * Steam Deck DUB Edition
 * 
 * Provides functions to select data from the store
 */

import store from './store';
import type { 
  ApplicationState, 
  UserPreferences, 
  ProgressState, 
  UIState 
} from './store';

/**
 * General selectors
 */
const getPreferences = (): UserPreferences => store.getState('preferences');
const getProgress = (): ProgressState => store.getState('progress');
const getUI = (): UIState => store.getState('ui');

/**
 * Preference selectors
 */
const getTheme = (): UserPreferences['theme'] => getPreferences().theme;
const getFontSize = (): UserPreferences['fontSize'] => getPreferences().fontSize;
const getLanguage = (): string => getPreferences().language;
const getReducedMotion = (): boolean => getPreferences().reducedMotion;
const getHighContrast = (): boolean => getPreferences().highContrast;

/**
 * Progress selectors
 */
const getCompletedSections = (): Record<string, boolean> => getProgress().completedSections;
const getTotalProgress = (): number => getProgress().totalProgress;
const getLastVisited = (): string | null => getProgress().lastVisited;
const isSectionCompleted = (sectionId: string): boolean => getCompletedSections()[sectionId] || false;

/**
 * UI selectors
 */
const isSidebarOpen = (): boolean => getUI().sidebarOpen;
const getCurrentRoute = (): string | null => getUI().currentRoute;
const isLoading = (): boolean => getUI().isLoading;
const isSettingsVisible = (): boolean => getUI().showSettings;
const getSearchQuery = (): string => getUI().searchQuery;
const getActiveTab = (): string => getUI().activeTab;

/**
 * Compound selectors
 */
const isProgressStarted = (): boolean => Object.values(getCompletedSections()).some(Boolean);
const isProgressComplete = (): boolean => getTotalProgress() === 100;

/**
 * Selector exports
 */
export default {
  // General selectors
  getPreferences,
  getProgress,
  getUI,
  
  // Preference selectors
  getTheme,
  getFontSize,
  getLanguage,
  getReducedMotion,
  getHighContrast,
  
  // Progress selectors
  getCompletedSections,
  getTotalProgress,
  getLastVisited,
  isSectionCompleted,
  
  // UI selectors
  isSidebarOpen,
  getCurrentRoute,
  isLoading,
  isSettingsVisible,
  getSearchQuery,
  getActiveTab,
  
  // Compound selectors
  isProgressStarted,
  isProgressComplete
}; 