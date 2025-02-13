import { type Api, type Chain, type ChainId, chains, type Config, getApi } from '@polkadot-sufficient-assets/core';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useApi from '../../hooks/useApi';
import { ConfigProvider } from './../../context/config.context';

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

const mockConfig: Config = {
  sourceChains: [chains.polkadotChain],
  useXcmTransfer: true,
  destinationChains: [chains.kusamaChain],
  destinationAddress: '0x123',
  // @ts-ignore
  lightClients: { enable: true },
};

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    getApi: vi.fn(),
  };
});

vi.mock('../../hooks/useConfig', () => ({
  useConfig: vi.fn(() => mockConfig),
}));

describe('useApi hook', () => {
  const mockChainId = chains.polkadotChain.id;
  const mockApi: Api<ChainId> = createMockApi('asset-hub');
  const mockSourceChains: [Chain] = [chains.polkadotChain];
  const mockDestinationChains: [Chain] = [chains.kusamaChain];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should return api and loaded state after fetching', async () => {
    vi.mocked(getApi).mockResolvedValue(mockApi);

    const { result } = renderHook(() => useApi(mockChainId), {
      wrapper: ({ children }) => <ConfigProvider config={mockConfig}>{children}</ConfigProvider>,
    });

    expect(result.current[1]).toBe(false);

    await waitFor(() => {
      expect(result.current[0]).toEqual(mockApi);
      expect(result.current[1]).toBe(true);
      expect(getApi).toHaveBeenCalledWith(mockChainId, [...mockSourceChains, ...(mockDestinationChains ?? [])], true, {
        enable: true,
      });
    });
  });

  it('should handle error when API call fails', async () => {
    const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(getApi).mockRejectedValue(new Error('API fetch failed'));

    const { result } = renderHook(() => useApi(mockChainId));

    expect(result.current[1]).toBe(false);

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
      expect(result.current[1]).toBe(false);
      expect(getApi).toHaveBeenCalledWith(mockChainId, [...mockSourceChains, ...(mockDestinationChains ?? [])], true, {
        enable: true,
      });
    });

    spyConsoleError.mockRestore();
  });

  it('should return undefined and false if no chainId is provided', () => {
    const { result } = renderHook(() => useApi(undefined));

    expect(result.current[0]).toBeUndefined();
    expect(result.current[1]).toBe(false);
  });
});
