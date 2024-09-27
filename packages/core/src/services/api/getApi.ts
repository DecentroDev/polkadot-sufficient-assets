import { polkadot } from '@polkadot-api/descriptors';
import type { ChainDefinition, TypedApi } from 'polkadot-api';
import { firstValueFrom } from 'rxjs';
import { getChainById, getDescriptors, type Chain, type ChainId, type Descriptors, type KnowChainId } from '../chains';
import { getClient } from '../client/getClient';

type ApiBase<Id extends ChainId> = Id extends KnowChainId ? TypedApi<Descriptors<Id>> : TypedApi<ChainDefinition>;
export type Api<Id extends ChainId> = ApiBase<Id> & {
  chainId: Id;
  waitReady: Promise<void>;
};

const getApiInner = async <Id extends ChainId>(
  chainId: ChainId,
  lightClients: boolean,
  chains: Chain[]
): Promise<Api<Id>> => {
  const chain = getChainById(chainId, chains);

  const descriptors = getDescriptors(chain.id);

  const client = await getClient(chainId, chains, { lightClients });
  if (!client) throw new Error(`Could not create client for chain ${chainId}/${lightClients}`);

  const api = client.getTypedApi(descriptors ?? polkadot) as Api<Id>;
  api.chainId = chainId as Id;
  api.waitReady = new Promise<void>((resolve, reject) => {
    client.bestBlocks$;

    firstValueFrom(client.bestBlocks$)
      .then(() => resolve())
      .catch(reject);
  });

  return api;
};

const getApiCacheId = (chainId: ChainId, lightClient: boolean): string => `${chainId}-${lightClient}`;

const API_CACHE = new Map<string, Promise<Api<ChainId>>>();

export const getApi = async <Id extends ChainId, Papi = Api<Id>>(
  id: Id,
  chains: Chain[] = [],
  waitReady = true,
  lightClients = true
): Promise<Papi> => {
  const cacheKey = getApiCacheId(id, lightClients);

  if (!API_CACHE.has(cacheKey)) API_CACHE.set(cacheKey, getApiInner(id, lightClients, chains));

  const api = (await API_CACHE.get(cacheKey)) as Api<KnowChainId>;

  if (waitReady) await api.waitReady;

  return api as Papi;
};
