import { chains, createConfig, tokens } from 'polkadot-sufficient-assets';

import { startFromWorker } from 'polkadot-sufficient-assets/smoldot/from-worker';
import SmWorker from 'polkadot-sufficient-assets/smoldot/worker?worker';

import { chainSpec as polkadotChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot';
import { chainSpec as polkadotAssetHubChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot_asset_hub';

const smoldot = startFromWorker(new SmWorker());

export const libConfig = createConfig({
  chains: [chains.polkadotAssetHubChain],
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
      token: tokens.DOT,
      feeTokens: [tokens.DOT],
    },
  },
});
