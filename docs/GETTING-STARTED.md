# Getting Started with Grimoire

This guide will help you set up your development environment and get started with the Grimoire project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v7 or later)
- [Git](https://git-scm.com/)
- A modern web browser (Chrome, Firefox, or Edge)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended) or your preferred editor

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bluntwizard/steam_deck_dub_edition.git
   cd steam_deck_dub_edition
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Starting the Development Server

Run the development server:

```bash
npm run dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run fix:css` - Fix CSS issues
- `npm run fix:js` - Fix JavaScript issues
- `npm run fix:all` - Fix all issues

### Code Structure

The project is structured as follows:

```
steam_deck_dub_edition/
├── src/                  # Source code
│   ├── scripts/          # JavaScript/TypeScript files
│   │   ├── api/          # API client and related code
│   │   ├── components/   # UI components
│   │   ├── services/     # Service layer
│   │   └── utils/        # Utility functions
│   ├── styles/           # CSS styles
│   └── content/          # Content files
├── public/               # Static assets
├── docs/                 # Documentation
└── tests/                # Test files
```

## TypeScript Development

The project uses TypeScript for type safety. All new files should be created with `.ts` extensions.

### Type Definitions

Type definitions can be found in:
- `src/scripts/types/` - Shared type definitions
- Component-specific types are typically defined in the component files

### TypeScript Configuration

The TypeScript configuration is in `tsconfig.json`. The project uses strict type checking.

## Testing

The project uses Jest for testing. To run tests:

```bash
npm run test
```

For more details on testing, see the [Testing Guidelines](./guides/TESTING-GUIDELINES.md).

## Deployment

The project is configured for Continuous Integration and Deployment (CI/CD):

1. Push changes to the main branch
2. The CI pipeline will automatically run tests
3. If tests pass, the changes will be deployed to the staging environment
4. After approval, the changes can be deployed to production

For more details on deployment, see the [CI/CD Setup](./ci-cd-setup.md).

## Troubleshooting

### Common Issues

#### Module not found errors
- Make sure all dependencies are installed with `npm install`
- Check import paths for typos

#### TypeScript errors
- Run `npm run lint` to identify issues
- Check for missing type definitions

#### CSS issues
- Run `npm run fix:css` to automatically fix common CSS issues

### Getting Help

If you need further assistance:
- Check existing [documentation](./README.md)
- Review the [issues](https://github.com/bluntwizard/steam_deck_dub_edition/issues) on GitHub
- Reach out to the team on the project's communication channels

## Next Steps

- Review the [Architecture Documentation](./ARCHITECTURE.md)
- Explore the [Component Catalog](./components/COMPONENT-CATALOG.md)
- Read the [Contributing Guidelines](./CONTRIBUTING.md) 