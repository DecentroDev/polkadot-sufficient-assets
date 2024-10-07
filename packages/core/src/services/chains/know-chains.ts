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
  logo: 'data:image/png;base64,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',
  stableTokenId: null,
  blockExplorerUrl: 'https://paseo.subscan.io',
});

export const paseoAssetHubChain = createChain({
  id: 'paseoah',
  name: 'Paseo Asset Hub',
  wsUrl: 'wss://asset-hub-paseo-rpc.dwellir.com',
  relay: 'paseo',
  paraId: 1000,
  logo: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA2NDAgNjQwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2NDAgNjQwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzMyMUQ0Nzt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cgkuc3Qye2ZpbGw6I0U2MDA3QTt9Cjwvc3R5bGU+CjxnPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTYzNy4zLDMxOS4zYzAsMTc1LjItMTQyLDMxNy4zLTMxNy4zLDMxNy4zUzIuNyw0OTQuNiwyLjcsMzE5LjNTMTQ0LjgsMi4xLDMyMCwyLjFTNjM3LjMsMTQ0LjEsNjM3LjMsMzE5LjN6IgoJCS8+Cgk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNDQ0LjIsMzkyLjRoLTY3LjZsLTEyLjctMzFoLTg1LjhsLTEyLjcsMzFoLTY3LjZsODAuOS0xODQuM2g4NC41TDQ0NC4yLDM5Mi40eiBNMzIxLjEsMjU2bC0yMi40LDU1aDQ0LjcKCQlMMzIxLjEsMjU2eiIvPgoJPGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzIxIiBjeT0iMTIyLjEiIHI9IjQ2LjkiLz4KCTxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjMyMSIgY3k9IjUxNy4xIiByPSI0Ni45Ii8+Cgk8Y2lyY2xlIGNsYXNzPSJzdDIiIGN4PSIxNDcuOCIgY3k9IjIxNiIgcj0iNDYuOSIvPgoJPGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iNDk0LjMiIGN5PSIyMTYiIHI9IjQ2LjkiLz4KCTxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjE0Ny44IiBjeT0iNDI0LjgiIHI9IjQ2LjkiLz4KCTxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjQ5NC4zIiBjeT0iNDI0LjgiIHI9IjQ2LjkiLz4KPC9nPgo8L3N2Zz4K',
  stableTokenId: 'native::pas',
  blockExplorerUrl: 'https://assethub-paseo.subscan.io',
});
