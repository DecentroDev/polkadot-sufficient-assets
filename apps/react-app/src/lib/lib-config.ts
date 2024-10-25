import { chains, createConfig } from '@polkadot-sufficient-assets/react';
import { HDX } from './assets';

export const libConfig = createConfig({
  chains: [chains.hydration],
  lightClients: false,
  tokens: {
    hdx: {
      token: HDX,
      feeTokens: [HDX],
    },
  },
  useXcmTransfer: true,
  xcmChains: [chains.polkadotAssetHubChain],
});
