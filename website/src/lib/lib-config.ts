import { chains, createConfig } from 'polkadot-sufficient-assets';
import { chainSpec as polkadotChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot';
import { chainSpec as polkadotAssetHubChainSpec } from 'polkadot-sufficient-assets/chain-specs/polkadot_asset_hub';
import { startFromWorker } from 'polkadot-sufficient-assets/smoldot/from-worker';
import { DOT, USDC, USDT } from './assets';

const smWorker = new Worker(new URL('polkadot-sufficient-assets/smoldot/worker', import.meta.url));
const smoldot = startFromWorker(smWorker);

export const pahUSDTConfig = createConfig({
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

export const pahUSDCConfig = createConfig({
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
      token: USDC,
      feeTokens: [DOT, USDT],
    },
  },
  useXcmTransfer: true,
  destinationChains: [chains.hydration],
  destinationAddress: undefined,
});

export const dotUSDTConfig = createConfig({
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
      token: DOT,
      feeTokens: [DOT, USDT],
    },
  },
  useXcmTransfer: true,
  destinationChains: [chains.polkadotChain],
  destinationAddress: undefined,
});
