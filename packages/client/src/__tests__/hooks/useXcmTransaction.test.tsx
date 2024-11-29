import {
  chains,
  formatBalance,
  getAssetConvertPlancks,
  getFeeAssetLocation,
  getXcmTransferExtrinsic,
  tokens,
  type Api,
  type ChainId,
} from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useXcmTransaction } from '../../hooks/useXcmTransaction';

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    getXcmTransferExtrinsic: vi.fn(),
    getAssetConvertPlancks: vi.fn(),
    formatBalance: vi.fn(),
    getFeeAssetLocation: vi.fn(),
  };
});

describe('useXcmTransaction', () => {
  const mockApi = {
    chain: { id: 'asset-hub' },
  } as unknown as Api<ChainId>;

  const mockToken = tokens.DOT;
  const mockFeeToken = tokens.USDT;
  const mockNativeToken = tokens.WND;
  const mockAmount = '1000';
  const mockFrom = '0x123';
  const mockTo = '0x456';
  const mockDestChain = chains.polkadotChain;

  const mockTx = {
    getEstimatedFees: vi.fn(),
  };
  const mockFeeLocation = {
    parents: 1,
    interior: { X2: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    (getXcmTransferExtrinsic as Mock).mockReturnValue(mockTx);
    mockTx.getEstimatedFees.mockResolvedValue(100n);
    (getAssetConvertPlancks as Mock).mockResolvedValue(200n);
    (formatBalance as Mock).mockReturnValue('0.0002');
    (getFeeAssetLocation as Mock).mockReturnValue(mockFeeLocation);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null tx when required params are missing', () => {
    const { result } = renderHook(() => useXcmTransaction(mockApi));

    expect(result.current.tx).toBeNull();
  });

  it('should calculate fee correctly when all params are provided', async () => {
    const { result } = renderHook(() =>
      useXcmTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo, mockDestChain)
    );

    await vi.waitFor(() => {
      expect(result.current.fee.isLoading).toBe(false);
    });

    expect(getXcmTransferExtrinsic).toHaveBeenCalledWith(mockApi, mockToken, mockAmount, mockTo, mockDestChain);
    expect(mockTx.getEstimatedFees).toHaveBeenCalledWith(mockFrom, { asset: mockFeeLocation });
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
      useXcmTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo, mockDestChain)
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

  it('should handle feeToken as undefined correctly', async () => {
    const { result } = renderHook(() =>
      useXcmTransaction(mockApi, mockToken, undefined, mockNativeToken, mockAmount, mockFrom, mockTo, mockDestChain)
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
      useXcmTransaction(mockApi, mockToken, mockFeeToken, mockNativeToken, mockAmount, mockFrom, mockTo, mockDestChain)
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
