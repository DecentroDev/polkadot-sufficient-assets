import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Api, ChainIdAssetHub } from '../../../services';
import { fetchAssetConvertionPool } from '../../../services/transfer/reserve-pool';
import { getTokenIdFromXcmV3Multilocation } from '../../../utils';

vi.mock(import('../../../utils'), () => ({
  getTokenIdFromXcmV3Multilocation: vi.fn(),
}));

// Mock API
const mockApi = {
  query: {
    AssetConversion: {
      Pools: {
        getEntries: vi.fn(),
      },
    },
    PoolAssets: {
      Asset: {
        getEntries: vi.fn(),
      },
    },
  },
  chain: {
    id: 'testChainId',
  },
} as unknown as Api<ChainIdAssetHub>;

describe('fetchAssetConvertionPool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of AssetConvertionPoolDef', async () => {
    const rawPools = [{ keyArgs: [['token1', 'token2']], value: 'pool1' }];
    const rawPoolAssets = [{ keyArgs: ['pool1'], value: { owner: 'owner1' } }];

    (mockApi.query.AssetConversion.Pools.getEntries as any).mockResolvedValueOnce(rawPools);
    (mockApi.query.PoolAssets.Asset.getEntries as any).mockResolvedValueOnce(rawPoolAssets);

    (getTokenIdFromXcmV3Multilocation as any).mockImplementation((_chainId: any, key: any) => key);

    const result = await fetchAssetConvertionPool(mockApi);

    expect(result).toEqual([
      {
        type: 'asset-convertion',
        chainId: 'testChainId',
        poolAssetId: 'pool1',
        tokenIds: ['token1', 'token2'],
        owner: 'owner1',
      },
    ]);
    expect(mockApi.query.AssetConversion.Pools.getEntries).toHaveBeenCalled();
    expect(mockApi.query.PoolAssets.Asset.getEntries).toHaveBeenCalled();
    expect(getTokenIdFromXcmV3Multilocation).toHaveBeenCalledWith('testChainId', 'token1');
    expect(getTokenIdFromXcmV3Multilocation).toHaveBeenCalledWith('testChainId', 'token2');
  });

  it('should filter out pools without matching pool assets', async () => {
    // Mock data with no matching pool assets
    const rawPools = [{ keyArgs: [['token1', 'token2']], value: 'pool1' }];
    const rawPoolAssets: never[] = []; // No matching pool assets

    (mockApi.query.AssetConversion.Pools.getEntries as any).mockResolvedValueOnce(rawPools);
    (mockApi.query.PoolAssets.Asset.getEntries as any).mockResolvedValueOnce(rawPoolAssets);

    const result = await fetchAssetConvertionPool(mockApi);

    // Since there's no matching pool asset, the result should be an empty array
    expect(result).toEqual([]);
  });

  it('should filter out pools with invalid token IDs', async () => {
    const rawPools = [{ keyArgs: [['token1', 'token2']], value: 'pool1' }];
    const rawPoolAssets = [{ keyArgs: ['pool1'], value: { owner: 'owner1' } }];

    // Mock getTokenIdFromXcmV3Multilocation to return null for invalid tokens
    (getTokenIdFromXcmV3Multilocation as any).mockImplementation((_chainId: any, key: any) =>
      key === 'token1' ? 'token1' : null
    );

    (mockApi.query.AssetConversion.Pools.getEntries as any).mockResolvedValueOnce(rawPools);
    (mockApi.query.PoolAssets.Asset.getEntries as any).mockResolvedValueOnce(rawPoolAssets);

    const result = await fetchAssetConvertionPool(mockApi);

    // Since one token ID is invalid, the result should be filtered out
    expect(result).toEqual([]);
  });
});
