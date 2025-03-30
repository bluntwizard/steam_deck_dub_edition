/**
 * Grimoire
 * NotificationSystem Component
 * 
 * Provides a centralized system for displaying notifications throughout the application.
 * Supports different types of notifications (toast, alert, modal) with custom styling,
 * positions, durations, and interaction options.
 */

import styles from './NotificationSystem.module.css';

class NotificationSystem {
  /**
   * Create a new NotificationSystem instance
   * @param {Object} options - Configuration options
   * @param {HTMLElement} [options.container=document.body] - Container for notifications
   * @param {string} [options.position='bottom-left'] - Default position of notifications
   * @param {number} [options.defaultDuration=4000] - Default duration in ms before auto-dismiss
   * @param {number} [options.maxVisible=5] - Maximum number of notifications visible at once
   * @param {boolean} [options.newestOnTop=true] - Whether to show newest notifications on top
   * @param {Object} [options.animations] - Custom animation settings
   * @param {boolean} [options.pauseOnHover=true] - Pause dismiss timer when hovering
   * @param {boolean} [options.dismissible=true] - Whether notifications can be dismissed by clicking
   * @param {boolean} [options.autoInit=true] - Whether to initialize automatically
   */
  constructor(options = {}) {
    /**
     * Container element for notifications
     * @type {HTMLElement}
     * @private
     */
    this.container = options.container || document.body;
    
    /**
     * Default position for notifications
     * @type {string}
     * @private
     */
    this.position = options.position || 'bottom-left';
    
    /**
     * Default notification duration in ms
     * @type {number}
     * @private
     */
    this.defaultDuration = options.defaultDuration !== undefined ? options.defaultDuration : 4000;
    
    /**
     * Maximum number of notifications visible at once
     * @type {number}
     * @private
     */
    this.maxVisible = options.maxVisible || 5;
    
    /**
     * Whether to show newest notifications on top
     * @type {boolean}
     * @private
     */
    this.newestOnTop = options.newestOnTop !== false;
    
    /**
     * Custom animation settings
     * @type {Object}
     * @private
     */
    this.animations = options.animations || {};
    
    /**
     * Whether to pause dismiss timer when hovering
     * @type {boolean}
     * @private
     */
    this.pauseOnHover = options.pauseOnHover !== false;
    
    /**
     * Whether notifications can be dismissed by clicking
     * @type {boolean}
     * @private
     */
    this.dismissible = options.dismissible !== false;
    
    /**
     * All currently active notifications
     * @type {Array}
     * @private
     */
    this.activeNotifications = [];
    
    /**
     * Queue of pending notifications when max visible is reached
     * @type {Array}
     * @private
     */
    this.notificationQueue = [];
    
    /**
     * Whether the system is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Container for notification groups by position
     * @type {Object}
     * @private
     */
    this.notificationContainers = {};
    
    /**
     * ID counter for notifications
     * @type {number}
     * @private
     */
    this.idCounter = 0;
    
    // Initialize if autoInit is true
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the notification system
   * @returns {NotificationSystem} this
   */
  initialize() {
    if (this.initialized) {
      return this;
    }
    
    // Create a global reference for other components to use
    window.NotificationSystem = this;
    
    // Create notification containers for each position
    this.createNotificationContainers();
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Create the notification containers for different positions
   * @private
   */
  createNotificationContainers() {
    const positions = [
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
   * @param {Object|string} options - Notification options or message string
   * @param {string} [options.message] - Notification message
   * @param {string} [options.title] - Notification title
   * @param {string} [options.type='info'] - Notification type (info, success, warning, error)
   * @param {string} [options.position] - Notification position (overrides default)
   * @param {number} [options.duration] - Notification duration (overrides default)
   * @param {boolean} [options.dismissible] - Whether notification can be dismissed
   * @param {Array} [options.actions] - Array of action buttons {label, onClick}
   * @param {Function} [options.onShow] - Callback when notification is shown
   * @param {Function} [options.onDismiss] - Callback when notification is dismissed
   * @param {string} [options.className] - Additional CSS class name
   * @param {Object} [options.data] - Additional data to associate with notification
   * @returns {Object} Notification object
   */
  show(options) {
    // Convert string message to options object
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    // Generate unique ID for this notification
    const id = `notification-${this.idCounter++}`;
    
    // Set default values
    const notification = {
      id,
      message: options.message || '',
      title: options.title || '',
      type: options.type || 'info',
      position: options.position || this.position,
      duration: options.duration !== undefined ? options.duration : this.defaultDuration,
      dismissible: options.dismissible !== undefined ? options.dismissible : this.dismissible,
      actions: options.actions || [],
      onShow: options.onShow || null,
      onDismiss: options.onDismiss || null,
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
   * @param {Object} notification - Notification object
   * @private
   */
  createNotificationElement(notification) {
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
      contentHTML += `<div class="${styles.title}">${notification.title}</div>`;
    }
    
    // Add message
    contentHTML += `<div class="${styles.message}">${notification.message}</div>`;
    
    // Add action buttons if provided
    if (notification.actions && notification.actions.length > 0) {
      contentHTML += `<div class="${styles.actions}">`;
      notification.actions.forEach((action, index) => {
        contentHTML += `<button class="${styles.actionButton}" data-action-index="${index}">${action.label}</button>`;
      });
      contentHTML += `</div>`;
    }
    
    contentHTML += `</div>`;
    
    // Add close button if dismissible
    if (notification.dismissible) {
      contentHTML += `<button class="${styles.closeButton}" aria-label="Close notification">×</button>`;
    }
    
    // Set the HTML content
    element.innerHTML = contentHTML;
    
    // Add event listeners
    if (notification.dismissible) {
      const closeButton = element.querySelector(`.${styles.closeButton}`);
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.dismiss(notification.id);
        });
      }
      
      // Allow clicking on the notification to dismiss it
      element.addEventListener('click', (e) => {
        // Don't dismiss if clicking on an action button
        if (!e.target.closest(`.${styles.actionButton}`)) {
          this.dismiss(notification.id);
        }
      });
    }
    
    // Add action button event listeners
    if (notification.actions && notification.actions.length > 0) {
      const buttons = element.querySelectorAll(`.${styles.actionButton}`);
      buttons.forEach(button => {
        const actionIndex = parseInt(button.getAttribute('data-action-index'), 10);
        const action = notification.actions[actionIndex];
        
        if (action && typeof action.onClick === 'function') {
          button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent notification dismiss
            action.onClick(notification);
          });
        }
      });
    }
    
    // Add hover events to pause dismissal
    if (this.pauseOnHover && notification.duration > 0) {
      element.addEventListener('mouseenter', () => {
        this.pauseNotificationTimer(notification);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resumeNotificationTimer(notification);
      });
    }
    
    // Store element reference
    notification.element = element;
    
    // Add to active notifications
    this.activeNotifications.push(notification);
    
    // Add to DOM
    if (this.newestOnTop) {
      container.insertBefore(element, container.firstChild);
    } else {
      container.appendChild(element);
    }
    
    // Trigger animation in next frame
    setTimeout(() => {
      element.classList.add(styles.visible);
      notification.visible = true;
      
      // Fire onShow callback if provided
      if (typeof notification.onShow === 'function') {
        notification.onShow(notification);
      }
      
      // Dispatch event
      this.dispatchNotificationEvent('notification-shown', notification);
    }, 10);
    
    // Set auto-dismiss timer if duration is greater than 0
    if (notification.duration > 0) {
      notification.dismissTimeout = setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }
  
  /**
   * Get icon HTML based on notification type
   * @param {string} type - Notification type
   * @returns {string} Icon HTML
   * @private
   */
  getIconForType(type) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }
  
  /**
   * Shorthand method to show an info notification
   * @param {string|Object} options - Message or options object
   * @returns {Object} Notification object
   */
  info(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    options.type = 'info';
    return this.show(options);
  }
  
  /**
   * Shorthand method to show a success notification
   * @param {string|Object} options - Message or options object
   * @returns {Object} Notification object
   */
  success(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    options.type = 'success';
    return this.show(options);
  }
  
  /**
   * Shorthand method to show a warning notification
   * @param {string|Object} options - Message or options object
   * @returns {Object} Notification object
   */
  warning(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    options.type = 'warning';
    return this.show(options);
  }
  
  /**
   * Shorthand method to show an error notification
   * @param {string|Object} options - Message or options object
   * @returns {Object} Notification object
   */
  error(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    options.type = 'error';
    return this.show(options);
  }
  
  /**
   * Dismiss a notification by its ID
   * @param {string} id - Notification ID
   * @param {boolean} [immediate=false] - Whether to skip exit animation
   * @returns {boolean} Whether notification was found and dismissed
   */
  dismiss(id, immediate = false) {
    // Find the notification in active notifications
    const index = this.activeNotifications.findIndex(n => n.id === id);
    
    if (index === -1) {
      return false;
    }
    
    const notification = this.activeNotifications[index];
    
    // Clear dismiss timeout
    if (notification.dismissTimeout) {
      clearTimeout(notification.dismissTimeout);
      notification.dismissTimeout = null;
    }
    
    if (immediate) {
      // Remove immediately
      this.removeNotificationElement(notification, index);
    } else {
      // Start exit animation
      notification.element.classList.remove(styles.visible);
      
      // Remove after animation completes
      setTimeout(() => {
        this.removeNotificationElement(notification, index);
      }, 300); // Match CSS transition duration
    }
    
    return true;
  }
  
  /**
   * Remove a notification element and process the queue
   * @param {Object} notification - Notification object
   * @param {number} index - Index in activeNotifications array
   * @private
   */
  removeNotificationElement(notification, index) {
    // Remove from DOM
    if (notification.element && notification.element.parentNode) {
      notification.element.parentNode.removeChild(notification.element);
    }
    
    // Remove from active notifications
    this.activeNotifications.splice(index, 1);
    
    // Fire onDismiss callback if provided
    if (typeof notification.onDismiss === 'function') {
      notification.onDismiss(notification);
    }
    
    // Dispatch event
    this.dispatchNotificationEvent('notification-dismissed', notification);
    
    // Process queue if we have pending notifications
    if (this.notificationQueue.length > 0) {
      const nextNotification = this.notificationQueue.shift();
      this.createNotificationElement(nextNotification);
    }
  }
  
  /**
   * Pause the dismiss timer for a notification
   * @param {Object} notification - Notification object
   * @private
   */
  pauseNotificationTimer(notification) {
    if (notification.dismissTimeout) {
      clearTimeout(notification.dismissTimeout);
      notification.dismissTimeout = null;
      notification.remainingTime = notification.duration - 
        (Date.now() - notification.timestamp.getTime());
    }
  }
  
  /**
   * Resume the dismiss timer for a notification
   * @param {Object} notification - Notification object
   * @private
   */
  resumeNotificationTimer(notification) {
    if (notification.remainingTime && notification.remainingTime > 0) {
      notification.dismissTimeout = setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.remainingTime);
    }
  }
  
  /**
   * Dismiss all notifications
   * @param {boolean} [immediate=false] - Whether to skip exit animation
   * @returns {NotificationSystem} this
   */
  dismissAll(immediate = false) {
    // Create a copy of active notifications to avoid issues during iteration
    const notifications = [...this.activeNotifications];
    
    // Dismiss each notification
    notifications.forEach(notification => {
      this.dismiss(notification.id, immediate);
    });
    
    // Clear the queue
    this.notificationQueue = [];
    
    return this;
  }
  
  /**
   * Update a notification's content
   * @param {string} id - Notification ID
   * @param {Object} options - Properties to update
   * @returns {boolean} Whether notification was found and updated
   */
  update(id, options) {
    const notification = this.activeNotifications.find(n => n.id === id);
    
    if (!notification) {
      return false;
    }
    
    // Update properties
    Object.assign(notification, options);
    
    // Update the DOM content
    if (notification.element) {
      // Update message
      if (options.message !== undefined) {
        const messageEl = notification.element.querySelector(`.${styles.message}`);
        if (messageEl) {
          messageEl.textContent = options.message;
        }
      }
      
      // Update title
      if (options.title !== undefined) {
        const titleEl = notification.element.querySelector(`.${styles.title}`);
        if (titleEl) {
          titleEl.textContent = options.title;
        }
      }
      
      // Update type
      if (options.type !== undefined) {
        // Remove old type class
        ['info', 'success', 'warning', 'error'].forEach(type => {
          notification.element.classList.remove(styles[type]);
        });
        
        // Add new type class
        notification.element.classList.add(styles[options.type]);
        
        // Update icon
        const iconEl = notification.element.querySelector(`.${styles.icon}`);
        if (iconEl) {
          iconEl.textContent = this.getIconForType(options.type);
        }
      }
      
      // Update duration and reset timer
      if (options.duration !== undefined) {
        // Clear existing timeout
        if (notification.dismissTimeout) {
          clearTimeout(notification.dismissTimeout);
        }
        
        // Set new timeout if duration is greater than 0
        if (options.duration > 0) {
          notification.dismissTimeout = setTimeout(() => {
            this.dismiss(notification.id);
          }, options.duration);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Create a confirmation notification with yes/no actions
   * @param {Object|string} options - Options or message
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} [onCancel] - Callback when canceled
   * @returns {Object} Notification object
   */
  confirm(options, onConfirm, onCancel) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    options.type = options.type || 'info';
    options.dismissible = options.dismissible !== false;
    options.duration = options.duration || 0; // No auto-dismiss by default
    
    // Add confirmation actions
    options.actions = [
      {
        label: options.confirmText || 'Yes',
        onClick: (notification) => {
          this.dismiss(notification.id);
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        }
      },
      {
        label: options.cancelText || 'No',
        onClick: (notification) => {
          this.dismiss(notification.id);
          if (typeof onCancel === 'function') {
            onCancel();
          }
        }
      }
    ];
    
    return this.show(options);
  }
  
  /**
   * Dispatch a custom notification event
   * @param {string} eventName - Event name
   * @param {Object} notification - Notification object
   * @private
   */
  dispatchNotificationEvent(eventName, notification) {
    const event = new CustomEvent(eventName, {
      detail: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        title: notification.title,
        position: notification.position,
        data: notification.data
      },
      bubbles: true
    });
    
    this.container.dispatchEvent(event);
  }
  
  /**
   * Destroy the notification system and remove all notifications
   */
  destroy() {
    // Dismiss all notifications
    this.dismissAll(true);
    
    // Remove notification containers
    Object.values(this.notificationContainers).forEach(container => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    
    // Reset object
    this.notificationContainers = {};
    this.activeNotifications = [];
    this.notificationQueue = [];
    this.initialized = false;
    
    // Remove global reference
    if (window.NotificationSystem === this) {
      delete window.NotificationSystem;
    }
  }
}

export default NotificationSystem; 