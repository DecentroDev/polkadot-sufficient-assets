import type { ChainId, Token } from '../services';

export const getAssetIdByChain = (token: Token, chainId: ChainId) => {
  return (token.assetIds?.[chainId] ?? token.assetId)?.toString();
};

export const getAssetPalletByChain = (token: Token, chainId: ChainId) => {
  return token.assetPallet?.[chainId];
};
