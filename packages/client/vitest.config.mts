import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setupTests.tsx'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/*', 'src/index.ts', 'src/smoldot/**', 'src/chain-specs/**', 'src/__tests__'],
    },
    exclude: ['node_modules/**'],
  },
});
