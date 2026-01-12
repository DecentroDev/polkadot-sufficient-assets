import * as fs from 'fs/promises';
import * as path from 'path';
import { defineConfig, type Options } from 'tsup';

const DIST_PATH = './dist';

async function cleanFile(dir = DIST_PATH): Promise<void> {
  try {
    // Read all files in the directory
    const files = await fs.readdir(dir, { withFileTypes: true });

    // Iterate over each file/directory
    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      // If it's a directory, recurse or delete if it's a __tests__ directory
      if (file.isDirectory()) {
        if (file.name === '__tests__') {
          await fs.rm(fullPath, { recursive: true, force: true });
          console.log(`Deleted: ${fullPath}`);
        } else {
          // Recurse into subdirectories that are not __tests__
          await cleanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error while trying to delete __tests__ directories: ${error}`);
  }
}

export default defineConfig((options: Options) => ({
  treeshake: false,
  splitting: false,
  entry: ['src/index.ts', 'src/smoldot', 'src/chain-specs'],
  format: ['esm', 'cjs'],
  target: 'esnext',
  platform: 'browser',
  outDir: DIST_PATH,
  dts: true,
  minify: true,
  clean: !options.watch,
  // Externalize ONLY React and Polkadot API packages
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    /^@polkadot\/api.*/,
    /^@polkadot\/extension-.*/,
    /^polkadot-api.*/,
  ],
  // Explicitly bundle everything else (MUI, workspace packages, etc)
  noExternal: [
    /^@mui\/.*/,
    /^@emotion\/.*/,
    '@polkadot-sufficient-assets/core',
    '@polkadot-ui/assets',
    '@r2wc/react-to-web-component',
  ],
  sourcemap: false,
  async onSuccess() {
    await cleanFile();
  },
  banner: {
    js: "'use client';",
  },
  ...options,
}));
