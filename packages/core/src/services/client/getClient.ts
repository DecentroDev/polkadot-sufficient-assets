import { type PolkadotClient, createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import type { SmoldotClient } from '../../types';
import { type Chain, type ChainId, type ChainRelay, getChainById, isRelay } from '../chains';
import { getChainSpec, hasChainSpec } from './getChainSpec';
import { getSmChainProvider } from './getSmChainProvider';

export type ClientOptions = {
  lightClients?: {
    enable: boolean;
    smoldot: SmoldotClient;
    chainSpecs: Partial<Record<ChainId, string>>;
  };
};

const getClientCacheId = (chainId: ChainId, { lightClients }: ClientOptions) =>
  `${chainId}-${lightClients?.enable ?? 'false'}`;

const CLIENTS_CACHE = new Map<string, Promise<PolkadotClient>>();

export const getClient = (chainId: ChainId, chains: Chain[], options: ClientOptions): Promise<PolkadotClient> => {
  const cacheKey = getClientCacheId(chainId, options);

  if (!CLIENTS_CACHE.has(cacheKey)) {
    const chain = getChainById(chainId, chains);
    CLIENTS_CACHE.set(
      cacheKey,
      isRelay(chain) ? getRelayChainClient(chain, options) : getParaChainClient(chain, options)
    );
  }

  return CLIENTS_CACHE.get(cacheKey) as Promise<PolkadotClient>;
};

export const getRelayChainClient = async (chain: ChainRelay, options: ClientOptions) => {
  // force ws provider if light clients are disabled or chainSpec is not available
  if (!options.lightClients || !options.lightClients.enable || !hasChainSpec(chain.id)) {
    return createClient(getWsProvider(chain.wsUrls));
  }

  const { smoldot, chainSpecs } = options.lightClients;

  const chainSpec = getChainSpec(chain.id, chainSpecs);

  // fallback to smoldot
  return createClient(await getSmChainProvider(smoldot, { chainId: chain.id, chainSpec }));
};

export const getParaChainClient = async (chain: Chain, options: ClientOptions) => {
  if (!chain.relay) throw new Error(`Chain ${chain.id} does not have a relay chain`);
  const { id: paraChainId, relay: relayChainId } = chain;

  const chainSpecList = options?.lightClients?.chainSpecs;

  if (
    !options.lightClients ||
    !options.lightClients.enable ||
    !hasChainSpec(paraChainId, chainSpecList) ||
    !hasChainSpec(relayChainId, chainSpecList)
  ) {
    return createClient(getWsProvider(chain.wsUrls));
  }

  const { chainSpecs, smoldot } = options.lightClients;

  const [relayChainSpec, paraChainSpec] = [
    getChainSpec(relayChainId, chainSpecs),
    getChainSpec(paraChainId, chainSpecs),
  ];

  return createClient(
    await getSmChainProvider(
      smoldot,
      { chainId: chain.id, chainSpec: paraChainSpec },
      { chainId: relayChainId, chainSpec: relayChainSpec }
    )
  );
};
