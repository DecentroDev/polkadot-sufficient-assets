import {
  type Api,
  type ChainId,
  chains,
  formatBalance,
  subscribeTokenBalance,
  tokens,
} from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import type { ITransferContext } from 'src/context/transfer.context';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { useTransfer } from '../../hooks/useTransfer';

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    formatBalance: vi.fn(),
    subscribeTokenBalance: vi.fn(),
  };
});

vi.mock('../../hooks/useTransfer', () => ({
  useTransfer: vi.fn(),
}));

const mockAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

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
                        dest: mockAddress,
                        amount: BigInt(10),
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

describe('useTokenBalance', () => {
  let mockApi: Api<ChainId>;
  let mockTransfer: ITransferContext;
  let mockUnsubscribe = vi.fn();

  beforeEach(() => {
    mockApi = createMockApi('asset-hub');
    mockTransfer = {
      api: mockApi,
      token: tokens.DOT,
      feeToken: tokens.DOT,
      changeFeeToken: vi.fn(),
      feeTokens: [tokens.DOT, tokens.USDT],
      nativeToken: tokens.DOT,
      chain: chains.polkadotChain,
      destinationAddress: undefined,
      isLoaded: true,
      lightClientEnable: false,
      useXcmTransfer: false,
      destinationChains: [],
    };

    vi.mocked(useTransfer).mockReturnValue(mockTransfer);
    vi.mocked(formatBalance).mockReturnValue('0.0001');
    vi.mocked(subscribeTokenBalance).mockImplementation((_, __, ___, callback) => {
      callback?.(100n);
      return { unsubscribe: mockUnsubscribe };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useTokenBalance());

    expect(result.current).toEqual({
      isLoading: true,
      value: 0n,
      valueFormatted: '0',
      error: true,
    });
  });

  it('should not subscribe when address is missing', () => {
    renderHook(() => useTokenBalance(mockTransfer.token));

    expect(subscribeTokenBalance).not.toHaveBeenCalled();
  });

  it('should not subscribe when token is missing', () => {
    renderHook(() => useTokenBalance(undefined, mockAddress));

    expect(subscribeTokenBalance).not.toHaveBeenCalled();
  });

  it('should not subscribe when api is not loaded', () => {
    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      api: mockApi,
      isLoaded: false,
    });

    renderHook(() => useTokenBalance(mockTransfer.token, mockAddress));

    expect(subscribeTokenBalance).not.toHaveBeenCalled();
  });

  it('should subscribe and update balance when all dependencies are available', () => {
    const { result } = renderHook(() => useTokenBalance(mockTransfer.token, mockAddress));

    expect(subscribeTokenBalance).toHaveBeenCalledWith(mockApi, mockTransfer.token, mockAddress, expect.any(Function));

    expect(result.current).toEqual({
      isLoading: false,
      value: 100n,
      valueFormatted: '0.0001',
      error: false,
    });
  });

  it('should handle null balance', () => {
    vi.mocked(subscribeTokenBalance).mockImplementation((_, __, ___, callback) => {
      // @ts-ignore
      callback?.(null);
      return { unsubscribe: mockUnsubscribe };
    });

    const { result } = renderHook(() => useTokenBalance(mockTransfer.token, mockAddress));

    expect(result.current.value).toBe(0n);
  });

  it('should unsubscribe on cleanup', () => {
    const { unmount } = renderHook(() => useTokenBalance(mockTransfer.token, mockAddress));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle decimals fallback when token decimals is undefined', () => {
    const tokenWithoutDecimals = { ...mockTransfer.token, decimals: undefined };

    // @ts-ignore
    renderHook(() => useTokenBalance(tokenWithoutDecimals, mockAddress));

    expect(formatBalance).toHaveBeenCalledWith('100', 12);
  });

  it('should resubscribe when dependencies change', () => {
    const { rerender } = renderHook(({ token, address }) => useTokenBalance(token, address), {
      initialProps: { token: mockTransfer.token, address: mockAddress },
    });

    const newAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

    rerender({ token: mockTransfer.token, address: newAddress });

    expect(subscribeTokenBalance).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
