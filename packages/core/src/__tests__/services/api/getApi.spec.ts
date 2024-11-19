// api.test.ts
import { polkadot } from '@polkadot-api/descriptors';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
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
  };
});

vi.mock('../../../services/client/getClient');

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
      const mockDescriptor = {
        asset: {},
        descriptors: Promise.resolve(),
        metadataTypes: Promise.resolve(),
      };
      (getChainById as Mock).mockReturnValue(mockChain);
      (getDescriptors as Mock).mockReturnValue(mockDescriptor);

      const getTypedApiMock = vi.fn().mockReturnValue(mockApi.relayChain);

      const mockClient = {
        getTypedApi: getTypedApiMock,
        bestBlocks$: of(1000),
      };
      (getClient as Mock).mockResolvedValueOnce(mockClient);
      const api = await getApiInner(mockChain.id, undefined, [mockChain]);

      expect(api.chainId).toBe(mockChain.id);
      expect(api.chain).toBe(mockChain);
      expect(getTypedApiMock).toHaveBeenCalledWith(mockDescriptor);
      await expect(api.waitReady).resolves.toBeUndefined(); // Check waitReady resolves correctly
    });

    it('should throw error if getClient return undefined', async () => {
      (getClient as Mock).mockResolvedValueOnce(undefined);
      const api = getApiInner(mockChain.id, undefined, [mockChain]);
      expect(api).rejects.toThrowError(`Could not create client for chain ${mockChain.id}/${undefined}`);
    });

    it('should fallback to polkadot if descriptor not found', async () => {
      (getChainById as Mock).mockReturnValue(mockChain);
      const getTypedApiMock = vi.fn().mockReturnValue(mockApi.relayChain);
      const fakeChain = { ...mockChain, id: 'hydration' };
      const mockClient = {
        getTypedApi: getTypedApiMock,
        bestBlocks$: of(1000),
      };
      (getClient as Mock).mockResolvedValueOnce(mockClient);
      const api = await getApiInner(fakeChain.id, undefined, [fakeChain]);

      expect(api.chainId).toBe(fakeChain.id);
      expect(api.chain).toBe(fakeChain);
      expect(getTypedApiMock).toHaveBeenCalledWith(polkadot);
      await expect(api.waitReady).resolves.toBeUndefined(); // Check waitReady resolves correctly
    });
  });

  describe('getApi', () => {
    it('should return api for an valid chain ID', async () => {
      const mockClient = {
        getTypedApi: vi.fn().mockReturnValue(mockApi.relayChain),
        bestBlocks$: of(1000),
      };
      (getClient as Mock).mockResolvedValueOnce(mockClient);
      const api = getApi(
        chains.polkadotChain.id,
        [chains.polkadotChain, chains.polkadotAssetHubChain],
        true,
        undefined
      );
      await expect(api).resolves.toHaveProperty('chainId');
    });

    it('should return api for an valid chain ID with light clients provided', async () => {
      const mockClient = {
        getTypedApi: vi.fn().mockReturnValue(mockApi.relayChain),
        bestBlocks$: of(1000),
      };
      (getClient as Mock).mockResolvedValueOnce(mockClient);

      const api = getApi(chains.polkadotChain.id, [chains.polkadotChain, chains.polkadotAssetHubChain], true, {
        enable: true,
        smoldot: vi.fn().mockReturnValue({}) as any,
        chainSpecs: {
          [chains.polkadotAssetHubChain.id]: '',
          [chains.polkadotChain.id]: '',
        },
      });
      await expect(api).resolves.toHaveProperty('chainId');
    });

    it('should throw an error for an invalid chain ID', async () => {
      const invalidChainId = 'unknownChain';
      await expect(getApi(invalidChainId as any, [], true, undefined)).rejects.toThrow(
        `Could not find chain ${invalidChainId}`
      );
    });
  });
});
