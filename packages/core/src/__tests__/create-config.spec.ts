import { describe, expect, it } from 'vitest';
import { createConfig, type Config } from '../create-config';
import { chains, tokens, type Chain } from '../services';

// Sample chain type for testing purposes
const sampleChain: Chain = {
  ...chains.polkadotChain,
};

describe('createConfig', () => {
  it('should create a configuration object with a single chain', () => {
    const config: Config<[typeof sampleChain]> = {
      chains: [sampleChain],
      lightClients: true,
      tokens: {
        chain1: {
          token: tokens.DOT,
          feeTokens: [tokens.USDC],
        },
      },
    };

    const result = createConfig(config);

    expect(result).toEqual(config);
  });

  it('should allow configuration without fee tokens', () => {
    const config: Config<[typeof sampleChain]> = {
      chains: [sampleChain],
      lightClients: false,
      tokens: {
        chain1: {
          token: tokens.DOT,
          feeTokens: [],
        },
      },
    };

    const result = createConfig(config);

    expect(result).toEqual(config);
  });

  it('should create a configuration object without optional fields', () => {
    const config: Config<[typeof sampleChain]> = {
      chains: [sampleChain],
    };

    const result = createConfig(config);

    expect(result).toEqual(config);
  });
});
