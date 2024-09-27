import { createConfig, paseoAssetHubChain, paseoChain } from '@polkadot-sufficient-assets/react';

export const libConfig = createConfig({
  chains: [paseoChain, paseoAssetHubChain],
  lightClients: true,
});
