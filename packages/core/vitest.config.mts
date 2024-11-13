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
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/chain-specs/*',
        'src/smoldot/*',
        'src/types/*',
        'src/index.ts',
        'src/services/wallet/StorageAdapter.ts',
      ],
    },
  },
});
