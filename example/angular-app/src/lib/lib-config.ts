import { chains, createConfig, createTheme } from 'polkadot-sufficient-assets';
import { HDX, USDT } from './assets';

export const libConfig = createConfig({
  sourceChains: [chains.hydration],
  tokens: {
    hdx: {
      token: USDT,
      feeTokens: [HDX],
    },
  },
  useXcmTransfer: true,
  destinationChains: [chains.polkadotAssetHubChain],
});

export const libTheme = createTheme({
  palette: {
    mode: 'light',
  },
});
