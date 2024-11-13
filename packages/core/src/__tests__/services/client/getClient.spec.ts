import { createClient } from 'polkadot-api';
import { chainSpec as polkadotChainspec } from 'polkadot-api/chains/rococo_v2_2';
import { start } from 'polkadot-api/smoldot';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Chain,
  type ChainRelay,
  chains,
  type ClientOptions,
  getChainById,
  getClient,
  getParaChainClient,
  getRelayChainClient,
} from '../../../services';
import { getChainSpec, hasChainSpec } from '../../../services/client/getChainSpec';
import { getSmChainProvider } from '../../../services/client/getSmChainProvider';

const smoldot = start();

vi.mock(import('polkadot-api'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn(),
  };
});
getRelayChainClient;

vi.mock(import('polkadot-api/ws-provider/web'), () => ({
  getWsProvider: vi.fn(),
}));

vi.mock(import('../../../services/client/getSmChainProvider'), () => {
  return {
    getSmChainProvider: vi.fn(),
  };
});

vi.mock(import('../../../services/client/getChainSpec'), () => ({
  getChainSpec: vi.fn(),
  hasChainSpec: vi.fn(),
}));

// @ts-ignore
vi.mock(import('../../../services/chains'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getChainById: vi.fn(),
    isRelay: vi.fn(),
  };
});

const polkadot = await smoldot.addChain({
  chainSpec: polkadotChainspec,
  disableJsonRpc: true,
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
      chainSpecs: { 'chain-1': 'spec-1', 'relay-1': 'relay-spec' },
    },
  };

  beforeEach(() => {
    vi.mocked(getChainById).mockReturnValue(mockChain);
    vi.mocked(getWsProvider).mockReturnValue({} as any);
    vi.mocked(getSmChainProvider).mockResolvedValue({} as any);
    vi.mocked(createClient).mockReturnValue({} as any);
  });

  describe('getClient', () => {
    it('should return a cached client if available', async () => {
      const client1 = await getClient('chain-1', [mockChain], mockOptions);
      const client2 = await getClient('chain-1', [mockChain], mockOptions);

      expect(client1).toBe(client2);
      expect(createClient).toHaveBeenCalledTimes(1);
    });

    it('should create a new client if not cached', async () => {
      await getClient('chain-1', [mockChain], mockOptions);

      expect(createClient).toHaveBeenCalled();
    });
  });

  describe('getRelayChainClient', () => {
    it('should create a client using wsProvider when light clients are disabled', async () => {
      const chain = chains.kusamaChain;
      const options: ClientOptions = { lightClients: { enable: false, smoldot: {} as any, chainSpecs: {} } };

      const mockClient = { someClientProperty: 'value' };
      (createClient as any).mockResolvedValue(mockClient);
      (getWsProvider as any).mockReturnValue('mockProvider');

      const client = await getRelayChainClient(chain, options);

      expect(createClient).toHaveBeenCalledWith('mockProvider');
      expect(client).toBe(mockClient);
    });

    it('should create a client using wsProvider when chainSpec is not available', async () => {
      const chain = chains.kusamaChain;
      const options: ClientOptions = {
        lightClients: {
          enable: true,
          smoldot: {} as any,
          chainSpecs: {},
        },
      };

      (hasChainSpec as any).mockReturnValue(false);
      const mockClient = { someClientProperty: 'value' };
      (createClient as any).mockResolvedValue(mockClient);
      (getWsProvider as any).mockReturnValue('mockProvider');

      const client = await getRelayChainClient(chain, options);

      expect(createClient).toHaveBeenCalledWith('mockProvider');
      expect(client).toBe(mockClient);
    });

    it('should create a client using smoldot when light clients are enabled and chainSpec is available', async () => {
      const chain = chains.kusamaChain;
      const options: ClientOptions = {
        lightClients: {
          enable: true,
          smoldot: {} as any,
          chainSpecs: { chain1: 'chainSpec' },
        },
      };

      (hasChainSpec as any).mockReturnValue(true);
      (getChainSpec as any).mockReturnValue('mockChainSpec');
      const mockSmChainProvider = 'mockSmChainProvider';
      (getSmChainProvider as any).mockResolvedValue(mockSmChainProvider);
      const mockClient = { someClientProperty: 'value' };
      (createClient as any).mockResolvedValue(mockClient);

      const client = await getRelayChainClient(chain, options);

      expect(getChainSpec).toHaveBeenCalledWith(chain.id, options?.lightClients?.chainSpecs);
      expect(createClient).toHaveBeenCalledWith(mockSmChainProvider);
      expect(client).toBe(mockClient);
    });
  });

  describe('getParaChainClient', () => {
    it('should throw an error if relay chain is not available', async () => {
      mockChain.relay = null;
      await expect(getParaChainClient(mockChain, mockOptions)).rejects.toThrow(
        `Chain ${mockChain.id} does not have a relay chain`
      );
    });

    // it('should use ws provider if lightClients are disabled', async () => {
    //   const client = await getParaChainClient(mockChain, {
    //     ...mockOptions,
    //     lightClients: { ...mockOptions.lightClients, enable: false },
    //   });

    //   expect(getWsProvider).toHaveBeenCalledWith(mockChain.wsUrls);
    //   expect(createClient).toHaveBeenCalledWith({ ws: 'mock-ws-provider' });
    // });

    it('should use smoldot provider if enabled and chainSpec is available', async () => {
      vi.mocked(getChainSpec).mockReturnValueOnce('relay-spec').mockReturnValueOnce('spec-1');

      const client = await getParaChainClient(mockRelayChain, mockOptions);

      // expect(getSmChainProvider).toHaveBeenCalledWith(
      //   mockOptions.lightClients?.smoldot,
      //   { chainId: 'chain-1', chainSpec: 'spec-1' },
      //   { chainId: 'relay-1', chainSpec: 'relay-spec' }
      // );
      expect(createClient).toHaveBeenCalledWith({});
    });
  });
});
