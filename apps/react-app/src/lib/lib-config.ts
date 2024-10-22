import { chains, createConfig, tokens } from '@polkadot-sufficient-assets/react';
import { USDT } from './assets';

export const libConfig = createConfig({
  chains: [chains.polkadotAssetHubChain],
  lightClients: false,
  tokens: {
    pah: {
      token: USDT,
      feeTokens: [tokens.DOT, tokens.USDT],
    },
  },
});
