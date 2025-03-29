# Steam Deck DUB Edition (SDDE)

A modernized UI component library and toolkit for Steam Deck and general desktop applications.

## Overview

The Steam Deck DUB Edition (SDDE) is a project aimed at creating a modern, modular UI component system for desktop applications, with a focus on the Steam Deck platform. It provides reusable components for building consistent user interfaces with improved accessibility and customization.

## Features

- **Modular Components**: Dialog, PageLoader, NotificationSystem, ErrorHandler, and HelpCenter
- **Consistent Design**: Unified styling system across all components
- **Accessibility**: Built with a11y best practices in mind
- **Documentation**: Comprehensive guides with visual examples
- **Testing**: Unit tests and end-to-end testing

## Quick Start

Check our [Developer Quickstart Guide](docs/developer-quickstart.md) for detailed instructions on using the components in your project.

### Installation

```bash
npm install @sdde/components
```

### Basic Usage

```javascript
import { Dialog, NotificationSystem, PageLoader } from '@sdde/components';

// Initialize a notification system
const notifications = new NotificationSystem({
  position: 'top-right'
});

// Show a notification
notifications.showNotification({
  type: 'success',
  message: 'Component initialized successfully!'
});

// Create and open a dialog
const dialog = new Dialog({
  title: 'Welcome',
  content: 'This is a simple dialog example.',
  buttons: [
    { text: 'Close', action: 'close' }
  ]
});
dialog.open();
```

## Component Showcase

To see all components in action, run:

```bash
npm run dev
```

And visit `http://localhost:3000/examples/` in your browser.

## Documentation

- [Component API Documentation](docs/components.md)
- [Developer Quickstart Guide](docs/developer-quickstart.md)
- [Modularization Progress](docs/modularization-progress.md)
- [Visual Examples](docs/component-visuals.md)

## Development

### Prerequisites

- Node.js 14.x or higher
- npm 7.x or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/steam-deck-dub-edition.git
   cd steam-deck-dub-edition
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e
```

## Contributing

Contributions are welcome! Please check the [contribution guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE). 