/**
 * Grimoire
 * NotificationSystem Component Tests
 */

import NotificationSystem from "../../components/NotificationSystem/NotificationSystem";

// Mock CSS module
jest.mock(
  "../../components/NotificationSystem/NotificationSystem.module.css",
  () => ({
    notificationContainer: "notificationContainer-mock",
    notification: "notification-mock",
    visible: "visible-mock",
    info: "info-mock",
    success: "success-mock",
    warning: "warning-mock",
    error: "error-mock",
    icon: "icon-mock",
    content: "content-mock",
    title: "title-mock",
    message: "message-mock",
    actions: "actions-mock",
    actionButton: "actionButton-mock",
    closeButton: "closeButton-mock",
    progressBar: "progressBar-mock",
    "top-left": "top-left-mock",
    "top-center": "top-center-mock",
    "top-right": "top-right-mock",
    "bottom-left": "bottom-left-mock",
    "bottom-center": "bottom-center-mock",
    "bottom-right": "bottom-right-mock",
  }),
);

describe("NotificationSystem", () => {
  let notificationSystem;
  let container;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement("div");
    document.body.appendChild(container);

    // Reset any global instances
    delete window.NotificationSystem;

    // Clear any leftover notifications from other tests
    document.querySelectorAll(".notificationContainer-mock").forEach((el) => {
      el.parentNode.removeChild(el);
    });
  });

  afterEach(() => {
    // Clean up
    if (
      notificationSystem &&
      typeof notificationSystem.destroy === "function"
    ) {
      notificationSystem.destroy();
    }

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }

    jest.clearAllMocks();
  });

  // Initialization Tests
  describe("Initialization", () => {
    test("should initialize with default options", () => {
      notificationSystem = new NotificationSystem();

      expect(notificationSystem).toBeDefined();
      expect(notificationSystem.position).toBe("bottom-left");
      expect(notificationSystem.defaultDuration).toBe(4000);
      expect(notificationSystem.maxVisible).toBe(5);
      expect(notificationSystem.newestOnTop).toBe(true);
      expect(notificationSystem.pauseOnHover).toBe(true);
      expect(notificationSystem.dismissible).toBe(true);
      expect(notificationSystem.activeNotifications).toEqual([]);
      expect(notificationSystem.notificationQueue).toEqual([]);
    });

    test("should accept custom options", () => {
      notificationSystem = new NotificationSystem({
        container,
        position: "top-right",
        defaultDuration: 3000,
        maxVisible: 3,
        newestOnTop: false,
        pauseOnHover: false,
        dismissible: false,
        autoInit: true,
      });

      expect(notificationSystem.container).toBe(container);
      expect(notificationSystem.position).toBe("top-right");
      expect(notificationSystem.defaultDuration).toBe(3000);
      expect(notificationSystem.maxVisible).toBe(3);
      expect(notificationSystem.newestOnTop).toBe(false);
      expect(notificationSystem.pauseOnHover).toBe(false);
      expect(notificationSystem.dismissible).toBe(false);
    });

    test("should create container elements for different positions", () => {
      notificationSystem = new NotificationSystem({ container });

      // Check if containers for all positions are created
      const positions = [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ];

      positions.forEach((position) => {
        const containerEl = document.getElementById(
          `notification-container-${position}`,
        );
        expect(containerEl).toBeTruthy();
        expect(
          containerEl.classList.contains("notificationContainer-mock"),
        ).toBe(true);
      });
    });

    test("should set a global reference", () => {
      notificationSystem = new NotificationSystem();
      expect(window.NotificationSystem).toBe(notificationSystem);
    });

    test("should not initialize when autoInit is false", () => {
      const createContainersSpy = jest.spyOn(
        NotificationSystem.prototype,
        "createNotificationContainers",
      );

      notificationSystem = new NotificationSystem({ autoInit: false });

      expect(createContainersSpy).not.toHaveBeenCalled();
      expect(notificationSystem.initialized).toBe(false);

      createContainersSpy.mockRestore();
    });
  });

  // Notification Display Tests
  describe("Showing Notifications", () => {
    test("should show a notification", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.show("Test notification");

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.message).toBe("Test notification");
      expect(notification.type).toBe("info");

      // Check if element was created
      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl).toBeTruthy();
      expect(notificationEl.querySelector(".message-mock").textContent).toBe(
        "Test notification",
      );
    });

    test("should show a notification with options", () => {
      notificationSystem = new NotificationSystem({ container });

      const onShowMock = jest.fn();
      const onDismissMock = jest.fn();

      const notification = notificationSystem.show({
        title: "Notification Title",
        message: "Notification message",
        type: "success",
        position: "top-right",
        duration: 2000,
        onShow: onShowMock,
        onDismiss: onDismissMock,
      });

      // Verify notification object properties
      expect(notification.title).toBe("Notification Title");
      expect(notification.message).toBe("Notification message");
      expect(notification.type).toBe("success");
      expect(notification.position).toBe("top-right");
      expect(notification.duration).toBe(2000);

      // Check DOM element
      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl).toBeTruthy();
      expect(notificationEl.classList.contains("success-mock")).toBe(true);
      expect(notificationEl.querySelector(".title-mock").textContent).toBe(
        "Notification Title",
      );
      expect(notificationEl.querySelector(".message-mock").textContent).toBe(
        "Notification message",
      );

      // Verify onShow callback is called (wait a frame for setTimeout)
      jest.advanceTimersByTime(50);
      expect(onShowMock).toHaveBeenCalled();
    });

    test("should queue notifications when max visible is reached", () => {
      notificationSystem = new NotificationSystem({
        container,
        maxVisible: 2,
      });

      // Show 3 notifications
      notificationSystem.show("Notification 1");
      notificationSystem.show("Notification 2");
      const notification3 = notificationSystem.show("Notification 3");

      // Check that only 2 notifications are shown
      const notificationEls = document.querySelectorAll(".notification-mock");
      expect(notificationEls.length).toBe(2);

      // Check that the third one is queued
      expect(notificationSystem.activeNotifications.length).toBe(2);
      expect(notificationSystem.notificationQueue.length).toBe(1);
      expect(notificationSystem.notificationQueue[0].message).toBe(
        "Notification 3",
      );

      // Dismiss the first one
      notificationSystem.dismiss(notificationSystem.activeNotifications[0].id);
      jest.advanceTimersByTime(350); // Wait for animation

      // Now the third one should be shown
      const notificationElsAfter =
        document.querySelectorAll(".notification-mock");
      expect(notificationElsAfter.length).toBe(2);

      // Queue should be empty
      expect(notificationSystem.notificationQueue.length).toBe(0);
    });
  });

  // Notification Types Tests
  describe("Notification Types", () => {
    test("should show info notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.info("Info notification");

      expect(notification.type).toBe("info");

      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.classList.contains("info-mock")).toBe(true);
    });

    test("should show success notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.success("Success notification");

      expect(notification.type).toBe("success");

      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.classList.contains("success-mock")).toBe(true);
    });

    test("should show warning notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.warning("Warning notification");

      expect(notification.type).toBe("warning");

      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.classList.contains("warning-mock")).toBe(true);
    });

    test("should show error notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.error("Error notification");

      expect(notification.type).toBe("error");

      const notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.classList.contains("error-mock")).toBe(true);
    });
  });

  // Dismissal Tests
  describe("Notification Dismissal", () => {
    test("should auto-dismiss notifications after duration", () => {
      jest.useFakeTimers();

      notificationSystem = new NotificationSystem({
        container,
        defaultDuration: 2000,
      });

      const notification = notificationSystem.show("Test notification");

      // Check that the notification is shown
      expect(document.querySelector(".notification-mock")).toBeTruthy();

      // Advance time past duration
      jest.advanceTimersByTime(2050);

      // Check that the notification is removed
      expect(document.querySelector(".notification-mock")).toBeFalsy();

      jest.useRealTimers();
    });

    test("should manually dismiss notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.show({
        message: "Test notification",
        duration: 0, // No auto-dismiss
      });

      // Check that the notification is shown
      expect(document.querySelector(".notification-mock")).toBeTruthy();

      // Dismiss notification
      notificationSystem.dismiss(notification.id);

      // Wait for animation
      jest.advanceTimersByTime(350);

      // Check that the notification is removed
      expect(document.querySelector(".notification-mock")).toBeFalsy();
    });

    test("should dismiss notifications when clicking close button", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.show("Test notification");

      // Get the close button and click it
      const closeButton = document.querySelector(".closeButton-mock");
      expect(closeButton).toBeTruthy();

      // Mock dismiss method to verify it's called
      const dismissSpy = jest.spyOn(notificationSystem, "dismiss");
      closeButton.click();

      expect(dismissSpy).toHaveBeenCalledWith(notification.id);
      dismissSpy.mockRestore();
    });

    test("should dismiss all notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      // Show multiple notifications
      notificationSystem.show("Notification 1");
      notificationSystem.show("Notification 2");
      notificationSystem.show("Notification 3");

      // Check that all notifications are shown
      expect(document.querySelectorAll(".notification-mock").length).toBe(3);

      // Dismiss all notifications
      notificationSystem.dismissAll(true); // Immediate

      // Check that all notifications are removed
      expect(document.querySelectorAll(".notification-mock").length).toBe(0);
    });
  });

  // Action Button Tests
  describe("Notification Actions", () => {
    test("should show action buttons and handle clicks", () => {
      notificationSystem = new NotificationSystem({ container });

      const action1Mock = jest.fn();
      const action2Mock = jest.fn();

      const notification = notificationSystem.show({
        message: "Notification with actions",
        actions: [
          { label: "Action 1", onClick: action1Mock },
          { label: "Action 2", onClick: action2Mock },
        ],
      });

      // Check if action buttons are created
      const actionButtons = document.querySelectorAll(".actionButton-mock");
      expect(actionButtons.length).toBe(2);
      expect(actionButtons[0].textContent).toBe("Action 1");
      expect(actionButtons[1].textContent).toBe("Action 2");

      // Click the first action button
      actionButtons[0].click();

      // Check that the action is called with the notification
      expect(action1Mock).toHaveBeenCalledWith(notification);
      expect(action2Mock).not.toHaveBeenCalled();
    });

    test("should create confirmation notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      const onConfirmMock = jest.fn();
      const onCancelMock = jest.fn();

      const notification = notificationSystem.confirm(
        "Are you sure?",
        onConfirmMock,
        onCancelMock,
      );

      // Check notification properties
      expect(notification.message).toBe("Are you sure?");
      expect(notification.type).toBe("info");
      expect(notification.actions.length).toBe(2);

      // Get action buttons
      const actionButtons = document.querySelectorAll(".actionButton-mock");
      expect(actionButtons.length).toBe(2);
      expect(actionButtons[0].textContent).toBe("Yes");
      expect(actionButtons[1].textContent).toBe("No");

      // Click Yes button
      actionButtons[0].click();

      // Check that onConfirm is called
      expect(onConfirmMock).toHaveBeenCalled();
      expect(onCancelMock).not.toHaveBeenCalled();

      // Wait for animation
      jest.advanceTimersByTime(350);

      // Create another confirmation to test the No button
      const notification2 = notificationSystem.confirm(
        "Are you sure?",
        onConfirmMock,
        onCancelMock,
      );

      // Get new action buttons
      const actionButtons2 = document.querySelectorAll(".actionButton-mock");

      // Click No button
      actionButtons2[1].click();

      // Check that onCancel is called
      expect(onCancelMock).toHaveBeenCalled();
      // onConfirmMock count should still be 1 from earlier
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
  });

  // Update Tests
  describe("Notification Updates", () => {
    test("should update notification content", () => {
      notificationSystem = new NotificationSystem({ container });

      const notification = notificationSystem.show({
        title: "Original Title",
        message: "Original message",
        type: "info",
      });

      // Check original content
      let notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.querySelector(".title-mock").textContent).toBe(
        "Original Title",
      );
      expect(notificationEl.querySelector(".message-mock").textContent).toBe(
        "Original message",
      );
      expect(notificationEl.classList.contains("info-mock")).toBe(true);

      // Update notification
      notificationSystem.update(notification.id, {
        title: "Updated Title",
        message: "Updated message",
        type: "success",
      });

      // Check updated content
      notificationEl = document.querySelector(".notification-mock");
      expect(notificationEl.querySelector(".title-mock").textContent).toBe(
        "Updated Title",
      );
      expect(notificationEl.querySelector(".message-mock").textContent).toBe(
        "Updated message",
      );
      expect(notificationEl.classList.contains("success-mock")).toBe(true);
    });
  });

  // Event Tests
  describe("Notification Events", () => {
    test("should dispatch events when showing and dismissing notifications", () => {
      notificationSystem = new NotificationSystem({ container });

      // Set up event listeners
      const shownSpy = jest.fn();
      const dismissedSpy = jest.fn();

      container.addEventListener("notification-shown", shownSpy);
      container.addEventListener("notification-dismissed", dismissedSpy);

      // Show a notification
      const notification = notificationSystem.show("Test notification");

      // Wait a frame for the shown event
      jest.advanceTimersByTime(50);

      // Check that shown event was fired
      expect(shownSpy).toHaveBeenCalled();
      expect(shownSpy.mock.calls[0][0].detail.message).toBe(
        "Test notification",
      );

      // Dismiss the notification
      notificationSystem.dismiss(notification.id);

      // Wait for animation
      jest.advanceTimersByTime(350);

      // Check that dismissed event was fired
      expect(dismissedSpy).toHaveBeenCalled();
      expect(dismissedSpy.mock.calls[0][0].detail.message).toBe(
        "Test notification",
      );

      // Clean up
      container.removeEventListener("notification-shown", shownSpy);
      container.removeEventListener("notification-dismissed", dismissedSpy);
    });
  });

  // Cleanup Tests
  describe("Cleanup", () => {
    test("should destroy properly", () => {
      notificationSystem = new NotificationSystem({ container });

      // Show some notifications
      notificationSystem.show("Notification 1");
      notificationSystem.show("Notification 2");

      // Check that notifications are shown
      expect(document.querySelectorAll(".notification-mock").length).toBe(2);
      expect(
        document.querySelectorAll(".notificationContainer-mock").length,
      ).toBe(6); // 6 positions

      // Destroy notification system
      notificationSystem.destroy();

      // Check that all notifications and containers are removed
      expect(document.querySelectorAll(".notification-mock").length).toBe(0);
      expect(
        document.querySelectorAll(".notificationContainer-mock").length,
      ).toBe(0);

      // Check that global reference is removed
      expect(window.NotificationSystem).toBeUndefined();
    });
  });
});
