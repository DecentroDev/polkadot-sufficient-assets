// jest.config.js
module.exports = {
  testEnvironment: 'jsdom', // Use jsdom for front-end tests
  collectCoverageFrom: ['packages/**/*.{ts,tsx}'], // Collect coverage from both ts and tsx files
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  modulePathIgnorePatterns: ['<rootDir>/examples', '<rootDir>/tooling/cra-template*', '<rootDir>/.*/dist'], // Use forward slashes for Windows compatibility
  testMatch: ['**/?(*.)+(test|spec).tsx'], // Only run tests with .tsx files
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testPathIgnorePatterns: ['<rootDir>/.*/dist/'], // Ignore dist folder with forward slashes
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', './scripts/setup-test.ts'], // Setup files for testing
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
