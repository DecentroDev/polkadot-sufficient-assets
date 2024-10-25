import type { SS58String } from 'polkadot-api';
import { getTokenIdFromXcmV3Multilocation } from '../../utils';
import type { Pair } from '../../utils/xcm-v3-multi-location';
import type { Api } from '../api';
import type { ChainId, ChainIdAssetHub } from '../chains';
import type { Token } from '../tokens';

export type AssetConvertionPool = {
  type: 'asset-convertion';
  chainId: ChainId;
  poolAssetId: number;
  tokenIds: [Pair, Pair];
  owner: SS58String;
};

export const fetchAssetConvertionPool = async (api: Api<ChainIdAssetHub>) => {
  const [rawPools, rawPoolAssets] = await Promise.all([
    api.query.AssetConversion.Pools.getEntries({ at: 'best' }),
    api.query.PoolAssets.Asset.getEntries({ at: 'best' }),
  ]);

  const chain = api.chain;

  return rawPools
    .map<AssetConvertionPool | null>((d) => {
      const poolAssetId = d.value;
      const poolAsset = rawPoolAssets.find((p) => p.keyArgs[0] === poolAssetId);

      if (!poolAsset) return null;

      const pool: AssetConvertionPool = {
        type: 'asset-convertion',
        chainId: chain.id,
        poolAssetId,
        tokenIds: d.keyArgs[0].map((k) => getTokenIdFromXcmV3Multilocation(chain.id, k)) as [Token, Token],
        owner: poolAsset.value.owner,
      };

      return pool;
    })
    .filter((p): p is AssetConvertionPool => !!p)
    .filter((p): p is AssetConvertionPool => p.tokenIds.every((t) => !!t));
};
