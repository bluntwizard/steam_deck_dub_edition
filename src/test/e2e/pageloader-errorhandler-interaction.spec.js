// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test file for PageLoader and ErrorHandler interaction
 * 
 * These tests verify that PageLoader and ErrorHandler components
 * work correctly together in various error scenarios
 */

test.describe('PageLoader and ErrorHandler Component Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page before each test
    await page.goto('http://localhost:8080/component-showcase.html');
    
    // Wait for page to be fully loaded
    await page.waitForSelector('.showcase-container');
  });

  test('should show error in PageLoader when content loading fails', async ({ page }) => {
    // Navigate to PageLoader section
    await page.click('text=PageLoader Component');
    
    // Click on the "Simulate Failed Load" button
    await page.click('button:text("Simulate Failed Load")');
    
    // Verify PageLoader shows error state
    const pageLoader = page.locator('.page-loader');
    await expect(pageLoader).toBeVisible();
    
    // Verify error message is displayed
    const errorMessage = pageLoader.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to load content');
    
    // Verify retry button is available
    const retryButton = errorMessage.locator('button:text("Retry")');
    await expect(retryButton).toBeVisible();
  });

  test('should show error notification when PageLoader fails', async ({ page }) => {
    // Navigate to ErrorHandler section
    await page.click('text=ErrorHandler Component');
    
    // Find and click the "PageLoader with Error Notification" demo
    await page.click('button:text("PageLoader with Error Notification")');
    
    // Wait for PageLoader to appear and then fail
    const pageLoader = page.locator('.page-loader');
    await expect(pageLoader).toBeVisible();
    await page.waitForSelector('.page-loader.loading');
    
    // Verify error notification appears
    const notification = page.locator('.notification-container.error');
    await expect(notification).toBeVisible();
    
    // Verify notification content
    await expect(notification.locator('.notification-content')).toContainText('Error loading content');
    
    // Click the retry button on the notification
    await notification.locator('button:text("Retry")').click();
    
    // Verify PageLoader is in loading state again
    await expect(pageLoader).toHaveClass(/loading/);
  });

  test('should recover from error with ErrorHandler', async ({ page }) => {
    // Navigate to the combined demo section
    await page.click('text=Component Interactions');
    
    // Click on ErrorHandler + PageLoader demo
    await page.click('button:text("ErrorHandler with PageLoader")');
    
    // Initially trigger an error
    await page.click('button:text("Load with Error")');
    
    // Verify PageLoader shows error
    const pageLoader = page.locator('.page-loader');
    await expect(pageLoader).toHaveClass(/error/);
    
    // Verify ErrorHandler shows dialog
    const errorDialog = page.locator('.dialog-container.error-dialog');
    await expect(errorDialog).toBeVisible();
    
    // Try recovery option
    await errorDialog.locator('button:text("Try Recovery")').click();
    
    // Verify ErrorHandler dialog closes
    await expect(errorDialog).not.toBeVisible();
    
    // Verify PageLoader shows success state
    await page.waitForSelector('.page-loader.success');
    await expect(pageLoader).toHaveClass(/success/);
    
    // Verify content is loaded
    const content = pageLoader.locator('.content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('Successfully recovered content');
  });

  test('should show modal error with fallback content', async ({ page }) => {
    // Navigate to the combined demo section
    await page.click('text=Component Interactions');
    
    // Click on Critical Error demo
    await page.click('button:text("Critical Error with Fallback")');
    
    // Wait for PageLoader to appear and then fail critically
    const pageLoader = page.locator('.page-loader');
    await expect(pageLoader).toBeVisible();
    
    // Verify critical error dialog appears
    const errorDialog = page.locator('.dialog-container.critical-error');
    await expect(errorDialog).toBeVisible();
    await expect(errorDialog.locator('.dialog-title')).toContainText('Critical Error');
    
    // Choose to show fallback content
    await errorDialog.locator('button:text("Show Fallback Content")').click();
    
    // Verify error dialog closes
    await expect(errorDialog).not.toBeVisible();
    
    // Verify PageLoader shows fallback content
    const fallbackContent = pageLoader.locator('.fallback-content');
    await expect(fallbackContent).toBeVisible();
    await expect(fallbackContent).toContainText('Fallback content');
  });

  test('should handle chained error recovery attempts', async ({ page }) => {
    // Navigate to the combined demo section
    await page.click('text=Component Interactions');
    
    // Click on Multiple Recovery Attempts demo
    await page.click('button:text("Multiple Recovery Attempts")');
    
    // Verify initial load
    const pageLoader = page.locator('.page-loader');
    await expect(pageLoader).toBeVisible();
    
    // First error
    await page.click('button:text("Trigger First Error")');
    
    // Verify error notification
    const firstErrorNotification = page.locator('.notification-container.error');
    await expect(firstErrorNotification).toBeVisible();
    await expect(firstErrorNotification.locator('.notification-content')).toContainText('First error occurred');
    
    // Attempt first recovery
    await firstErrorNotification.locator('button:text("Try Fix #1")').click();
    
    // Second error
    const secondErrorNotification = page.locator('.notification-container.error').nth(1);
    await expect(secondErrorNotification).toBeVisible();
    await expect(secondErrorNotification.locator('.notification-content')).toContainText('Second error occurred');
    
    // Attempt second recovery
    await secondErrorNotification.locator('button:text("Try Fix #2")').click();
    
    // Verify success notification
    const successNotification = page.locator('.notification-container.success');
    await expect(successNotification).toBeVisible();
    await expect(successNotification.locator('.notification-content')).toContainText('Successfully recovered');
    
    // Verify content is loaded
    await expect(pageLoader).toHaveClass(/success/);
    const content = pageLoader.locator('.content');
    await expect(content).toBeVisible();
  });
}); 