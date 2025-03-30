/**
 * End-to-end tests for Grimoire component interactions
 * This tests how components work together in realistic scenarios
 */

const { chromium } = require('playwright');

describe('Grimoire Component Interactions', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/examples/');
  });

  afterEach(async () => {
    await page.close();
  });

  test('Dialog should trigger Notification when confirmed', async () => {
    // Open confirmation dialog
    await page.click('#openConfirmDialog');
    
    // Wait for dialog to appear
    await page.waitForSelector('.sdde-dialog');
    
    // Dialog should be visible
    expect(await page.isVisible('.sdde-dialog')).toBe(true);
    
    // Click the confirm button
    await page.click('.sdde-dialog button:nth-child(2)');
    
    // Wait for notification to appear
    await page.waitForSelector('.sdde-notification.success');
    
    // Notification should be visible with correct message
    expect(await page.isVisible('.sdde-notification.success')).toBe(true);
    expect(await page.textContent('.sdde-notification.success')).toContain('Action confirmed');
  });

  test('ErrorHandler should show modal for critical errors', async () => {
    // Trigger critical error
    await page.click('#triggerCriticalError');
    
    // Wait for error dialog to appear
    await page.waitForSelector('.sdde-dialog.error-modal');
    
    // Dialog should be visible with error message
    expect(await page.isVisible('.sdde-dialog.error-modal')).toBe(true);
    expect(await page.textContent('.sdde-dialog.error-modal')).toContain('A critical error occurred');
    
    // Should have a retry button
    const retryButton = await page.waitForSelector('.sdde-dialog.error-modal button:has-text("Retry")');
    expect(retryButton).not.toBeNull();
  });

  test('PageLoader should show progress and hide when complete', async () => {
    // Start loader with progress
    await page.click('#showLoaderWithProgress');
    
    // Wait for loader to appear
    await page.waitForSelector('.sdde-loader');
    
    // Loader should be visible
    expect(await page.isVisible('.sdde-loader')).toBe(true);
    
    // Should eventually show progress near 100%
    await page.waitForFunction(() => {
      const progressEl = document.querySelector('.sdde-loader-progress');
      return progressEl && parseFloat(progressEl.style.width) >= 90;
    }, { timeout: 5000 });
    
    // Loader should eventually hide
    await page.waitForFunction(() => {
      const loader = document.querySelector('.sdde-loader');
      return loader === null || !loader.offsetParent;
    }, { timeout: 8000 });
  });

  test('HelpCenter should open and allow navigation', async () => {
    // Open help center
    await page.click('#openHelpCenter');
    
    // Wait for help center to appear
    await page.waitForSelector('.sdde-help-center');
    
    // Help center should be visible
    expect(await page.isVisible('.sdde-help-center')).toBe(true);
    
    // Should be able to navigate to a topic
    await page.click('.sdde-help-topic:first-child');
    
    // Topic content should load
    await page.waitForSelector('.sdde-help-content');
    expect(await page.isVisible('.sdde-help-content')).toBe(true);
    
    // Should be able to close help center
    await page.click('.sdde-help-center-close');
    
    // Help center should close
    await page.waitForFunction(() => {
      const helpCenter = document.querySelector('.sdde-help-center');
      return helpCenter === null || !helpCenter.offsetParent;
    });
  });

  test('ErrorHandler should work with PageLoader', async () => {
    // Use a custom test endpoint that simulates an API call
    await page.evaluate(() => {
      window.testIntegration = async () => {
        const pageLoader = new Grimoire.PageLoader({
          container: document.body
        });
        
        const errorHandler = new Grimoire.ErrorHandler({
          showNotifications: true,
          displayMode: 'modal'
        });
        
        pageLoader.show();
        
        try {
          // Simulate API call that fails after 1 second
          await new Promise((_, reject) => {
            setTimeout(() => reject(new Error('API call failed')), 1000);
          });
        } catch (error) {
          errorHandler.handleError(error, {
            userMessage: 'Failed to load data',
            displayMode: 'modal'
          });
        } finally {
          pageLoader.hide();
        }
      };
      
      // Run the test integration
      window.testIntegration();
    });
    
    // Wait for loader to appear
    await page.waitForSelector('.sdde-loader');
    
    // Loader should be visible
    expect(await page.isVisible('.sdde-loader')).toBe(true);
    
    // After error occurs, error dialog should appear
    await page.waitForSelector('.sdde-dialog.error-modal');
    expect(await page.isVisible('.sdde-dialog.error-modal')).toBe(true);
    
    // And loader should be hidden
    expect(await page.isVisible('.sdde-loader')).toBe(false);
  });
}); 