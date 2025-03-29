# Developer Quickstart Guide

This guide will help you quickly get started with the Steam Deck DUB Edition's component system. It covers component installation, basic usage patterns, customization, and troubleshooting.

## Table of Contents
- [Installation](#installation)
- [Component Overview](#component-overview)
- [Basic Usage](#basic-usage)
- [Integration Patterns](#integration-patterns)
- [Extending Components](#extending-components)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## Installation

### Prerequisites
- Node.js 14.x or higher
- Electron 13.x or higher (for desktop application integration)

### Setting Up Components

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/steam-deck-dub-edition.git
   cd steam-deck-dub-edition
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Import components in your project**:
   ```javascript
   // ES6 import
   import { Dialog, PageLoader, NotificationSystem, ErrorHandler, HelpCenter } from './app/components';
   
   // CommonJS
   const { Dialog, PageLoader, NotificationSystem, ErrorHandler, HelpCenter } = require('./app/components');
   ```

## Component Overview

Our modular component system includes:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Dialog** | Modal dialogs for user interaction | Customizable content, action buttons, accessibility features |
| **PageLoader** | Content loading management | Loading states, progress indicators, error handling |
| **NotificationSystem** | User notifications | Multiple types (info, success, warning, error), positioning options |
| **ErrorHandler** | Centralized error management | Global error catching, different display modes, error history |
| **HelpCenter** | In-app documentation | Searchable content, navigation, contextual help |

## Basic Usage

### Dialog Component

```javascript
// Create a dialog
const dialog = new Dialog({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  buttons: [
    { id: 'cancel', label: 'Cancel', type: 'secondary' },
    { id: 'confirm', label: 'Confirm', type: 'primary' }
  ]
});

// Show dialog and handle button clicks
dialog.open();
dialog.on('button-click', (e) => {
  if (e.detail.buttonId === 'confirm') {
    // Handle confirmation
    console.log('User confirmed the action');
  }
  dialog.close();
});
```

### PageLoader Component

```javascript
// Create a page loader
const pageLoader = new PageLoader({
  container: document.getElementById('content-container'),
  loadingMessage: 'Loading content...'
});

// Load content
pageLoader.showLoading();
fetchContent()
  .then(content => {
    pageLoader.setContent(content);
  })
  .catch(error => {
    pageLoader.showError('Failed to load content', error);
  });
```

### NotificationSystem Component

```javascript
// Create notification system
const notifications = new NotificationSystem({
  position: 'top-right',
  duration: 5000  // 5 seconds
});

// Show different types of notifications
notifications.showNotification('Information message', 'info');
notifications.showNotification('Operation successful!', 'success');
notifications.showNotification('Please review your input', 'warning');
notifications.showNotification('An error occurred', 'error');
```

### ErrorHandler Component

```javascript
// Create error handler
const errorHandler = new ErrorHandler({
  showNotifications: true,
  notificationType: 'toast',
  logErrors: true
});

// Wrap functions with error handling
const fetchDataSafely = errorHandler.createErrorWrapper(
  fetchData,  // Original function
  {
    userMessage: 'Failed to fetch data. Please try again later.',
    displayMode: 'toast'
  }
);

// Use the wrapped function
fetchDataSafely()
  .then(data => processData(data))
  .catch(error => console.log('Error already handled by ErrorHandler'));
```

### HelpCenter Component

```javascript
// Create help center
const helpCenter = new HelpCenter({
  container: document.getElementById('help-container'),
  helpContentUrl: './help-content/',
  defaultTopic: 'getting-started'
});

// Open help center
document.getElementById('help-button').addEventListener('click', () => {
  helpCenter.open();
});

// Navigate to specific topics
helpCenter.openTopic('troubleshooting');
```

## Integration Patterns

### Pattern 1: Component Composition

Combine components to create complex interfaces:

```javascript
function initializeAppInterface() {
  // Create components
  const loader = new PageLoader({ container: document.getElementById('main') });
  const notifications = new NotificationSystem();
  const errorHandler = new ErrorHandler({ showNotifications: true });
  
  // Connect components
  loader.on('loading-error', (e) => {
    errorHandler.handleError(e.detail.error, {
      userMessage: 'Content could not be loaded'
    });
  });
  
  // Initialize content loading with error handling
  const loadContentSafely = errorHandler.createErrorWrapper(loadContent);
  loadContentSafely().then(content => loader.setContent(content));
}
```

### Pattern 2: Progressive Enhancement

Add components based on browser capabilities:

```javascript
function initializeWithFeatureDetection() {
  // Base components for all browsers
  const basicComponents = initializeBasicComponents();
  
  // Add enhanced components for modern browsers
  if (supportsModernFeatures()) {
    const enhancedComponents = initializeEnhancedComponents();
    return { ...basicComponents, ...enhancedComponents };
  }
  
  return basicComponents;
}
```

### Pattern 3: Contextual Component Activation

Show components based on application state:

```javascript
function handleApplicationState(state) {
  const components = {
    dialog: new Dialog(),
    loader: new PageLoader(),
    notifications: new NotificationSystem(),
    helpCenter: new HelpCenter()
  };
  
  // Show relevant components based on state
  switch(state) {
    case 'loading':
      components.loader.showLoading();
      break;
    case 'error':
      components.dialog.open({
        title: 'Error',
        content: 'Something went wrong. Need help?',
        buttons: [
          { id: 'help', label: 'Get Help' },
          { id: 'retry', label: 'Retry' }
        ]
      });
      components.dialog.on('button-click', e => {
        if (e.detail.buttonId === 'help') {
          components.helpCenter.open();
        }
      });
      break;
    case 'success':
      components.notifications.showNotification('Operation completed successfully', 'success');
      break;
  }
  
  return components;
}
```

## Extending Components

### Custom Dialog Example

```javascript
class CustomDialog extends Dialog {
  constructor(options) {
    super(options);
    this.customFeature = options.customFeature || 'default';
  }
  
  addCustomContent(content) {
    const customContainer = document.createElement('div');
    customContainer.className = 'custom-content';
    customContainer.innerHTML = content;
    this.contentElement.appendChild(customContainer);
    return this;
  }
  
  // Override methods as needed
  open() {
    console.log('Opening custom dialog with feature:', this.customFeature);
    super.open();
  }
}

// Usage
const myDialog = new CustomDialog({
  title: 'Custom Dialog',
  customFeature: 'advanced-layout'
});

myDialog.addCustomContent('<p>This is custom content</p>').open();
```

### Custom Error Handler Example

```javascript
class EnhancedErrorHandler extends ErrorHandler {
  constructor(options) {
    super(options);
    this.analyticsProvider = options.analyticsProvider;
  }
  
  handleError(error, options = {}) {
    // Send error to analytics
    if (this.analyticsProvider) {
      this.analyticsProvider.trackError(error, {
        context: options.context,
        errorId: options.errorId
      });
    }
    
    // Call parent implementation
    return super.handleError(error, options);
  }
}

// Usage
const analytics = new AnalyticsService();
const errorHandler = new EnhancedErrorHandler({
  analyticsProvider: analytics,
  showNotifications: true
});
```

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Components not rendering | Missing CSS | Ensure you've imported the component's CSS module |
| Events not firing | Incorrect event binding | Check event names and make sure listeners are added before triggering events |
| Z-index conflicts | CSS stacking context issues | Review the z-index values in your CSS and adjust the component's container positioning |
| Component initialization fails | DOM not ready | Ensure components are initialized after DOM content is loaded |
| Style conflicts | CSS specificity issues | Use more specific selectors or the `!important` flag for component styles |

### Debugging Tips

1. **Enable verbose logging**:
   ```javascript
   // For most components
   component.debug = true;
   
   // For ErrorHandler specifically
   const errorHandler = new ErrorHandler({
     logErrors: true,
     includeStackTrace: true,
     logLevel: 'debug'
   });
   ```

2. **Inspect component DOM structure**:
   - Use browser dev tools to inspect the generated HTML
   - Check for proper class names and attribute values
   - Verify CSS is correctly applied

3. **Event debugging**:
   ```javascript
   document.addEventListener('dialog-opened', e => console.log('Dialog opened:', e.detail));
   document.addEventListener('notification-shown', e => console.log('Notification shown:', e.detail));
   ```

4. **Component state logging**:
   ```javascript
   // Log PageLoader state changes
   pageLoader.on('state-change', e => console.log('PageLoader state:', e.detail.state));
   ```

## Development Workflow

### Adding a New Component

1. **Create component structure**:
   ```
   app/components/NewComponent/
   ├── index.js
   ├── NewComponent.js
   ├── NewComponent.css
   └── __tests__/
       └── NewComponent.test.js
   ```

2. **Implement the component**:
   - Follow existing component patterns
   - Ensure proper event handling
   - Add accessibility features
   - Include documentation

3. **Test your component**:
   ```bash
   npm test -- --testPathPattern=NewComponent
   ```

4. **Add to component showcase**:
   - Create a new showcase page for your component
   - Demonstrate different states and configurations

5. **Update documentation**:
   - Add API documentation
   - Include usage examples
   - Provide visual examples

### Updating Existing Components

1. Review component's current implementation and tests
2. Make changes while maintaining backward compatibility
3. Update tests to cover new functionality
4. Update documentation to reflect changes
5. Test integration with other components

### Best Practices

1. **Naming conventions**:
   - Use PascalCase for component classes
   - Use camelCase for methods and properties
   - Use kebab-case for CSS classes and events

2. **Code organization**:
   - Keep component logic in separate files
   - Group related functionality
   - Use clear, descriptive names

3. **Performance considerations**:
   - Minimize DOM manipulations
   - Use event delegation where appropriate
   - Clean up event listeners when components are destroyed

4. **Accessibility**:
   - Ensure keyboard navigation
   - Include ARIA attributes
   - Test with screen readers
   - Maintain proper focus management

5. **Testing**:
   - Write unit tests for all components
   - Test edge cases and error handling
   - Include integration tests for component interaction 