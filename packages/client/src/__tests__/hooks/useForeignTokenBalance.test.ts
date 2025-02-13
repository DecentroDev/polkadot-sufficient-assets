import {
  type Api,
  type Chain,
  type ChainId,
  chains,
  formatBalance,
  subscribeTokenBalance,
  type Token,
  tokens,
} from '@polkadot-sufficient-assets/core';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useApi from '../../hooks/useApi';
import { useForeignTokenBalance } from '../../hooks/useForeignTokenBalance';

vi.mock('../../hooks/useApi', () => ({
  default: vi.fn(),
}));

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    subscribeTokenBalance: vi.fn(),
  };
});

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
                        dest: '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj',
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

describe('useForeignTokenBalance', () => {
  const mockChain: Chain = chains.polkadotAssetHubChain;
  const mockApi: Api<ChainId> = createMockApi('asset-hub');
  const mockToken: Token = tokens.DOT;
  const mockAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj';
  let mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.mocked(useApi).mockReturnValue([mockApi, true]);
    vi.mocked(subscribeTokenBalance).mockImplementation((_api: any, _token: any, _address: any, callback: any) => {
      callback?.(100n);
      return { unsubscribe: mockUnsubscribe };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial balance state', () => {
    const { result } = renderHook(() => useForeignTokenBalance());
    expect(result.current).toEqual({
      isLoading: true,
      value: 0n,
      valueFormatted: '0',
      error: true,
    });
  });

  it('should subscribe and update balance correctly', async () => {
    const { result } = renderHook(() => useForeignTokenBalance(mockChain, mockToken, mockAddress));

    await waitFor(() => {
      expect(subscribeTokenBalance).toHaveBeenCalledWith(mockApi, mockToken, mockAddress, expect.any(Function));
      expect(result.current).toEqual({
        isLoading: false,
        value: 100n,
        valueFormatted: formatBalance(100n),
        error: false,
      });
    });
  });

  it('should unsubscribe on unmount', () => {
    const unsubscribeMock = vi.fn();
    vi.mocked(subscribeTokenBalance).mockReturnValue({ unsubscribe: unsubscribeMock });

    const { unmount } = renderHook(() => useForeignTokenBalance(mockChain, mockToken, mockAddress));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should set balance value to 0n when subscribeTokenBalance returns null', async () => {
    vi.mocked(subscribeTokenBalance).mockImplementation((_api, _token, _address, callback) => {
      // @ts-ignore
      callback?.(null);
      return { unsubscribe: vi.fn() };
    });

    const { result } = renderHook(() => useForeignTokenBalance(mockChain, mockToken, mockAddress));

    await waitFor(() => {
      expect(result.current).toEqual({
        isLoading: false,
        value: 0n,
        valueFormatted: '0',
        error: false,
      });
    });
  });

  it('should format balance with default decimals when token.decimals is undefined', async () => {
    const mockTokenWithoutDecimals = { ...mockToken, decimals: undefined };
    // @ts-ignore
    const { result } = renderHook(() => useForeignTokenBalance(mockChain, mockTokenWithoutDecimals, mockAddress));

    await waitFor(() => {
      expect(result.current).toEqual({
        isLoading: false,
        value: 100n,
        valueFormatted: formatBalance(100n),
        error: false,
      });
    });
  });
});
