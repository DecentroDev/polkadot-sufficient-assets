import { describe, expect, it } from 'vitest';
import type { TokenBalance } from '../../types';

describe('TokenBalance Interface', () => {
  it('should allow valid values for isLoading, value, valueFormatted, and error', () => {
    const validTokenBalance: TokenBalance = {
      isLoading: false,
      value: BigInt(1000),
      valueFormatted: '1,000',
      error: false,
    };

    expect(validTokenBalance.isLoading).toBe(false);
    expect(validTokenBalance.value).toBe(BigInt(1000));
    expect(validTokenBalance.valueFormatted).toBe('1,000');
    expect(validTokenBalance.error).toBe(false);
  });

  it('should handle missing valueFormatted and error', () => {
    const tokenBalanceWithoutOptionalFields: TokenBalance = {
      isLoading: true,
      value: BigInt(500),
    };

    expect(tokenBalanceWithoutOptionalFields.isLoading).toBe(true);
    expect(tokenBalanceWithoutOptionalFields.value).toBe(BigInt(500));
    expect(tokenBalanceWithoutOptionalFields.valueFormatted).toBeUndefined();
    expect(tokenBalanceWithoutOptionalFields.error).toBeUndefined();
  });
});
