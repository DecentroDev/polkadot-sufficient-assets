import { describe, expect, it } from 'vitest';
import {
  type Chain,
  type ChainAssetHub,
  type ChainRelay,
  DESCRIPTORS_ALL,
  getChainById,
  getDescriptors,
  isAssetHub,
  isChainIdAssetHub,
  isChainIdRelay,
  isRelay,
} from '../../../services';

const mockChains: Chain[] = [
  {
    id: 'pah',
    name: 'Pah Chain',
    wsUrl: 'wss://pah.chain',
    relay: 'polkadot',
    paraId: 1000,
    logo: '',
    stableTokenId: null,
    blockExplorerUrl: '',
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    wsUrl: 'wss://polkadot.api.onfinality.io/public-ws',
    relay: null,
    paraId: null,
    logo: '',
    stableTokenId: null,
    blockExplorerUrl: '',
  },
];

describe('Chain Descriptors', () => {
  it('should have all descriptors defined', () => {
    expect(DESCRIPTORS_ALL).toBeDefined();
    expect(Object.keys(DESCRIPTORS_ALL)).toContain('polkadot');
    expect(Object.keys(DESCRIPTORS_ALL)).toContain('pah');
  });

  it('should validate ChainIdAssetHub correctly', () => {
    expect(isChainIdAssetHub('pah')).toBe(true);
    expect(isChainIdAssetHub('invalid')).toBe(false);
  });

  it('should validate ChainIdRelay correctly', () => {
    expect(isChainIdRelay('polkadot')).toBe(true);
    expect(isChainIdRelay('invalid')).toBe(false);
  });

  it('should return descriptors for valid ChainId', () => {
    expect(getDescriptors('pah')).toBeDefined();
    expect(getDescriptors('polkadot')).toBeDefined();
    expect(getDescriptors('invalid')).toBeUndefined();
  });

  it('should retrieve the correct chain by ID', () => {
    const chain = getChainById<Chain>('pah', mockChains);
    expect(chain.id).toEqual('pah');
    expect(() => getChainById<Chain>('invalid', mockChains)).toThrowError('Could not find chain invalid');
  });

  it('should identify AssetHub chains correctly', () => {
    const chainAssetHub: ChainAssetHub = {
      id: 'pah',
      name: 'Pah Chain',
      wsUrl: 'wss://pah.chain',
      relay: 'polkadot',
      paraId: 1000,
      logo: '',
      stableTokenId: null,
      blockExplorerUrl: '',
    };
    const chainRelay: ChainRelay = {
      id: 'polkadot',
      name: 'Polkadot',
      wsUrl: 'wss://polkadot.api.onfinality.io/public-ws',
      relay: null,
      paraId: null,
      logo: '',
      stableTokenId: null,
      blockExplorerUrl: '',
    };

    expect(isAssetHub(chainAssetHub)).toBe(true);
    expect(isAssetHub(chainRelay)).toBe(false);
  });

  it('should identify Relay chains correctly', () => {
    const chainAssetHub: ChainAssetHub = {
      id: 'pah',
      name: 'Pah Chain',
      wsUrl: 'wss://pah.chain',
      relay: 'polkadot',
      paraId: 1000,
      logo: '',
      stableTokenId: null,
      blockExplorerUrl: '',
    };
    const chainRelay: ChainRelay = {
      id: 'polkadot',
      name: 'Polkadot',
      wsUrl: 'wss://polkadot.api.onfinality.io/public-ws',
      relay: null,
      paraId: null,
      logo: '',
      stableTokenId: null,
      blockExplorerUrl: '',
    };

    expect(isRelay(chainRelay)).toBe(true);
    expect(isRelay(chainAssetHub)).toBe(false);
  });
});
