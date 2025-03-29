// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Component Showcase', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase before each test
    await page.goto('/component-showcase.html');
  });

  test('should load properly in all browsers', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Steam Deck DUB Edition - Component Showcase');
    
    // Verify the header is present
    const header = page.locator('header h1');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Steam Deck DUB Edition - Component Showcase');
    
    // Check that all component sections are present
    const componentSections = page.locator('.component-section');
    await expect(componentSections).toHaveCount(5); // Dialog, PageLoader, NotificationSystem, ErrorHandler, HelpCenter
  });

  test('should verify Dialog component functionality', async ({ page }) => {
    // Click the simple dialog button
    await page.locator('#openSimpleDialog').click();
    
    // Wait for dialog to appear
    const dialog = page.locator('.sdde-dialog');
    await expect(dialog).toBeVisible();
    
    // Verify dialog content
    await expect(dialog.locator('.sdde-dialog-title')).toHaveText('Simple Dialog');
    await expect(dialog.locator('.sdde-dialog-content')).toContainText('This is a basic dialog');
    
    // Close the dialog
    await dialog.locator('.sdde-dialog-close-btn').click();
    
    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
  });

  test('should verify PageLoader component functionality', async ({ page }) => {
    // Click the show loader button
    await page.locator('#showLoader').click();
    
    // Wait for loader to appear
    const loader = page.locator('#loadingTestArea .sdde-pageloader');
    await expect(loader).toBeVisible();
    
    // Verify loader spinner is visible
    await expect(loader.locator('.sdde-pageloader-spinner')).toBeVisible();
    
    // Hide the loader
    await page.locator('#hideLoader').click();
    
    // Verify loader is hidden
    await expect(loader).not.toBeVisible();
  });

  test('should verify NotificationSystem component functionality', async ({ page }) => {
    // Enter custom notification text
    await page.locator('#notificationText').fill('Custom notification test');
    
    // Click the info notification button
    await page.locator('#showInfoNotification').click();
    
    // Wait for notification to appear
    const notification = page.locator('.sdde-notification');
    await expect(notification).toBeVisible();
    
    // Verify notification content
    await expect(notification).toContainText('Custom notification test');
    
    // Verify it has the correct type
    await expect(notification).toHaveClass(/info/);
    
    // Wait for notification to disappear (auto-dismiss)
    await expect(notification).not.toBeVisible({ timeout: 10000 });
  });

  test('should verify ErrorHandler component functionality', async ({ page }) => {
    // Click the custom error button
    await page.locator('#triggerCustomError').click();
    
    // Wait for error notification to appear
    const errorNotification = page.locator('.sdde-notification.error');
    await expect(errorNotification).toBeVisible();
    
    // Verify error notification content
    await expect(errorNotification).toContainText('A custom error was triggered');
  });

  test('should toggle theme correctly', async ({ page }) => {
    // Make sure the theme toggle exists
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    });
    
    // Click the theme toggle
    await themeToggle.click();
    
    // Check if theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    
    expect(newTheme).not.toEqual(initialTheme);
    expect(newTheme).toEqual(initialTheme === 'light' ? 'dark' : 'light');
    
    // Verify CSS variables have changed
    if (newTheme === 'light') {
      const backgroundColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });
      
      // Light theme should have a lighter background color
      expect(backgroundColor).not.toEqual('rgb(18, 18, 18)'); // Not dark theme color
    }
  });

  test('should handle responsive layouts', async ({ page }) => {
    // Test desktop layout first
    const containerDesktop = page.locator('.container');
    const desktopPadding = await containerDesktop.evaluate((el) => {
      return window.getComputedStyle(el).padding;
    });
    
    // Now resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Wait for responsive layout to apply
    await page.waitForTimeout(500);
    
    // Check if padding changed for mobile
    const mobilePadding = await containerDesktop.evaluate((el) => {
      return window.getComputedStyle(el).padding;
    });
    
    // Control panel buttons should stack on mobile
    const controlPanel = page.locator('.control-panel').first();
    const flexDirection = await controlPanel.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    expect(flexDirection).toEqual('column');
    expect(mobilePadding).not.toEqual(desktopPadding); // Should be different on mobile
  });
}); 