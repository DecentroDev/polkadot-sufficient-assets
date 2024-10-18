import { getSyncProvider } from '@polkadot-api/json-rpc-provider-proxy';
import { createScClient, WellKnownChain } from '@substrate/connect';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chains } from '../../../services';
import { getScChainProvider, getWellKnownChain, noop } from '../../../services/client/getScChainProvider';
import { mockChainSpecs } from './getChainSpec.spec';

vi.mock('@polkadot-api/json-rpc-provider-proxy', () => ({
  getSyncProvider: vi.fn(),
}));

vi.mock('@substrate/connect', () => {
  const actual = vi.importActual('@substrate/connect');
  return {
    ...actual,
    createScClient: vi.fn(),
    WellKnownChain: {
      polkadot: 'polkadot',
      rococo_v2_2: 'rococo',
      westend2: 'westend',
      ksmcc3: 'kusama',
      paseo: 'paseo',
    },
  };
});

describe('getScChainProvider', () => {
  const mockChainId = chains.polkadotChain.id;
  const mockRelayChainId = chains.kusamaChain.id;
  const mockChainSpec = mockChainSpecs.polkadot;
  const mockClient = {
    addWellKnownChain: vi.fn(),
    addChain: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createScClient as any).mockReturnValue(mockClient);
    (getSyncProvider as any).mockImplementation((callback: any) => callback());
  });

  const setupAddWellKnownChainMock = async (wellKnownChain: any) => {
    mockClient.addWellKnownChain.mockResolvedValueOnce({
      addChain: vi.fn().mockResolvedValue({
        sendJsonRpc: vi.fn(),
        remove: vi.fn(),
      }),
    });
    return wellKnownChain;
  };

  it('should create a client and return a sync provider for a well-known chain', async () => {
    await setupAddWellKnownChainMock(WellKnownChain.polkadot);

    const provider = await getScChainProvider({ chainId: mockChainId, chainSpec: mockChainSpec });

    expect(createScClient).toHaveBeenCalledTimes(1);
    expect(getSyncProvider).toHaveBeenCalled();
    expect(provider).toBeDefined();
  });

  it('should handle adding a relay chain and then a chain', async () => {
    await setupAddWellKnownChainMock(WellKnownChain.ksmcc3);

    const provider = await getScChainProvider({
      chainId: mockChainId,
      relayChainId: mockRelayChainId,
      chainSpec: mockChainSpec,
    });

    expect(mockClient.addWellKnownChain).toHaveBeenCalledWith(WellKnownChain.ksmcc3);
    expect(mockClient.addWellKnownChain).toHaveBeenCalledTimes(1);
    expect(provider).toBeDefined();
  });

  it('should handle a non-well-known chain', async () => {
    mockClient.addChain.mockResolvedValueOnce({
      sendJsonRpc: vi.fn(),
      remove: vi.fn(),
    });

    const provider = await getScChainProvider({ chainId: 'non-well-known', chainSpec: mockChainSpec });

    expect(mockClient.addChain).toHaveBeenCalledWith(mockChainSpec, expect.any(Function));
    expect(provider).toBeDefined();
  });

  it('should throw an error if adding a chain fails', async () => {
    mockClient.addWellKnownChain.mockRejectedValue(new Error('Failed to add well-known chain'));

    await expect(getScChainProvider({ chainId: mockChainId, chainSpec: mockChainSpec })).rejects.toThrow(
      'Failed to add well-known chain'
    );
  });

  it('should handle onMessage and disconnect correctly', async () => {
    const sendJsonRpcMock = vi.fn();
    const removeMock = vi.fn();
    let onMessageCallback: (msg: string) => void;

    const mockChainInstance = {
      sendJsonRpc: sendJsonRpcMock,
      remove: removeMock,
    };

    mockClient.addWellKnownChain.mockResolvedValueOnce({
      addChain: vi.fn().mockImplementation((_spec, onMessage) => {
        onMessageCallback = onMessage;
        return Promise.resolve(mockChainInstance);
      }),
    });

    const provider = await getScChainProvider({
      chainId: 'polkadot',
      chainSpec: mockChainSpec,
      relayChainId: mockRelayChainId,
    });
    const mockListener = vi.fn();
    const { send, disconnect } = provider(mockListener, () => {});
    send('{"jsonrpc":"2.0","method":"ping"}');
    expect(sendJsonRpcMock).toHaveBeenCalledWith('{"jsonrpc":"2.0","method":"ping"}');
    // @ts-ignore
    onMessageCallback('test-message');
    expect(mockListener).toHaveBeenCalledWith('test-message');
    disconnect();
    expect(removeMock).toHaveBeenCalled();
  });
});

describe('getWellKnownChain', () => {
  it('should return if case rococo_v2_2 chain', async () => {
    const result = getWellKnownChain(WellKnownChain.rococo_v2_2);
    expect(result).toEqual(WellKnownChain.rococo_v2_2);
  });

  it('should return if case westend2 chain', async () => {
    const result = getWellKnownChain(WellKnownChain.westend2);
    expect(result).toEqual(WellKnownChain.westend2);
  });

  it('should return if case paseo chain', async () => {
    const result = getWellKnownChain(WellKnownChain.paseo);
    expect(result).toEqual(WellKnownChain.paseo);
  });

  it('should return null if incorrect chain', async () => {
    const result = getWellKnownChain('abc');
    expect(result).toBeNull();
  });

  it('should return undefined if call noop', () => {
    const result = noop();
    expect(result).toBeUndefined();
  });
});
