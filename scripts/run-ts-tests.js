#!/usr/bin/env node

/**
 * Run TypeScript Tests
 * Executes Jest tests on TypeScript test files
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurations
const CONFIG = {
  // Component tests
  componentTests: 'src/test/components/*.test.ts',
  // Utility tests
  utilsTests: 'src/test/utils.test.ts',
  // Specific test (if provided as argument)
  specificTest: process.argv[2],
  // Watch mode flag
  watch: process.argv.includes('--watch'),
  // Coverage flag
  coverage: process.argv.includes('--coverage'),
};

/**
 * Run Jest with the specified options
 * @param {string} testPattern - Test pattern to match
 * @param {boolean} watch - Whether to run in watch mode
 * @param {boolean} coverage - Whether to collect coverage
 */
function runJest(testPattern, watch = false, coverage = false) {
  try {
    const cmd = [
      'npx jest',
      testPattern,
      watch ? '--watch' : '',
      coverage ? '--coverage' : '',
      '--colors',
    ].filter(Boolean).join(' ');

    console.log(`\n🧪 Running tests: ${cmd}\n`);
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Tests failed!');
    process.exit(1);
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
🧪 TypeScript Test Runner

Usage:
  ./scripts/run-ts-tests.js [options] [testPattern]

Options:
  --watch      Run tests in watch mode
  --coverage   Collect test coverage

Examples:
  ./scripts/run-ts-tests.js                           # Run all TypeScript tests
  ./scripts/run-ts-tests.js --watch                   # Run all tests in watch mode
  ./scripts/run-ts-tests.js Button                    # Run tests matching "Button"
  ./scripts/run-ts-tests.js Button.test.ts --coverage # Run Button tests with coverage
  ./scripts/run-ts-tests.js components                # Run all component tests
  ./scripts/run-ts-tests.js utils                     # Run utility tests
`);
}

/**
 * Main function
 */
function main() {
  if (process.argv.includes('--help')) {
    printUsage();
    return;
  }

  // Check if TypeScript is installed
  try {
    execSync('npx tsc --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ TypeScript is not installed. Please run: npm install typescript');
    process.exit(1);
  }

  // Check if Jest is installed
  try {
    execSync('npx jest --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Jest is not installed. Please run: npm install jest @types/jest ts-jest');
    process.exit(1);
  }

  console.log('🧪 Running TypeScript tests...');

  // Run specific test if provided
  if (CONFIG.specificTest) {
    if (CONFIG.specificTest === 'components') {
      runJest(CONFIG.componentTests, CONFIG.watch, CONFIG.coverage);
    } else if (CONFIG.specificTest === 'utils') {
      runJest(CONFIG.utilsTests, CONFIG.watch, CONFIG.coverage);
    } else {
      // Run a specific test or pattern
      runJest(CONFIG.specificTest, CONFIG.watch, CONFIG.coverage);
    }
  } else {
    // Run all TypeScript tests
    runJest('src/**/*.test.ts', CONFIG.watch, CONFIG.coverage);
  }

  console.log('\n✅ All tests completed successfully!');
}

// Execute the script
main(); 