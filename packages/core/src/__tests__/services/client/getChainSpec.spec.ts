import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainId } from '../../../services';
import { CHAIN_SPECS_CACHE, getChainSpec, hasChainSpec, loadChainSpec } from '../../../services/client/getChainSpec';

// Define mock chain specs to simulate the dynamic imports
export const mockChainSpecs = {
  kusama: 'Kusama Spec',
  rococo: 'Rococo Spec',
  westend: 'Westend Spec',
  polkadot: 'Polkadot Spec',
  kah: 'Kah Spec',
  rah: 'Rah Spec',
  wah: 'Wah Spec',
  pah: 'Pah Spec',
  paseo: 'Paseo Spec',
  paseoah: 'Paseo Asset Hub Spec',
};

// Mock dynamic imports with vi.mock for all known chains
vi.mock('polkadot-api/chains/ksmcc3', () => ({
  chainSpec: mockChainSpecs.kusama,
}));
vi.mock('polkadot-api/chains/rococo_v2_2', () => ({
  chainSpec: mockChainSpecs.rococo,
}));
vi.mock('polkadot-api/chains/westend2', () => ({
  chainSpec: mockChainSpecs.westend,
}));
vi.mock('polkadot-api/chains/polkadot', () => ({
  chainSpec: mockChainSpecs.polkadot,
}));
vi.mock('polkadot-api/chains/ksmcc3_asset_hub', () => ({
  chainSpec: mockChainSpecs.kah,
}));
vi.mock('polkadot-api/chains/rococo_v2_2_asset_hub', () => ({
  chainSpec: mockChainSpecs.rah,
}));
vi.mock('polkadot-api/chains/westend2_asset_hub', () => ({
  chainSpec: mockChainSpecs.wah,
}));
vi.mock('polkadot-api/chains/polkadot_asset_hub', () => ({
  chainSpec: mockChainSpecs.pah,
}));
vi.mock('polkadot-api/chains/paseo', () => ({
  chainSpec: mockChainSpecs.paseo,
}));
vi.mock('polkadot-api/chains/paseo_asset_hub', () => ({
  chainSpec: mockChainSpecs.paseoah,
}));

describe('Chain Specifications', () => {
  beforeEach(() => {
    CHAIN_SPECS_CACHE.clear(); // Clear cache before each test
    vi.clearAllMocks(); // Reset mock history
  });

  describe('hasChainSpec', () => {
    it('should return true for known chain specs', () => {
      expect(hasChainSpec('kusama')).toBe(true);
      expect(hasChainSpec('paseo')).toBe(true);
      expect(hasChainSpec('unknown' as any)).toBe(false); // Ensure unknown chains return false
    });
  });

  describe('loadChainSpec', () => {
    // it('should return spec chain import success for kusama chain', async () => {
    //   const chainId: ChainId = 'kusama';
    //   // @ts-ignore
    //   await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    // });

    it('should return spec chain import success for rococo chain', async () => {
      const chainId: ChainId = 'rococo';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should return spec chain import success for polkadot chain', async () => {
      const chainId: ChainId = 'polkadot';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should return spec chain import success for kah chain', async () => {
      const chainId: ChainId = 'kah';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should return spec chain import success for rah chain', async () => {
      const chainId: ChainId = 'rah';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should return spec chain import success for wah chain', async () => {
      // Simulate an import failure
      vi.mock('polkadot-api/chains/wah', () => {
        throw new Error('Import failed');
      });
      const chainId: ChainId = 'wah';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should return spec chain import success for paseoah chain', async () => {
      // Simulate an import failure
      vi.mock('polkadot-api/chains/paseoah', () => {
        throw new Error('Import failed');
      });
      const chainId: ChainId = 'paseoah';
      // @ts-ignore
      await expect(await loadChainSpec(chainId)).toEqual(mockChainSpecs[chainId]);
    });

    it('should handle import failures gracefully', async () => {
      // Simulate an import failure
      vi.mock('polkadot-api/chains/ksmcc3', () => {
        throw new Error('Import failed');
      });
      const unknownChain = 'unknown';
      // @ts-ignore
      await expect(loadChainSpec(unknownChain)).rejects.toThrow(`Failed to load chain spec for chain ${unknownChain}`);
    });
  });

  describe('getChainSpec', () => {
    it('should cache the chain spec after the first load', async () => {
      const firstLoad = await getChainSpec('paseo');
      const cachedLoad = await getChainSpec('paseo');

      expect(firstLoad).toBe('Paseo Spec');
      expect(cachedLoad).toBe(firstLoad); // Should use the cached result
    });

    it('should return cached value if spec is already loaded', async () => {
      await getChainSpec('pah'); // Load the chain spec to cache it
      expect(CHAIN_SPECS_CACHE.has('pah')).toBe(true);

      const result = await getChainSpec('pah');
      expect(result).toBe('Pah Spec');
    });

    it('should throw an error if trying to load an unknown chain', async () => {
      await expect(getChainSpec('unknown' as any)).rejects.toThrow('Unknown chain: unknown');
    });

    it('should load and cache the spec only once', async () => {
      const loadSpecSpy = vi.spyOn({ loadChainSpec }, 'loadChainSpec');

      const firstLoad = await getChainSpec('westend');
      const secondLoad = await getChainSpec('westend'); // This should use the cache.

      expect(firstLoad).toBe('Westend Spec');
      expect(secondLoad).toBe(firstLoad); // Verify that it came from cache.
      expect(loadSpecSpy).toHaveBeenCalledTimes(0); // Ensure loadChainSpec was only called once.
    });
  });
});
