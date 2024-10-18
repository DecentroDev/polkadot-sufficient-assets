import { MultiAddress } from '@polkadot-api/descriptors';
import { describe, expect, it, vi } from 'vitest';
import { type Api, type ChainId, type ChainIdAssetHub, chains, getTransferExtrinsic, tokens } from '../../../services';
import { parseUnits } from '../../../utils';

// Mock the parseUnits function
vi.mock('../../../utils', () => ({
  parseUnits: vi.fn(),
}));

describe('getTransferExtrinsic', () => {
  const mockApi: Api<ChainId> = {
    tx: {
      Balances: {
        transfer_keep_alive: vi.fn(),
      },
      Assets: {
        transfer: vi.fn(),
      },
    },
    chainId: 'polkadot' as ChainId,
    chain: chains.polkadotChain,
  } as unknown as Api<ChainId>;

  const mockDest = '5FHneW46xGXgs5mUiveU4sbTyGBzmtoL2DL2oGy8L9bpndvT';

  it('should return the correct transfer_keep_alive extrinsic for native tokens', () => {
    (parseUnits as any).mockReturnValue(BigInt(1000)); // Use proper mocking

    const result = getTransferExtrinsic(mockApi as any, tokens.DOT, '100', mockDest);

    expect(result).toEqual(undefined);
    expect(mockApi.tx.Balances.transfer_keep_alive).toHaveBeenCalledWith({
      dest: MultiAddress.Id(mockDest),
      value: BigInt(1000),
    });
  });

  it('should return the correct transfer extrinsic for asset tokens', () => {
    (parseUnits as any).mockReturnValue(BigInt(1000)); // Use proper mocking

    const mockApiAsset: Api<ChainIdAssetHub> = {
      ...mockApi,
      chainId: 'pah',
      chain: chains.polkadotAssetHubChain,
    } as unknown as Api<ChainIdAssetHub>;
    const result = getTransferExtrinsic(mockApiAsset as any, tokens.USDT, '100', mockDest);

    expect(result).toEqual(undefined);
    expect(mockApiAsset.tx.Assets.transfer).toHaveBeenCalledWith({
      id: tokens.USDT.assetId,
      target: MultiAddress.Id(mockDest),
      amount: 1000n,
    });
  });

  it('should throw an error if the chain does not have the Assets pallet for asset tokens', () => {
    const mockApiWithoutAssets = {
      ...mockApi,
      tx: {
        Balances: mockApi.tx.Balances,
      },
    };

    expect(() => getTransferExtrinsic(mockApiWithoutAssets as any, tokens.USDC, '100', mockDest)).toThrow(
      `Chain ${mockApiWithoutAssets.chain.name} does not have the Assets pallet`
    );
  });

  it('should throw an error if asset token does not have an assetId', () => {
    const mockTokenNoAssetId = { ...tokens.USDT, assetId: undefined };

    expect(() => getTransferExtrinsic(mockApi as any, mockTokenNoAssetId, '100', mockDest)).toThrow(
      `Token ${mockTokenNoAssetId.symbol} does not have an assetId`
    );
  });

  it('should return null if token not found type', () => {
    const mockTokenNoAssetId = { ...tokens.USDT, type: 'abc' };

    // @ts-ignore
    expect(getTransferExtrinsic(mockApi as any, mockTokenNoAssetId, '100', mockDest)).toBeNull();
  });
});
