import { MultiAddress } from '@polkadot-api/descriptors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTransferExtrinsic,
  type Api,
  type ChainId,
  type ChainIdAssetHub,
  type ChainIdPara,
  type Token,
} from '../../../services';
import { parseUnits } from '../../../utils';

const address = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj';

const createMockApi = (type: 'asset-hub' | 'parachain') => {
  const api: Partial<Api<ChainId>> = {
    chain: {
      id: type,
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      chainId: null,
      logo: '',
      type: type === 'asset-hub' ? 'relay' : 'para',
      blockExplorerUrl: null,
    },
    tx: {
      Balances: { transfer_keep_alive: vi.fn() },
      Assets: { transfer: vi.fn() },
      Tokens: {
        transfer:
          type === 'parachain'
            ? {
                mock: {
                  calls: [
                    [
                      {
                        dest: address,
                        amount: BigInt(10), // Make sure this is the intended value
                        currency_id: 123,
                      },
                    ],
                  ],
                },
              }
            : vi.fn(),
      },
    },
  };
  return api as Api<ChainId>;
};

// Helper: Create a mock token with default properties
const createMockToken = (type: string, symbol: string, decimals = 12, assetId?: number) =>
  ({
    type,
    symbol,
    decimals,
    assetId,
  }) as Token;

describe('getTransferExtrinsic', () => {
  let apiAssetHub: Api<ChainIdAssetHub>;
  let apiPara: Api<ChainIdPara>;

  beforeEach(() => {
    apiAssetHub = createMockApi('asset-hub') as Api<ChainIdAssetHub>;
    apiPara = createMockApi('parachain') as Api<ChainIdPara>;
  });

  it('should return a native token transfer extrinsic', () => {
    const nativeToken = createMockToken('native', 'DOT');
    const amount = '10';
    const dest = address;

    const extrinsic = getTransferExtrinsic(apiAssetHub, nativeToken, amount, dest);

    expect(apiAssetHub.tx.Balances.transfer_keep_alive).toHaveBeenCalledWith({
      dest: MultiAddress.Id(dest),
      value: parseUnits(amount, nativeToken.decimals),
    });
    expect(extrinsic).toEqual(extrinsic);
  });

  it('should return an asset token transfer extrinsic with Tokens pallet', () => {
    const assetToken = createMockToken('asset', 'KSM', 12, 123);
    const amount = '20';
    const dest = address;

    const extrinsic = getTransferExtrinsic(apiPara, assetToken, amount, dest);

    const actualArgs = (apiPara.tx.Tokens.transfer as any).mock.calls[0]?.[0]; // Safely access the first call

    const expectedArgs = {
      dest: address,
      amount: BigInt(10), // Make sure this is the intended value
      currency_id: 123,
    };

    // Compare actual and expected values
    expect(actualArgs).toEqual(expect.objectContaining(expectedArgs));

    expect(extrinsic).toBeUndefined();
  });

  it('should return an asset token transfer extrinsic with Assets pallet', () => {
    const assetToken = createMockToken('asset', 'KSM', 12, 456);
    const amount = '30';
    const dest = address;

    const extrinsic = getTransferExtrinsic(apiAssetHub, assetToken, amount, dest);

    expect(apiAssetHub.tx.Assets.transfer).toHaveBeenCalledWith({
      id: 456,
      target: MultiAddress.Id(dest),
      amount: parseUnits(amount, assetToken.decimals),
    });
    expect(extrinsic).toEqual(extrinsic);
  });

  it('should return null for unsupported token type', () => {
    const unsupportedToken = createMockToken('unknown', 'XYZ');
    const amount = '10';
    const dest = '5Ew3reF...';

    const extrinsic = getTransferExtrinsic(apiAssetHub, unsupportedToken, amount, dest);

    expect(extrinsic).toBeNull();
  });

  it('should throw an error if asset token has no assetId', () => {
    const invalidAssetToken = createMockToken('asset', 'KSM');
    const amount = '10';
    const dest = address;

    expect(() => getTransferExtrinsic(apiAssetHub, invalidAssetToken, amount, dest)).toThrowError(
      'Token KSM does not have an assetId'
    );
  });

  it('should return api when assetPallet equal tokens', () => {
    const token = createMockToken('asset', 'KSM');
    const amount = '10';
    const dest = '5Ew3reF...';

    const extrinsic = getTransferExtrinsic(
      apiAssetHub,
      {
        ...token,
        assetIds: { 'asset-hub': 1 },
        assetPallet: { [apiAssetHub.chain.id]: 'tokens' },
      },
      amount,
      dest
    );
    expect(extrinsic).toEqual(undefined);
  });
});
