import { describe, expect, it } from 'vitest';
import {
  type Chain,
  chainDestIsBridge,
  chains,
  isParachain,
  isRelayChain,
  isSystemChain,
  parseLocationStrToLocation,
} from '../../../services';

// Test cases for `isSystemChain`
describe('isSystemChain', () => {
  it('should return true for a system chain based on type', () => {
    const chain: Chain = {
      type: 'system',
      chainId: 100,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isSystemChain(chain)).toBe(true);
  });

  it('should return true for a chain with chainId between 1 and 1999', () => {
    const chain: Chain = {
      type: 'system',
      chainId: 1500,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isSystemChain(chain)).toBe(true);
  });

  it('should return false for a chain with chainId 2000 or more', () => {
    const chain: Chain = {
      type: 'relay',
      chainId: 2000,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isSystemChain(chain)).toBe(false);
  });

  // it('should return false for a non-number chainId', () => {
  //   const chain: Chain = {
  //     type: 'relay',
  //     chainId: 'not-a-number',
  //     id: 'polkadot',
  //     name: '',
  //     specName: '',
  //     wsUrls: [],
  //     relay: null,
  //     logo: '',
  //     blockExplorerUrl: null,
  //   };
  //   expect(isSystemChain(chain)).toBe(false);
  // });
});

describe('isParachain', () => {
  it('should return true for a parachain based on type and chainId', () => {
    const chain: Chain = {
      type: 'para',
      chainId: 3000,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isParachain(chain)).toBe(true);
  });

  it('should return false for a chain with chainId 2000 or more', () => {
    const chain: Chain = {
      type: 'system',
      chainId: 2500,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isParachain(chain)).toBe(false);
  });

  it('should return false for a chain with chainId less than 2000', () => {
    const chain: Chain = {
      type: 'system',
      chainId: 1500,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isParachain(chain)).toBe(false);
  });

  it('should return false for a non-number chainId', () => {
    const chain: Chain = {
      type: 'system',
      chainId: null,
      id: 'polkadot',
      name: '',
      specName: '',
      wsUrls: [],
      relay: null,
      logo: '',
      blockExplorerUrl: null,
    };
    expect(isParachain(chain)).toBe(false);
  });
});

// Test cases for `parseLocationStrToLocation`
describe('parseLocationStrToLocation', () => {
  it('should parse a valid JSON string', () => {
    const locationStr = '{"interior": {"X1": {"someKey": "value"}}}';
    expect(parseLocationStrToLocation(locationStr)).toEqual({ interior: { X1: { someKey: 'value' } } });
  });

  it('should throw an error for an invalid JSON string', () => {
    const locationStr = 'invalid-json';
    expect(() => parseLocationStrToLocation(locationStr)).toThrow('Unable to parse invalid-json as a valid location');
  });
});

// Test cases for `chainDestIsBridge`
describe('chainDestIsBridge', () => {
  it('should return true if location includes "globalConsensus" in X1', () => {
    const locationStr = '{"interior": {"X1": {"globalConsensus": "someValue"}}}';
    expect(chainDestIsBridge(locationStr)).toBe(true);
  });

  it('should return true if location includes "globalConsensus" in X2', () => {
    const locationStr = '{"interior": {"X2": {"globalConsensus": "someValue"}}}';
    expect(chainDestIsBridge(locationStr)).toBe(true);
  });

  it('should return false if location does not include "globalConsensus"', () => {
    const locationStr = '{"interior": {"X1": {"someOtherKey": "value"}}}';
    expect(chainDestIsBridge(locationStr)).toBe(false);
  });

  it('should return false for a location without interior', () => {
    const locationStr = '{}';
    expect(chainDestIsBridge(locationStr)).toBe(false);
  });

  it('should return false when interior exists but X1 and X2 are not present', () => {
    const locationStr = '{"interior": {}}';
    expect(chainDestIsBridge(locationStr)).toBe(false);
  });
});

describe('isRelayChain', () => {
  it('should return true when provide relay chain config', () => {
    const chain = chains.polkadotChain;
    expect(isRelayChain(chain)).toBe(true);
  });

  it('should return false when provide parachain chain config', () => {
    const chain = chains.hydration;
    expect(isRelayChain(chain)).toBe(false);
  });
});
