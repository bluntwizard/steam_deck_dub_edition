// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase before each test
    await page.goto('/component-showcase.html');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for proper heading structure - h1 followed by h2s
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(5); // At least one h2 for each component
    
    // Ensure there are no heading level skips (h1 to h3 without h2)
    const h3Elements = page.locator('h3');
    for (let i = 0; i < await h3Elements.count(); i++) {
      const h3 = h3Elements.nth(i);
      const parentHeadings = await page.evaluate(el => {
        let current = el;
        while (current.parentElement) {
          current = current.parentElement;
          const h2 = current.querySelector('h2');
          if (h2) return true;
        }
        return false;
      }, await h3.elementHandle());
      
      expect(parentHeadings).toBeTruthy();
    }
  });

  test('should provide alt text for all images', async ({ page }) => {
    // Check all images have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab key navigation
    await page.keyboard.press('Tab');
    
    // First tab should focus on first interactive element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement.tagName.toLowerCase();
    });
    
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(focusedElement);
    
    // Test opening dialog with keyboard
    await page.keyboard.press('Tab'); // Tab to first button
    await page.keyboard.press('Enter'); // Press Enter to activate
    
    // Dialog should be visible and focused
    const dialog = page.locator('.sdde-dialog');
    await expect(dialog).toBeVisible();
    
    // Test if focus is trapped within the dialog (focus should not leave dialog)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusStillInDialog = await page.evaluate(() => {
      const activeElement = document.activeElement;
      const dialog = document.querySelector('.sdde-dialog');
      return dialog?.contains(activeElement);
    });
    
    expect(focusStillInDialog).toBeTruthy();
    
    // Test closing dialog with Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('should verify contrast ratios for text', async ({ page }) => {
    // Get background and text colors
    const contrastRatios = await page.evaluate(() => {
      // Helper to calculate relative luminance
      function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }
      
      // Helper to calculate contrast ratio
      function contrastRatio(lum1, lum2) {
        const lightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (lightest + 0.05) / (darkest + 0.05);
      }
      
      // Helper to get computed color in RGB format
      function getRgbValues(color) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return [0, 0, 0];
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
      
      const results = [];
      
      // Check component titles
      const titles = document.querySelectorAll('.component-title');
      titles.forEach(title => {
        const style = window.getComputedStyle(title);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // If background is transparent, use parent background
        let parentBg = bgColor;
        if (parentBg === 'rgba(0, 0, 0, 0)' || parentBg === 'transparent') {
          let parent = title.parentElement;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && parentStyle.backgroundColor !== 'transparent') {
              parentBg = parentStyle.backgroundColor;
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        const rgbText = getRgbValues(color);
        const rgbBg = getRgbValues(parentBg);
        
        const textLuminance = luminance(rgbText[0], rgbText[1], rgbText[2]);
        const bgLuminance = luminance(rgbBg[0], rgbBg[1], rgbBg[2]);
        
        const ratio = contrastRatio(textLuminance, bgLuminance);
        
        results.push({
          element: 'component-title',
          ratio: ratio
        });
      });
      
      // Check normal text
      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach(p => {
        const style = window.getComputedStyle(p);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // If background is transparent, use parent background
        let parentBg = bgColor;
        if (parentBg === 'rgba(0, 0, 0, 0)' || parentBg === 'transparent') {
          let parent = p.parentElement;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && parentStyle.backgroundColor !== 'transparent') {
              parentBg = parentStyle.backgroundColor;
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        const rgbText = getRgbValues(color);
        const rgbBg = getRgbValues(parentBg);
        
        const textLuminance = luminance(rgbText[0], rgbText[1], rgbText[2]);
        const bgLuminance = luminance(rgbBg[0], rgbBg[1], rgbBg[2]);
        
        const ratio = contrastRatio(textLuminance, bgLuminance);
        
        results.push({
          element: 'paragraph',
          ratio: ratio
        });
      });
      
      return results;
    });
    
    // WCAG AA requires a contrast ratio of at least 4.5:1 for normal text
    // and 3:1 for large text (18pt or 14pt bold)
    for (const result of contrastRatios) {
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Check CSS variables and animations
    const reducedMotionApplied = await page.evaluate(() => {
      // Add a test element with animation
      const testDiv = document.createElement('div');
      testDiv.className = 'animation-test';
      testDiv.style.cssText = `
        width: 100px;
        height: 100px;
        background: blue;
        animation: testAnimation 1s infinite;
      `;
      
      // Add animation definition
      const style = document.createElement('style');
      style.textContent = `
        @keyframes testAnimation {
          0% { transform: scale(1); }
          100% { transform: scale(1.5); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(testDiv);
      
      // Check computed style
      const computedStyle = window.getComputedStyle(testDiv);
      const animationDuration = computedStyle.animationDuration;
      
      // Check if our component respects the prefers-reduced-motion setting
      const componentDemo = document.querySelector('.component-demo');
      const demoStyle = window.getComputedStyle(componentDemo);
      const hasTransform = demoStyle.transform;
      
      return {
        // Should be near-zero for prefers-reduced-motion: reduce
        animationDuration,
        hasTransform,
        // Media query test
        mediaQueryMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    });
    
    // Verify reduced motion is applied
    expect(reducedMotionApplied.mediaQueryMatches).toBeTruthy();
    expect(reducedMotionApplied.animationDuration).toBe('0.001ms');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Click button to open dialog
    await page.locator('#openSimpleDialog').click();
    
    // Dialog should have proper ARIA role
    const dialog = page.locator('.sdde-dialog');
    await expect(dialog).toHaveAttribute('role', 'dialog');
    
    // Dialog should have aria-modal="true"
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // Dialog should have aria-labelledby pointing to title
    const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
    expect(ariaLabelledby).not.toBeNull();
    
    // Verify the referenced element exists and contains the title
    const titleElement = page.locator(`#${ariaLabelledby}`);
    await expect(titleElement).toBeVisible();
    await expect(titleElement).toHaveText('Simple Dialog');
    
    // Close dialog
    await dialog.locator('.sdde-dialog-close-btn').click();
  });
}); 