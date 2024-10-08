import type { XcmV3Junctions } from '@polkadot-api/descriptors';
import { isChainIdAssetHub, type ChainId, type Token } from '../services';

export type XcmV3Multilocation = {
  parents: number;
  interior: XcmV3Junctions;
};

export type Pair = Pick<Token, 'type' | 'assetId' | 'location'>;

export const getTokenIdFromXcmV3Multilocation = (chainId: ChainId, multilocation: XcmV3Multilocation): Pair | null => {
  const { interior } = multilocation;
  if (interior.type === 'Here')
    return {
      type: 'native',
      assetId: undefined,
    };
  if (interior.type === 'X2' && interior.value.some((e) => e.type === 'PalletInstance' && e.value === 50))
    for (const entry of interior.value)
      if (entry.type === 'GeneralIndex')
        return {
          type: 'asset',
          assetId: Number(entry.value),
        };
  if (isChainIdAssetHub(chainId))
    return {
      type: 'foreign-asset',
      location: multilocation,
    };
  return null;
};
