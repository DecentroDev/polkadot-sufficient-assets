import { type Codec, createClient, type SS58String } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Chain,
  type ChainRelay,
  chains,
  getChainById,
  getClient,
  getParaChainClient,
  getRelayChainClient,
  isRelay,
} from '../../../services';
import { getChainSpec, hasChainSpec } from '../../../services/client/getChainSpec';
import { getScChainProvider } from '../../../services/client/getScChainProvider';
import { getSmChainProvider } from '../../../services/client/getSmChainProvider';
import { isScAvailableScProvider } from '../../../services/client/isScAvailable';

vi.mock(import('polkadot-api'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn(),
    getWsProvider: vi.fn(() => 'mockWsProvider'),
    AccountId: vi.fn(() => '5GrwvaEFiu5H8p8b5rZqQ4f6RexF6p2U6zWkQZopVvGg7Yg' as unknown as Codec<SS58String>),
  };
});

vi.mock(import('polkadot-api/ws-provider/web'), () => ({
  getWsProvider: vi.fn(),
}));

// @ts-ignore
vi.mock(import('../../../services/chains/chains'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getChainById: vi.fn(),
    isRelay: vi.fn(),
  };
});

// @ts-ignore
vi.mock(import('../../../services/client/getChainSpec'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getChainSpec: vi.fn(),
    hasChainSpec: vi.fn(),
  };
});

// Mock other necessary providers
vi.mock(import('../../../services/client/getScChainProvider'), () => ({
  getScChainProvider: vi.fn(),
}));

vi.mock(import('../../../services/client/getSmChainProvider'), () => ({
  getSmChainProvider: vi.fn(),
}));

vi.mock(import('../../../services/client/isScAvailable'), () => ({
  isScAvailableScProvider: vi.fn(),
}));

describe('getClient', () => {
  const mockChainId = chains.westendAssetHubChain.id;
  const mockChain: Chain = chains.westendAssetHubChain;
  const mockChains: Chain[] = [mockChain];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cache and return a client for a relay chain', async () => {
    (getChainById as any).mockReturnValue(mockChain);
    (isRelay as any).mockReturnValue(true);
    (hasChainSpec as any).mockReturnValue(true);
    (createClient as any).mockResolvedValue('mockClient');

    const client1 = await getClient(mockChainId, mockChains, { lightClients: true });
    const client2 = await getClient(mockChainId, mockChains, { lightClients: true });

    expect(client1).toBe(client2);
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('should create a client using the WS provider if lightClients is false', async () => {
    (getChainById as any).mockReturnValue(mockChain);
    (isRelay as any).mockReturnValue(true);
    (hasChainSpec as any).mockReturnValue(false);
    (getWsProvider as any).mockReturnValue('wsProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getClient(mockChainId, mockChains, { lightClients: false });

    expect(createClient).toHaveBeenCalledWith('wsProvider');
  });

  it('should create a client using the substrate-connect provider if available', async () => {
    (getChainById as any).mockReturnValue(mockChain);
    (isRelay as any).mockReturnValue(true);
    (hasChainSpec as any).mockReturnValue(true);
    (getChainSpec as any).mockResolvedValue('chainSpec');
    (isScAvailableScProvider as any).mockResolvedValue(true);
    (getScChainProvider as any).mockReturnValue('scProvider');
    (createClient as any).mockResolvedValue('mockClient');
  });

  it('should create a client for parachains', async () => {
    const mockParaChain = { id: 'paraChain', relay: 'polkadot', wsUrl: 'wss://para.api' };
    (getChainById as any).mockReturnValue(mockParaChain);
    (isRelay as any).mockReturnValue(false);
    (getWsProvider as any).mockReturnValue('scProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getClient(mockParaChain.id, mockChains, { lightClients: true });

    expect(createClient).toHaveBeenCalledWith('scProvider');
  });

  it('should throw an error if a parachain does not have a relay', async () => {
    const mockParaChain = { id: 'paraChain', relay: null, wsUrl: 'wss://para.api' };
    (getChainById as any).mockReturnValue(mockParaChain);

    expect(await getClient(mockParaChain.id, mockChains, { lightClients: true })).toEqual('mockClient');
  });
});

describe('getRelayChainClient', () => {
  const mockChainId = chains.polkadotChain.id;
  const mockChain: ChainRelay = chains.polkadotChain;
  const mockChains: Chain[] = [mockChain];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use WS provider if light clients are disabled', async () => {
    (hasChainSpec as any).mockReturnValue(false);
    (getWsProvider as any).mockReturnValue('wsProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getRelayChainClient(mockChain, { lightClients: false });

    expect(createClient).toHaveBeenCalledWith('wsProvider');
  });

  it('should use Substrate-connect provider if available', async () => {
    (hasChainSpec as any).mockReturnValue(true);
    (getChainSpec as any).mockResolvedValue('chainSpec');
    (isScAvailableScProvider as any).mockResolvedValue(true);
    (getScChainProvider as any).mockReturnValue('scProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getRelayChainClient(mockChain, { lightClients: true });

    expect(createClient).toHaveBeenCalledWith('scProvider');
  });

  it('should fall back to smoldot if Substrate-connect is unavailable', async () => {
    (hasChainSpec as any).mockReturnValue(true);
    (getChainSpec as any).mockResolvedValue('chainSpec');
    (isScAvailableScProvider as any).mockResolvedValue(false);
    (getSmChainProvider as any).mockResolvedValue('smProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getRelayChainClient(mockChain, { lightClients: true });

    expect(createClient).toHaveBeenCalledWith('smProvider');
  });
});

describe('getParaChainClient', () => {
  it('should throw an error if the parachain has no relay', async () => {
    const mockParaChain = { id: 'paraChain', relay: null, wsUrl: 'wss://para.api' };

    await expect(() => getParaChainClient(mockParaChain as Chain, { lightClients: true })).rejects.toThrow(
      `Chain paraChain does not have a relay chain`
    );
  });

  it('should use WS provider if light clients are disabled', async () => {
    const mockParaChain = { id: 'paraChain', relay: 'polkadot', wsUrl: 'wss://para.api' };
    (hasChainSpec as any).mockReturnValue(false);
    (getWsProvider as any).mockReturnValue('wsProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getParaChainClient(mockParaChain as Chain, { lightClients: false });

    expect(createClient).toHaveBeenCalledWith('wsProvider');
  });

  it('should use Substrate-connect if available', async () => {
    const mockParaChain = { id: 'paraChain', relay: 'polkadot', wsUrl: 'wss://para.api' };
    (hasChainSpec as any).mockReturnValue(true);
    (getChainSpec as any).mockResolvedValue('paraChainSpec');
    (isScAvailableScProvider as any).mockResolvedValue(true);
    (getScChainProvider as any).mockReturnValue('scProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getParaChainClient(mockParaChain as Chain, { lightClients: true });

    expect(createClient).toHaveBeenCalledWith('scProvider');
  });

  it('should fall back to smoldot if Substrate-connect is unavailable', async () => {
    const mockParaChain = { id: 'paraChain', relay: 'polkadot', wsUrl: 'wss://para.api' };
    (hasChainSpec as any).mockReturnValue(true);
    (getChainSpec as any).mockResolvedValue('paraChainSpec');
    (isScAvailableScProvider as any).mockResolvedValue(false);
    (getSmChainProvider as any).mockResolvedValue('smProvider');
    (createClient as any).mockResolvedValue('mockClient');

    const client = await getParaChainClient(mockParaChain as Chain, { lightClients: true });

    expect(createClient).toHaveBeenCalledWith('smProvider');
  });
});
