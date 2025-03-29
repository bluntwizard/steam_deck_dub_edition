/**
 * Constants used throughout the component library
 */

// Component class names
export const CLASS_NAMES = {
  DIALOG: {
    CONTAINER: 'dialog-container',
    OVERLAY: 'dialog-overlay',
    CONTENT: 'dialog-content',
    TITLE: 'dialog-title',
    BODY: 'dialog-body',
    ACTIONS: 'dialog-actions',
    CLOSE_BUTTON: 'dialog-close-button'
  },
  PAGE_LOADER: {
    CONTAINER: 'page-loader',
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    CONTENT: 'content',
    PROGRESS: 'progress-bar',
    ERROR_MESSAGE: 'error-message',
    FALLBACK_CONTENT: 'fallback-content'
  },
  NOTIFICATION: {
    CONTAINER: 'notification-container',
    CONTENT: 'notification-content',
    TITLE: 'notification-title',
    MESSAGE: 'notification-message',
    ACTIONS: 'notification-actions',
    CLOSE_BUTTON: 'notification-close',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  ERROR_HANDLER: {
    CONTAINER: 'error-handler',
    MODAL: 'error-modal',
    TOAST: 'error-toast',
    INLINE: 'error-inline'
  },
  HELP_CENTER: {
    CONTAINER: 'help-center-container',
    SIDEBAR: 'help-center-sidebar',
    CONTENT: 'help-content',
    SEARCH: 'help-search',
    SEARCH_RESULTS: 'search-results',
    NAV_BUTTONS: 'navigation-buttons',
    BACK_BUTTON: 'back-button',
    FORWARD_BUTTON: 'forward-button',
    CLOSE_BUTTON: 'close-button',
    FLOATING_BUTTON: 'help-floating-button'
  }
};

// Event names
export const EVENTS = {
  DIALOG: {
    OPENED: 'dialog-opened',
    CLOSED: 'dialog-closed',
    BUTTON_CLICK: 'dialog-button-click'
  },
  PAGE_LOADER: {
    LOADING_START: 'loading-start',
    LOADING_COMPLETE: 'loading-complete',
    LOADING_ERROR: 'loading-error',
    LOADING_PROGRESS: 'loading-progress',
    STATE_CHANGE: 'state-change'
  },
  NOTIFICATION: {
    SHOWN: 'notification-shown',
    CLOSED: 'notification-closed',
    ACTION: 'notification-action'
  },
  ERROR_HANDLER: {
    ERROR_HANDLED: 'error-handled',
    NOTIFICATION_CLOSED: 'error-notification-closed',
    ACTION_CLICKED: 'error-action-clicked'
  },
  HELP_CENTER: {
    OPENED: 'helpcenter-opened',
    CLOSED: 'helpcenter-closed',
    TOPIC_CHANGED: 'helpcenter-topic-changed',
    SEARCH: 'helpcenter-search'
  }
};

// Display modes
export const DISPLAY_MODES = {
  ERROR: {
    TOAST: 'toast',
    MODAL: 'modal',
    INLINE: 'inline',
    NONE: 'none'
  }
};

// Position values
export const POSITIONS = {
  NOTIFICATION: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    TOP_CENTER: 'top-center',
    BOTTOM_CENTER: 'bottom-center'
  },
  HELP_BUTTON: {
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left'
  }
};

// Log levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Animation durations (in ms)
export const ANIMATION = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500
  }
}; 