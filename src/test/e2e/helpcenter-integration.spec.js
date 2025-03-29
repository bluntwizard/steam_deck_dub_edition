// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test file for HelpCenter integration with other components
 * 
 * These tests verify that the HelpCenter component works correctly
 * when interacting with other UI components
 */

test.describe('HelpCenter Integration with Other Components', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page before each test
    await page.goto('http://localhost:8080/component-showcase.html');
    
    // Wait for page to be fully loaded
    await page.waitForSelector('.showcase-container');
  });

  test('should open HelpCenter from Dialog component', async ({ page }) => {
    // Navigate to Dialog section
    await page.click('text=Dialog Component');
    
    // Open a dialog with help button
    await page.click('button:text("Dialog with Help Button")');
    
    // Verify dialog is open
    const dialog = page.locator('.dialog-container:visible');
    await expect(dialog).toBeVisible();
    
    // Click the help button in the dialog
    await dialog.locator('button:text("Get Help")').click();
    
    // Verify the HelpCenter opens
    const helpCenter = page.locator('.help-center-container');
    await expect(helpCenter).toBeVisible();
    
    // Verify HelpCenter loaded specific help topic related to the dialog
    const helpContent = helpCenter.locator('.help-content');
    await expect(helpContent).toContainText('Using Dialogs');
    
    // Close the HelpCenter
    await helpCenter.locator('.close-button').click();
    
    // Verify HelpCenter is closed
    await expect(helpCenter).not.toBeVisible();
    
    // Verify dialog is still open
    await expect(dialog).toBeVisible();
    
    // Close the dialog
    await dialog.locator('button:text("Close")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('should open HelpCenter from error in PageLoader', async ({ page }) => {
    // Navigate to PageLoader section
    await page.click('text=PageLoader Component');
    
    // Trigger load with error that has help option
    await page.click('button:text("Load with Help Option")');
    
    // Verify PageLoader shows error
    const errorMessage = page.locator('.page-loader .error-message');
    await expect(errorMessage).toBeVisible();
    
    // Click the "Get Help" button in the error message
    await errorMessage.locator('button:text("Get Help")').click();
    
    // Verify HelpCenter opens
    const helpCenter = page.locator('.help-center-container');
    await expect(helpCenter).toBeVisible();
    
    // Verify HelpCenter loaded the troubleshooting topic
    const helpContent = helpCenter.locator('.help-content');
    await expect(helpContent).toContainText('Troubleshooting Content Loading');
    
    // Navigate to a different help topic
    await helpCenter.locator('a:text("Common Issues")').click();
    
    // Verify topic changed
    await expect(helpContent).toContainText('Common Issues');
    
    // Close HelpCenter
    await helpCenter.locator('.close-button').click();
    await expect(helpCenter).not.toBeVisible();
  });

  test('should open HelpCenter from error notification', async ({ page }) => {
    // Navigate to NotificationSystem section
    await page.click('text=NotificationSystem Component');
    
    // Show error notification with help option
    await page.click('button:text("Error with Help")');
    
    // Verify error notification appears
    const notification = page.locator('.notification-container.error');
    await expect(notification).toBeVisible();
    
    // Click the "Help" button on the notification
    await notification.locator('button:text("Help")').click();
    
    // Verify HelpCenter opens
    const helpCenter = page.locator('.help-center-container');
    await expect(helpCenter).toBeVisible();
    
    // Verify search is prefilled with error code
    const searchInput = helpCenter.locator('.search-input');
    await expect(searchInput).toHaveValue('ERR-1234');
    
    // Verify search results are shown for the error
    const searchResults = helpCenter.locator('.search-results');
    await expect(searchResults).toContainText('Error Code: ERR-1234');
    
    // Close HelpCenter
    await helpCenter.locator('.close-button').click();
    await expect(helpCenter).not.toBeVisible();
  });

  test('should link to specific HelpCenter topics from UI elements', async ({ page }) => {
    // Navigate to the combined demo section
    await page.click('text=Component Interactions');
    
    // Click demo with inline help links
    await page.click('button:text("UI with Help Links")');
    
    // Verify component with help links is shown
    const uiContainer = page.locator('.demo-ui-container');
    await expect(uiContainer).toBeVisible();
    
    // Click an inline help link
    await uiContainer.locator('.help-link:has-text("Learn about settings")').click();
    
    // Verify HelpCenter opens to specific topic
    const helpCenter = page.locator('.help-center-container');
    await expect(helpCenter).toBeVisible();
    
    // Verify correct topic is shown
    const helpContent = helpCenter.locator('.help-content');
    await expect(helpContent).toContainText('Settings Overview');
    
    // Navigate back to previous topic using history
    await helpCenter.locator('button.back-button').click();
    
    // Verify introduction topic is shown
    await expect(helpContent).toContainText('Introduction');
    
    // Close HelpCenter
    await helpCenter.locator('.close-button').click();
    await expect(helpCenter).not.toBeVisible();
  });

  test('should maintain app state after using HelpCenter', async ({ page }) => {
    // Navigate to the form demo section
    await page.click('text=Component Interactions');
    await page.click('button:text("Form with Help")');
    
    // Fill out a form
    const form = page.locator('form.demo-form');
    await form.locator('input[name="name"]').fill('Test User');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('select[name="option"]').selectOption('option2');
    
    // Get help on a specific field
    await form.locator('button:has-text("Help"):near(input[name="email"])').click();
    
    // Verify HelpCenter opens
    const helpCenter = page.locator('.help-center-container');
    await expect(helpCenter).toBeVisible();
    
    // Verify email field help content is shown
    const helpContent = helpCenter.locator('.help-content');
    await expect(helpContent).toContainText('Email Field Requirements');
    
    // Close HelpCenter
    await helpCenter.locator('.close-button').click();
    await expect(helpCenter).not.toBeVisible();
    
    // Verify form state is maintained
    await expect(form.locator('input[name="name"]')).toHaveValue('Test User');
    await expect(form.locator('input[name="email"]')).toHaveValue('test@example.com');
    await expect(form.locator('select[name="option"]')).toHaveValue('option2');
    
    // Complete the form submission
    await form.locator('button[type="submit"]').click();
    
    // Verify success notification appears
    const notification = page.locator('.notification-container.success');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('Form submitted successfully');
  });
}); 