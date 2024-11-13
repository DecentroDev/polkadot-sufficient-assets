import type { JsonRpcProvider } from 'polkadot-api/ws-provider/web';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainId } from '../../../services';
import { getSmChainProvider, loadChain } from '../../../services/client/getSmChainProvider';
import type { SmoldotClient } from '../../../types';

// Mock the module at the top level
vi.mock('polkadot-api/sm-provider', () => ({
  getSmProvider: vi.fn(),
}));

describe('Smoldot Chain Provider', () => {
  let mockSmoldotClient: SmoldotClient;
  const mockChainId: ChainId = 'mockChainId' as ChainId; // Replace 'mockChainId' with an actual value if available
  const mockChainSpec = 'mockChainSpec';
  const mockChain = {}; // This represents the mock chain object

  beforeEach(async () => {
    mockSmoldotClient = {
      addChain: vi.fn().mockResolvedValue(mockChain),
    } as unknown as SmoldotClient;

    // Reset mocks
    vi.mocked((await import('polkadot-api/sm-provider')).getSmProvider).mockReset();
  });

  describe('loadChain', () => {
    it('should add a chain and store the promise in the cache', async () => {
      const result = await loadChain(mockSmoldotClient, { chainId: mockChainId, chainSpec: mockChainSpec });

      expect(mockSmoldotClient.addChain).toHaveBeenCalledWith({
        chainSpec: mockChainSpec,
        potentialRelayChains: undefined,
      });

      expect(result).toBe(mockChain);
    });

    it('should not add the chain again if it is already cached', async () => {
      await loadChain(mockSmoldotClient, { chainId: mockChainId, chainSpec: mockChainSpec });
      await loadChain(mockSmoldotClient, { chainId: mockChainId, chainSpec: mockChainSpec });

      expect(mockSmoldotClient.addChain).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSmChainProvider', async () => {
    it('should return a provider for the chain', async () => {
      const mockProvider: JsonRpcProvider = vi.fn();
      vi.mocked((await import('polkadot-api/sm-provider')).getSmProvider).mockReturnValue(mockProvider);

      const provider = await getSmChainProvider(mockSmoldotClient, {
        chainId: mockChainId,
        chainSpec: mockChainSpec,
      });

      expect(provider).toBe(mockProvider);
    });

    it('should load a relay chain if relayDef is provided', async () => {
      const mockRelayDef = { chainId: 'relayId' as ChainId, chainSpec: 'mockRelaySpec' };
      await getSmChainProvider(mockSmoldotClient, { chainId: mockChainId, chainSpec: mockChainSpec }, mockRelayDef);

      expect(mockSmoldotClient.addChain).toHaveBeenCalledWith({
        chainSpec: mockRelayDef.chainSpec,
        potentialRelayChains: undefined,
      });
    });
  });
});
