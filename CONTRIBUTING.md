# Contributing to Steam Deck DUB Edition

Thank you for your interest in contributing to the Steam Deck DUB Edition project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions related to this project. Help us maintain a positive and inclusive community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment details (OS, browser, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

1. A clear, descriptive title
2. Detailed description of the proposed feature
3. Any relevant mockups or examples
4. Explain why this feature would be useful to most users

### Pull Requests

We actively welcome pull requests:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Pull Request Guidelines

- Follow the coding style and conventions used in the project
- Update documentation for any new features or changes
- Add tests for new features or bug fixes
- Make sure all tests pass before submitting
- Keep pull requests focused on a single issue or feature

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/steam-deck-dub-edition.git
   cd steam-deck-dub-edition
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Run tests
   ```bash
   npm test
   ```

## Project Structure

```
steam-deck-dub-edition/
├── docs/                 # Documentation
├── packages/
│   └── sdde-components/  # Component library
├── tests/
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
├── examples/             # Example usage
└── scripts/              # Build and utility scripts
```

## Component Development

When developing new components or enhancing existing ones:

1. Follow the existing component architecture
2. Make sure your component is:
   - Accessible (keyboard navigation, ARIA attributes, etc.)
   - Responsive
   - Well-documented
   - Thoroughly tested
3. Update the component showcase with examples
4. Add visual examples to the documentation

## Documentation

Please update documentation for any changes:

- Component API documentation
- Visual examples
- Usage examples
- README updates if needed

## Testing

All new features or bug fixes should include appropriate tests:

- Unit tests for individual components and functions
- End-to-end tests for component interactions
- Accessibility tests

## License

By contributing to the Steam Deck DUB Edition, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 