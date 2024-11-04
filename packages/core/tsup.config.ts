import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entryPoints: ['src/index.ts', 'src/chain-specs', 'src/smoldot'],
  tsconfig: 'tsconfig.json',
  dts: true,
  minify: true,
  target: 'esnext',
  format: ['cjs', 'esm'],
  ...options,
}));
