import {
  formatBalance,
  getAssetConvertPlancks,
  getFeeAssetLocation,
  getTransferExtrinsic,
  tokens,
  XcmV3Junction,
  XcmV3Junctions,
  type Api,
  type ChainId,
} from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useTransaction } from '../../hooks/useTransaction';

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    getTransferExtrinsic: vi.fn(),
    getAssetConvertPlancks: vi.fn(),
    formatBalance: vi.fn(),
    getFeeAssetLocation: vi.fn(),
  };
});

describe('useTransaction', () => {
  const mockApi = {
    chain: {
      id: 'asset-hub',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      chainId: null,
      logo: '',
      type: 'relay',
      blockExplorerUrl: null,
    },
    tx: {
      Balances: { transfer_keep_alive: vi.fn() },
      Assets: { transfer: vi.fn() },
      Tokens: {
        transfer: vi.fn(),
      },
    },
  } as unknown as Api<ChainId>;

  const mockToken = tokens.DOT;
  const mockFeeToken = tokens.USDT;
  const mockNativeToken = tokens.WND;
  const mockAmount = '1000';
  const mockFrom = '0x123';
  const mockTo = '0x456';

  const mockTx = {
    getEstimatedFees: vi.fn(),
  };
  const mockFeeLocation = {
    parents: 1,
    interior: XcmV3Junctions.X2([XcmV3Junction.Parachain(1000), XcmV3Junction.PalletInstance(50)]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getTransferExtrinsic as Mock).mockReturnValue(mockTx);
    mockTx.getEstimatedFees.mockResolvedValue(100n);
    (getAssetConvertPlancks as Mock).mockResolvedValue(200n);
    (formatBalance as Mock).mockReturnValue('0.0002');
    (getFeeAssetLocation as Mock).mockReturnValue(mockFeeLocation);
  });

  it('should return null tx when required params are missing', () => {
    const { result } = renderHook(() => useTransaction(mockApi));

    expect(result.current.tx).toBeNull();
  });

  it('should calculate fee correctly when all params are provided', async () => {
    const { result } = renderHook(() =>
      useTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo)
    );

    await vi.waitFor(() => {
      expect(result.current.fee.isLoading).toBe(false);
    });

    expect(getTransferExtrinsic).toHaveBeenCalledWith(mockApi, mockToken, mockAmount, mockTo);
    expect(mockTx.getEstimatedFees).toHaveBeenCalledWith(mockFrom, {
      asset: mockFeeLocation,
    });
    expect(getAssetConvertPlancks).toHaveBeenCalledWith(mockApi, {
      nativeToken: mockNativeToken,
      plancks: 100n,
      tokenIn: mockNativeToken,
      tokenOut: mockFeeToken,
    });
    expect(formatBalance).toHaveBeenCalledWith('200', 6);

    expect(result.current.fee).toEqual({
      isLoading: false,
      value: 200n,
      valueFormatted: '0.0002',
      error: false,
    });
  });

  it('should handle fee estimation error', async () => {
    mockTx.getEstimatedFees.mockRejectedValue(new Error('Estimation failed'));

    const { result } = renderHook(() =>
      useTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo)
    );

    await vi.waitFor(() => {
      expect(result.current.fee.isLoading).toBe(false);
    });

    expect(result.current.fee).toEqual({
      isLoading: false,
      value: 0n,
      valueFormatted: '0',
      error: true,
    });
  });

  it('should update tx when params change', () => {
    const { rerender, result } = renderHook(
      ({ amount, to }) => useTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, amount, 'sender', to),
      {
        initialProps: { amount: mockAmount, to: 'receiver-1' },
      }
    );

    expect(getTransferExtrinsic).toHaveBeenCalledWith(mockApi, mockToken, mockAmount, 'receiver-1');

    rerender({ amount: '200', to: 'receiver-2' });

    expect(getTransferExtrinsic).toHaveBeenCalledWith(mockApi, mockToken, '200', 'receiver-2');
  });

  it('should handle feeToken as undefined correctly', async () => {
    const { result } = renderHook(() =>
      useTransaction(mockApi, mockToken, undefined, mockNativeToken, mockAmount, mockFrom, mockTo)
    );

    await vi.waitFor(() => {
      expect(result.current.fee.isLoading).toBe(false);
    });

    expect(mockTx.getEstimatedFees).toHaveBeenCalledWith(mockFrom, { asset: undefined });
  });

  it('should set fee to 0n when _fee is null', async () => {
    (getAssetConvertPlancks as Mock).mockResolvedValue(null);
    (formatBalance as Mock).mockReturnValue('0');

    const { result } = renderHook(() =>
      useTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo)
    );

    await vi.waitFor(() => {
      expect(result.current.fee.isLoading).toBe(false);
    });

    expect(result.current.fee).toEqual({
      isLoading: false,
      value: 0n,
      valueFormatted: '0',
      error: false,
    });
  });
});
