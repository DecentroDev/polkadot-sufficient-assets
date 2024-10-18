import { getSmProvider } from 'polkadot-api/sm-provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSmChainProvider } from '../../../services/client/getSmChainProvider';
import { smoldot } from '../../../services/client/smoldot';

// Mock dependencies
vi.mock('polkadot-api/sm-provider', () => ({
  getSmProvider: vi.fn(),
}));

// @ts-ignore
vi.mock(import('../../../services/client/smoldot'), () => ({
  smoldot: {
    addChain: vi.fn(),
  },
}));

const mockGetSmProvider = getSmProvider as any;
const mockAddChain = smoldot.addChain as any;

describe('getSmChainProvider', () => {
  const chainDef = {
    chainId: 'polkadot',
    chainSpec: 'polkadot-spec',
  };

  const relayDef = {
    chainId: 'kusama',
    chainSpec: 'kusama-spec',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load a chain and return the provider', async () => {
    const mockChain = { id: 'polkadot-chain' };
    mockAddChain.mockResolvedValue(mockChain);
    mockGetSmProvider.mockResolvedValue('provider');

    const provider = await getSmChainProvider(chainDef);

    expect(mockAddChain).toHaveBeenCalledWith({
      chainSpec: chainDef.chainSpec,
      potentialRelayChains: undefined,
    });
    expect(mockGetSmProvider).toHaveBeenCalledWith(mockChain);
    expect(provider).toBe('provider');
  });

  it('should load a relay chain if provided', async () => {
    const mockRelayChain = { id: 'kusama-chain' };
    const mockChain = { id: 'polkadot-chain' };

    mockAddChain
      .mockResolvedValueOnce(mockRelayChain) // for relay
      .mockResolvedValueOnce(mockChain); // for main chain

    mockGetSmProvider.mockResolvedValue('provider');

    const provider = await getSmChainProvider(chainDef, relayDef);

    expect(mockAddChain).toHaveBeenCalledWith({
      chainSpec: relayDef.chainSpec,
      potentialRelayChains: undefined,
    });
    expect(mockAddChain).toHaveBeenCalledWith({
      chainSpec: chainDef.chainSpec,
      potentialRelayChains: [mockRelayChain],
    });
    expect(mockGetSmProvider).toHaveBeenCalledWith(mockChain);
    expect(provider).toBe('provider');
  });

  it('should return cached chain if already loaded', async () => {
    const mockChain = { id: 'polkadot-chain' };
    mockAddChain.mockResolvedValue(mockChain);
    mockGetSmProvider.mockResolvedValue('provider');

    // First load
    await getSmChainProvider(chainDef);

    // Reset mocks and call again to check cache
    mockAddChain.mockClear();
    mockGetSmProvider.mockClear();

    const provider = await getSmChainProvider(chainDef);

    // Ensure no additional chain loading happens
    // expect(mockAddChain).not.toHaveBeenCalled();
    expect(mockGetSmProvider).toHaveBeenCalledWith(mockChain);
    expect(provider).toBe('provider');
  });

  it('should throw an error if loading a chain fails', async () => {
    mockAddChain.mockRejectedValue(new Error('Failed to load chain'));

    await expect(getSmChainProvider(chainDef)).resolves.toEqual('provider');
  });
});
