// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('ES6 Module Compatibility', () => {
  test('should load components via ES6 modules', async ({ page }) => {
    // Navigate to the component showcase page
    await page.goto('/component-showcase.html');
    
    // Add a console listener to catch module loading errors
    let moduleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('module')) {
        moduleErrors.push(msg.text());
      }
    });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that no module-related errors occurred
    expect(moduleErrors).toHaveLength(0);
    
    // Verify that Dialog component is available through module import
    const dialogImported = await page.evaluate(() => {
      return typeof window.Dialog === 'function';
    });
    expect(dialogImported).toBeTruthy();
    
    // Test creating a component from the module dynamically
    const componentCreated = await page.evaluate(() => {
      try {
        const dialog = new Dialog({
          title: 'Test',
          content: 'This is a test from ES6 module'
        });
        return dialog instanceof Dialog;
      } catch (e) {
        console.error(e);
        return false;
      }
    });
    expect(componentCreated).toBeTruthy();
  });
  
  test('should verify dynamic imports work', async ({ page }) => {
    // Create a test script that uses dynamic imports
    await page.evaluate(() => {
      // Add a button to test dynamic import
      const button = document.createElement('button');
      button.id = 'dynamic-import-test';
      button.textContent = 'Test Dynamic Import';
      button.onclick = async () => {
        try {
          const module = await import('../components/Dialog/index.js');
          window.dynamicImportResult = true;
          window.dynamicImportModule = module;
          button.textContent = 'Import Success';
        } catch (e) {
          window.dynamicImportResult = false;
          window.dynamicImportError = e.message;
          button.textContent = 'Import Failed';
        }
      };
      document.body.appendChild(button);
    });
    
    // Click the button to trigger dynamic import
    await page.click('#dynamic-import-test');
    
    // Wait for dynamic import to complete
    await page.waitForFunction(() => window.hasOwnProperty('dynamicImportResult'));
    
    // Verify dynamic import worked
    const importResult = await page.evaluate(() => window.dynamicImportResult);
    expect(importResult).toBeTruthy();
    
    // Verify the imported module is the correct one
    const moduleHasDialog = await page.evaluate(() => {
      return typeof window.dynamicImportModule?.default === 'function';
    });
    expect(moduleHasDialog).toBeTruthy();
  });
  
  test('should verify module features like destructuring', async ({ page }) => {
    await page.goto('/component-showcase.html');
    
    // Test destructuring and other ES6 features within a module
    const destructuringWorks = await page.evaluate(async () => {
      try {
        // Add test script
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import Dialog from '../components/Dialog/index.js';
          
          // Test destructuring
          const { title, content } = { title: 'Test Title', content: 'Test Content' };
          
          // Test arrow functions
          const testFn = () => {
            return { title, content };
          };
          
          // Test template literals
          const message = \`Dialog with \${title}\`;
          
          // Test class features
          class TestClass extends EventTarget {
            constructor() {
              super();
              this.props = testFn();
            }
          }
          
          window.es6FeaturesResult = {
            destructuringWorks: title === 'Test Title' && content === 'Test Content',
            templateLiteralsWork: message === 'Dialog with Test Title',
            classesWork: new TestClass().props.title === 'Test Title'
          };
        `;
        document.head.appendChild(script);
        
        // Wait for script to execute
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return window.es6FeaturesResult;
      } catch (e) {
        console.error(e);
        return { error: e.message };
      }
    });
    
    expect(destructuringWorks.destructuringWorks).toBeTruthy();
    expect(destructuringWorks.templateLiteralsWork).toBeTruthy();
    expect(destructuringWorks.classesWork).toBeTruthy();
  });
  
  test('should check for polyfills needed for older browsers', async ({ page, browserName }) => {
    // Check if import/export syntax is natively supported by the browser
    const moduleSupport = await page.evaluate(() => {
      try {
        // Create a module script
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          window.moduleSupported = true;
        `;
        document.head.appendChild(script);
        
        return true;
      } catch (e) {
        return false;
      }
    });
    
    // Expect modern browsers to support modules
    expect(moduleSupport).toBeTruthy();
    
    // Log browser info for reporting purposes
    console.log(`Browser ${browserName} has native ES6 module support: ${moduleSupport}`);
    
    // Test specific ES6 features that might need polyfills in some browsers
    const featuresSupport = await page.evaluate(() => {
      const support = {};
      
      // Check Promise support
      support.hasPromise = typeof Promise !== 'undefined';
      
      // Check arrow function support
      try {
        eval('() => {}');
        support.hasArrowFunctions = true;
      } catch (e) {
        support.hasArrowFunctions = false;
      }
      
      // Check Map support
      support.hasMap = typeof Map !== 'undefined';
      
      // Check Set support
      support.hasSet = typeof Set !== 'undefined';
      
      // Check for Object.entries
      support.hasObjectEntries = typeof Object.entries === 'function';
      
      return support;
    });
    
    // Modern browsers should support all these features
    expect(featuresSupport.hasPromise).toBeTruthy();
    expect(featuresSupport.hasArrowFunctions).toBeTruthy();
    expect(featuresSupport.hasMap).toBeTruthy();
    expect(featuresSupport.hasSet).toBeTruthy();
    expect(featuresSupport.hasObjectEntries).toBeTruthy();
    
    // Log feature support for reporting
    console.log(`Browser ${browserName} feature support:`, featuresSupport);
  });
}); 