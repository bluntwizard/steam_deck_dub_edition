# Component Showcase

This directory contains a showcase/demo page for the Grimoire modularized components.

## Purpose

The component showcase serves as:

1. A visual demonstration of all available components
2. A live testing environment for component functionality
3. A reference for developers on how to use the components
4. A documentation supplement with code examples

## Available Files

- `component-showcase.html` - The main HTML showcase page
- `showcase.css` - Additional CSS styles for the showcase
- `showcase.js` - JavaScript enhancements for the showcase (theme toggling, code copying, navigation)

## Usage

To view the showcase, open `component-showcase.html` in a web browser. The page will load all available components and provide interactive examples for each one.

### Features

- **Interactive Demos**: Each component has a dedicated section with interactive controls to demonstrate its functionality.
- **Code Examples**: Code snippets show how to implement each component in your own projects.
- **Copy Function**: Copy code examples to clipboard with a single click.
- **Theme Toggle**: Switch between light and dark themes.
- **Responsive Design**: The showcase is fully responsive and works on mobile devices.
- **Accessibility**: Full keyboard navigation and screen reader support.

## Component Sections

Each component section includes:

1. **Description**: A brief overview of the component's purpose and capabilities.
2. **Interactive Demo**: Controls to demonstrate the component's functionality.
3. **Code Example**: A code snippet showing how to use the component.

## Adding New Components

To add a new component to the showcase:

1. Add a new section to `component-showcase.html` following the existing pattern.
2. Import the component in the module script section.
3. Add initialization and event handlers for the component demos.

## Browser Compatibility

The showcase is compatible with all modern browsers that support ES6 modules and CSS variables, including:

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)

## Development

When developing or adding to the showcase:

1. Test all components in multiple browsers
2. Ensure all interactive elements have keyboard support
3. Verify that code examples are up-to-date with component APIs
4. Check that theme switching works properly for all elements

## Printing

The showcase includes print styles for generating documentation. When printing:

- Controls and interactive elements are hidden
- Code examples are formatted for readability
- Each component section starts on a new page 