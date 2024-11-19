import { describe, expect, it } from 'vitest';
import { isValidAddress } from '../../utils';

describe('isValidAddress', () => {
  it('should return true for a valid SS58 address', () => {
    const validAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj';
    const result = isValidAddress(validAddress);

    expect(result).toBe(true);
  });

  it('should return false for an invalid SS58 address', () => {
    const invalidAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj123';
    const result = isValidAddress(invalidAddress);
    expect(result).toBe(false);
  });

  it('should return false for an empty or undefined address', () => {
    const emptyAddress = '';
    const undefinedAddress = undefined;

    expect(isValidAddress(emptyAddress)).toBe(false);
    expect(isValidAddress(undefinedAddress as unknown as string)).toBe(false);
  });
});
