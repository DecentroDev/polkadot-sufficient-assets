import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entryPoints: ['src/index.ts'],
  tsconfig: 'tsconfig.json',
  dts: true,
  minify: true,
  target: 'esnext',
  format: ['cjs', 'esm'],
  ...options,
}));
