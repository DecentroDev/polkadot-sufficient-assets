import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainId } from '../../../services';
import { CHAIN_SPECS_CACHE, getChainSpec, hasChainSpec } from '../../../services/client/getChainSpec';

describe('Chain Spec Utilities', () => {
  // Reset the CHAIN_SPECS_CACHE before each test to prevent interference between tests.
  beforeEach(() => {
    vi.clearAllMocks();
    CHAIN_SPECS_CACHE.clear();
  });

  describe('hasChainSpec', () => {
    it('should return true if chainId exists in chainSpecList', () => {
      const chainId = 'testChain' as ChainId;
      const chainSpecList = { [chainId]: 'specData' };

      expect(hasChainSpec(chainId, chainSpecList)).toBe(true);
    });

    it('should return false if chainId does not exist in chainSpecList', () => {
      const chainId = 'testChain' as ChainId;
      const chainSpecList = { anotherChain: 'specData' };

      expect(hasChainSpec(chainId, chainSpecList)).toBe(false);
    });

    it('should return false if chainSpecList is undefined', () => {
      const chainId = 'testChain' as ChainId;

      expect(hasChainSpec(chainId)).toBe(false);
    });
  });

  describe('getChainSpec', () => {
    it('should return the spec from cache if already cached', () => {
      const chainId = 'testChain' as ChainId;
      const chainSpec = 'cachedSpecData';
      CHAIN_SPECS_CACHE.set(chainId, chainSpec);

      const result = getChainSpec(chainId, { [chainId]: 'newSpecData' });
      expect(result).toBe(chainSpec); // should return cached value
    });

    it('should throw an error if chainSpecList is not provided', () => {
      const chainId = 'testChain' as ChainId;

      expect(() => getChainSpec(chainId)).toThrowError('chainSpecs is not provided in lightClients config');
    });

    it('should throw an error if chainId is not in chainSpecList', () => {
      const chainId = 'unknownChain' as ChainId;
      const chainSpecList = { testChain: 'specData' };

      expect(() => getChainSpec(chainId, chainSpecList)).toThrowError(`Unknown chain: ${chainId}`);
    });

    it('should cache the spec if not already cached and return it', () => {
      const chainId = 'testChain' as ChainId;
      const chainSpec = 'specData';
      const chainSpecList = { [chainId]: chainSpec };

      const result = getChainSpec(chainId, chainSpecList);

      expect(result).toBe(chainSpec); // should return the new spec value
      expect(CHAIN_SPECS_CACHE.get(chainId)).toBe(chainSpec); // should cache the spec
    });
  });
});
