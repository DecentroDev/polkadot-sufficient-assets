import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enables use of global variables like `describe` and `test`
    globals: true,
    // Set the test environment to Node.js
    environment: 'jsdom',
    // Specify the patterns for test files
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/*', 'src/index.ts', 'src/services/wallet/StorageAdapter.ts', 'src/__tests__'],
    },
  },
});
