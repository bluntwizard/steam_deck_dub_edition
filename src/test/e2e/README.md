# End-to-End Tests for Component Interactions

This directory contains end-to-end tests for component interactions in the Grimoire application. These tests focus on how components work together rather than testing components in isolation.

## Test Structure

The tests are organized by the primary interaction pattern they're testing:

- **dialog-notification-interaction.spec.js**: Tests the interaction between Dialog components and NotificationSystem
- **pageloader-errorhandler-interaction.spec.js**: Tests how PageLoader and ErrorHandler components work together to handle content loading errors
- **helpcenter-integration.spec.js**: Tests how HelpCenter integrates with various components like Dialog, PageLoader, and NotificationSystem

## Running the Tests

You can run the end-to-end tests with the following command:

```bash
npm run test:browser
```

To view a detailed HTML report after running the tests:

```bash
npm run test:browser:report
```

## Prerequisites

- The component showcase must be running on port 8080 (this is handled automatically by the test runner)
- Playwright browsers must be installed (`npx playwright install`)

## Adding New Tests

When adding new end-to-end tests for component interactions:

1. Create a new .spec.js file in this directory
2. Follow the existing patterns for setting up tests (navigate to showcase, interact with components, assert expected behavior)
3. Focus on testing real user flows and component interoperability rather than individual component functionality
4. Keep test descriptions clear and specific to help with debugging

## Test Coverage Goals

These tests aim to cover:

- Error handling and recovery flows
- Multi-step workflows using multiple components
- State preservation across component interactions
- Accessibility and keyboard navigation
- UI responsiveness and visual consistency 