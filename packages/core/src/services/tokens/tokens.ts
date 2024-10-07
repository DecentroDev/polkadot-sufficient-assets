import { createToken } from './create-token';

export const tokens = {
  WND: createToken({
    type: 'native',
    decimals: 12,
    symbol: 'WND',
    name: 'Westend',
    logo: './img/tokens/WND.svg',
    isSufficient: true,
  }),
  ROC: createToken({
    type: 'native',
    decimals: 12,
    symbol: 'ROC',
    name: 'Rococo',
    logo: './img/tokens/ROC.svg',
    isSufficient: true,
  }),
  KSM: createToken({
    type: 'native',
    decimals: 12,
    symbol: 'KSM',
    name: 'Kusama',
    logo: './img/tokens/KSM.svg',
    isSufficient: true,
  }),
  DOT: createToken({
    type: 'native',
    decimals: 10,
    symbol: 'DOT',
    name: 'Polkadot',
    logo: './img/tokens/DOT.svg',
    isSufficient: true,
  }),
  PAS: createToken({
    type: 'native',
    decimals: 10,
    symbol: 'PAS',
    name: 'Paseo',
    logo: './img/tokens/PAS.svg',
    isSufficient: true,
  }),
  USDC: createToken({
    type: 'asset',
    assetId: 1337,
    decimals: 6,
    symbol: 'USDC',
    name: 'USDC Coin',
    logo: './img/tokens/USDC.webp',
    isSufficient: true,
  }),
  USDT: createToken({
    type: 'asset',
    assetId: 1984,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
    logo: './img/tokens/USDT.webp',
    isSufficient: true,
  }),
};