# Grimoire Architecture

This document provides an overview of the Grimoire architecture, including component interactions and design patterns.

## System Overview

The Grimoire is a web-based documentation and guide application with offline support, designed to provide information about the Steam Deck hardware and software. The application is built with a modular architecture that emphasizes maintainability, performance, and accessibility.

## Core Architecture

![Architecture Diagram](./images/architecture-diagram.png)

The application is structured using a modular, component-based architecture:

### Layers

1. **Core** - Foundation of the application, manages initialization and bootstrapping
2. **Services** - Provides functionalities like offline support, content loading, and search
3. **Components** - Reusable UI elements that make up the interface
4. **Utils** - Utility functions used throughout the application

### Key Components

- **Content Loader**: Manages loading and caching of content
- **Search System**: Provides full-text search functionality
- **Offline Manager**: Handles offline content caching and retrieval
- **UI Components**: Navigation, sidebar, preferences panel, and content display

## Data Flow

1. User requests content via the UI
2. Content loader retrieves content, checking cache first
3. Content is processed (formatted, linked, etc.)
4. UI components render the content
5. User interactions trigger appropriate actions

## Design Patterns

The application uses several design patterns:

### Module Pattern
JS/TS modules are used to encapsulate functionality and prevent global namespace pollution.

### Observer Pattern
Used for event handling and component communication:
- UI components subscribe to state changes
- Services publish events when data changes

### Factory Pattern
Used for creating components dynamically based on content needs.

### Singleton Pattern
Used for services that should have only one instance (e.g., OfflineManager, SearchController).

## Technologies

- **TypeScript**: For type-safe JavaScript development
- **Service Workers**: For offline functionality
- **LocalStorage/IndexedDB**: For client-side data persistence
- **Custom CSS**: For styling with variables for theming

## Client-Side State Management

The application uses a simple state management approach:

1. **User Preferences**: Stored in localStorage and managed by the Preferences component
2. **UI State**: Managed at the component level with events for cross-component communication
3. **Content State**: Managed by the ContentLoader service

## Performance Considerations

- **Code Splitting**: JavaScript is split into smaller chunks loaded on demand
- **Lazy Loading**: Content and assets are loaded only when needed
- **Caching**: Aggressive caching for offline support and performance
- **DOM Updates**: Efficient DOM updates using DocumentFragment

## Security Considerations

- **Content Security Policy**: Restricts resource loading to prevent XSS
- **HTTPS**: All communication is encrypted
- **Input Validation**: User inputs are validated and sanitized

## Future Architecture Improvements

- **Build Process Enhancement**: Further optimization of the build process
- **Component System Refinement**: More robust component lifecycle management
- **Design System Implementation**: Comprehensive design token system
- **State Management**: More formalized state management pattern

## References

- [Implementation Plan](./implementation-plan.md)
- [Component Documentation](./components/README.md)
- [Service Documentation](./features/README.md) 