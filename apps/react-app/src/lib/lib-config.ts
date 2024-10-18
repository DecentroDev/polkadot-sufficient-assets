import { chains, createConfig, tokens } from '@polkadot-sufficient-assets/react';

export const libConfig = createConfig({
  chains: [chains.westendAssetHubChain],
  lightClients: false,
  tokens: {
    wah: {
      token: tokens.WND,
      feeTokens: [tokens.WND],
    },
  },
  useXcmTransfer: true,
  xcmChains: [chains.westendChain, chains.rococoAssetHubChain],
});
