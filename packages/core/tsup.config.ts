import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entryPoints: ['src/index.ts', 'src/chain-specs', 'src/smoldot'],
  tsconfig: 'tsconfig.json',
  dts: false, // Disabled temporarily - descriptor type conflicts with PRMX
  minify: true,
  target: 'esnext',
  format: ['cjs', 'esm'],
  ...options,
}));
