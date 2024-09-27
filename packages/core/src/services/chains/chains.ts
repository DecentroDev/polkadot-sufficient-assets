import { kah, kusama, pah, paseo, paseoah, polkadot, rah, rococo, wah, westend } from '@polkadot-api/descriptors';

type DescriptorsRelayType = {
  polkadot: typeof polkadot;
  kusama: typeof kusama;
  rococo: typeof rococo;
  westend: typeof westend;
  paseo: typeof paseo;
};

type DescriptorsAssetHubType = {
  pah: typeof pah;
  kah: typeof kah;
  rah: typeof rah;
  wah: typeof wah;
  paseoah: typeof paseoah;
};

const DESCRIPTORS_RELAY: DescriptorsRelayType = {
  polkadot,
  kusama,
  rococo,
  westend,
  paseo,
};

const DESCRIPTORS_ASSET_HUB: DescriptorsAssetHubType = {
  pah,
  kah,
  rah,
  wah,
  paseoah,
};

export const DESCRIPTORS_ALL = {
  ...DESCRIPTORS_RELAY,
  ...DESCRIPTORS_ASSET_HUB,
};

type DescriptorsAssetHub = typeof DESCRIPTORS_ASSET_HUB;
type DescriptorsRelay = typeof DESCRIPTORS_RELAY;
export type DescriptorsAll = DescriptorsRelay & DescriptorsAssetHub;

export type ChainIdAssetHub = keyof DescriptorsAssetHub;
export type ChainIdRelay = keyof DescriptorsRelay;
export type KnowChainId = ChainIdRelay | ChainIdAssetHub;
type UnKnowChainId = string & {};
export type ChainId = KnowChainId | UnKnowChainId;

export const isChainIdAssetHub = (id: unknown): id is ChainIdAssetHub =>
  typeof id === 'string' && !!DESCRIPTORS_ASSET_HUB[id as ChainIdAssetHub];
export const isChainIdRelay = (id: unknown): id is ChainIdRelay =>
  typeof id === 'string' && !!DESCRIPTORS_RELAY[id as ChainIdRelay];

export type Descriptors<Id extends KnowChainId> = DescriptorsAll[Id];

export const getDescriptors = (id: ChainId): Descriptors<KnowChainId> | undefined => {
  if (DESCRIPTORS_ALL[id as KnowChainId]) {
    return DESCRIPTORS_ALL[id as KnowChainId];
  }
  return undefined;
};

export type Chain = {
  id: ChainId;
  name: string;
  wsUrl: string;
  relay: ChainIdRelay | null;
  paraId: number | null;
  logo: string;
  stableTokenId: string | null;
  blockExplorerUrl: string | null;
};

export type ChainRelay = Chain & { paraId: null };

export type ChainAssetHub = Chain & { paraId: 1000 };

export const getChainById = <T extends Chain>(id: ChainId, chains: Chain[]): T => {
  const foundChain = chains.find((chain) => chain.id === id) as T;
  if (!foundChain) throw new Error(`Could not find chain ${id}`);
  return foundChain as T;
};

export const isAssetHub = (chain: Chain): chain is ChainAssetHub => {
  return chain.paraId === 1000;
};

export const isRelay = (chain: Chain): chain is ChainRelay => {
  return chain.paraId === null;
};
