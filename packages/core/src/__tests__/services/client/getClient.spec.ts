import { createClient } from 'polkadot-api';
import { chainSpec as polkadotChainSpec } from 'polkadot-api/chains/polkadot';
import { chainSpec as polkadotAssetHubChainSpec } from 'polkadot-api/chains/polkadot_asset_hub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Chain, type ChainRelay, chains, type ClientOptions } from '../../../services';
import { CLIENTS_CACHE, getClient } from '../../../services/client/getClient';
import { getSmChainProvider } from '../../../services/client/getSmChainProvider';
vi.mock(import('polkadot-api'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

vi.mock(import('polkadot-api/ws-provider/web'), () => ({
  getWsProvider: vi.fn(),
}));

vi.mock(import('../../../services/client/getSmChainProvider'), () => {
  return {
    getSmChainProvider: vi.fn(),
  };
});

// @ts-ignore
vi.mock(import('../../../services/chains'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

describe('Client Functions', () => {
  let mockChain: Chain = chains.polkadotAssetHubChain;
  let mockRelayChain: ChainRelay = chains.polkadotChain;
  let mockOptions: ClientOptions = {
    lightClients: {
      enable: true,
      smoldot: {
        addChain: vi.fn(),
        terminate: vi.fn(),
      },
      chainSpecs: {
        [chains.polkadotChain.id]: polkadotChainSpec,
        [chains.polkadotAssetHubChain.id]: polkadotAssetHubChainSpec,
        'chain-1': 'spec-1',
        'relay-1': 'relay-spec',
      },
    },
  };

  beforeEach(() => {
    // vi.mocked(getChainById).mockReturnValue(mockChain);
    // vi.mocked(getWsProvider).mockReturnValue({} as any);
    // vi.mocked(getSmChainProvider).mockResolvedValue({} as any);
    // vi.mocked(createClient).mockReturnValue({} as any);

    vi.clearAllMocks();
    CLIENTS_CACHE.clear();
  });

  describe('getClient', () => {
    it('should create a new client if not cached', async () => {
      await getClient(mockChain.id, [mockChain], mockOptions);
      expect(createClient).toHaveBeenCalled();
    });

    it('should return a cached client if available', async () => {
      await getClient(mockChain.id, [mockChain], mockOptions);
      await getClient(mockChain.id, [mockChain], mockOptions);

      expect(createClient).toHaveBeenCalledTimes(1);
    });

    it('should create a new parachain client ', async () => {
      await getClient(chains.polkadotAssetHubChain.id, [chains.polkadotAssetHubChain], mockOptions);
      expect(createClient).toHaveBeenCalled();
    });

    it('should create a new relay chain client ', async () => {
      await getClient(chains.polkadotChain.id, [chains.polkadotChain], mockOptions);

      expect(getSmChainProvider).toHaveBeenCalled();
      expect(createClient).toHaveBeenCalled();
    });

    it('should create a new client with no light clients provided', async () => {
      await getClient(chains.polkadotChain.id, [chains.polkadotChain], { lightClients: undefined });
      expect(getSmChainProvider).not.toHaveBeenCalled();
      expect(createClient).toHaveBeenCalled();
    });

    it('should create a new parachain client with no light clients provided', async () => {
      await getClient(chains.polkadotAssetHubChain.id, [chains.polkadotAssetHubChain], { lightClients: undefined });
      expect(getSmChainProvider).not.toHaveBeenCalled();
      expect(createClient).toHaveBeenCalled();
    });

    it('should throw error if not provided relay chain in chain config', async () => {
      const client = getClient(chains.polkadotAssetHubChain.id, [{ ...chains.polkadotAssetHubChain, relay: null }], {
        lightClients: undefined,
      });
      await expect(client).rejects.toThrowError(`Chain ${chains.polkadotAssetHubChain.id} does not have a relay chain`);
    });
  });
});
