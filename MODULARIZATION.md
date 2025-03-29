# Component Modularization Plan

This document outlines the process for migrating existing components to a modular structure with CSS modules, similar to the `Button` component.

## Structure

Each component will follow this structure:

```
src/components/ComponentName/
  ├── index.js        # Entry point that exports the component
  ├── ComponentName.js     # The actual component implementation
  └── ComponentName.module.css  # CSS module with component-specific styles
```

## Migration Progress

| Component | Status | Notes |
|-----------|--------|-------|
| Button | ✅ Complete | Original example |
| ProgressTracker | ✅ Complete | Converted to module structure |
| Gallery | ✅ Complete | Converted to module structure |
| Lightbox | ✅ Complete | Handled as part of Gallery module |
| Search | ✅ Complete | Converted to module structure |
| AccessibilityControls | ✅ Complete | Converted to module structure |
| Notifications | ✅ Complete | Converted to module structure |
| PreferencesDialog | ✅ Complete | Converted to module structure |
| SettingsSection | ✅ Complete | Converted to module structure |
| SettingsTabs | ✅ Complete | Converted to module structure |
| SvgHeader | ✅ Complete | Converted to module structure |
| VersionManager | ✅ Complete | Converted to module structure |
| VersionDisplay | ✅ Complete | Converted to module structure |
| LazyLoader | ✅ Complete | Converted to module structure |
| CodeBlocks | ✅ Complete | Converted to module structure |
| Theme | ✅ Complete | Converted to module structure |

## Migration Steps

For each component, follow these steps:

1. Create the component directory structure in `src/components/`
2. Create an `index.js` file that imports the module CSS and exports the component
3. Create a `ComponentName.js` file with the component implementation
4. Create a `ComponentName.module.css` file with component-specific styles
5. Update imports in `ui-main.js` and other files to reference the new module
6. Remove the old CSS import from `src/styles/index.js`
7. Test the component to ensure it works correctly

## Benefits

- Better encapsulation of component code and styles
- Scoped CSS that prevents style leakage and conflicts
- Improved maintainability with related files kept together
- Enhanced reusability of components
- Cleaner imports and dependencies

## Conventions

- Use PascalCase for component directories and files
- Use kebab-case for CSS class names
- Keep component files focused on single responsibility
- Document component APIs with JSDoc comments 

## JavaScript Structure Reorganization

As part of the modularization effort, we have also reorganized the JavaScript files:

### Directory Structure

- Moved files from `src/js` and `src/js/core` to the `src/scripts` directory structure
- Organized files by their function into subdirectories:
  - `src/scripts/core` - Core application functionality
  - `src/scripts/services` - Service-related files like preload and service workers
  - `src/scripts/components` - Component-specific JavaScript
  - `src/scripts/utils` - Utility functions

### Specific Files Moved

- `src/js/core/ui-main.js` → `src/scripts/core/ui-main.js`
- `src/js/main.js` → `src/scripts/core/electron-main.js` (renamed to avoid conflict)
- `src/js/preload.js` → `src/scripts/services/preload.js`
- `src/js/service-worker.js` → `src/scripts/services/service-worker.js`

### Benefits

- Consolidated all JavaScript code into a consistent directory structure
- Improved code organization by functional category
- Eliminated redundant directory structures
- Simplified imports and dependencies
- Enhanced maintainability by providing clearer file locations 