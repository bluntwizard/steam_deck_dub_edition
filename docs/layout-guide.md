# Grimoire Layout System Guide

This document explains how to use the unified layout system in the Grimoire guide.

## Core Concepts

Our layout system combines the best of Flexbox and CSS Grid:

- **Flexbox**: Used for one-dimensional layouts (rows OR columns)
- **CSS Grid**: Used for two-dimensional layouts (rows AND columns)

## When to Use Each Layout Type

### Use Flexbox (`flex-*` classes) when:

- Arranging items in a single row or column
- Creating navigation menus
- Centering content horizontally and vertically
- Building simple layouts that need to be flexible with content size

```html
<!-- Example: Simple centered content -->
<div class="flex-center">
  <div>I am centered!</div>
</div>

<!-- Example: Justified content with space between -->
<div class="flex flex-row justify-between items-center">
  <div>Left aligned</div>
  <div>Right aligned</div>
</div>
```

### Use Grid (`grid-*` classes) when:

- Creating multi-column/row layouts
- Building complex grid systems
- Creating responsive layouts that maintain structure
- Needing precise control over placement of elements

```html
<!-- Example: Simple 3-column grid -->
<div class="grid-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Example: Asymmetric layout with sidebar -->
<div class="grid-sidebar">
  <main>Main content area</main>
  <aside class="sidebar-area">Sidebar content</aside>
</div>
```

### Specialty Layouts:

- **Content Layout**: For article-style content with a maximum width
- **Cards Layout**: For grids of cards with equal heights
- **Masonry Layout**: For pinterest-style galleries
- **Holy Grail**: For classic header-footer-sidebar layouts

```html
<!-- Example: Content layout -->
<div class="content-layout">
  <h1>My Article</h1>
  <p>This content is centered with a max width</p>
  <img class="full-width" src="banner.jpg" alt="Banner">
</div>
```

## Common Layout Patterns

### Centering Content

```html
<div class="flex-center">Centered content</div>
```

### Sidebar with Main Content

```html
<div class="grid-sidebar">
  <main>Main content here</main>
  <aside class="sidebar-area">Sidebar content here</aside>
</div>
```

### Card Grid

```html
<div class="cards-layout">
  <div class="card">
    <div class="card-header">Card 1</div>
    <div class="card-body">Content here</div>
  </div>
  <!-- More cards... -->
</div>
```

### Responsive Columns

```html
<div class="grid-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
  <!-- Will automatically wrap to new rows on smaller screens -->
</div>
```

## Best Practices

1. **Start Simple**: Begin with container and basic layout, then add complexity
2. **Mobile First**: Design for mobile screens first, then enhance for larger screens
3. **Use Semantic HTML**: Choose appropriate HTML elements before applying layout classes
4. **Avoid Nesting**: Keep layout nesting to a minimum for better performance
5. **Be Consistent**: Use the same layout patterns throughout the guide

## Responsive Considerations

Our layout system automatically handles most responsive behavior, but you can use these utilities for fine control:

- `hide-xs`, `hide-sm`, `hide-md`, `hide-lg`: Hide elements at specific breakpoints
- `order-first-mobile`, `order-last-mobile`: Change element order on mobile screens

## Utility Classes

- `container`: Centers content with a max width
- `full-width`: Makes an element span the full width
- `gap-small`, `gap-medium`, `gap-large`: Controls spacing between grid/flex items
- `p-responsive`: Adds responsive padding that adjusts to screen size
