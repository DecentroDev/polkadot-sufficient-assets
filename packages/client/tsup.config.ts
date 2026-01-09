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
  outDir: DIST_PATH,
  dts: true,
  minify: true,
  clean: !options.watch,
  external: [
    // React - must be provided by consumer
    'react',
    'react-dom',
    // MUI - must be provided by consumer (peerDependency)
    /^@mui\/.*/,
    /^@emotion\/.*/,
    // Polkadot packages - optional peerDependencies
    /^@polkadot\/api.*/,
    /^@polkadot\/extension-.*/,
    /^polkadot-api.*/,
  ],
  // Bundle these packages into the output
  noExternal: [
    // Workspace packages must be bundled
    '@polkadot-sufficient-assets/core',
    // These small packages should be bundled for easier consumption
    '@r2wc/react-to-web-component',
    '@polkadot-ui/assets',
    /^@polkadot-ui\/assets.*/,
    '@polkadot-api/known-chains',
    '@polkadot-api/smoldot',
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
