/**
 * NotificationSystem type definitions
 */

/**
 * Notification position options
 */
export type NotificationPosition = 
  'top-left' | 'top-center' | 'top-right' | 
  'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Notification type options
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification action button
 */
export interface NotificationAction {
  /**
   * Button label
   */
  label: string;
  
  /**
   * Click handler function
   */
  onClick: (notification: Notification) => void;
  
  /**
   * Optional CSS class name for styling
   */
  className?: string;
  
  /**
   * Optional ARIA label for accessibility
   */
  ariaLabel?: string;
  
  /**
   * Optional icon to display before label
   */
  icon?: string;
  
  /**
   * Button color/style
   */
  style?: 'primary' | 'secondary' | 'danger' | 'link';
  
  /**
   * Optional data attributes
   */
  data?: Record<string, string>;
}

/**
 * Animation settings for notifications
 */
export interface NotificationAnimations {
  /**
   * Entry animation duration in ms
   */
  showDuration?: number;
  
  /**
   * Exit animation duration in ms
   */
  hideDuration?: number;
  
  /**
   * Entry animation effect
   */
  showAnimation?: string;
  
  /**
   * Exit animation effect
   */
  hideAnimation?: string;
  
  /**
   * Whether to use CSS transitions or animations
   */
  useTransition?: boolean;
}

/**
 * Notification object that is returned when showing a notification
 */
export interface Notification {
  /**
   * Unique ID for the notification
   */
  id: string;
  
  /**
   * Notification message
   */
  message: string;
  
  /**
   * Optional notification title
   */
  title?: string;
  
  /**
   * Notification type
   */
  type: NotificationType;
  
  /**
   * Position of the notification
   */
  position: NotificationPosition;
  
  /**
   * Duration in ms before auto-dismiss (0 for no auto-dismiss)
   */
  duration: number;
  
  /**
   * Whether the notification can be dismissed by clicking
   */
  dismissible: boolean;
  
  /**
   * Array of action buttons
   */
  actions: NotificationAction[];
  
  /**
   * Callback when notification is shown
   */
  onShow?: (notification: Notification) => void;
  
  /**
   * Callback when notification is dismissed
   */
  onDismiss?: (notification: Notification) => void;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Additional data to associate with notification
   */
  data?: Record<string, any>;
  
  /**
   * DOM element for this notification
   */
  element: HTMLElement | null;
  
  /**
   * Timeout ID for auto-dismiss
   */
  dismissTimeout: number | null;
  
  /**
   * Creation timestamp
   */
  timestamp: Date;
  
  /**
   * Whether the notification is currently visible
   */
  visible: boolean;
}

/**
 * Options for showing a notification
 */
export interface NotificationOptions {
  /**
   * Notification message
   */
  message?: string;
  
  /**
   * Notification title
   */
  title?: string;
  
  /**
   * Notification type
   */
  type?: NotificationType;
  
  /**
   * Position override
   */
  position?: NotificationPosition;
  
  /**
   * Duration override in ms
   */
  duration?: number;
  
  /**
   * Whether notification can be dismissed by clicking
   */
  dismissible?: boolean;
  
  /**
   * Array of action buttons
   */
  actions?: NotificationAction[];
  
  /**
   * Callback when notification is shown
   */
  onShow?: (notification: Notification) => void;
  
  /**
   * Callback when notification is dismissed
   */
  onDismiss?: (notification: Notification) => void;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Additional data to associate with notification
   */
  data?: Record<string, any>;
}

/**
 * NotificationSystem configuration options
 */
export interface NotificationSystemOptions {
  /**
   * Container for notifications
   */
  container?: HTMLElement;
  
  /**
   * Default position of notifications
   */
  position?: NotificationPosition;
  
  /**
   * Default duration in ms before auto-dismiss
   */
  defaultDuration?: number;
  
  /**
   * Maximum number of notifications visible at once
   */
  maxVisible?: number;
  
  /**
   * Whether to show newest notifications on top
   */
  newestOnTop?: boolean;
  
  /**
   * Custom animation settings
   */
  animations?: NotificationAnimations;
  
  /**
   * Pause dismiss timer when hovering
   */
  pauseOnHover?: boolean;
  
  /**
   * Whether notifications can be dismissed by clicking
   */
  dismissible?: boolean;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * Confirm dialog options
 */
export interface ConfirmOptions extends NotificationOptions {
  /**
   * Confirm button text
   */
  confirmText?: string;
  
  /**
   * Cancel button text
   */
  cancelText?: string;
  
  /**
   * Confirm button style
   */
  confirmStyle?: 'primary' | 'secondary' | 'danger';
  
  /**
   * Cancel button style
   */
  cancelStyle?: 'primary' | 'secondary' | 'link';
}

/**
 * NotificationSystem interface
 */
export interface NotificationSystemInterface {
  /**
   * Initialize the notification system
   */
  initialize(): NotificationSystemInterface;
  
  /**
   * Show a notification
   */
  show(options: NotificationOptions | string): Notification;
  
  /**
   * Show an info notification
   */
  info(options: NotificationOptions | string): Notification;
  
  /**
   * Show a success notification
   */
  success(options: NotificationOptions | string): Notification;
  
  /**
   * Show a warning notification
   */
  warning(options: NotificationOptions | string): Notification;
  
  /**
   * Show an error notification
   */
  error(options: NotificationOptions | string): Notification;
  
  /**
   * Dismiss a notification by ID
   */
  dismiss(id: string, immediate?: boolean): boolean;
  
  /**
   * Dismiss all notifications
   */
  dismissAll(immediate?: boolean): void;
  
  /**
   * Update an existing notification
   */
  update(id: string, options: Partial<NotificationOptions>): Notification | null;
  
  /**
   * Show a confirmation dialog
   */
  confirm(
    options: ConfirmOptions | string, 
    onConfirm?: (notification: Notification) => void, 
    onCancel?: (notification: Notification) => void
  ): Notification;
  
  /**
   * Clean up and destroy the notification system
   */
  destroy(): void;
} 