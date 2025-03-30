# Test Migration to TypeScript

This document outlines the process and tools used to migrate tests from JavaScript to TypeScript in the Grimoire project.

## Overview

As part of our TypeScript migration initiative, we have converted the test suite from JavaScript to TypeScript to ensure type safety and better integration with the rest of the codebase.

## Migration Strategy

1. **Create Type Definitions**: Establish proper type definitions for component props and test utilities
2. **Automated Conversion**: Use the custom migration script to perform initial conversion of test files
3. **Manual Refinement**: Review and enhance the converted files with proper type annotations
4. **Update Test Setup**: Modify Jest configuration and setup files to support TypeScript tests

## Migration Script

We've created a migration script (`scripts/migrate-tests.js`) that automates much of the conversion process:

```bash
# Make the script executable
chmod +x scripts/migrate-tests.js

# Run the script
./scripts/migrate-tests.js
```

The script performs the following transformations:
- Converts JavaScript test files (.js) to TypeScript (.ts)
- Adds type imports for components
- Adds basic type annotations to functions and variables
- Formats the converted files using Prettier

## Test Utilities

We've added TypeScript versions of test utilities:

- `src/test/test-utils.ts`: Contains helper functions for testing components
- `src/test/setup.ts`: Contains global setup code and mocks for tests

## Jest Configuration Updates

The Jest configuration has been updated to support TypeScript tests:

- Added `setupFilesAfterEnv` to include the TypeScript setup file
- Configured Jest to process TypeScript files using ts-jest

## Type Definitions for Testing

For component tests, we've created type definitions that describe the props and state of each component:

- `src/types/button.ts`: Type definitions for the Button component
- Additional type definitions as needed for other components

## Manual Tasks After Conversion

After running the migration script, the following manual tasks are required:

1. Review each converted test file and add proper type annotations
2. Ensure that test mocks have proper TypeScript types
3. Fix any type errors identified by the TypeScript compiler
4. Update imports to use proper type definitions

## Best Practices

When writing TypeScript tests, follow these best practices:

1. Properly type test fixtures and mock data
2. Use type-safe assertions with Jest
3. Leverage TypeScript interfaces to ensure proper component props
4. Use generics for reusable test utilities

## Completion Status

- [x] Create test utilities in TypeScript
- [x] Create type definitions for component props
- [x] Create migration script for automated conversion
- [x] Update Jest configuration
- [ ] Convert component tests
- [ ] Convert utility tests
- [ ] Convert E2E tests

## Resources

- [Jest with TypeScript documentation](https://jestjs.io/docs/getting-started#using-typescript)
- [Testing Library with TypeScript](https://testing-library.com/docs/react-testing-library/setup#typescript) 