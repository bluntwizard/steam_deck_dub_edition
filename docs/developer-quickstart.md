# SDDE Components: Developer Quickstart Guide

This guide provides a quick introduction to using the SDDE Components library in your projects.

## Installation

### NPM
```bash
npm install @sdde/components
```

### Direct Include
Alternatively, include the CSS and JS files directly in your HTML:
```html
<link rel="stylesheet" href="path/to/sdde-components.css">
<script src="path/to/sdde-components.js"></script>
```

## Basic Usage

### 1. Initialize Components

```javascript
// Import the components (if using modules)
import { Dialog, NotificationSystem, PageLoader, ErrorHandler, HelpCenter } from '@sdde/components';

// Or access via the SDDE namespace if using direct include
// const { Dialog, NotificationSystem, PageLoader, ErrorHandler, HelpCenter } = SDDE;

// Initialize components
const notificationSystem = new NotificationSystem({
  position: 'top-right'
});

const errorHandler = new ErrorHandler({
  showNotifications: true,
  notificationSystem: notificationSystem
});

const pageLoader = new PageLoader({
  container: document.body
});

const helpCenter = new HelpCenter({
  container: document.body,
  helpContentUrl: './help-content/'
});
```

### 2. Common Component Examples

#### Dialog

```javascript
// Create and open a simple dialog
const dialog = new Dialog({
  title: 'Hello World',
  content: 'This is a basic dialog example.',
  buttons: [
    { text: 'Cancel', action: 'close' },
    { text: 'OK', action: () => console.log('OK clicked') }
  ]
});

dialog.open();

// Listen for events
dialog.element.addEventListener('dialog-closed', (e) => {
  console.log('Dialog was closed via:', e.detail.source);
});
```

#### Notifications

```javascript
// Show different types of notifications
notificationSystem.showNotification({
  type: 'info',
  message: 'This is an information message',
  duration: 5000 // 5 seconds
});

notificationSystem.showNotification({
  type: 'success',
  message: 'Operation completed successfully!',
  actions: [
    { text: 'Undo', callback: () => console.log('Undo clicked') }
  ]
});

// Warning and error notifications
notificationSystem.showNotification({ type: 'warning', message: 'Warning message' });
notificationSystem.showNotification({ type: 'error', message: 'Error message' });
```

#### Page Loader

```javascript
// Show a simple loader
pageLoader.show();

// Later, hide the loader
setTimeout(() => pageLoader.hide(), 2000);

// Show loader with progress
pageLoader.show();
let progress = 0;
const interval = setInterval(() => {
  progress += 10;
  pageLoader.updateProgress(progress);
  if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => pageLoader.hide(), 500);
  }
}, 300);
```

#### Error Handler

```javascript
// Handle a non-critical error
try {
  // Some code that might fail
  throw new Error('Something went wrong');
} catch (error) {
  errorHandler.handleError(error, {
    userMessage: 'We encountered an issue',
    displayMode: 'notification'
  });
}

// Create a function with automatic error handling
const riskyFunction = errorHandler.createErrorWrapper(() => {
  // This function will be wrapped with error handling
  if (Math.random() > 0.5) {
    throw new Error('Random failure');
  }
  return 'Success!';
}, {
  userMessage: 'Operation failed',
  displayMode: 'modal',
  actionButtons: [
    { text: 'Retry', action: () => riskyFunction() }
  ]
});

// Call the protected function
riskyFunction();
```

#### Help Center

```javascript
// Open the help center
helpCenter.open();

// Open to a specific topic
helpCenter.openTopic('getting-started');

// Search for content
helpCenter.search('keyboard shortcuts');
```

## Integrating Multiple Components

Components are designed to work together. Here's an example of integrating multiple components:

```javascript
// Initialize components
const notificationSystem = new NotificationSystem({ position: 'bottom-right' });
const errorHandler = new ErrorHandler({ 
  showNotifications: true,
  notificationSystem: notificationSystem
});
const pageLoader = new PageLoader({ container: document.body });

// Example data loading function with integrated components
async function loadData() {
  try {
    pageLoader.show();
    
    // Simulate API call
    const response = await fetch('/api/data')
      .catch(error => {
        throw new Error('Network error: ' + error.message);
      });
      
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update UI with data
    updateUI(data);
    
    notificationSystem.showNotification({
      type: 'success',
      message: 'Data loaded successfully!'
    });
  } catch (error) {
    errorHandler.handleError(error, {
      userMessage: 'Failed to load data',
      displayMode: 'modal',
      actionButtons: [
        { text: 'Try Again', action: loadData }
      ]
    });
  } finally {
    pageLoader.hide();
  }
}

// Call the function
loadData();
```

## Testing Components

The SDDE Components library is designed to be easily testable. Here's a simple example using Jest:

```javascript
import { Dialog } from '@sdde/components';

describe('Dialog component', () => {
  let dialog;
  
  beforeEach(() => {
    // Setup
    dialog = new Dialog({
      title: 'Test Dialog',
      content: 'Dialog content for testing'
    });
  });
  
  afterEach(() => {
    // Cleanup
    if (dialog && dialog.element && dialog.element.parentNode) {
      dialog.destroy();
    }
  });
  
  test('should create a dialog with the correct title', () => {
    dialog.open();
    const titleElement = dialog.element.querySelector('.sdde-dialog-title');
    expect(titleElement.textContent).toBe('Test Dialog');
  });
  
  test('should close when the close button is clicked', () => {
    dialog.open();
    const closeButton = dialog.element.querySelector('.sdde-dialog-close');
    const closeSpy = jest.spyOn(dialog, 'close');
    
    closeButton.click();
    
    expect(closeSpy).toHaveBeenCalled();
  });
});
```

## Advanced Configuration

For more detailed configuration options and advanced usage, refer to the full [component documentation](./components.md).

## Browser Compatibility

SDDE Components are compatible with:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Troubleshooting

If you encounter issues:

1. Check the console for errors
2. Verify you're using the latest version of the library
3. Ensure all dependencies are correctly loaded
4. Check for CSS conflicts with your application's styling

For further assistance, refer to the [troubleshooting section](./troubleshooting.md) or open an issue on our GitHub repository. 