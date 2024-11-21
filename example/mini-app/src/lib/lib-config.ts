import { chains, createConfig } from 'polkadot-sufficient-assets';

import { startFromWorker } from 'polkadot-sufficient-assets/smoldot/from-worker';
import SmWorker from 'polkadot-sufficient-assets/smoldot/worker?worker';

import { chainSpec as polkadotChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot';
import { chainSpec as polkadotAssetHubChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot_asset_hub';
import { DOT, USDT } from './assets';

const smoldot = startFromWorker(new SmWorker());

export const libConfig = createConfig({
  sourceChains: [chains.polkadotAssetHubChain],
  lightClients: {
    enable: true,
    smoldot,
    chainSpecs: {
      [chains.polkadotAssetHubChain.id]: polkadotAssetHubChainSpec,
      [chains.polkadotChain.id]: polkadotChainSpec,
    },
  },
  tokens: {
    pah: {
      token: USDT,
      feeTokens: [DOT, USDT],
    },
  },
  useXcmTransfer: true,
  destinationChains: [chains.hydration],
  destinationAddress: undefined,
});
