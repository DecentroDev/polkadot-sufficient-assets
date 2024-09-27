import type { libConfig } from './lib/lib-config';

declare module '@polkadot-sufficient-assets/react' {
  interface Register {
    config: typeof libConfig;
  }
}
