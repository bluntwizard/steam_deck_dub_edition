# Grimoire Components

A comprehensive UI component library for Grimoire, providing accessible, modular, and themeable interface components.

## Installation

```bash
npm install sdde-components
# or
yarn add sdde-components
```

## Components

The library includes the following components:

- **Dialog**: Modal dialog component with customizable content and actions
- **PageLoader**: Content loading component with loading states and error handling
- **NotificationSystem**: Notification manager for displaying various types of alerts
- **ErrorHandler**: Centralized error handling with different display modes
- **HelpCenter**: In-app documentation and help system

## Usage

```javascript
// Import the components you need
import { Dialog, NotificationSystem, ErrorHandler } from 'sdde-components';

// Import styles
import 'sdde-components/dist/styles.css';

// Create and use the components
const dialog = new Dialog({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  buttons: [
    { id: 'cancel', label: 'Cancel', type: 'secondary' },
    { id: 'confirm', label: 'Confirm', type: 'primary' }
  ]
});

dialog.open();
dialog.on('button-click', (e) => {
  if (e.detail.buttonId === 'confirm') {
    // Handle confirmation
    console.log('User confirmed the action');
  }
  dialog.close();
});
```

## Documentation

For complete documentation, see the [Component Documentation](https://github.com/grimoiredubedition/sdde-components/blob/main/docs/components.md).

## Examples

Check out the [Component Showcase](https://github.com/grimoiredubedition/sdde-components/blob/main/examples) for interactive examples of all components.

## Features

- **Accessibility**: All components follow WCAG guidelines for accessibility
- **Theming**: Customizable themes with CSS variables
- **Modularity**: Use only the components you need
- **Event-Based**: Components communicate through standard DOM events
- **Error Handling**: Built-in error handling mechanisms
- **Responsive**: Components work across different screen sizes

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

MIT 