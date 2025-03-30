/**
 * Test suite for Notifications component
 */

describe('Notifications', () => {
  let Notifications;
  let instance;
  let container;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock timers
    jest.useFakeTimers();
    
    // Clear module cache to ensure fresh instances
    jest.resetModules();
    
    // Import component
    Notifications = require('../../components/Notifications/Notifications').default;
    
    // Create instance
    instance = new Notifications({
      container: container
    });
  });
  
  afterEach(() => {
    // Clean up
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    document.body.innerHTML = '';
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('should initialize properly', () => {
    expect(instance).toBeDefined();
    expect(instance.container).toBe(container);
    expect(instance.notifications).toEqual([]);
  });
  
  test('should render notifications container', () => {
    instance.render();
    
    const notificationsContainer = container.querySelector('.notifications-container');
    expect(notificationsContainer).not.toBeNull();
  });
  
  test('should add notification', () => {
    instance.render();
    
    // Add a notification
    instance.addNotification({
      type: 'info',
      message: 'Test notification',
      duration: 3000
    });
    
    // Check if notification is added to the DOM
    const notificationElement = container.querySelector('.notification');
    expect(notificationElement).not.toBeNull();
    expect(notificationElement.classList.contains('info')).toBe(true);
    expect(notificationElement.textContent).toContain('Test notification');
    
    // Check if notification is added to the internal array
    expect(instance.notifications.length).toBe(1);
    expect(instance.notifications[0].message).toBe('Test notification');
  });
  
  test('should remove notification after duration', () => {
    instance.render();
    
    // Add a notification with 2000ms duration
    instance.addNotification({
      type: 'success',
      message: 'Auto-remove test',
      duration: 2000
    });
    
    // Initially, notification should be in the DOM
    let notificationElement = container.querySelector('.notification');
    expect(notificationElement).not.toBeNull();
    
    // Fast-forward time
    jest.advanceTimersByTime(2100);
    
    // After duration, notification should be removed
    notificationElement = container.querySelector('.notification');
    expect(notificationElement).toBeNull();
    expect(instance.notifications.length).toBe(0);
  });
  
  test('should manually remove notification', () => {
    instance.render();
    
    // Add a notification
    const notificationId = instance.addNotification({
      type: 'warning',
      message: 'Manual remove test',
      duration: 5000
    });
    
    // Initial check
    let notificationElement = container.querySelector('.notification');
    expect(notificationElement).not.toBeNull();
    
    // Remove the notification
    instance.removeNotification(notificationId);
    
    // Notification should be removed
    notificationElement = container.querySelector('.notification');
    expect(notificationElement).toBeNull();
    expect(instance.notifications.length).toBe(0);
  });
  
  test('should handle different notification types', () => {
    instance.render();
    
    // Add notifications of different types
    instance.addNotification({
      type: 'info',
      message: 'Info notification'
    });
    
    instance.addNotification({
      type: 'success',
      message: 'Success notification'
    });
    
    instance.addNotification({
      type: 'warning',
      message: 'Warning notification'
    });
    
    instance.addNotification({
      type: 'error',
      message: 'Error notification'
    });
    
    // Check if all notifications are added with correct types
    const notifications = container.querySelectorAll('.notification');
    expect(notifications.length).toBe(4);
    
    expect(notifications[0].classList.contains('info')).toBe(true);
    expect(notifications[1].classList.contains('success')).toBe(true);
    expect(notifications[2].classList.contains('warning')).toBe(true);
    expect(notifications[3].classList.contains('error')).toBe(true);
  });
  
  test('should handle notification with close button', () => {
    instance.render();
    
    // Add a notification with close button
    instance.addNotification({
      type: 'info',
      message: 'Closable notification',
      closable: true
    });
    
    // Check if close button exists
    const notificationElement = container.querySelector('.notification');
    const closeButton = notificationElement.querySelector('.close-btn');
    expect(closeButton).not.toBeNull();
    
    // Click close button
    closeButton.click();
    
    // Notification should be removed
    const removedNotification = container.querySelector('.notification');
    expect(removedNotification).toBeNull();
  });
  
  test('should add action buttons to notification', () => {
    instance.render();
    
    // Mock action handlers
    const actionHandler1 = jest.fn();
    const actionHandler2 = jest.fn();
    
    // Add a notification with actions
    instance.addNotification({
      type: 'info',
      message: 'Notification with actions',
      actions: [
        { label: 'Action 1', handler: actionHandler1 },
        { label: 'Action 2', handler: actionHandler2 }
      ]
    });
    
    // Check if action buttons exist
    const notificationElement = container.querySelector('.notification');
    const actionButtons = notificationElement.querySelectorAll('.action-btn');
    expect(actionButtons.length).toBe(2);
    expect(actionButtons[0].textContent).toBe('Action 1');
    expect(actionButtons[1].textContent).toBe('Action 2');
    
    // Click first action button
    actionButtons[0].click();
    expect(actionHandler1).toHaveBeenCalled();
    
    // Notification should still be there after action
    expect(container.querySelector('.notification')).not.toBeNull();
  });
  
  test('should clean up timers on destroy', () => {
    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    instance.render();
    
    // Add notifications with auto-remove
    instance.addNotification({ type: 'info', message: 'Test 1', duration: 3000 });
    instance.addNotification({ type: 'info', message: 'Test 2', duration: 5000 });
    
    // Destroy instance
    instance.destroy();
    
    // Should clear timeouts for both notifications
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
  });
}); 