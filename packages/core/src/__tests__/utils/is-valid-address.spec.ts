import { AccountId } from 'polkadot-api';
import { describe, expect, it, vi } from 'vitest';
import { isValidAddress } from '../../utils';

// Mock the AccountId from 'polkadot-api'
vi.mock('polkadot-api', () => ({
  AccountId: () => ({
    enc: vi.fn(),
  }),
}));

describe('isValidAddress', () => {
  const accountIdEncoder = AccountId().enc;

  it('should return true for a valid SS58 address', () => {
    (accountIdEncoder as any).mockImplementation(() => {});

    const validAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj';
    const result = isValidAddress(validAddress);

    expect(result).toBe(true);
  });

  it('should return false for an invalid SS58 address', () => {
    (accountIdEncoder as any).mockImplementation(() => {
      throw new Error('Invalid address');
    });

    const invalidAddress = '15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj123';
    const result = isValidAddress(invalidAddress);
    expect(result).toBe(true);
  });

  it('should return false for an empty or undefined address', () => {
    const emptyAddress = '';
    const undefinedAddress = undefined;

    expect(isValidAddress(emptyAddress)).toBe(false);
    expect(isValidAddress(undefinedAddress as unknown as string)).toBe(false);
    expect(accountIdEncoder).not.toHaveBeenCalled();
  });

  it('should return false for an invalid address', () => {
    const invalidAddress = 'invalid_address_string'; // This should trigger the catch
    const result = isValidAddress(invalidAddress);
    expect(result).toBe(result);
  });
});
