# Coding Standards

This document outlines the coding standards and best practices for the Steam Deck DUB Edition project.

## General Guidelines

- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Use meaningful names for variables, functions, and classes
- Keep functions small and focused
- Comment complex or non-obvious code
- Write self-documenting code where possible

## TypeScript Guidelines

### Types and Interfaces

- Use TypeScript for all new code
- Define interfaces for object shapes:

```typescript
// Good
interface UserPreferences {
  theme: string;
  fontSize: number;
  showImages: boolean;
}

// Avoid
const preferences: any = {
  theme: 'dark',
  fontSize: 16,
  showImages: true
};
```

- Use type annotations for function parameters and return types:

```typescript
// Good
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Avoid
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}
```

- Avoid using `any` type; use `unknown` if the type is truly unknown
- Use union types for variables that can have multiple types:

```typescript
// Good
function processValue(value: string | number): void {
  // Process value
}

// Avoid
function processValue(value: any): void {
  // Process value
}
```

### Functions

- Use arrow functions for callbacks:

```typescript
// Good
items.forEach((item) => {
  console.log(item.name);
});

// Avoid
items.forEach(function(item) {
  console.log(item.name);
});
```

- Use async/await instead of Promise chains for asynchronous code:

```typescript
// Good
async function fetchData(): Promise<Data> {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Avoid
function fetchData(): Promise<Data> {
  return fetch('/api/data')
    .then(response => response.json())
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}
```

### Error Handling

- Use try/catch blocks for error handling:

```typescript
// Good
async function processData(): Promise<void> {
  try {
    const data = await fetchData();
    analyzeData(data);
  } catch (error) {
    handleError(error);
  }
}

// Avoid
function processData(): void {
  fetchData()
    .then(data => analyzeData(data))
    .catch(error => handleError(error));
}
```

- Provide meaningful error messages
- Consider using custom error classes for specific error types

## CSS Guidelines

### BEM Naming Convention

Use BEM (Block, Element, Modifier) naming convention for CSS classes:

```css
/* Block */
.button {
  background-color: #007bff;
  color: white;
}

/* Element */
.button__icon {
  margin-right: 8px;
}

/* Modifier */
.button--large {
  padding: 12px 24px;
  font-size: 16px;
}
```

### Variables

- Use CSS variables for colors, spacing, and other repeated values:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --error-color: #dc3545;
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;
  --font-size-small: 12px;
  --font-size-medium: 14px;
  --font-size-large: 16px;
}

.button {
  background-color: var(--primary-color);
  padding: var(--spacing-small) var(--spacing-medium);
  font-size: var(--font-size-medium);
}
```

### Selectors

- Keep selectors as simple as possible
- Avoid deep nesting
- Avoid using `!important` unless absolutely necessary
- Use classes instead of IDs for styling

### Media Queries

- Use mobile-first approach for responsive design:

```css
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

@media (min-width: 992px) {
  .container {
    width: 970px;
  }
}
```

## HTML Guidelines

- Use semantic HTML elements (`<header>`, `<footer>`, `<article>`, etc.)
- Ensure accessibility compliance
  - Add `alt` attributes to images
  - Use appropriate ARIA attributes
  - Ensure proper heading hierarchy
- Keep markup clean and minimal
- Use attributes for JavaScript hooks (`data-*` attributes)

## JavaScript Best Practices

- Use `const` and `let` instead of `var`
- Use template literals for string concatenation:

```javascript
// Good
const greeting = `Hello, ${name}!`;

// Avoid
const greeting = 'Hello, ' + name + '!';
```

- Use destructuring assignment:

```javascript
// Good
const { name, age } = user;

// Avoid
const name = user.name;
const age = user.age;
```

- Use spread operator for array and object manipulation:

```javascript
// Good
const newArray = [...array1, ...array2];
const newObject = { ...object1, ...object2 };

// Avoid
const newArray = array1.concat(array2);
const newObject = Object.assign({}, object1, object2);
```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [CSS Guidelines](https://cssguidelin.es/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/) 