#!/bin/bash

# Format all JavaScript files
echo "Formatting JavaScript files..."
npx prettier --write "**/*.js" --ignore-path .gitignore

# Format all CSS files
echo "Formatting CSS files..."
npx prettier --write "**/*.css" --ignore-path .gitignore

# Format all HTML files
echo "Formatting HTML files..."
npx prettier --write "**/*.html" --ignore-path .gitignore

echo "All code formatted successfully!" 