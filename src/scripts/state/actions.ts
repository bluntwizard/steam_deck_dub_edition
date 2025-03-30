/**
 * State Actions
 * Grimoire
 * 
 * Provides functions to update the application state
 */

import store from './store';
import selectors from './selectors';
import type { 
  UserPreferences, 
  ProgressState, 
  UIState 
} from './store';

/**
 * Preference actions
 */
const setTheme = (theme: UserPreferences['theme']): void => {
  store.setState('preferences', { theme });
  
  // Apply theme to document
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  // Dispatch theme change event
  document.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme }
  }));
};

const setFontSize = (fontSize: UserPreferences['fontSize']): void => {
  store.setState('preferences', { fontSize });
  
  // Apply font size to document
  document.documentElement.setAttribute('data-font-size', fontSize);
  
  // Dispatch font size change event
  document.dispatchEvent(new CustomEvent('font-size-changed', {
    detail: { fontSize }
  }));
};

const setLanguage = (language: string): void => {
  store.setState('preferences', { language });
};

const setReducedMotion = (reducedMotion: boolean): void => {
  store.setState('preferences', { reducedMotion });
  
  // Apply reduced motion to document
  document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
};

const setHighContrast = (highContrast: boolean): void => {
  store.setState('preferences', { highContrast });
  
  // Apply high contrast to document
  document.documentElement.setAttribute('data-high-contrast', String(highContrast));
};

/**
 * Progress actions
 */
const setSectionCompleted = (sectionId: string, completed: boolean): void => {
  const currentSections = selectors.getCompletedSections();
  
  // Update the completed sections
  store.setState('progress', prevState => ({
    ...prevState,
    completedSections: {
      ...prevState.completedSections,
      [sectionId]: completed
    }
  }));
  
  // Update total progress
  updateTotalProgress();
};

const setLastVisited = (sectionId: string): void => {
  store.setState('progress', { lastVisited: sectionId });
};

const resetProgress = (): void => {
  store.setState('progress', {
    completedSections: {},
    lastVisited: null,
    totalProgress: 0
  });
};

const updateTotalProgress = (): void => {
  const sections = selectors.getCompletedSections();
  const completedCount = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length || 1; // Avoid division by zero
  
  const totalProgress = Math.round((completedCount / totalSections) * 100);
  
  store.setState('progress', { totalProgress });
};

/**
 * UI actions
 */
const setSidebarOpen = (open: boolean): void => {
  store.setState('ui', { sidebarOpen: open });
};

const setCurrentRoute = (route: string): void => {
  store.setState('ui', { currentRoute: route });
};

const setLoading = (loading: boolean): void => {
  store.setState('ui', { isLoading: loading });
};

const setShowSettings = (show: boolean): void => {
  store.setState('ui', { showSettings: show });
};

const setSearchQuery = (query: string): void => {
  store.setState('ui', { searchQuery: query });
};

const setActiveTab = (tab: string): void => {
  store.setState('ui', { activeTab: tab });
};

/**
 * Compound actions
 */
const resetAll = (): void => {
  store.resetState();
  
  // Apply default theme
  setTheme('system');
  
  // Apply default font size
  setFontSize('medium');
};

/**
 * Action exports
 */
export default {
  // Preference actions
  setTheme,
  setFontSize,
  setLanguage,
  setReducedMotion,
  setHighContrast,
  
  // Progress actions
  setSectionCompleted,
  setLastVisited,
  resetProgress,
  updateTotalProgress,
  
  // UI actions
  setSidebarOpen,
  setCurrentRoute,
  setLoading,
  setShowSettings,
  setSearchQuery,
  setActiveTab,
  
  // Compound actions
  resetAll
}; 