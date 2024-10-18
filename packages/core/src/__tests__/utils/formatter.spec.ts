import { describe, expect, it } from 'vitest';
import { formatBalance, formatDecimals, parseUnits } from '../../utils';

describe('formatDecimals', () => {
  it('should return empty string for null or undefined', () => {
    expect(formatDecimals(null)).toBe('');
    expect(formatDecimals(undefined)).toBe('');
  });

  it('should return "0" for input 0', () => {
    expect(formatDecimals(0)).toBe('0');
  });

  it('should return "< 0.0001" for numbers smaller than the minimum displayable value', () => {
    expect(formatDecimals(0.00009, 4)).toBe('< 0.0001');
  });

  it('should format large numbers in compact notation', () => {
    expect(formatDecimals(1234567, 2)).toBe('1.2M');
  });

  it('should format small numbers correctly', () => {
    expect(formatDecimals(1234.5678, 3)).toBe('1.23K');
  });

  it('should throw an error for invalid input', () => {
    expect(() => formatDecimals('invalid')).toThrow();
  });
});

describe('formatBalance', () => {
  it('should return "0" for null or undefined balance', () => {
    expect(formatBalance(null)).toBe('0');
    expect(formatBalance(undefined)).toBe('0');
  });

  it('should format balance with default decimals and digits', () => {
    expect(formatBalance('10000000000')).toBe('1');
  });

  it('should format negative balance correctly', () => {
    expect(formatBalance('-10000000000')).toBe('< 0.0001');
  });

  it('should handle balance with fraction and pad zeroes', () => {
    expect(formatBalance('123456789012345', 12, 4)).toBe('123.5');
  });

  it('should trim trailing zeros from fractions', () => {
    expect(formatBalance('1230000000', 9, 4)).toBe('1.23');
  });
});

describe('parseUnits', () => {
  it('should parse integer values correctly', () => {
    expect(parseUnits('123', 4)).toBe(BigInt('1230000'));
  });

  it('should parse fractional values correctly', () => {
    expect(parseUnits('1.23', 2)).toBe(BigInt('123'));
  });

  it('should round fractions correctly when exceeding decimals', () => {
    expect(parseUnits('1.234567', 4)).toBe(BigInt('12346'));
  });

  it('should handle negative values', () => {
    expect(parseUnits('-1.23', 2)).toBe(BigInt('-123'));
  });

  it('should throw an error for invalid format', () => {
    expect(() => parseUnits('abc')).toThrow('Invalid value');
  });

  it('should return value when decimals 0', () => {
    expect(parseUnits('0.99999999999', 1)).toEqual(10n);
  });

  it('should return value when decimals 0', () => {
    expect(parseUnits('0.12345', 3)).toEqual(123n);
  });

  it('should increment integer when fraction rounds up to 1', () => {
    const result = parseUnits('5.9999999999', 0);
    expect(result).toBe(BigInt(6));
  });

  it('should handle negative numbers and increment integer when fraction rounds up to 1', () => {
    const result = parseUnits('-3.9999999999', 0);
    expect(result).toBe(BigInt(-4));
  });

  it('should handle decimal cases without rounding the integer', () => {
    const result = parseUnits('3.0000000001', 0);
    expect(result).toBe(BigInt(3));
  });

  it('should throw an error for invalid value', () => {
    expect(() => parseUnits('invalid', 0)).toThrow('Invalid value');
  });
});
