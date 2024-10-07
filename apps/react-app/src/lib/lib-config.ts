import { chains, createConfig, tokens } from '@polkadot-sufficient-assets/react';

export const libConfig = createConfig({
  chains: [chains.paseoAssetHubChain],
  lightClients: false,
  tokens: {
    paseoah: {
      token: {
        assetId: 4,
        decimals: 10,
        symbol: 'VAR 2 USD',
        name: 'VAR 2',
        type: 'asset',
        isSufficient: false,
      },
      feeTokens: [tokens.PAS, tokens.USDC, tokens.USDT],
    },
  },
});
