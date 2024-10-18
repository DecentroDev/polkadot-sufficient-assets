import { createChain } from './create-chain';

export const polkadotChain = createChain({
  id: 'polkadot',
  name: 'Polkadot',
  specName: 'polkadot',
  wsUrl: 'wss://polkadot-rpc.dwellir.com',
  relay: 'polkadot',
  paraId: null,
  chainId: '0',
  logo: './chains/dot.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://polkadot.subscan.io',
});

export const polkadotAssetHubChain = createChain({
  id: 'pah',
  name: 'Polkadot Asset Hub',
  specName: 'asset-hub-polkadot',
  wsUrl: 'wss://statemint-rpc.dwellir.com',
  relay: 'polkadot',
  paraId: 1000,
  chainId: '1000',
  logo: './chains/pah.svg',
  stableTokenId: 'asset::pah::1337',
  blockExplorerUrl: 'https://assethub-polkadot.subscan.io',
});

export const kusamaChain = createChain({
  id: 'kusama',
  name: 'Kusama',
  specName: 'kusama',
  wsUrl: 'wss://kusama-rpc.polkadot.io',
  relay: 'kusama',
  paraId: null,
  chainId: '0',
  logo: './chains/ksm.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://kusama.subscan.io',
});

export const kusamaAssetHubChain = createChain({
  id: 'kah',
  name: 'Kusama Asset Hub',
  specName: 'asset-hub-kusama',
  wsUrl: 'wss://kusama-asset-hub-rpc.polkadot.io',
  relay: 'kusama',
  paraId: 1000,
  chainId: '1000',
  logo: './chains/kah.svg',
  stableTokenId: 'native::kah',
  blockExplorerUrl: 'https://assethub-kusama.subscan.io',
});

export const rococoChain = createChain({
  id: 'rococo',
  name: 'Rococo',
  specName: 'rococo',
  wsUrl: 'wss://rococo-rpc.polkadot.io',
  relay: 'rococo',
  paraId: null,
  chainId: '0',
  logo: './chains/roc.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://rococo.subscan.io',
});

export const rococoAssetHubChain = createChain({
  id: 'rah',
  name: 'Rococo Asset Hub',
  specName: 'asset-hub-rococo',
  wsUrl: 'wss://rococo-asset-hub-rpc.polkadot.io',
  relay: 'rococo',
  paraId: 1000,
  chainId: '1000',
  logo: './chains/rah.svg',
  stableTokenId: 'native::rah',
  blockExplorerUrl: 'https://assethub-rococo.subscan.io',
});

export const westendChain = createChain({
  id: 'westend',
  name: 'Westend',
  specName: 'westend',
  wsUrl: 'wss://westend-rpc.polkadot.io',
  relay: 'westend',
  paraId: null,
  chainId: '0',
  logo: './tokens/wnd.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://westend.subscan.io',
});

export const westendAssetHubChain = createChain({
  id: 'wah',
  name: 'Westend Asset Hub',
  specName: 'asset-hub-westend',
  wsUrl: 'wss://westend-asset-hub-rpc.polkadot.io',
  relay: 'westend',
  paraId: 1000,
  chainId: '1000',
  logo: './chains/wah.svg',
  stableTokenId: 'native::wah',
  blockExplorerUrl: 'https://assethub-westend.subscan.io',
});

export const paseoChain = createChain({
  id: 'paseo',
  name: 'Paseo',
  specName: 'paseo-testnet',
  wsUrl: 'wss://paseo.dotters.network',
  relay: 'paseo',
  paraId: null,
  chainId: '0',
  logo: './chains/pas.svg',
  stableTokenId: null,
  blockExplorerUrl: 'https://paseo.subscan.io',
});

export const paseoAssetHubChain = createChain({
  id: 'paseoah',
  name: 'Paseo Asset Hub',
  specName: 'asset-hub-paseo',
  wsUrl: 'wss://asset-hub-paseo-rpc.dwellir.com',
  relay: 'paseo',
  paraId: 1000,
  chainId: '1000',
  logo: './chains/pah.svg',
  stableTokenId: 'native::pas',
  blockExplorerUrl: 'https://assethub-paseo.subscan.io',
});
