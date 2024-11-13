import { describe, expect, it } from 'vitest';
import { isNumber } from '../../utils';

describe('isNumber', () => {
  it('should return false for an empty string', () => {
    expect(isNumber('')).toBe(false);
  });

  it('should return true for valid integers', () => {
    expect(isNumber('123')).toBe(true);
    expect(isNumber('-456')).toBe(true);
  });

  it('should return true for large valid BigInt values', () => {
    expect(isNumber('900719925474099100000')).toBe(true);
  });

  it('should return false for invalid BigInt strings', () => {
    expect(isNumber('900719925474099100000abc')).toBe(false);
  });
});
