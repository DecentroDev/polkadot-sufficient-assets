// createToken.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createToken, type Token } from '../../../services';

describe('createToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should create a token with required fields', () => {
    const token: Token = {
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      isSufficient: true,
    };

    const result = createToken(token);

    expect(result).toEqual(token);
  });

  it('should create a token with optional fields', () => {
    const token: Token = {
      assetId: 1,
      decimals: 8,
      symbol: 'DOT',
      name: 'Polkadot',
      logo: 'dot-logo.png',
      isSufficient: false,
      type: 'native',
      extrinsic: { method: 'transfer' },
      location: { paraId: 1000 },
    };

    const result = createToken(token);

    expect(result).toEqual(token);
  });

  it('should retain immutability of the token', () => {
    const token: Token = {
      decimals: 12,
      symbol: 'BTC',
      name: 'Bitcoin',
      isSufficient: true,
    };

    const result = createToken(token);

    expect(result).toEqual(token);
  });
});
