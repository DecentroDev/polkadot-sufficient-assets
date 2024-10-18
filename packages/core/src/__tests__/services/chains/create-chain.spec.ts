import { describe, expect, it } from 'vitest';
import { type Chain, chains, createChain } from '../../../services';

// Define a mock chain object
const mockChain: Chain = {
  ...chains.westendAssetHubChain,
};

describe('createChain', () => {
  it('should return the chain object with the correct structure', () => {
    const result = createChain(mockChain);

    expect(result).toEqual(mockChain);
  });

  it('should preserve the type of the input chain', () => {
    const customChain: Chain = {
      id: 'westend',
      name: 'CustomChain',
      wsUrl: '',
      relay: null,
      paraId: null,
      logo: '',
      stableTokenId: null,
      blockExplorerUrl: null,
    };

    const result = createChain(customChain);

    expect(result).toEqual(customChain);
  });
});
