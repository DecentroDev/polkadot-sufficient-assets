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

    it('should return false for a non-AssetHub chgetApiain', () => {
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
    const mockChain: Chain = chains.polkadotChain;

    it('should return an API for a valid chain ID', async () => {
      const mockClient = {
        getTypedApi: vi.fn().mockReturnValue(mockApi.relayChain),
        bestBlocks$: Promise.resolve(), // Simulate observable
      };

      (getChainById as any).mockReturnValue(mockChain);
      (getDescriptors as any).mockReturnValue({});
      (getClient as any).mockResolvedValue(mockClient);

      const api = await getApiInner(mockChain.id, undefined, [mockChain]);

      expect(api.chainId).toBe(mockChain.id);
      expect(api.chain).toBe(mockChain);
      await expect(api.waitReady).resolves.toBeUndefined(); // Check waitReady resolves correctly
    });
  });

  describe('getApi', () => {
    it('should return api for an valid chain ID', async () => {
      const validChainId = chains.polkadotChain.id;
      const expected = await getApi(
        validChainId as any,
        [chains.polkadotChain, chains.polkadotAssetHubChain],
        true,
        undefined
      );
      await expect(
        await getApi(validChainId as any, [chains.polkadotChain, chains.polkadotAssetHubChain], true, undefined)
      ).toEqual(expected);
    });
    it('should throw an error for an invalid chain ID', async () => {
      const invalidChainId = 'unknownChain';
      await expect(getApi(invalidChainId as any, [], true, undefined)).rejects.toThrow(
        `Could not find chain ${invalidChainId}`
      );
    });
  });
});
