import { getSmProvider } from 'polkadot-api/sm-provider';
import type { ChainId } from '../chains';

type Chain = Awaited<Parameters<typeof getSmProvider>[0]>;

type ChainDef = {
  chainId: ChainId;
  chainSpec: string;
};

const SMOLDOT_CHAINS_CACHE = new Map<string, Promise<Chain>>();

const loadChain = async ({ chainId, chainSpec }: ChainDef, relay?: Chain) => {
  const { smoldot } = await import('./smoldot');

  const chainPromise = smoldot.addChain({
    chainSpec,
    potentialRelayChains: relay ? [relay] : undefined,
  });

  if (!SMOLDOT_CHAINS_CACHE.has(chainId)) SMOLDOT_CHAINS_CACHE.set(chainId, chainPromise);

  return SMOLDOT_CHAINS_CACHE.get(chainId)!;
};

export const getSmChainProvider = async (
  chainDef: ChainDef,
  relayDef?: ChainDef
): Promise<ReturnType<typeof getSmProvider>> => {
  const relay = relayDef ? await loadChain(relayDef) : undefined;
  const chain = await loadChain(chainDef, relay);

  return getSmProvider(chain);
};
