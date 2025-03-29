/**
 * Notifications Component for Steam Deck DUB Edition
 * Provides a notification system for displaying messages to users
 * 
 * @module Notifications
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './Notifications.module.css';

/**
 * Class for managing notification displays
 */
class Notifications {
  /**
   * Creates a new Notifications instance
   */
  constructor() {
    /**
     * Whether the component has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Current active notifications
     * @type {Array}
     * @private
     */
    this.activeNotifications = [];
    
    /**
     * Maximum notifications to show at once
     * @type {number}
     * @private
     */
    this.maxNotifications = 3;
    
    /**
     * Default notification display time (ms)
     * @type {number}
     * @private
     */
    this.defaultDuration = 5000;
  }
  
  /**
   * Initialize the notifications component
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    // Setup notification container if not already present
    this.setupNotificationContainer();
    
    // Expose the notification method to the window for global usage
    if (!window.showNotification) {
      window.showNotification = this.show.bind(this);
    }
    
    this.initialized = true;
    console.log('Notifications component initialized');
  }
  
  /**
   * Set up the notification container
   * @private
   */
  setupNotificationContainer() {
    // Check if container already exists
    this.container = document.getElementById('notification-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = styles['notification-container'];
      document.body.appendChild(this.container);
    }
  }
  
  /**
   * Show a notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   * @param {string} options.type - Notification type (success, error, warning, info)
   * @param {number} options.duration - Display duration in ms
   * @param {Function} options.onAction - Callback when action button is clicked
   * @param {string} options.actionText - Text for the action button
   * @returns {number} Notification ID
   */
  show(message, options = {}) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const id = Date.now();
    const type = options.type || 'info';
    const duration = options.duration || this.defaultDuration;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${styles[type]}`;
    notification.setAttribute('role', 'alert');
    notification.dataset.id = id;
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = styles['notification-message'];
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    // Add action button if specified
    if (options.actionText && options.onAction) {
      const actionButton = document.createElement('button');
      actionButton.className = styles['notification-action'];
      actionButton.textContent = options.actionText;
      actionButton.addEventListener('click', () => {
        this.dismiss(id);
        options.onAction();
      });
      notification.appendChild(actionButton);
    }
    
    // Add to container
    this.container.appendChild(notification);
    
    // Add to active notifications
    this.activeNotifications.push({
      id,
      element: notification,
      timer: setTimeout(() => this.dismiss(id), duration)
    });
    
    // Limit number of notifications
    this.enforceNotificationLimit();
    
    // Trigger animation after a small delay (for CSS transitions)
    setTimeout(() => {
      notification.classList.add(styles.show);
    }, 10);
    
    return id;
  }
  
  /**
   * Show a success notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   * @returns {number} Notification ID
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }
  
  /**
   * Show an error notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   * @returns {number} Notification ID
   */
  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error' });
  }
  
  /**
   * Show a warning notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   * @returns {number} Notification ID
   */
  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }
  
  /**
   * Show an info notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   * @returns {number} Notification ID
   */
  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }
  
  /**
   * Dismiss a notification
   * @param {number} id - The notification ID to dismiss
   */
  dismiss(id) {
    const index = this.activeNotifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const notification = this.activeNotifications[index];
      
      // Clear timeout if it exists
      if (notification.timer) {
        clearTimeout(notification.timer);
      }
      
      // Remove from active notifications
      this.activeNotifications.splice(index, 1);
      
      // Start removal animation
      notification.element.classList.remove(styles.show);
      
      // Remove after animation completes
      setTimeout(() => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
      }, 300);
    }
  }
  
  /**
   * Dismiss all notifications
   */
  dismissAll() {
    [...this.activeNotifications].forEach(notification => {
      this.dismiss(notification.id);
    });
  }
  
  /**
   * Enforce the maximum number of notifications
   * @private
   */
  enforceNotificationLimit() {
    if (this.activeNotifications.length > this.maxNotifications) {
      // Remove oldest notifications first (maintain FIFO order)
      const toRemove = this.activeNotifications.slice(
        0, 
        this.activeNotifications.length - this.maxNotifications
      );
      
      toRemove.forEach(notification => {
        this.dismiss(notification.id);
      });
    }
  }
}

// Export a singleton instance
export default new Notifications(); 