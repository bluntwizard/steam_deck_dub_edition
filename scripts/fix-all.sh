#!/bin/bash

# Steam Deck DUB Edition - Unified Fix Script
# This script runs all necessary fixes and linting for the project

echo "╔════════════════════════════════════════════════════╗"
echo "║       Steam Deck DUB Edition Fixer                  ║"
echo "║       ------------------------------                 ║"
echo "║ This tool runs all linting and fixing in one step.  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Make sure all scripts are executable
chmod +x scripts/fix-css-all.sh
chmod +x scripts/fix-dependencies.sh
chmod +x scripts/deploy.sh

# Run CSS fixes
echo "Running CSS fixes..."
npm run fix:css

# Run JS error handling enhancements
echo "Enhancing JavaScript error handling..."
npm run fix:js

# Run accessibility improvements
echo "Improving accessibility..."
npm run fix:a11y

# Run ESLint
echo "Running ESLint..."
npm run lint:fix

# Format code with Prettier
echo "Formatting code with Prettier..."
npm run format

# Run final cleanup
echo "Running final cleanup..."
node scripts/final-cleanup.js

echo ""
echo "✅ All fixes complete!"
echo ""
echo "Next steps:"
echo "1. Review any remaining lint issues with: npm run lint"
echo "2. Review any CSS issues with: npm run lint:css"
echo "3. Run tests with: npm run test"
echo "" 