# CSS Coding Guidelines and Maintenance
Grimoire

## Overview
This document provides guidelines for writing and maintaining CSS code in the Grimoire project. Following these guidelines will help ensure code consistency, readability, and maintainability.

## File Structure
CSS files are organized as follows:
- `/src/styles/core/` - Base styles and variables
- `/src/styles/components/` - Individual component styles
- `/src/styles/layouts/` - Layout-specific styles
- `/src/styles/utilities/` - Helper classes and utility styles

## Naming Conventions
We follow a modified BEM (Block, Element, Modifier) naming convention:

- Block: `component-name`
- Element: `component-name__element`
- Modifier: `component-name--modifier`

Example:
```css
.card {
  /* Card block styles */
}

.card__header {
  /* Card header element styles */
}

.card--featured {
  /* Featured card modifier styles */
}
```

## Variables
Use CSS custom properties (variables) for consistent values:

```css
:root {
  --primary-color: #8be9fd;
  --text-primary: #f8f8f2;
  --spacing-md: 16px;
}
```

## Format & Style
- Use 2 space indentation
- Use lowercase selectors and properties
- Use single quotes for strings
- Include a space after property colon
- End all declarations with a semicolon
- Put each selector on its own line
- Include a space before opening brace
- Put closing brace on its own line

```css
.selector-1,
.selector-2 {
  property: value;
  property2: value;
}
```

## Comments
Use consistent commenting style:

```css
/* Section comment
   Spans multiple lines if needed */

/* Component comment */

/* Property-specific comment */
```

## Media Queries
Place media queries at the end of the file or component section:

```css
@media (max-width: 768px) {
  .selector {
    property: value;
  }
}
```

## Specificity Guidelines
- Avoid using `!important` where possible
- Minimize ID selectors
- Keep specificity as low as possible
- Use classes instead of element selectors when possible

## Accessibility
- Ensure sufficient color contrast (minimum 4.5:1 for normal text)
- Use relative units (em, rem) for better scaling
- Test designs with screen readers
- Include proper focus states for keyboard navigation

## Maintaining CSS Quality

### Using the Linter
We use stylelint to enforce CSS code quality:

```bash
# Check all CSS files
npx stylelint "src/styles/**/*.css"

# Automatically fix issues where possible
npx stylelint "src/styles/**/*.css" --fix
```

### Unified CSS Fixer Tool
For comprehensive CSS fixing, we use our unified CSS fixing tool:

```bash
# Fix all CSS files in the project
./fix-css-all.sh

# Fix specific directory
./fix-css-all.sh --dir=src/styles/components

# Fix specific file
./fix-css-all.sh --file=src/styles/core/base.css

# Perform deep cleaning for problematic files
./fix-css-all.sh --deep-clean

# Generate a report without making changes
./fix-css-all.sh --report-only
```

This unified tool handles:
1. Missing semicolons and syntax errors
2. Malformed selectors and pseudo-elements
3. Missing units in numeric values
4. Indentation and formatting issues
5. Unclosed blocks and nested rules
6. Complex CSS rewriting for severely broken files

### Common CSS Issues to Watch For

1. **Missing semicolons**: Always add semicolons at the end of declarations
2. **Unclosed blocks**: Ensure every opening `{` has a matching closing `}`
3. **Malformed selectors**: Check selector syntax, especially for pseudo-elements (use `::` not `:`)
4. **Unitless values**: Always include units for non-zero values (except for line-height and other special properties)
5. **Invalid property names**: Check for typos in property names
6. **Specificity issues**: Avoid deeply nested selectors and multiple ID selectors
7. **Overuse of !important**: This disrupts the natural cascade and causes maintenance issues

## Adding New CSS
When adding new CSS files:

1. Follow the file structure convention
2. Use consistent naming according to BEM
3. Leverage existing variables and utility classes
4. Run linting before committing changes
5. Test across different screen sizes

## Resources
- [CSS Tricks Guide to CSS Variables](https://css-tricks.com/a-complete-guide-to-custom-properties/)
- [BEM Naming Convention](http://getbem.com/naming/)
- [Stylelint Documentation](https://stylelint.io/) 