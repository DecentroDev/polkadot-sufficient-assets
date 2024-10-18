import { describe, expect, it, vi } from 'vitest';
import { isChainIdAssetHub } from '../../services';
import { getTokenIdFromXcmV3Multilocation } from '../../utils';

// @ts-ignore
vi.mock(import('../../services/chains'), () => ({
  isChainIdAssetHub: vi.fn(),
}));

describe('getTokenIdFromXcmV3Multilocation', () => {
  const mockChainId = 'mock-chain-id';

  it('should return a native token when interior type is "Here"', () => {
    const multilocation = { parents: 0, interior: { type: 'Here' } };
    // @ts-ignore
    const result = getTokenIdFromXcmV3Multilocation(mockChainId, multilocation);

    expect(result).toEqual({ type: 'native', assetId: undefined });
  });

  it('should return an asset token when interior type is "X2" and contains PalletInstance 50', () => {
    const multilocation = {
      parents: 0,
      interior: {
        type: 'X2',
        value: [
          { type: 'PalletInstance', value: 50 },
          { type: 'GeneralIndex', value: 12345 },
        ],
      },
    };
    // @ts-ignore
    const result = getTokenIdFromXcmV3Multilocation(mockChainId, multilocation);
    expect(result).toEqual({ type: 'asset', assetId: 12345 });
  });

  it('should return null when interior type is "X2" but does not contain PalletInstance 50', () => {
    const multilocation = {
      parents: 0,
      interior: {
        type: 'X2',
        value: [
          { type: 'PalletInstance', value: 49 }, // Not 50
          { type: 'GeneralIndex', value: 12345 },
        ],
      },
    };
    // @ts-ignore
    const result = getTokenIdFromXcmV3Multilocation(mockChainId, multilocation);
    expect(result).toBeNull();
  });

  it('should return foreign asset when chainId is an asset hub', () => {
    // Mock the isChainIdAssetHub function to return true
    vi.mocked(isChainIdAssetHub).mockReturnValue(true);

    const multilocation = {
      parents: 0,
      interior: {
        type: 'X1',
        value: [{ type: 'GeneralIndex', value: 6789 }],
      },
    };
    // @ts-ignore
    const result = getTokenIdFromXcmV3Multilocation(mockChainId, multilocation);
    expect(result).toEqual({
      type: 'foreign-asset',
      location: multilocation,
    });
  });

  it('should return null when none of the conditions match', () => {
    // Mock the isChainIdAssetHub function to return false
    vi.mocked(isChainIdAssetHub)?.mockReturnValue(false);

    const multilocation = {
      parents: 0,
      interior: {
        type: 'X1',
        value: [{ type: 'GeneralIndex', value: 6789 }],
      },
    };
    // @ts-ignore
    const result = getTokenIdFromXcmV3Multilocation(mockChainId, multilocation);
    expect(result).toBeNull();
  });
});
