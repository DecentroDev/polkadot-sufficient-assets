import { XcmV3Junction, XcmV3Junctions } from '@polkadot-api/descriptors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Api, type ChainIdAssetHub, chains, getFeeAssetLocation, type Token, tokens } from '../../../services';
import {
  getAssetConvertPlancks,
  getPairBalance,
  getPoolReservesByToken,
  isTokenEqualPair,
} from '../../../services/transfer/get-fee-asset-location';
import { type AssetConvertionPool, fetchAssetConvertionPool } from '../../../services/transfer/reserve-pool';
import type { Pair } from '../../../utils/xcm-v3-multi-location';

const mockApi: Api<ChainIdAssetHub> = {
  query: {
    System: {
      Account: {
        getValue: vi.fn(() => ({ data: { free: 0n, frozen: 1n } })),
      },
    },
    Assets: { Account: { getValue: vi.fn() } },
    ForeignAssets: { Account: { getValue: vi.fn() } },
  },
  chainId: 'pah',
} as unknown as Api<ChainIdAssetHub>;

const nativeToken = tokens.DOT;
const assetToken = tokens.USDT;
const foreignToken = tokens.WND;
const mockAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj';

// @ts-ignore
vi.mock(import('../../../services/transfer/reserve-pool'), () => ({
  fetchAssetConvertionPool: vi.fn(() => Promise.resolve([{ tokenIds: [nativeToken, assetToken], owner: mockAddress }])),
}));

vi.mock(import('../../../services/transfer/get-fee-asset-location'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getPoolReservesByToken: vi.fn(),
  };
});

// @ts-ignore
vi.mock(import('../../../services/api'), () => ({
  isApiAssetHub: vi.fn((api) => api.chainId === 'pah'),
}));

describe('getFeeAssetLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // This will clear all mocks before each test
  });
  it('should return the correct XCM location for a non-native asset', () => {
    const result = getFeeAssetLocation(assetToken, 'pah');
    expect(result).toEqual({
      parents: 0,
      interior: XcmV3Junctions.X2([
        XcmV3Junction.PalletInstance(50),
        XcmV3Junction.GeneralIndex(BigInt(assetToken.assetId)),
      ]),
    });
  });

  it('should throw an error if the token is not sufficient', () => {
    expect(() => getFeeAssetLocation({ ...assetToken, isSufficient: false }, 'pah')).toThrow(
      `Token ${assetToken.symbol} (${assetToken.assetId}) is not sufficient`
    );
  });

  it('should return undefined for native tokens', () => {
    const result = getFeeAssetLocation(nativeToken, 'pah');
    expect(result).toBeUndefined();
  });
});

describe('getPairBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // This will clear all mocks before each test
  });
  it('should return 0n when the balance for foreign-asset type', async () => {
    const mockApi = {
      chainId: 'pah',
      query: {
        ForeignAssets: {
          Account: {
            getValue: vi.fn().mockResolvedValue({
              status: { type: 'Liquid' },
              balance: 500n,
            }),
          },
        },
      },
    } as unknown as Api<'pah'>;

    const pair: Token = {
      type: 'foreign-asset',
      assetId: 1984,
      decimals: 0,
      symbol: '',
      name: '',
      isSufficient: false,
    };
    const address = 'test-address';
    const balance = await getPairBalance(mockApi, pair, address);
    expect(balance).toBe(0n);
  });

  it('should return 0n when wrong pair type', async () => {
    const pair: Token = {
      type: 'custom',
      assetId: 1984,
      decimals: 0,
      symbol: '',
      name: '',
      isSufficient: false,
    };
    const address = 'test-address';
    const balance = await getPairBalance(mockApi, pair, address);
    expect(balance).toBe(0n);
  });
});

describe('isTokenEqualPair', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // This will clear all mocks before each test
  });
  it('should return true if token and pair have the same type and assetId', () => {
    const pair: Pair = { assetId: assetToken.assetId, type: 'asset' };
    expect(isTokenEqualPair(assetToken, pair, chains.polkadotAssetHubChain.chainId as any)).toBe(true);
  });

  it('should return false if token and pair differ', () => {
    const pair: Pair = { assetId: 2, type: 'asset' };
    expect(isTokenEqualPair(assetToken, pair, chains.polkadotAssetHubChain.chainId as any)).toBe(false);
  });
});

describe('getPoolReservesByToken', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // This will clear all mocks before each test
  });
  it('should return correct reserves if a matching pool is found', async () => {
    ((mockApi.query.Assets.Account as any).getValue as any).mockResolvedValue({
      status: { type: 'Liquid' },
      balance: 100n,
    });

    const reserves = await getPoolReservesByToken(
      mockApi,
      nativeToken,
      assetToken,
      await fetchAssetConvertionPool(mockApi)
    );
    expect(reserves).toEqual(undefined);
  });

  it('should return reverse token if is asset token', async () => {
    const nonMatchingPools: AssetConvertionPool[] = [
      {
        chainId: 'polkadot',
        owner: '',
        type: 'asset-convertion',
        poolAssetId: 123,
        tokenIds: [assetToken, nativeToken],
      },
    ];
    const result = await getPoolReservesByToken(mockApi, assetToken, nativeToken, nonMatchingPools);
    expect(result).toBeUndefined();
  });
});

describe('getAssetConvertPlancks', () => {
  const mockPools: AssetConvertionPool[] = [
    {
      chainId: 'polkadot',
      owner: '',
      type: 'asset-convertion',
      poolAssetId: 123,
      tokenIds: [assetToken, nativeToken],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined if required params are missing', async () => {
    const result = await getAssetConvertPlancks(mockApi, {});
    expect(result).toBeUndefined();
  });

  it('should return the same plancks if tokenIn and tokenOut are the same', async () => {
    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken: nativeToken,
    });
    expect(result).toBe(-10n);
  });

  it('should return undefined if no pool reserves are found', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce([]);
    (getPoolReservesByToken as any).mockResolvedValueOnce(undefined);

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken: nativeToken,
    });
    expect(result).toBeUndefined();
  });

  it('should return undefined if any reserve contains 0n', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce(mockPools);
    (getPoolReservesByToken as any).mockResolvedValueOnce([0n, 1n]); // Mocking 0 in reserves

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 0n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken: nativeToken,
    });
    expect(result).toBeUndefined();
  });

  it('should return stablePlancks if tokenIn is native token', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce(mockPools);
    (getPoolReservesByToken as any).mockResolvedValueOnce([200n, 100n]).mockResolvedValueOnce([100n, 50n]);

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: nativeToken,
      tokenOut: foreignToken,
      nativeToken: nativeToken,
    });

    expect(result).toBe(1000n);
  });

  it('should return outPlancks for regular token conversions', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce(mockPools);
    (getPoolReservesByToken as any).mockResolvedValueOnce([200n, 100n]).mockResolvedValueOnce([300n, 150n]);

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken,
    });
    expect(result).toBe(-100000n);
  });

  it('should return undefined if pool reserves include 0n', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce(mockPools);
    (getPoolReservesByToken as any).mockResolvedValueOnce([0n, 100n]);

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken,
    });

    expect(result).toEqual(-100000n);
  });

  it('should return value if in token and native token is same', async () => {
    (fetchAssetConvertionPool as any).mockResolvedValueOnce(mockPools);
    (getPoolReservesByToken as any).mockResolvedValueOnce([0n, 100n]);

    const result = await getAssetConvertPlancks(mockApi, {
      plancks: 1000n,
      tokenIn: assetToken,
      tokenOut: foreignToken,
      nativeToken: assetToken,
    });
    expect(result).toEqual(1000n);
  });

  it('should return stablePlancks when tokenInAssetId equals nativeToken.assetId', async () => {
    const tokenIn = nativeToken;
    const tokenOut = assetToken;
    const plancks = BigInt(1000);
    const nativeToTokenOutReserveIn = BigInt(500);
    const nativeToTokenOutReserveOut = BigInt(2000);

    (getPoolReservesByToken as any).mockResolvedValueOnce([nativeToTokenOutReserveIn, nativeToTokenOutReserveOut]);

    const result = await getAssetConvertPlancks(mockApi as any, {
      plancks,
      tokenIn,
      tokenOut,
      nativeToken,
    });
    expect(result).toBe(-10n);
  });
});
