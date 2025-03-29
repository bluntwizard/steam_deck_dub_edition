/**
 * Type definitions for the component library
 * 
 * @module types
 */

/**
 * @typedef {Object} DialogOptions
 * @property {string} [title] - Dialog title
 * @property {string|HTMLElement} [content] - Dialog content (string or HTML element)
 * @property {DialogButton[]} [buttons] - Array of buttons to display
 * @property {boolean} [closeOnOverlayClick=true] - Whether clicking the overlay closes the dialog
 * @property {boolean} [showCloseButton=true] - Whether to show the X close button
 * @property {string} [size='medium'] - Dialog size ('small', 'medium', 'large')
 * @property {string} [className] - Additional CSS class names
 * @property {Function} [onOpen] - Callback function when dialog opens
 * @property {Function} [onClose] - Callback function when dialog closes
 * @property {boolean} [focusTrap=true] - Whether to trap focus within the dialog
 * @property {boolean} [autoFocus=true] - Whether to automatically focus the first focusable element
 * @property {boolean} [escapeCloses=true] - Whether pressing Escape closes the dialog
 */

/**
 * @typedef {Object} DialogButton
 * @property {string} id - Button identifier
 * @property {string} label - Button text
 * @property {string} [type='secondary'] - Button type ('primary', 'secondary', 'tertiary', 'danger')
 * @property {Function} [onClick] - Click handler for the button
 * @property {string} [icon] - Optional icon name to display with the button
 * @property {boolean} [disabled=false] - Whether the button is disabled
 */

/**
 * @typedef {Object} PageLoaderOptions
 * @property {HTMLElement} [container] - Container element for the PageLoader
 * @property {string} [loadingMessage='Loading...'] - Message to display during loading
 * @property {boolean} [showProgress=false] - Whether to show a progress bar
 * @property {string} [errorTemplate] - Template for error messages
 * @property {boolean} [retryButton=true] - Whether to show a retry button on error
 * @property {Function} [onError] - Callback function when an error occurs
 * @property {Function} [onLoad] - Callback function when content is loaded
 * @property {boolean} [animateTransitions=true] - Whether to animate state transitions
 */

/**
 * @typedef {Object} NotificationOptions
 * @property {string} message - Notification message
 * @property {string} [type='info'] - Notification type ('info', 'success', 'warning', 'error')
 * @property {string} [title] - Optional notification title
 * @property {number} [duration=5000] - Duration in ms before auto-close (0 for no auto-close)
 * @property {string} [position='top-right'] - Position of the notification
 * @property {boolean} [dismissible=true] - Whether the notification can be dismissed
 * @property {NotificationAction[]} [actions] - Array of action buttons
 * @property {Function} [onClose] - Callback function when notification closes
 * @property {string} [id] - Unique identifier for the notification
 */

/**
 * @typedef {Object} NotificationAction
 * @property {string} id - Action identifier
 * @property {string} label - Action button text
 * @property {Function} [onClick] - Click handler for the action
 * @property {string} [icon] - Optional icon name
 */

/**
 * @typedef {Object} ErrorHandlerOptions
 * @property {boolean} [captureGlobalErrors=true] - Whether to capture unhandled errors
 * @property {boolean} [logErrors=true] - Whether to log errors to console
 * @property {boolean} [showNotifications=true] - Whether to show error notifications
 * @property {string} [notificationType='toast'] - Type of notification to show
 * @property {number} [notificationDuration=5000] - Duration for error notifications
 * @property {boolean} [includeStackTrace=false] - Whether to include stack traces
 * @property {Function} [onError] - Callback function when an error is handled
 * @property {Object} [errorMessages] - Custom error messages by error code
 * @property {number} [maxErrorHistory=50] - Maximum number of errors to keep in history
 */

/**
 * @typedef {Object} HelpCenterOptions
 * @property {HTMLElement} [container] - Container element for the HelpCenter
 * @property {string} [helpContentUrl='./help-content/'] - URL to help content directory
 * @property {string} [defaultTopic='index'] - Default topic to show
 * @property {boolean} [searchEnabled=true] - Whether search is enabled
 * @property {boolean} [navigateHistoryEnabled=true] - Whether history navigation is enabled
 * @property {number} [animationDuration=300] - Duration for animations
 * @property {boolean} [showFloatingButton=false] - Whether to show a floating help button
 * @property {string} [floatingButtonPosition='bottom-right'] - Position of floating button
 * @property {Function} [onOpen] - Callback function when HelpCenter opens
 * @property {Function} [onClose] - Callback function when HelpCenter closes
 * @property {Function} [onTopicChange] - Callback function when topic changes
 */

/**
 * @typedef {Object} EventEmitterOptions
 * @property {HTMLElement} [target=document] - Target element for events
 * @property {boolean} [debug=false] - Whether to log debug information
 */

// Export these as JSDoc type definitions
// They will be properly converted to TypeScript definitions
// in the build process 