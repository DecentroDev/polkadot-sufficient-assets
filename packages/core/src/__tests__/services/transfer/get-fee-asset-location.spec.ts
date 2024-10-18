import { XcmV3Junction, XcmV3Junctions } from '@polkadot-api/descriptors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Api, type ChainIdAssetHub, getFeeAssetLocation, type Token, tokens } from '../../../services';
import {
  getAssetConvertPlancks,
  getBalance,
  getPoolReservesByToken,
  isTokenEqualPair,
} from '../../../services/transfer/get-fee-asset-location';
import { type AssetConvertionPoolDef, fetchAssetConvertionPool } from '../../../services/transfer/reserve-pool';
import type { Pair } from '../../../utils/xcm-v3-multi-location';

const mockApi: Api<ChainIdAssetHub> = {
  query: {
    System: { Account: { getValue: vi.fn() } },
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
  it('should return the correct XCM location for a non-native asset', () => {
    const result = getFeeAssetLocation(assetToken);
    expect(result).toEqual({
      parents: 0,
      interior: XcmV3Junctions.X2([
        XcmV3Junction.PalletInstance(50),
        XcmV3Junction.GeneralIndex(BigInt(assetToken.assetId)),
      ]),
    });
  });

  it('should throw an error if the token is not sufficient', () => {
    expect(() => getFeeAssetLocation({ ...assetToken, isSufficient: false })).toThrow(
      `Token ${assetToken.symbol} (${assetToken.assetId}) is not sufficient`
    );
  });

  it('should return undefined for native tokens', () => {
    const result = getFeeAssetLocation(nativeToken);
    expect(result).toBeUndefined();
  });
});

describe('getBalance', () => {
  it('should return the correct native balance', async () => {
    (mockApi.query.System.Account.getValue as any).mockResolvedValue({
      data: { free: 1000n, frozen: 200n },
    });

    const result = await getBalance(mockApi, nativeToken, mockAddress);
    expect(result).toBe(800n);
  });

  it('should return the correct balance for asset tokens', async () => {
    (mockApi.query.Assets.Account.getValue as any).mockResolvedValue({
      status: { type: 'Liquid' },
      balance: 500n,
    });

    const result = await getBalance(mockApi, assetToken, mockAddress);
    expect(result).toBe(500n);
  });

  it('should return 0 for asset tokens if status is not Liquid', async () => {
    (mockApi.query.Assets.Account.getValue as any).mockResolvedValue({
      status: { type: 'Frozen' },
      balance: 500n,
    });

    const result = await getBalance(mockApi, assetToken, mockAddress);
    expect(result).toBe(0n);
  });

  it('should return 0 for unsupported asset tokens', async () => {
    const unsupportedToken: Token = {
      // @ts-ignore
      type: 'unsupported',
      assetId: undefined,
      decimals: 0,
      symbol: '',
      name: '',
      isSufficient: false,
    };
    expect(await getBalance(mockApi, unsupportedToken, mockAddress)).toEqual(0n);
  });

  it('should return the correct balance for foreign assets', async () => {
    (mockApi.query.ForeignAssets.Account.getValue as any).mockResolvedValue({
      status: { type: 'Liquid' },
      balance: 500n,
    });

    const result = await getBalance(mockApi, foreignToken, mockAddress);
    expect(result).toBe(800n);
  });

  it('should return 0 for foreign assets if status is not Liquid', async () => {
    (mockApi.query.ForeignAssets.Account.getValue as any).mockResolvedValue({
      status: { type: 'Frozen' },
      balance: 500n,
    });

    const result = await getBalance(mockApi, foreignToken, mockAddress);
    expect(result).toBe(800n);
  });

  it('should throw an error for unsupported foreign assets', async () => {
    const unsupportedForeignToken: Token = {
      type: 'foreign-asset',
      assetId: undefined,
      decimals: 0,
      symbol: '',
      name: '',
      isSufficient: false,
    };
    await expect(getBalance(mockApi, unsupportedForeignToken, mockAddress)).rejects.toThrow(
      `Cannot watch balance for undefined. Assets are not supported on ${mockApi.chainId}`
    );
  });

  it('should balance for correct foreign assets', async () => {
    (mockApi.query.ForeignAssets.Account.getValue as any).mockResolvedValue({
      status: { type: 'Liquid' },
      balance: 500n,
    });
    const unsupportedForeignToken: Token = {
      ...tokens.USDT,
      type: 'foreign-asset',
    };
    expect(await getBalance(mockApi, unsupportedForeignToken, mockAddress)).toEqual(500n);
  });

  it('should return 0 for unrecognized token types', async () => {
    const unknownToken: Token = {
      type: 'custom',
      decimals: 0,
      symbol: '',
      name: '',
      isSufficient: false,
    };
    const result = await getBalance(mockApi, unknownToken, mockAddress);
    expect(result).toBe(0n);
  });
});

describe('isTokenEqualPair', () => {
  it('should return true if token and pair have the same type and assetId', () => {
    const pair: Pair = { assetId: assetToken.assetId, type: 'asset' };
    expect(isTokenEqualPair(assetToken, pair)).toBe(true);
  });

  it('should return false if token and pair differ', () => {
    const pair: Pair = { assetId: 2, type: 'asset' };
    expect(isTokenEqualPair(assetToken, pair)).toBe(false);
  });
});

describe('getPoolReservesByToken', () => {
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

  it('should return undefined if no matching pool is not found', async () => {
    const nonMatchingPools: any[] = [];
    const result = await getPoolReservesByToken(mockApi, nativeToken, assetToken, nonMatchingPools);
    expect(result).toBeUndefined();
  });

  it('should return reverse token if is asset token', async () => {
    const nonMatchingPools: AssetConvertionPoolDef[] = [
      {
        chainId: 'polkadot',
        owner: '',
        type: 'asset-convertion',
        poolAssetId: 123,
        tokenIds: [assetToken, nativeToken],
      },
    ];
    const result = await getPoolReservesByToken(mockApi, assetToken, nativeToken, nonMatchingPools);
    expect(result).toEqual(undefined);
  });
});

describe('getAssetConvertPlancks', () => {
  const mockPools: AssetConvertionPoolDef[] = [
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
    expect(result).toBe(8000n);
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
    expect(result).toBe(125n);
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

    expect(result).toEqual(125n);
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
    expect(result).toEqual(125n);
  });
});
