#!/bin/bash

# Make scripts executable
chmod +x fix-dependencies.sh

# Install dependencies
./fix-dependencies.sh

# First run the specialized fix for pseudo-elements
echo "Fixing pseudo-element issues..."
node fix-pseudo-elements.js

# Phase 1: CSS Improvements
echo "Running comprehensive CSS fixes..."
node comprehensive-css-fix.js

# Fix missing CSS units
echo "Fixing CSS units issues..."
node fix-css-units.js

# Fix indentation issues
echo "Fixing CSS indentation issues..."
node fix-indentation.js

# Phase 1: JavaScript Improvements
echo "Analyzing JavaScript error handling..."
node enhance-error-handling.js

# Phase 1: Accessibility Improvements
echo "Running accessibility analysis..."
echo "Note: This requires jsdom to be installed (npm install jsdom)"
node improve-accessibility.js

# Fix HTML issues
echo "Fixing HTML issues..."
npx html-validate --fix index.html offline.html src/**/*.html

# Fix CSS issues
echo "Fixing CSS issues..."
npx stylelint "**/*.css" --fix

# Fix JS issues
echo "Fixing JavaScript issues..."
npx eslint --fix "src/**/*.js" main.js preload.js service-worker.js

# Run our custom CSS fix script
echo "Running custom CSS fixes..."
node css-fix-script.js

# Run final cleanup for any remaining issues
echo "Running final cleanup..."
node final-cleanup.js

echo "Running CSS syntax fixes..."
node fix-css-syntax.js

echo "Running remaining CSS fixes..."
node fix-remaining-css.js

echo "All fixes complete!"
echo "Next steps:"
echo "1. Review error-handling-report.md for JavaScript improvement recommendations"
echo "2. Review accessibility-report.md for accessibility enhancement recommendations"
echo "3. Run 'npx stylelint \"src/styles/**/*.css\"' and 'npx eslint --quiet \"src/scripts/**/*.js\"' to verify remaining issues" 