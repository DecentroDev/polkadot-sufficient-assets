import { chains, createConfig, createTheme, tokens } from 'polkadot-sufficient-assets';
import { USDT } from './assets';

export const libConfig = createConfig({
  sourceChains: [chains.hydration],
  tokens: {
    hdx: {
      token: USDT,
      feeTokens: [tokens.HDX],
    },
  },
  useXcmTransfer: true,
  destinationChains: [chains.hydration],
});

export const libTheme = createTheme({
  palette: {
    mode: 'light',
  },
}) as unknown;
