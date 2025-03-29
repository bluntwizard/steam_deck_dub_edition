# Migration Guide: Legacy to Modular Architecture

This document provides guidance for migrating from the legacy implementation to the new modular architecture.

## Overview

The Steam Deck DUB Edition codebase has undergone a significant architectural upgrade, moving from a monolithic structure to a component-based modular architecture. This guide will help you understand the changes and how to adopt them in your projects.

## File Changes

- `index.html` now contains the modern modular implementation (previously `index-new.html`)
- The legacy implementation has been archived as `index-legacy.html` for reference

## Key Changes

1. **Component-Based Architecture**
   - Code is now organized into reusable, self-contained components
   - Each component has its own directory with JavaScript, CSS, and tests
   - Components expose a clear API through their constructors and methods

2. **Modern CSS Approach**
   - CSS variables for consistent theming
   - CSS modules for component-specific styling
   - Responsive design with mobile-first approach
   - Dark/light theme support

3. **JavaScript Improvements**
   - ES6 modules instead of global script tags
   - Centralized application initialization
   - Event-driven component communication
   - Proper error handling and lifecycle management

4. **Improved Developer Experience**
   - Clear documentation for each component
   - Comprehensive tests
   - Consistent patterns across the codebase

## Migration Steps

### Step 1: Update HTML Structure

Replace references to the old HTML structure with the new modular approach:

**Legacy:**
```html
<!-- Old way -->
<div class="loading-container">
  <div class="spinner"></div>
  <p class="loading-message">Loading...</p>
</div>

<script>
  // Manual creation of loading UI
  function showLoading() {
    document.querySelector('.loading-container').style.display = 'flex';
  }
  
  function hideLoading() {
    document.querySelector('.loading-container').style.display = 'none';
  }
</script>
```

**Modern:**
```html
<!-- Container for the loader -->
<div id="loader-container"></div>

<script type="module">
  import PageLoader from './src/components/PageLoader/index.js';
  
  const loader = new PageLoader({
    container: document.getElementById('loader-container'),
    message: 'Loading...',
    showSpinner: true
  });
  
  // Show/hide with proper methods
  loader.show();
  loader.hide();
</script>
```

### Step 2: Replace Global JavaScript with Modules

Replace global JavaScript with ES6 modules:

**Legacy:**
```html
<!-- Old way with multiple script tags -->
<script src="src/scripts/utils/error-handler.js"></script>
<script src="src/scripts/utils/notifications.js"></script>
<script>
  // Global functions
  function handleError(error) {
    console.error(error);
    showNotification('Error occurred: ' + error.message, 'error');
  }
  
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after delay
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
</script>
```

**Modern:**
```html
<!-- Modern approach with module imports -->
<script type="module">
  import ErrorHandler from './src/components/ErrorHandler/index.js';
  import NotificationSystem from './src/components/NotificationSystem/index.js';
  import appInit from './src/scripts/app-init.js';
  
  // Use the components through the app initializer
  try {
    // Your code here
  } catch (error) {
    appInit.components.errorHandler.handleError(error);
  }
  
  // Or create your own instances
  const notificationSystem = new NotificationSystem({
    position: 'top-right',
    autoRemove: true
  });
  
  notificationSystem.success({
    message: 'Operation completed successfully',
    duration: 3000
  });
</script>
```

### Step 3: Update CSS References

Replace direct CSS imports with the modular approach:

**Legacy:**
```html
<!-- Old way with multiple CSS files -->
<link rel="stylesheet" href="src/styles/components/loading.css">
<link rel="stylesheet" href="src/styles/components/notifications.css">
<link rel="stylesheet" href="src/styles/components/error-messages.css">
```

**Modern:**
```html
<!-- Modern approach with single main CSS file -->
<link rel="stylesheet" href="src/styles/main.css">
<!-- Components load their own CSS modules -->
```

### Step 4: Adopt the Application Initializer

Use the app initializer for coordinated component loading:

**Legacy:**
```javascript
// Old way - manually initializing everything
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    document.body.classList.add(storedTheme);
  }
  
  // Initialize loading indicator
  const loadingContainer = document.querySelector('.loading-container');
  // More initialization code...
  
  // Setup error handling
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', error);
    // Show error message...
  };
});
```

**Modern:**
```javascript
// Modern way - using app initializer
import appInit from './src/scripts/app-init.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components with proper dependencies
  appInit.initialize().then(() => {
    console.log('Application initialized successfully');
    
    // Use components through the app initializer
    appInit.components.pageLoader.show();
    appInit.loadContent('home');
  }).catch(error => {
    console.error('Failed to initialize:', error);
  });
});
```

## Component Migration Map

For each legacy pattern, use the following modern components:

| Legacy Pattern | Modern Component | Notes |
|----------------|------------------|-------|
| Loading indicators | `PageLoader` | Full-featured loading overlay with progress support |
| Error handling | `ErrorHandler` | Centralized error handling with notification support |
| Notifications | `NotificationSystem` | Toast-style notifications with actions |
| Help content | `HelpCenter` | Interactive help system with topics |
| Manual DOM updates | Component-based approach | Let components manage their own DOM |

## Testing Your Migration

1. You are now using the modular implementation by default when opening `index.html`
2. If you need to reference the legacy implementation, use `index-legacy.html`
3. Check for console errors or visual issues
4. Test all core functionality to ensure it works as expected
5. Verify that responsive design works on different screen sizes
6. Check light/dark theme switching functionality

## Common Migration Issues

### Issue: Module loading errors

**Problem:** Browser shows errors about ES6 modules.

**Solution:** Ensure you're running with proper CORS settings and using a modern browser. Running through a local server (vs. file:// protocol) is often required.

```bash
# Using Python's built-in HTTP server
python -m http.server

# Then visit http://localhost:8000/
```

### Issue: Components not initializing

**Problem:** Components don't appear or initialize properly.

**Solution:** Check the console for errors and verify that the DOM is fully loaded before initialization:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components here
});
```

### Issue: Styling inconsistencies

**Problem:** Styles don't match between legacy and modern versions.

**Solution:** Check for overriding styles and ensure CSS variables are properly applied:

```css
/* Check that these variables exist in your main.css */
:root {
  --primary-color: #5e35b1;
  --text-color: var(--dark-text);
  /* etc. */
}
```

## Getting Help

If you encounter issues during migration:

1. Check the component documentation in `docs/components.md`
2. Explore example usage in the component test files
3. Use the browser developer tools to inspect for errors
4. Reach out to the project maintainers with specific questions

## Conclusion

Migration to the new modular architecture will result in a more maintainable, testable, and extensible codebase. The initial investment in updating your code will pay off with easier updates, better performance, and a more consistent user experience. 