# Testing Guide

This document provides information on how to run and write tests for the Grimoire project.

## Running Tests

The project uses Jest for unit testing. To run the tests:

```bash
# Run all tests
npm test

# Run tests for a specific component
npm test -- Button

# Run tests with coverage report
npm test -- --coverage
```

## Test Structure

Tests are organized in the following directory structure:

```
src/test/
  ├── components/        - Component unit tests
  ├── integration/       - Integration tests
  └── utils/             - Utility function tests
```

## Writing Component Tests

When creating tests for components, follow these guidelines:

1. Create the test file in the `src/test/components/` directory
2. Name the test file `ComponentName.test.js`
3. Use the Jest DOM environment by adding `@jest-environment jsdom` at the top of the file
4. Import the component from its module
5. Write tests for all component functionality

Example:

```javascript
/**
 * @jest-environment jsdom
 */

import { Button } from '../../components/Button';

describe('Button Component', () => {
  // Setup code 
  
  test('renders correctly', () => {
    // Test implementation
  });
  
  // More tests...
});
```

## Test Coverage

The project aims to maintain high test coverage. When adding new components or functionality:

1. Write tests for all public methods and functions
2. Test different props/options configurations
3. Test edge cases and error handling
4. Run the coverage report to ensure adequate coverage

## Mocking

Use Jest's mocking capabilities to isolate components during testing:

```javascript
// Mock a dependency
jest.mock('../../utils/analytics', () => ({
  trackEvent: jest.fn()
}));

// Spy on a method
jest.spyOn(console, 'error').mockImplementation(() => {});
```

## Continuous Integration

Tests are automatically run in the CI pipeline on every pull request and push to the main branch. Pull requests with failing tests will not be merged. 