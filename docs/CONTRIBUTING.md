# Contributing to Steam Deck DUB Edition

Thank you for your interest in contributing to the Steam Deck DUB Edition project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork to your local machine
3. Set up the development environment as described in [Getting Started](./GETTING-STARTED.md)
4. Create a new branch for your changes

## Development Workflow

1. Make your changes in a feature branch with a descriptive name
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Follow the coding standards and guidelines
   - [Coding Standards](./guides/CODING-STANDARDS.md)
   - [Layout Guidelines](./guides/LAYOUT-GUIDELINES.md)
   - [Testing Guidelines](./guides/TESTING-GUIDELINES.md)

3. Commit your changes with clear, descriptive messages
   ```bash
   git commit -m "Add feature: clear description of changes"
   ```

4. Push your changes to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request to the main repository

## Pull Request Process

1. Update documentation to reflect your changes
2. Ensure all tests pass
3. Address any code review comments
4. Once approved, your changes will be merged

## Coding Standards

### General

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Keep functions small and focused
- Comment complex or non-obvious code
- Follow the principle of least surprise

### TypeScript

- Write all new code in TypeScript
- Use proper type annotations
- Avoid using `any` type
- Use interfaces for object shapes
- Follow functional programming principles where appropriate

### CSS

- Use BEM naming conventions
- Define variables for colors and other repeated values
- Keep selectors as simple as possible
- Avoid using `!important`
- Organize styles logically

### HTML

- Use semantic HTML elements
- Ensure accessibility compliance
- Keep markup clean and minimal

## Testing

- Write tests for all new features
- Ensure existing tests pass
- Follow the testing guidelines in [Testing Guidelines](./guides/TESTING-GUIDELINES.md)

## Documentation

- Update documentation to reflect your changes
- Use clear, concise language
- Include code examples where appropriate
- Keep documentation organized and easy to navigate

## Branching Strategy

- `main` - Stable production code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent production fixes

## Code Review Process

1. All code changes require at least one review
2. Reviewers will provide constructive feedback
3. Address all review comments before merge
4. Maintain a respectful discourse during reviews

## Issue Reporting

If you find a bug or have a feature request:

1. Check if an issue already exists
2. Create a new issue with a clear description
3. Include steps to reproduce for bugs
4. Label appropriately

## Recognition

Contributors will be acknowledged in:
- The README.md file
- Release notes
- Project documentation

Thank you for contributing to the Steam Deck DUB Edition project! 