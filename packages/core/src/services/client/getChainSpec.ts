import type { ChainId } from '../chains';

export const hasChainSpec = (chainId: ChainId, chainSpecList?: Partial<Record<ChainId, string>>) => {
  if (chainSpecList) {
    return chainSpecList[chainId] !== undefined;
  }
  return false;
};

export const CHAIN_SPECS_CACHE = new Map<ChainId, string>();

export const getChainSpec = (chainId: ChainId, chainSpecList?: Partial<Record<ChainId, string>>) => {
  if (!chainSpecList) {
    throw new Error(`chainSpecs is not provided in lightClients config`);
  }
  if (!hasChainSpec(chainId, chainSpecList)) {
    throw new Error(`Unknown chain: ${chainId}`);
  }

  if (!CHAIN_SPECS_CACHE.has(chainId) && chainSpecList?.[chainId]) {
    CHAIN_SPECS_CACHE.set(chainId, chainSpecList?.[chainId]);
  }

  return CHAIN_SPECS_CACHE.get(chainId) as string;
};
