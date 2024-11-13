import { describe, expect, it, vi } from 'vitest';
import { type Api, type ChainId, type ChainIdAssetHub, getExistentialDeposit, type Token } from '../../../services';
import { getAssetIdByChain, getAssetPalletByChain } from '../../../utils';

// Mock API and utils
const mockApi = <T extends ChainId>(query: Partial<Api<T>> = {}): Api<T> =>
  ({
    chainId: 'some-chain-id',
    constants: { Balances: { ExistentialDeposit: vi.fn() } },
    query: {
      Assets: { Asset: { getValue: vi.fn() } },
    },
    ...query,
  }) as unknown as Api<T>;

vi.mock('../../../utils', () => ({
  getAssetIdByChain: vi.fn(),
  getAssetPalletByChain: vi.fn(),
}));

describe('getExistentialDeposit', () => {
  const token: Token = {
    type: 'asset',
    symbol: 'DOT',
    decimals: 0,
    name: '',
    isSufficient: false,
  };

  it('should return the min_balance for an asset token', async () => {
    const api = mockApi<ChainIdAssetHub>({
      query: {
        Assets: {
          // @ts-ignore
          Asset: {
            getValue: vi.fn().mockResolvedValue({ min_balance: 1000n }),
          },
        },
      },
    });

    (getAssetIdByChain as any).mockReturnValue('1');
    (getAssetPalletByChain as any).mockReturnValue('assets');

    const result = await getExistentialDeposit(token, api);
    expect(result).toBe(1000n);
  });

  it('should return 0n when asset token has no min_balance', async () => {
    const api = mockApi<ChainIdAssetHub>({
      query: {
        Assets: {
          // @ts-ignore
          Asset: {
            getValue: vi.fn().mockResolvedValue(null),
          },
        },
      },
    });

    (getAssetIdByChain as any).mockReturnValue('1');
    (getAssetPalletByChain as any).mockReturnValue('assets');

    const result = await getExistentialDeposit(token, api);
    expect(result).toBe(0n);
  });

  it('should return the native token’s existential deposit', async () => {
    const nativeToken: Token = {
      type: 'native',
      symbol: 'KSM',
      decimals: 0,
      name: '',
      isSufficient: false,
    };
    const api = mockApi({
      constants: {
        Balances: {
          // @ts-ignore
          ExistentialDeposit: vi.fn().mockResolvedValue(500n),
        },
      },
    });

    const result = await getExistentialDeposit(nativeToken, api);
    expect(result).toBe(500n);
  });

  it('should return 0n if native token has no existential deposit', async () => {
    const nativeToken: Token = {
      type: 'native',
      symbol: 'KSM',
      decimals: 0,
      name: '',
      isSufficient: false,
    };
    const api = mockApi({
      constants: {
        Balances: {
          // @ts-ignore
          ExistentialDeposit: vi.fn().mockResolvedValue(undefined),
        },
      },
    });

    const result = await getExistentialDeposit(nativeToken, api);
    expect(result).toBe(0n);
  });

  it('should throw an error if the asset token has no assetId', async () => {
    (getAssetIdByChain as any).mockReturnValue(null);

    const api = mockApi();
    await expect(getExistentialDeposit(token, api)).rejects.toThrow('Token DOT does not have an assetId');
  });

  it('should throw an error for unsupported token types', async () => {
    const unsupportedToken: Token = {
      type: 'custom',
      symbol: 'XYZ',
      decimals: 0,
      name: '',
      isSufficient: false,
    };

    const api = mockApi();
    await expect(getExistentialDeposit(unsupportedToken, api)).rejects.toThrow('Unsupported token type: XYZ');
  });
});
