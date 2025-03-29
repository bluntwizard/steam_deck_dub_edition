// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('UI Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase before each test
    await page.goto('/component-showcase.html');
  });

  test('should render buttons consistently across browsers', async ({ page, browserName }) => {
    // Get all buttons in first component
    const buttons = page.locator('.component-section:first-child .control-panel button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    
    // Get size and styling of the first button
    const firstButton = buttons.first();
    const buttonStyles = await firstButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        width: style.width,
        height: style.height,
        padding: style.padding,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily
      };
    });
    
    // Log styles for different browsers to compare
    console.log(`Button styles in ${browserName}:`, buttonStyles);
    
    // Capture screenshot of buttons for visual comparison
    await buttons.first().screenshot({ path: `./test-results/button-${browserName}.png` });
    
    // Assert basic consistency (these should be the same across browsers)
    expect(buttonStyles.borderRadius).toBe('4px');
    expect(buttonStyles.color.replace(/\s+/g, '')).toMatch(/rgb\(255,255,255\)/i);
  });

  test('should render dialog consistently across browsers', async ({ page, browserName }) => {
    // Open a dialog
    await page.locator('#openSimpleDialog').click();
    
    // Verify dialog is visible
    const dialog = page.locator('.sdde-dialog');
    await expect(dialog).toBeVisible();
    
    // Get dialog styles
    const dialogStyles = await dialog.evaluate(el => {
      const style = window.getComputedStyle(el);
      const contentEl = el.querySelector('.sdde-dialog-content');
      const contentStyle = contentEl ? window.getComputedStyle(contentEl) : {};
      const titleEl = el.querySelector('.sdde-dialog-title');
      const titleStyle = titleEl ? window.getComputedStyle(titleEl) : {};
      
      return {
        width: style.width,
        maxWidth: style.maxWidth,
        padding: style.padding,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        zIndex: style.zIndex,
        position: style.position,
        content: {
          padding: contentStyle.padding,
          color: contentStyle.color,
          fontSize: contentStyle.fontSize
        },
        title: {
          fontSize: titleStyle.fontSize,
          fontWeight: titleStyle.fontWeight,
          color: titleStyle.color
        }
      };
    });
    
    // Log dialog styles for different browsers
    console.log(`Dialog styles in ${browserName}:`, dialogStyles);
    
    // Capture screenshot of dialog for visual comparison
    await dialog.screenshot({ path: `./test-results/dialog-${browserName}.png` });
    
    // Assert dialog position is fixed
    expect(dialogStyles.position).toBe('fixed');
    
    // Assert z-index is high enough to appear above other content
    expect(parseInt(dialogStyles.zIndex, 10)).toBeGreaterThan(100);
    
    // Close dialog
    await page.locator('.sdde-dialog-close-btn').click();
  });

  test('should render notifications consistently across browsers', async ({ page, browserName }) => {
    // Trigger a notification
    await page.locator('#showInfoNotification').click();
    
    // Wait for notification to appear
    const notification = page.locator('.sdde-notification');
    await expect(notification).toBeVisible();
    
    // Get notification styles
    const notificationStyles = await notification.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        padding: style.padding,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        color: style.color,
        boxShadow: style.boxShadow,
        position: style.position,
        animation: style.animation,
        fontSize: style.fontSize
      };
    });
    
    // Log notification styles for different browsers
    console.log(`Notification styles in ${browserName}:`, notificationStyles);
    
    // Capture screenshot of notification for visual comparison
    await notification.screenshot({ path: `./test-results/notification-${browserName}.png` });
    
    // Assert notification has position fixed or absolute
    expect(['fixed', 'absolute']).toContain(notificationStyles.position);
    
    // Wait for notification to disappear or manually close it
    if (await notification.isVisible()) {
      await notification.locator('.sdde-notification-close').click();
    }
  });

  test('should render fonts consistently across browsers', async ({ page, browserName }) => {
    // Get font rendering of component titles
    const titles = page.locator('.component-title');
    
    // Check font metrics
    const fontMetrics = await titles.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const range = document.createRange();
      range.selectNodeContents(el);
      const rect = range.getBoundingClientRect();
      
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textRendering: style.textRendering,
        contentWidth: rect.width,
        contentHeight: rect.height
      };
    });
    
    // Log font metrics for different browsers
    console.log(`Font metrics in ${browserName}:`, fontMetrics);
    
    // Capture screenshot of title for visual comparison
    await titles.first().screenshot({ path: `./test-results/title-font-${browserName}.png` });
    
    // Assert some basic font properties
    expect(fontMetrics.fontFamily).toContain('Segoe UI');
  });

  test('should render form inputs consistently across browsers', async ({ page, browserName }) => {
    // Locate form input
    const input = page.locator('#notificationText');
    await expect(input).toBeVisible();
    
    // Get input styles
    const inputStyles = await input.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        padding: style.padding,
        borderRadius: style.borderRadius,
        border: style.border,
        backgroundColor: style.backgroundColor,
        color: style.color,
        height: style.height,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        boxSizing: style.boxSizing
      };
    });
    
    // Log input styles for different browsers
    console.log(`Input styles in ${browserName}:`, inputStyles);
    
    // Capture screenshot of input for visual comparison
    await input.screenshot({ path: `./test-results/input-${browserName}.png` });
    
    // Test input focus state
    await input.focus();
    
    const focusStyles = await input.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow
      };
    });
    
    // Log focus styles
    console.log(`Input focus styles in ${browserName}:`, focusStyles);
    
    // Capture screenshot of focused input
    await input.screenshot({ path: `./test-results/input-focus-${browserName}.png` });
    
    // Verify input has some kind of focus indicator
    const hasFocusIndicator = 
      focusStyles.outlineWidth !== '0px' || 
      focusStyles.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('should use consistent spacing across browsers', async ({ page, browserName }) => {
    // Get the spacing between components
    const componentSpacing = await page.evaluate(() => {
      const components = Array.from(document.querySelectorAll('.component-section'));
      if (components.length < 2) return null;
      
      const firstRect = components[0].getBoundingClientRect();
      const secondRect = components[1].getBoundingClientRect();
      
      return {
        marginBottom: secondRect.top - firstRect.bottom,
        paddingInside: components[0].style.padding || getComputedStyle(components[0]).padding
      };
    });
    
    // Log spacing for different browsers
    console.log(`Component spacing in ${browserName}:`, componentSpacing);
    
    // There should be consistent spacing between components
    expect(componentSpacing?.marginBottom).toBeGreaterThan(10);
    
    // Get element alignment
    const alignment = await page.evaluate(() => {
      const container = document.querySelector('.container');
      if (!container) return null;
      
      const containerRect = container.getBoundingClientRect();
      const componentRect = container.querySelector('.component-section')?.getBoundingClientRect();
      
      if (!componentRect) return null;
      
      return {
        containerLeft: containerRect.left,
        componentLeft: componentRect.left,
        componentPaddingLeft: parseInt(getComputedStyle(container.querySelector('.component-section')).paddingLeft, 10),
        isAligned: containerRect.left === componentRect.left
      };
    });
    
    // Log alignment for different browsers
    console.log(`Element alignment in ${browserName}:`, alignment);
    
    // Verify alignment is consistent
    expect(alignment?.isAligned).toBeTruthy();
  });

  test('should handle scrolling areas consistently', async ({ page, browserName }) => {
    // Change to a mobile viewport to force scrolling
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Get scrollbar width and scroll behavior
    const scrollData = await page.evaluate(() => {
      // Calculate scrollbar width
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);
      
      const inner = document.createElement('div');
      outer.appendChild(inner);
      
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      document.body.removeChild(outer);
      
      // Get scroll behavior
      const htmlStyle = getComputedStyle(document.documentElement);
      const bodyStyle = getComputedStyle(document.body);
      
      return {
        scrollbarWidth,
        htmlScrollBehavior: htmlStyle.scrollBehavior,
        bodyScrollBehavior: bodyStyle.scrollBehavior
      };
    });
    
    // Log scroll data for different browsers
    console.log(`Scroll data in ${browserName}:`, scrollData);
    
    // Scroll to the bottom and take screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: `./test-results/scroll-bottom-${browserName}.png` });
    
    // Test smooth scrolling behavior by clicking on a component further down
    await page.evaluate(() => {
      const components = document.querySelectorAll('.component-section');
      if (components.length > 3) {
        components[3].scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // Wait a moment for smooth scroll to complete
    await page.waitForTimeout(500);
    
    // Take screenshot after smooth scroll
    await page.screenshot({ path: `./test-results/smooth-scroll-${browserName}.png` });
  });
}); 