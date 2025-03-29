// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test file for Dialog and NotificationSystem interaction
 * 
 * These tests verify that Dialog and NotificationSystem components
 * work correctly together in various interaction patterns
 */

test.describe('Dialog and NotificationSystem Component Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page before each test
    await page.goto('http://localhost:8080/component-showcase.html');
    
    // Wait for page to be fully loaded
    await page.waitForSelector('.showcase-container');
  });

  test('should show notification when dialog action is completed', async ({ page }) => {
    // Navigate to Dialog section
    await page.click('text=Dialog Component');
    
    // Find and click the "Open Dialog with Action" button
    await page.click('button:text("Open Dialog with Notification Action")');
    
    // Verify dialog is open
    const dialog = page.locator('.dialog-container:visible');
    await expect(dialog).toBeVisible();
    
    // Verify dialog title
    const dialogTitle = dialog.locator('.dialog-title');
    await expect(dialogTitle).toHaveText('Action Confirmation');
    
    // Click the confirm button in the dialog
    await dialog.locator('button:text("Confirm Action")').click();
    
    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
    
    // Verify notification is shown
    const notification = page.locator('.notification-container:visible');
    await expect(notification).toBeVisible();
    
    // Verify notification content
    const notificationContent = notification.locator('.notification-content');
    await expect(notificationContent).toHaveText('Action completed successfully');
    
    // Verify notification type
    await expect(notification).toHaveClass(/success/);
    
    // Wait for notification to auto-dismiss (if auto-dismiss is enabled)
    await page.waitForTimeout(5500); // 5.5 seconds to account for animation time
    
    // Verify notification is gone after timeout
    await expect(notification).not.toBeVisible();
  });

  test('should show error notification when dialog action fails', async ({ page }) => {
    // Navigate to Dialog section
    await page.click('text=Dialog Component');
    
    // Find and click the "Open Dialog with Failed Action" button
    await page.click('button:text("Open Dialog with Error Action")');
    
    // Verify dialog is open
    const dialog = page.locator('.dialog-container:visible');
    await expect(dialog).toBeVisible();
    
    // Click the "Try Action" button in the dialog
    await dialog.locator('button:text("Try Action")').click();
    
    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
    
    // Verify error notification is shown
    const notification = page.locator('.notification-container:visible');
    await expect(notification).toBeVisible();
    
    // Verify notification content
    const notificationContent = notification.locator('.notification-content');
    await expect(notificationContent).toHaveText('Action failed: Something went wrong');
    
    // Verify notification type
    await expect(notification).toHaveClass(/error/);
    
    // Click the "Retry" button on the notification
    await notification.locator('button:text("Retry")').click();
    
    // Verify dialog is reopened
    await expect(dialog).toBeVisible();
  });

  test('should chain multiple dialogs with notifications', async ({ page }) => {
    // Navigate to Dialog section
    await page.click('text=Dialog Component');
    
    // Find and click the "Start Multi-step Process" button
    await page.click('button:text("Start Multi-step Process")');
    
    // Step 1: Verify first dialog is open
    const dialog1 = page.locator('.dialog-container:visible');
    await expect(dialog1).toBeVisible();
    await expect(dialog1.locator('.dialog-title')).toHaveText('Step 1 of 3');
    
    // Complete step 1
    await dialog1.locator('button:text("Next")').click();
    
    // Verify step 1 notification
    const notification1 = page.locator('.notification-container:visible');
    await expect(notification1).toBeVisible();
    await expect(notification1.locator('.notification-content')).toHaveText('Step 1 completed');
    
    // Step 2: Verify second dialog is open
    const dialog2 = page.locator('.dialog-container:visible');
    await expect(dialog2).toBeVisible();
    await expect(dialog2.locator('.dialog-title')).toHaveText('Step 2 of 3');
    
    // Complete step 2
    await dialog2.locator('button:text("Next")').click();
    
    // Verify step 2 notification
    const notification2 = page.locator('.notification-container:visible');
    await expect(notification2).toBeVisible();
    await expect(notification2.locator('.notification-content')).toHaveText('Step 2 completed');
    
    // Step 3: Verify third dialog is open
    const dialog3 = page.locator('.dialog-container:visible');
    await expect(dialog3).toBeVisible();
    await expect(dialog3.locator('.dialog-title')).toHaveText('Step 3 of 3');
    
    // Complete step 3
    await dialog3.locator('button:text("Finish")').click();
    
    // Verify process completed notification
    const notification3 = page.locator('.notification-container:visible');
    await expect(notification3).toBeVisible();
    await expect(notification3.locator('.notification-content')).toHaveText('All steps completed successfully');
    await expect(notification3).toHaveClass(/success/);
  });
  
  test('should allow notification interaction from dialog', async ({ page }) => {
    // Navigate to Dialog section
    await page.click('text=Dialog Component');
    
    // Find and click the "Show Dialog with Notification Controls" button
    await page.click('button:text("Dialog with Notification Controls")');
    
    // Verify dialog is open
    const dialog = page.locator('.dialog-container:visible');
    await expect(dialog).toBeVisible();
    
    // Click the "Show Info Notification" button in the dialog
    await dialog.locator('button:text("Show Info")').click();
    
    // Verify info notification is shown
    const infoNotification = page.locator('.notification-container.info:visible');
    await expect(infoNotification).toBeVisible();
    
    // Click the "Show Warning Notification" button in the dialog
    await dialog.locator('button:text("Show Warning")').click();
    
    // Verify warning notification is shown
    const warningNotification = page.locator('.notification-container.warning:visible');
    await expect(warningNotification).toBeVisible();
    
    // Click the "Clear All Notifications" button in the dialog
    await dialog.locator('button:text("Clear Notifications")').click();
    
    // Verify all notifications are gone
    await expect(page.locator('.notification-container:visible')).toHaveCount(0);
    
    // Close the dialog
    await dialog.locator('button:text("Close")').click();
    
    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
  });
}); 