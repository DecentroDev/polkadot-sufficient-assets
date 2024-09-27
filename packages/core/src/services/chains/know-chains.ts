import { createChain } from './create-chain';

export const polkadotChain = createChain({
  id: 'polkadot',
  name: 'Polkadot',
  wsUrl: 'wss://polkadot-rpc.dwellir.com',
  relay: 'polkadot',
  paraId: null,
  logo: './tokens/dot.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://polkadot.subscan.io',
});

export const polkadotAssetHubChain = createChain({
  id: 'pah',
  name: 'Polkadot Asset Hub',
  wsUrl: 'wss://statemint-rpc.dwellir.com',
  relay: 'polkadot',
  paraId: 1000,
  logo: './chains/pah.svg',
  stableTokenId: 'asset::pah::1337',
  blockExplorerUrl: 'https://assethub-polkadot.subscan.io',
});

export const kusamaChain = createChain({
  id: 'kusama',
  name: 'Kusama',
  wsUrl: 'wss://kusama-rpc.polkadot.io',
  relay: 'kusama',
  paraId: null,
  logo: './tokens/ksm.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://kusama.subscan.io',
});

export const kusamaAssetHubChain = createChain({
  id: 'kah',
  name: 'Kusama Asset Hub',
  wsUrl: 'wss://kusama-asset-hub-rpc.polkadot.io',
  relay: 'kusama',
  paraId: 1000,
  logo: './chains/kah.svg',
  stableTokenId: 'native::kah',
  blockExplorerUrl: 'https://assethub-kusama.subscan.io',
});

export const rococoChain = createChain({
  id: 'rococo',
  name: 'Rococo',
  wsUrl: 'wss://rococo-rpc.polkadot.io',
  relay: 'rococo',
  paraId: null,
  logo: './tokens/roc.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://rococo.subscan.io',
});

export const rococoAssetHubChain = createChain({
  id: 'rah',
  name: 'Rococo Asset Hub',
  wsUrl: 'wss://rococo-asset-hub-rpc.polkadot.io',
  relay: 'rococo',
  paraId: 1000,
  logo: './chains/rah.svg',
  stableTokenId: 'native::rah',
  blockExplorerUrl: 'https://assethub-rococo.subscan.io',
});

export const westendChain = createChain({
  id: 'westend',
  name: 'Westend',
  wsUrl: 'wss://westend-rpc.polkadot.io',
  relay: 'westend',
  paraId: null,
  logo: './tokens/wnd.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://westend.subscan.io',
});

export const westendAssetHubChain = createChain({
  id: 'wah',
  name: 'Westend Asset Hub',
  wsUrl: 'wss://westend-asset-hub-rpc.polkadot.io',
  relay: 'westend',
  paraId: 1000,
  logo: './chains/wah.svg',
  stableTokenId: 'native::wah',
  blockExplorerUrl: 'https://assethub-westend.subscan.io',
});

export const paseoChain = createChain({
  id: 'paseo',
  name: 'Paseo',
  wsUrl: 'wss://paseo.dotters.network',
  relay: 'paseo',
  paraId: null,
  logo: './chains/paseoah.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://paseo.subscan.io',
});

export const paseoAssetHubChain = createChain({
  id: 'paseoah',
  name: 'Paseo Asset Hub',
  wsUrl: 'wss://asset-hub-paseo-rpc.dwellir.com',
  relay: 'paseo',
  paraId: 1000,
  logo: './chains/paseoah.svg',
  stableTokenId: 'native::pas',
  blockExplorerUrl: 'https://assethub-paseo.subscan.io',
});
