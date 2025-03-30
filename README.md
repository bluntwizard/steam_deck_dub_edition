# Steam Deck DUB Edition (SDDE)

A modernized UI component library and toolkit for Steam Deck and general desktop applications.

## Overview

The Steam Deck DUB Edition (SDDE) is a project aimed at creating a modern, modular UI component system for desktop applications, with a focus on the Steam Deck platform. It provides reusable components for building consistent user interfaces with improved accessibility and customization.

## Features

- **Modular Components**: Dialog, PageLoader, NotificationSystem, ErrorHandler, and HelpCenter
- **Consistent Design**: Unified styling system across all components
- **Accessibility**: Built with a11y best practices in mind
- **Progressive Web App**: Offline support and installable on mobile and desktop
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

## Progressive Web App Features

SDDE can be installed as a Progressive Web App on desktop and mobile devices, offering:

- **Offline Access**: Continue using the app without an internet connection
- **Desktop Installation**: Install on your computer for quick access
- **Mobile Support**: Use on Android and iOS devices
- **Automatic Updates**: Receive notifications when new versions are available
- **Background Sync**: Synchronize data when coming back online

## Documentation

- [Component API Documentation](docs/components.md)
- [Developer Quickstart Guide](docs/developer-quickstart.md)
- [Modularization Progress](docs/modularization-progress.md)
- [Visual Examples](docs/component-visuals.md)

## Internationalization (i18n) and RTL Support

Steam Deck DUB Edition now supports multiple languages and right-to-left (RTL) text direction for languages like Arabic and Hebrew.

### Features

- **Multiple Language Support**: 
  - English (en)
  - Spanish (es)
  - Arabic (ar) - RTL
  - Hebrew (he) - RTL

- **RTL Layout Support**:
  - Automatic text direction switching
  - Mirrored UI elements and layouts
  - Proper alignment for RTL languages

- **Language Selection Component**:
  - Easy language switching in the UI
  - Three variants: dropdown, buttons, and select
  - Shows native language names

### Implementation Details

#### Locale Files

Each language has its own locale file in the `src/locales` directory:
- `en.json` - English (default)
- `es.json` - Spanish
- `ar.json` - Arabic (RTL)
- `he.json` - Hebrew (RTL)

Locale files include a `direction` property that defines the text direction for the language:

```json
{
  "direction": "rtl",
  "common": {
    // translations
  }
}
```

#### RTL CSS Support

RTL-specific styles are defined in `src/assets/css/rtl.css` and are automatically applied when a RTL language is selected. These styles handle:

- Text alignment
- Layout mirroring
- Margins and padding
- Icons and buttons
- Form elements

#### i18n Module

The enhanced i18n module (`src/i18n.js`) handles:

- Language detection and selection
- Loading translations
- RTL/LTR direction management
- DOM updates based on language
- Number and date formatting

#### Language Selector Component

A reusable language selector component is available in three variants:

```jsx
// Dropdown (default)
<LanguageSelector />

// Buttons
<LanguageSelector variant="buttons" />

// Select element (mobile-friendly)
<LanguageSelector variant="select" />
```

### Adding New Languages

To add a new language:

1. Create a new locale file in `src/locales/` with the language code as filename (e.g., `fr.json` for French)
2. Set the `direction` property to either "ltr" or "rtl"
3. Add the language to the supported locales list in `src/i18n.js`

```javascript
this.supportedLocales = [
  // Existing languages...
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' }
];
```

### Testing RTL Languages

When developing UI components, always test with both LTR and RTL languages to ensure proper layout in both directions.

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