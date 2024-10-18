// api.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Chain,
  chains,
  getApi,
  getApiInner,
  getChainById,
  getClient,
  getDescriptors,
  isApiAssetHub,
  isApiRelay,
} from '../../../services'; // Adjust the import path

const mockApi = {
  nonRelayChain: {
    chainId: chains.westendAssetHubChain.id,
    chain: chains.westendAssetHubChain,
    waitReady: vi.fn(),
  },
  relayChain: {
    chainId: chains.polkadotChain.id,
    chain: chains.polkadotChain,
    waitReady: Promise.resolve(),
  },
};

vi.mock(import('../../../services'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getChainById: vi.fn(),
    getDescriptors: vi.fn(),
    getClient: vi.fn(),
  };
});

describe('API Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isApiAssetHub', () => {
    it('should return true for an AssetHub chain', () => {
      const result = isApiAssetHub(mockApi.nonRelayChain as any);
      expect(result).toEqual(true);
    });

    it('should return false for a non-AssetHub chain', () => {
      const result = isApiAssetHub(mockApi.relayChain as any);
      expect(result).toEqual(false);
    });
  });

  describe('isApiRelay', () => {
    it('should return true for a Relay chain', () => {
      const result = isApiRelay(mockApi.relayChain as any);
      expect(result).toEqual(true);
    });

    it('should return false for a non-Relay chain', () => {
      const result = isApiRelay(mockApi.nonRelayChain as any);
      expect(result).toEqual(false);
    });
  });

  describe('getApiInner', () => {
    const mockChain: Chain = {
      id: chains.polkadotChain.id,
      name: 'Polkadot',
      wsUrl: 'wss://rpc.polkadot.io',
      relay: null,
      paraId: null,
      logo: 'logo.png',
      stableTokenId: 'DOT',
      blockExplorerUrl: null,
    };

    it('should return an API for a valid chain ID', async () => {
      const mockClient = {
        getTypedApi: vi.fn().mockReturnValue(mockApi.relayChain),
        bestBlocks$: Promise.resolve(), // Simulate observable
      };

      (getChainById as any).mockReturnValue(mockChain);
      (getDescriptors as any).mockReturnValue({});
      (getClient as any).mockResolvedValue(mockClient);

      const api = await getApiInner(mockChain.id, false, [mockChain]);

      expect(api.chainId).toBe(mockChain.id);
      expect(api.chain).toBe(mockChain);
      await expect(api.waitReady).resolves.toBeUndefined(); // Check waitReady resolves correctly
    });
  });

  describe('getApi', () => {
    it('should throw an error for an invalid chain ID', async () => {
      const invalidChainId = 'unknownChain';
      await expect(getApi(invalidChainId as any, [], true, true)).rejects.toThrow(
        `Could not find chain ${invalidChainId}`
      );
    });
  });
});
