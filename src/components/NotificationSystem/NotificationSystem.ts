/**
 * Grimoire
 * NotificationSystem Component
 * 
 * Provides a centralized system for displaying notifications throughout the application.
 * Supports different types of notifications (toast, alert, modal) with custom styling,
 * positions, durations, and interaction options.
 */

import styles from './NotificationSystem.module.css';
import {
  NotificationSystemOptions,
  NotificationOptions,
  Notification,
  NotificationPosition,
  NotificationType,
  ConfirmOptions,
  NotificationSystemInterface,
  NotificationAnimations
} from '../../types/notification-system';

class NotificationSystem implements NotificationSystemInterface {
  private container: HTMLElement;
  private position: NotificationPosition;
  private defaultDuration: number;
  private maxVisible: number;
  private newestOnTop: boolean;
  private animations: NotificationAnimations;
  private pauseOnHover: boolean;
  private dismissible: boolean;
  private activeNotifications: Notification[];
  private notificationQueue: Notification[];
  private initialized: boolean;
  private notificationContainers: Record<NotificationPosition, HTMLElement>;
  private idCounter: number;

  /**
   * Create a new NotificationSystem instance
   * @param options - Configuration options
   */
  constructor(options: NotificationSystemOptions = {}) {
    this.container = options.container || document.body;
    this.position = options.position || 'bottom-left';
    this.defaultDuration = options.defaultDuration !== undefined ? options.defaultDuration : 4000;
    this.maxVisible = options.maxVisible || 5;
    this.newestOnTop = options.newestOnTop !== false;
    this.animations = options.animations || {};
    this.pauseOnHover = options.pauseOnHover !== false;
    this.dismissible = options.dismissible !== false;
    this.activeNotifications = [];
    this.notificationQueue = [];
    this.initialized = false;
    this.notificationContainers = {} as Record<NotificationPosition, HTMLElement>;
    this.idCounter = 0;
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the notification system
   * @returns this
   */
  initialize(): NotificationSystem {
    if (this.initialized) {
      return this;
    }
    
    // Create a global reference for other components to use
    (window as any).NotificationSystem = this;
    
    // Create notification containers for each position
    this.createNotificationContainers();
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Create the notification containers for different positions
   * @private
   */
  private createNotificationContainers(): void {
    const positions: NotificationPosition[] = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ];
    
    positions.forEach(position => {
      const container = document.createElement('div');
      container.className = `${styles.notificationContainer} ${styles[position]}`;
      container.setAttribute('data-position', position);
      container.setAttribute('aria-live', 'polite');
      container.id = `notification-container-${position}`;
      
      this.container.appendChild(container);
      this.notificationContainers[position] = container;
    });
  }
  
  /**
   * Show a notification
   * @param options - Notification options or message string
   * @returns Notification object
   */
  show(options: NotificationOptions | string): Notification {
    // Convert string message to options object
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    // Generate unique ID for this notification
    const id = `notification-${this.idCounter++}`;
    
    // Set default values
    const notification: Notification = {
      id,
      message: options.message || '',
      title: options.title || '',
      type: options.type || 'info',
      position: options.position || this.position,
      duration: options.duration !== undefined ? options.duration : this.defaultDuration,
      dismissible: options.dismissible !== undefined ? options.dismissible : this.dismissible,
      actions: options.actions || [],
      onShow: options.onShow,
      onDismiss: options.onDismiss,
      className: options.className || '',
      data: options.data || {},
      element: null,
      dismissTimeout: null,
      timestamp: new Date(),
      visible: false
    };
    
    // Check if we've reached maximum visible notifications
    if (this.activeNotifications.length >= this.maxVisible) {
      // Queue the notification
      this.notificationQueue.push(notification);
      return notification;
    }
    
    // Create and display the notification
    this.createNotificationElement(notification);
    
    return notification;
  }
  
  /**
   * Create the notification DOM element
   * @param notification - Notification object
   * @private
   */
  private createNotificationElement(notification: Notification): void {
    // Get the container for this position
    const container = this.notificationContainers[notification.position];
    if (!container) {
      console.error(`Notification position "${notification.position}" is not valid`);
      return;
    }
    
    // Create the notification element
    const element = document.createElement('div');
    element.id = notification.id;
    element.className = `${styles.notification} ${styles[notification.type]} ${notification.className}`;
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', notification.type === 'error' ? 'assertive' : 'polite');
    
    // Create the content
    let contentHTML = '';
    
    // Add icon based on notification type
    contentHTML += `<div class="${styles.icon}">${this.getIconForType(notification.type)}</div>`;
    
    // Add content
    contentHTML += `<div class="${styles.content}">`;
    
    // Add title if provided
    if (notification.title) {
      contentHTML += `<h3 class="${styles.title}">${notification.title}</h3>`;
    }
    
    // Add message
    contentHTML += `<div class="${styles.message}">${notification.message}</div>`;
    
    // Add actions if provided
    if (notification.actions && notification.actions.length > 0) {
      contentHTML += `<div class="${styles.actions}">`;
      notification.actions.forEach(action => {
        const actionClass = action.className || '';
        const actionStyle = action.style ? styles[action.style] : '';
        const ariaLabel = action.ariaLabel || action.label;
        
        contentHTML += `<button class="${styles.action} ${actionClass} ${actionStyle}" data-action-id="${action.label}" aria-label="${ariaLabel}">`;
        
        if (action.icon) {
          contentHTML += `<span class="${styles.actionIcon}">${action.icon}</span>`;
        }
        
        contentHTML += `${action.label}</button>`;
      });
      contentHTML += '</div>';
    }
    
    contentHTML += '</div>';
    
    // Add close button if dismissible
    if (notification.dismissible) {
      contentHTML += `<button class="${styles.closeButton}" aria-label="Dismiss notification">×</button>`;
    }
    
    // Set the content
    element.innerHTML = contentHTML;
    
    // Store the element in the notification object
    notification.element = element;
    
    // Add to active notifications
    this.activeNotifications.push(notification);
    
    // Add event listeners
    this.addNotificationEventListeners(notification);
    
    // Add to container (at top or bottom based on settings)
    if (this.newestOnTop && container.firstChild) {
      container.insertBefore(element, container.firstChild);
    } else {
      container.appendChild(element);
    }
    
    // Set visible flag
    notification.visible = true;
    
    // Trigger show animation in next frame
    requestAnimationFrame(() => {
      if (element) {
        element.classList.add(styles.visible);
      }
    });
    
    // Set up auto-dismiss timer if duration is set
    if (notification.duration > 0) {
      notification.dismissTimeout = window.setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
    
    // Call onShow callback if provided
    if (typeof notification.onShow === 'function') {
      notification.onShow(notification);
    }
    
    // Dispatch event
    this.dispatchNotificationEvent('show', notification);
  }
  
  /**
   * Add event listeners to a notification element
   * @param notification - Notification object
   * @private
   */
  private addNotificationEventListeners(notification: Notification): void {
    const element = notification.element;
    if (!element) return;
    
    // Close button click
    if (notification.dismissible) {
      const closeButton = element.querySelector(`.${styles.closeButton}`);
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.dismiss(notification.id);
        });
      }
      
      // Click on notification itself (optional way to dismiss)
      element.addEventListener('click', (e) => {
        // Only dismiss if clicked on the notification background, not on buttons or content
        if ((e.target as HTMLElement).classList.contains(styles.notification)) {
          this.dismiss(notification.id);
        }
      });
    }
    
    // Action buttons
    if (notification.actions && notification.actions.length > 0) {
      const actionButtons = element.querySelectorAll(`.${styles.action}`);
      actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const actionId = (button as HTMLElement).getAttribute('data-action-id');
          const action = notification.actions.find(a => a.label === actionId);
          
          if (action && typeof action.onClick === 'function') {
            action.onClick(notification);
          }
        });
      });
    }
    
    // Pause timer on hover if enabled
    if (this.pauseOnHover && notification.duration > 0) {
      element.addEventListener('mouseenter', () => {
        this.pauseNotificationTimer(notification);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resumeNotificationTimer(notification);
      });
    }
  }
  
  /**
   * Get icon HTML for a notification type
   * @param type - Notification type
   * @returns Icon HTML
   * @private
   */
  private getIconForType(type: NotificationType): string {
    switch (type) {
      case 'info':
        return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>';
      case 'success':
        return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>';
      case 'warning':
        return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>';
      case 'error':
        return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>';
      default:
        return '';
    }
  }
  
  /**
   * Show an info notification
   * @param options - Notification options or message string
   * @returns Notification object
   */
  info(options: NotificationOptions | string): Notification {
    const opts = typeof options === 'string' ? { message: options } : options;
    return this.show({ ...opts, type: 'info' });
  }
  
  /**
   * Show a success notification
   * @param options - Notification options or message string
   * @returns Notification object
   */
  success(options: NotificationOptions | string): Notification {
    const opts = typeof options === 'string' ? { message: options } : options;
    return this.show({ ...opts, type: 'success' });
  }
  
  /**
   * Show a warning notification
   * @param options - Notification options or message string
   * @returns Notification object
   */
  warning(options: NotificationOptions | string): Notification {
    const opts = typeof options === 'string' ? { message: options } : options;
    return this.show({ ...opts, type: 'warning' });
  }
  
  /**
   * Show an error notification
   * @param options - Notification options or message string
   * @returns Notification object
   */
  error(options: NotificationOptions | string): Notification {
    const opts = typeof options === 'string' ? { message: options } : options;
    return this.show({ ...opts, type: 'error' });
  }
  
  /**
   * Dismiss a notification
   * @param id - Notification ID
   * @param immediate - Whether to skip the animation
   * @returns Whether the notification was found and dismissed
   */
  dismiss(id: string, immediate: boolean = false): boolean {
    // Find the notification in active notifications
    const index = this.activeNotifications.findIndex(notification => notification.id === id);
    
    if (index === -1) {
      return false;
    }
    
    const notification = this.activeNotifications[index];
    
    // Clear dismiss timeout if set
    if (notification.dismissTimeout !== null) {
      clearTimeout(notification.dismissTimeout);
      notification.dismissTimeout = null;
    }
    
    // Remove immediately or with animation
    if (immediate) {
      this.removeNotificationElement(notification, index);
    } else {
      // Start hide animation
      if (notification.element) {
        notification.element.classList.remove(styles.visible);
        notification.element.classList.add(styles.hiding);
        
        // Remove after animation completes
        setTimeout(() => {
          this.removeNotificationElement(notification, index);
        }, this.animations.hideDuration || 300);
      } else {
        this.removeNotificationElement(notification, index);
      }
    }
    
    return true;
  }
  
  /**
   * Remove a notification element and process the queue
   * @param notification - Notification to remove
   * @param index - Index in activeNotifications array
   * @private
   */
  private removeNotificationElement(notification: Notification, index: number): void {
    // Call onDismiss callback if provided
    if (typeof notification.onDismiss === 'function') {
      notification.onDismiss(notification);
    }
    
    // Remove from DOM
    if (notification.element && notification.element.parentNode) {
      notification.element.parentNode.removeChild(notification.element);
    }
    
    // Remove from active notifications
    this.activeNotifications.splice(index, 1);
    
    // Dispatch event
    this.dispatchNotificationEvent('dismiss', notification);
    
    // Process queue if we have pending notifications
    if (this.notificationQueue.length > 0) {
      const nextNotification = this.notificationQueue.shift();
      if (nextNotification) {
        this.createNotificationElement(nextNotification);
      }
    }
  }
  
  /**
   * Pause the auto-dismiss timer for a notification
   * @param notification - Notification object
   * @private
   */
  private pauseNotificationTimer(notification: Notification): void {
    if (notification.dismissTimeout !== null) {
      clearTimeout(notification.dismissTimeout);
      notification.dismissTimeout = null;
      
      // Calculate remaining time
      const elapsed = Date.now() - notification.timestamp.getTime();
      notification.duration = Math.max(0, notification.duration - elapsed);
    }
  }
  
  /**
   * Resume the auto-dismiss timer for a notification
   * @param notification - Notification object
   * @private
   */
  private resumeNotificationTimer(notification: Notification): void {
    if (notification.duration > 0) {
      notification.dismissTimeout = window.setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }
  
  /**
   * Dismiss all notifications
   * @param immediate - Whether to skip animations
   */
  dismissAll(immediate: boolean = false): void {
    // Create a copy to avoid mutation issues during iteration
    const activeNotificationsCopy = [...this.activeNotifications];
    
    // Dismiss each notification
    activeNotificationsCopy.forEach(notification => {
      this.dismiss(notification.id, immediate);
    });
    
    // Clear the queue
    this.notificationQueue = [];
  }
  
  /**
   * Update an existing notification
   * @param id - Notification ID
   * @param options - Updated notification options
   * @returns Updated notification or null if not found
   */
  update(id: string, options: Partial<NotificationOptions>): Notification | null {
    // Find the notification
    const notification = this.activeNotifications.find(n => n.id === id);
    
    if (!notification || !notification.element) {
      return null;
    }
    
    // Update properties
    if (options.message !== undefined) {
      notification.message = options.message;
      const messageEl = notification.element.querySelector(`.${styles.message}`);
      if (messageEl) {
        messageEl.innerHTML = options.message;
      }
    }
    
    if (options.title !== undefined) {
      notification.title = options.title;
      let titleEl = notification.element.querySelector(`.${styles.title}`);
      
      if (!titleEl && options.title) {
        // Create title element if it doesn't exist
        titleEl = document.createElement('h3');
        titleEl.className = styles.title;
        const contentEl = notification.element.querySelector(`.${styles.content}`);
        if (contentEl && contentEl.firstChild) {
          contentEl.insertBefore(titleEl, contentEl.firstChild);
        }
      }
      
      if (titleEl) {
        if (options.title) {
          titleEl.innerHTML = options.title;
        } else if (titleEl.parentNode) {
          // Remove title if empty
          titleEl.parentNode.removeChild(titleEl);
        }
      }
    }
    
    // Update type
    if (options.type !== undefined && options.type !== notification.type) {
      notification.element.classList.remove(styles[notification.type]);
      notification.element.classList.add(styles[options.type]);
      notification.type = options.type;
      
      // Update icon
      const iconEl = notification.element.querySelector(`.${styles.icon}`);
      if (iconEl) {
        iconEl.innerHTML = this.getIconForType(options.type);
      }
    }
    
    // Update duration
    if (options.duration !== undefined) {
      // Clear existing timeout
      if (notification.dismissTimeout !== null) {
        clearTimeout(notification.dismissTimeout);
        notification.dismissTimeout = null;
      }
      
      // Update duration
      notification.duration = options.duration;
      
      // Set new timeout if needed
      if (notification.duration > 0) {
        notification.dismissTimeout = window.setTimeout(() => {
          this.dismiss(notification.id);
        }, notification.duration);
      }
    }
    
    // Update actions
    if (options.actions !== undefined) {
      notification.actions = options.actions;
      
      // Update actions in DOM
      const actionsEl = notification.element.querySelector(`.${styles.actions}`);
      if (actionsEl) {
        // Remove existing actions
        actionsEl.innerHTML = '';
        
        // Add new actions
        if (options.actions.length > 0) {
          options.actions.forEach(action => {
            const actionClass = action.className || '';
            const actionStyle = action.style ? styles[action.style] : '';
            const ariaLabel = action.ariaLabel || action.label;
            
            const actionButton = document.createElement('button');
            actionButton.className = `${styles.action} ${actionClass} ${actionStyle}`;
            actionButton.setAttribute('data-action-id', action.label);
            actionButton.setAttribute('aria-label', ariaLabel);
            
            if (action.icon) {
              const iconSpan = document.createElement('span');
              iconSpan.className = styles.actionIcon;
              iconSpan.innerHTML = action.icon;
              actionButton.appendChild(iconSpan);
            }
            
            actionButton.appendChild(document.createTextNode(action.label));
            
            // Add click handler
            actionButton.addEventListener('click', (e) => {
              e.preventDefault();
              if (typeof action.onClick === 'function') {
                action.onClick(notification);
              }
            });
            
            actionsEl.appendChild(actionButton);
          });
        }
      }
    }
    
    // Update callback handlers
    if (options.onShow !== undefined) {
      notification.onShow = options.onShow;
    }
    
    if (options.onDismiss !== undefined) {
      notification.onDismiss = options.onDismiss;
    }
    
    // Update className
    if (options.className !== undefined) {
      // Remove old class
      if (notification.className) {
        notification.element.classList.remove(notification.className);
      }
      
      // Add new class
      if (options.className) {
        notification.element.classList.add(options.className);
      }
      
      notification.className = options.className;
    }
    
    // Update data
    if (options.data !== undefined) {
      notification.data = options.data;
    }
    
    return notification;
  }
  
  /**
   * Show a confirmation dialog
   * @param options - Confirm options or message string
   * @param onConfirm - Callback when confirmed
   * @param onCancel - Callback when canceled
   * @returns Notification object
   */
  confirm(
    options: ConfirmOptions | string, 
    onConfirm?: (notification: Notification) => void, 
    onCancel?: (notification: Notification) => void
  ): Notification {
    // Convert string message to options object
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    
    // Default settings
    const confirmText = opts.confirmText || 'Yes';
    const cancelText = opts.cancelText || 'No';
    const confirmStyle = opts.confirmStyle || 'primary';
    const cancelStyle = opts.cancelStyle || 'secondary';
    
    // Create actions
    const actions = [
      {
        label: confirmText,
        onClick: (notification: Notification) => {
          if (onConfirm) onConfirm(notification);
          this.dismiss(notification.id);
        },
        style: confirmStyle
      },
      {
        label: cancelText,
        onClick: (notification: Notification) => {
          if (onCancel) onCancel(notification);
          this.dismiss(notification.id);
        },
        style: cancelStyle
      }
    ];
    
    // Show the notification with the confirm/cancel buttons
    return this.show({
      ...opts,
      type: opts.type || 'warning',
      actions,
      duration: 0, // Confirmation dialogs don't auto-dismiss
      dismissible: opts.dismissible !== undefined ? opts.dismissible : true
    });
  }
  
  /**
   * Dispatch a custom event for a notification
   * @param eventName - Name of the event
   * @param notification - Notification object
   * @private
   */
  private dispatchNotificationEvent(eventName: string, notification: Notification): void {
    const event = new CustomEvent(`notification:${eventName}`, {
      detail: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: notification.timestamp,
        data: notification.data
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Clean up and destroy the notification system
   */
  destroy(): void {
    // Dismiss all notifications immediately
    this.dismissAll(true);
    
    // Remove all containers
    Object.values(this.notificationContainers).forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    
    // Reset state
    this.notificationContainers = {} as Record<NotificationPosition, HTMLElement>;
    this.activeNotifications = [];
    this.notificationQueue = [];
    this.initialized = false;
    
    // Remove global reference
    if ((window as any).NotificationSystem === this) {
      delete (window as any).NotificationSystem;
    }
  }
}

export default NotificationSystem; 