# TypeScript Implementation

This document provides details about the TypeScript implementation in the Steam Deck DUB Edition project, including migration status, type definitions, and best practices.

## Overview

The Steam Deck DUB Edition project has been fully migrated to TypeScript to enhance code quality, maintainability, and developer experience. TypeScript provides static typing which helps catch errors at compile time rather than runtime.

## Migration Status

The TypeScript migration is **100% complete**. All JavaScript files have been converted to TypeScript with appropriate interfaces, type annotations, and error handling.

| Category | Files Migrated | Total Files | Progress |
|----------|----------------|-------------|----------|
| Utils | 9 | 9 | 100% |
| Components | 6 | 6 | 100% |
| Services | 7 | 7 | 100% |
| **Overall** | **22** | **22** | **100%** |

## Type System

### Key Interfaces

The project uses several key interfaces to define data structures:

#### User Preferences

```typescript
interface UserPreference {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  lineHeight: number;
  codeBlockPreferences: {
    theme: string;
    showLineNumbers: boolean;
    wrap: boolean;
    fontFamily: string;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  navigation: {
    stickyHeader: boolean;
    showProgressBar: boolean;
    collapsibleSections: boolean;
  };
  // more preferences...
}
```

#### Service Worker Caching

```typescript
interface CacheStatistics {
  totalItems: number;
  contentItems: number;
  assetItems: number;
}

interface CachedPage {
  url: string;
  title: string;
}
```

#### Search Functionality

```typescript
interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  matches: string[];
}

interface SearchIndex {
  version: string;
  pages: SearchPage[];
}

interface SearchPage {
  title: string;
  url: string;
  content: string;
  keywords: string[];
}
```

### Type Declarations

Type declarations for third-party libraries and global objects are stored in `.d.ts` files:

- `src/scripts/types/global.d.ts` - Global type definitions
- `src/scripts/types/search-index.d.ts` - Search index type definitions
- `src/scripts/types/electron.d.ts` - Electron API type definitions

Example of a global declaration file:

```typescript
// src/scripts/types/global.d.ts

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    preferences: UserPreference;
    searchController: SearchController;
    offlineManager: OfflineManager;
  }
}

export {};
```

## TypeScript Configuration

The TypeScript configuration is defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Best Practices

### Type Safety

- Use explicit types for function parameters and return values
- Avoid using `any` type; use `unknown` instead if the type is truly unknown
- Use type guards to narrow types
- Use union types for variables that can have multiple types

Example of a type guard:

```typescript
function isSearchResult(value: unknown): value is SearchResult {
  return typeof value === 'object' && value !== null && 
    'title' in value && 'url' in value && 'score' in value;
}

function processResult(result: unknown) {
  if (isSearchResult(result)) {
    // TypeScript now knows result is a SearchResult
    console.log(result.title);
  }
}
```

### Nullable Types

- Use `optional` parameters with `?` for nullable fields
- Use the non-null assertion operator `!` only when you're certain a value is not null

```typescript
function getElement(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function getSafeElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id ${id} not found`);
  }
  return element;
}
```

### Async/Await

- Use `async/await` for asynchronous code
- Properly type Promise return values

```typescript
async function fetchData(): Promise<Data> {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json() as Data;
}
```

## Migration Approach

The TypeScript migration followed this approach:

1. Define interfaces and types for existing data structures
2. Convert files incrementally, starting with utilities and core files
3. Update imports/exports to support TypeScript modules
4. Add proper error handling and null checks
5. Implement type-safe event handlers

## Benefits Realized

The TypeScript migration has provided several benefits:

- **Fewer runtime errors**: Type checking catches errors at compile time
- **Better IDE support**: Autocompletion and code navigation
- **Self-documenting code**: Types serve as documentation
- **Safer refactoring**: Type checking helps prevent breaking changes
- **Enhanced maintainability**: Easier to understand and modify code

## References

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Coding Standards](../guides/CODING-STANDARDS.md)
- [Contributing Guidelines](../CONTRIBUTING.md) 