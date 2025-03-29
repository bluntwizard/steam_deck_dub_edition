#!/bin/bash

# Script to install Playwright browsers for cross-browser testing

echo "Installing Playwright browsers for cross-browser testing..."

# Install npm packages if not already installed
npm install

# Install Playwright browsers
npx playwright install

# Create test results directory if it doesn't exist
mkdir -p test-results/html-report

echo "Playwright browsers installed successfully!"
echo "Run tests with: npm run test:browser"
echo "View HTML report with: npm run test:browser:report" 