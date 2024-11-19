import { describe, expect, it } from 'vitest';
import {
  type Chain,
  DESCRIPTORS_ALL,
  getChainById,
  getDescriptors,
  isChainIdAssetHub,
  isChainIdRelay,
} from '../../../services';

// Mock Chains
const mockChains: Chain[] = [
  {
    id: 'pah',
    name: 'Polkadot Asset Hub',
    specName: 'pah',
    wsUrls: ['wss://pah.polkadot.io'],
    relay: 'polkadot',
    chainId: 1000,
    logo: 'pah-logo.png',
    type: 'system',
    blockExplorerUrl: null,
  },
  {
    id: 'kusama',
    name: 'Kusama',
    specName: 'kusama',
    wsUrls: ['wss://kusama-rpc.polkadot.io'],
    relay: null,
    chainId: null,
    logo: 'kusama-logo.png',
    type: 'relay',
    blockExplorerUrl: null,
  },
];

describe('Chains', () => {
  it('should correctly identify a ChainIdAssetHub', () => {
    expect(isChainIdAssetHub('pah')).toBe(true);
    expect(isChainIdAssetHub('unknown')).toBe(false);
    expect(isChainIdAssetHub(1)).toBe(false);
  });

  it('should correctly identify a ChainIdRelay', () => {
    expect(isChainIdRelay('kusama')).toBe(true);
    expect(isChainIdRelay('unknown')).toBe(false);
  });

  it('should retrieve the correct descriptor using getDescriptors', () => {
    expect(getDescriptors('pah')).toBe(DESCRIPTORS_ALL['pah']);
    expect(getDescriptors('unknown')).toBeUndefined();
  });
});

describe('Chain Utility Functions', () => {
  it('should retrieve a chain by ID using getChainById', () => {
    const chain = getChainById<Chain>('pah', mockChains);
    expect(chain.name).toBe('Polkadot Asset Hub');
  });

  it('should throw an error if getChainById does not find a chain', () => {
    expect(() => getChainById<Chain>('unknown', mockChains)).toThrow('Could not find chain unknown');
  });

  // it('should correctly identify a chain as Asset Hub', () => {
  //   const pahChain = getChainById<Chain>('pah', mockChains);
  //   expect(isAssetHub(pahChain)).toBe(true);
  // });

  // it('should correctly identify a chain as Relay', () => {
  //   const kusamaChain = getChainById<Chain>('kusama', mockChains);
  //   expect(isRelay(kusamaChain)).toBe(true);
  // });

  // it('should not identify a non-Asset Hub chain as Asset Hub', () => {
  //   const kusamaChain = getChainById<Chain>('kusama', mockChains);
  //   expect(isAssetHub(kusamaChain)).toBe(false);
  // });

  // it('should not identify a non-Relay chain as Relay', () => {
  //   const pahChain = getChainById<Chain>('pah', mockChains);
  //   expect(isRelay(pahChain)).toBe(false);
  // });
});
