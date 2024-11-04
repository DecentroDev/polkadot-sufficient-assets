import type { libConfig } from './lib/lib-config';

declare module 'polkadot-sufficient-assets' {
  interface Register {
    config: typeof libConfig;
  }
}
