/**
 * SDDE Components Library
 * 
 * This file exports all components from the library.
 * 
 * @module sdde-components
 */

// Export individual components
export { default as Dialog } from './components/Dialog';
export { default as PageLoader } from './components/PageLoader';
export { default as NotificationSystem } from './components/NotificationSystem';
export { default as ErrorHandler } from './components/ErrorHandler';
export { default as HelpCenter } from './components/HelpCenter';

// Export utilities
export { default as EventEmitter } from './utils/EventEmitter';
export { default as DOMUtils } from './utils/DOMUtils';
export { default as ThemeManager } from './utils/ThemeManager';

// Export constants and types
export * from './constants';
export * from './types';

// Version export
export const VERSION = '0.1.0'; 