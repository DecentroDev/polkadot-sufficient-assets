import { chains, createConfig, createToken, tokens } from '@polkadot-sufficient-assets/react';

const USDC = createToken({
  type: 'asset',
  assetId: 31337,
  decimals: 6,
  symbol: 'USDC',
  name: 'USDC Coin',
  logo: './img/tokens/USDC.webp',
  isSufficient: true,
});

export const libConfig = createConfig({
  chains: [chains.westendAssetHubChain],
  lightClients: false,
  tokens: {
    wah: {
      token: USDC,
      feeTokens: [tokens.WND, tokens.USDT, USDC],
    },
  },
});
