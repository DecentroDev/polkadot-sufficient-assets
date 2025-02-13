import { describe, expect, it } from 'vitest';
import { formatNumberInput, isValidNumber, limitDecimalLength, shortenAddress } from '../../lib/utils';

describe('shortenAddress', () => {
  it('should return empty string for non-string input', () => {
    expect(shortenAddress('')).toBe('');
    // @ts-expect-error
    expect(shortenAddress(123)).toBe('');
  });

  it('should return original address if length is less than 2 * specified length', () => {
    expect(shortenAddress('0x1234', 12)).toBe('0x1234');
  });

  it('should shorten address with default length', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenAddress(address)).toBe('0x1234567890...cdef12345678');
  });

  it('should shorten address with custom length', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenAddress(address, 4)).toBe('0x12...5678');
  });
});

describe('isValidNumber', () => {
  it('should return false for NaN values', () => {
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('abc')).toBe(false);
  });

  it('should return false for numbers starting with 0 followed by non-zero', () => {
    expect(isValidNumber('01')).toBe(false);
    expect(isValidNumber('02345')).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isValidNumber('-1')).toBe(false);
    expect(isValidNumber('-123')).toBe(false);
  });

  it('should return true for valid numbers', () => {
    expect(isValidNumber('0')).toBe(true);
    expect(isValidNumber('1')).toBe(true);
    expect(isValidNumber('123')).toBe(true);
    expect(isValidNumber('0.123')).toBe(true);
    expect(isValidNumber('123.456')).toBe(true);
  });
});

describe('limitDecimalLength', () => {
  it('should return original input for invalid numbers', () => {
    expect(limitDecimalLength('abc')).toBe('abc');
  });

  it('should not modify numbers without decimals', () => {
    expect(limitDecimalLength('123')).toBe('123');
  });

  it('should limit decimal places to default (10) if not specified', () => {
    expect(limitDecimalLength('123.12345678901234')).toBe('123.1234567890');
  });

  it('should limit decimal places to specified length', () => {
    expect(limitDecimalLength('123.456789', 3)).toBe('123.456');
  });

  it('should not modify if decimal places are less than limit', () => {
    expect(limitDecimalLength('123.456', 10)).toBe('123.456');
  });
});

describe('formatNumberInput', () => {
  it('should remove invalid characters from input', () => {
    expect(formatNumberInput('abc123')).toBe('bc123');
  });

  it('should handle numbers greater than 1000000000', () => {
    expect(formatNumberInput('1000000001')).toBe('100000000');
  });

  it('should limit decimal places to default (10)', () => {
    expect(formatNumberInput('123.12345678901234')).toBe('123.1234567890');
  });

  it('should limit decimal places to specified length', () => {
    expect(formatNumberInput('123.456789', 3)).toBe('123.456');
  });

  it('should remove leading zeros followed by non-zero digits', () => {
    expect(formatNumberInput('01234')).toBe('1234');
  });

  it('should remove negative signs', () => {
    expect(formatNumberInput('-123')).toBe('123');
  });

  it('should handle valid decimal numbers', () => {
    expect(formatNumberInput('123.456')).toBe('123.456');
    expect(formatNumberInput('0.123')).toBe('0.123');
  });

  it('should handle zero correctly', () => {
    expect(formatNumberInput('0')).toBe('0');
    expect(formatNumberInput('0.0')).toBe('0.0');
  });
});
