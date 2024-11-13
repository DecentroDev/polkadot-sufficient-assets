import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Api,
  type Chain,
  chainDestIsBridge,
  chains,
  isParachain,
  isRelayChain,
  isSystemChain,
} from '../../../services';
import { Direction, establishDirection } from '../../../services/transfer/establishDirection';

// @ts-ignore
vi.mock(import('../../../services'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isParachain: vi.fn(),
    isRelayChain: vi.fn(),
    isSystemChain: vi.fn(),
    chainDestIsBridge: vi.fn(),
  };
});

describe('establishDirection', () => {
  let mockApi: Api<string>;
  let mockDestChain: Chain;

  beforeEach(() => {
    mockApi = {
      chain: { specName: '' },
    } as unknown as Api<string>;

    mockDestChain = {
      chainId: null,
      specName: '',
      interior: {},
    } as unknown as Chain;

    vi.clearAllMocks();
  });

  it('should return SystemToRelay for a system parachain to relay chain', () => {
    mockApi.chain = chains.polkadotAssetHubChain;
    mockDestChain = chains.polkadotChain;
    (isSystemChain as any).mockReturnValueOnce(true); // Origin is system chain
    (isRelayChain as any).mockReturnValueOnce(true);

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.SystemToRelay);
  });

  it('should return SystemToSystem for a system parachain to another system parachain', () => {
    mockApi.chain = chains.polkadotAssetHubChain;
    mockDestChain = chains.polkadotAssetHubChain;
    (isSystemChain as any).mockReturnValueOnce(true).mockReturnValueOnce(true); // Both are system chains

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.SystemToSystem);
  });

  it('should return SystemToPara for a system parachain to a parachain', () => {
    mockApi.chain = chains.paseoAssetHubChain;
    mockDestChain = chains.hydration;
    (isSystemChain as any).mockReturnValueOnce(true); // Origin is system chain
    (isParachain as any).mockReturnValueOnce(true); // Destination is parachain

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.SystemToPara);
  });

  it('should return SystemToBridge for a system parachain to a bridge', () => {
    const bridgeLocation = JSON.stringify({
      interior: {
        X1: {
          globalconsensus: {},
        },
      },
    });
    mockApi.chain = chains.paseoAssetHubChain;
    mockDestChain.chainId = bridgeLocation as any;
    (isSystemChain as any).mockReturnValueOnce(true); // Origin is system chain
    (chainDestIsBridge as any).mockReturnValueOnce(true);

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.SystemToBridge);
  });

  it('should return RelayToSystem for a relay chain to a system parachain', () => {
    mockApi.chain = chains.paseoChain;
    mockDestChain = chains.paseoAssetHubChain;
    (isRelayChain as any).mockReturnValueOnce(true);
    (isSystemChain as any).mockReturnValueOnce(true); // Destination is system chain

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.RelayToSystem);
  });

  it('should return RelayToPara for a relay chain to a parachain', () => {
    mockApi.chain = chains.paseoChain;
    mockDestChain = chains.hydration;
    (isRelayChain as any).mockReturnValueOnce(true);
    (isParachain as any).mockReturnValueOnce(true); // Destination is parachain

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.RelayToPara);
  });

  it('should return RelayToBridge for a relay chain to a bridge', () => {
    const bridgeLocation = JSON.stringify({
      interior: {
        X1: {
          globalconsensus: {},
        },
      },
    });

    mockApi.chain = chains.polkadotChain;
    mockDestChain.chainId = bridgeLocation as any;
    (isRelayChain as any).mockReturnValueOnce(true);
    (chainDestIsBridge as any).mockReturnValueOnce(true);

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.RelayToBridge);
  });

  it('should return ParaToRelay for a parachain to a relay chain', () => {
    mockApi.chain = chains.hydration;
    mockDestChain = chains.kusamaChain;
    (isParachain as any).mockReturnValueOnce(true);
    (isRelayChain as any).mockReturnValueOnce(true);

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.ParaToRelay);
  });

  it('should return ParaToSystem for a parachain to a system parachain', () => {
    mockApi.chain = chains.hydration;
    mockDestChain = chains.kusamaAssetHubChain;
    (isParachain as any).mockReturnValueOnce(true);
    (isSystemChain as any).mockReturnValueOnce(true); // Destination is system chain

    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.ParaToSystem);
  });

  it('should return ParaToPara for a parachain to another parachain', () => {
    (isParachain as any).mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockApi.chain = chains.hydration;
    mockDestChain = chains.hydration;
    const direction = establishDirection(mockApi, mockDestChain);
    expect(direction).toBe(Direction.ParaToPara);
  });

  it('should throw an error for an unknown direction', () => {
    (isSystemChain as any).mockReturnValue(false);
    (isRelayChain as any).mockReturnValue(false);
    (isParachain as any).mockReturnValue(false);
    (chainDestIsBridge as any).mockReturnValue(false);

    expect(() => establishDirection(mockApi, mockDestChain)).toThrow('Could not establish a xcm transaction direction');
  });
});
