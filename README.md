# Grimoire

A cross-platform UI toolkit and application template system for building modern, deployable applications.

## Overview

Grimoire is a comprehensive toolkit for rapidly developing and deploying cross-platform applications. It bridges the gap between development and deployment by providing a complete solution that includes UI components, project scaffolding, and packaging options for multiple platforms.

## What is Grimoire?

Grimoire is best described as a **"Cross-Platform UI Template"** or **"App Toolkit"** that offers:

1. **UI Library/Toolkit**
   - Reusable TypeScript components with consistent styling
   - Theming system with light/dark mode and custom color schemes
   - Accessibility features built-in to all components

2. **App Scaffold**
   - Pre-configured project structure ready for customization
   - TypeScript integration for enhanced development experience
   - Build tools already configured and optimized

3. **Cross-Platform Deployment**
   - Ready-to-deploy formats for multiple platforms:
     - AppImage and .deb for Linux
     - Progressive Web App (PWA) support
     - Desktop application support

## Features

- **Modular Components**: Dialog, PageLoader, NotificationSystem, ErrorHandler, and HelpCenter
- **Consistent Design**: Unified styling system across all components
- **Accessibility**: Built with a11y best practices in mind
- **Progressive Web App**: Offline support and installable on mobile and desktop
- **TypeScript Integration**: Fully typed components and utilities
- **Documentation**: Comprehensive guides with visual examples
- **Testing**: Unit tests and end-to-end testing

## Quick Start

Check our [Getting Started Guide](docs/GETTING-STARTED.md) for detailed instructions 
on using Grimoire in your project.

### Installation

```bash
npm install @grimoire/toolkit
```

### Basic Usage

```javascript
import { Dialog, NotificationSystem, PageLoader } from '@grimoire/toolkit';

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

## Cross-Platform Features

Grimoire applications can be deployed in multiple formats:

- **Progressive Web App**: Install on any device with a modern browser
- **Linux AppImage**: Run on any Linux distribution without installation
- **Debian Package (.deb)**: Native installation for Debian-based systems
- **Desktop Application**: Native-like experience on Windows, macOS, and Linux

### PWA Features

- **Offline Access**: Continue using the app without an internet connection
- **Desktop Installation**: Install on your computer for quick access
- **Mobile Support**: Use on Android and iOS devices
- **Automatic Updates**: Receive notifications when new versions are available
- **Background Sync**: Synchronize data when coming back online

## Documentation

- [Component API Documentation](docs/components/COMPONENT-CATALOG.md)
- [Getting Started Guide](docs/GETTING-STARTED.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [TypeScript Implementation](docs/features/TYPESCRIPT.md)

## Internationalization (i18n) and RTL Support

Grimoire fully supports multiple languages and right-to-left (RTL) text direction for languages like Arabic and Hebrew.

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

RTL-specific styles are defined in `src/assets/css/rtl.css` and are automatically applied when 
a RTL language is selected. These styles handle:

- Text alignment
- Layout mirroring
- Margins and padding
- Icons and buttons
- Form elements

#### i18n Module

The enhanced i18n module (`src/i18n.ts`) handles:

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
3. Add the language to the supported locales list in `src/i18n.ts`

```typescript
this.supportedLocales = [
  // Existing languages...
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' }
];
```

### Testing RTL Languages

When developing UI components, always test with both LTR and RTL languages to ensure proper layout in both directions.

## Development

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/grimoire.git
   cd grimoire
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

## Why Grimoire?

Most UI libraries (like React or Vue) focus solely on components without addressing deployment. Frameworks (like Angular or Next.js) provide structure but lack cross-platform packaging solutions. Grimoire bridges this gap by offering:

1. A comprehensive UI component library
2. Ready-to-use project structure and scaffolding
3. Built-in deployment solutions for multiple platforms

This makes Grimoire ideal for developers who want to build applications quickly and deploy them across various platforms without the complexity of setting up separate build and packaging systems.

## Contributing

Contributions are welcome! Please check the [contribution guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE). 