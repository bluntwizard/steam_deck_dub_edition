/**
 * Jest Configuration for Grimoire
 * Configured to support TypeScript tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform files with TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Patterns to ignore
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/index.{js,ts}',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Module name mapper for CSS and asset imports
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/src/test/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  
  // Verbose output
  verbose: true
};
