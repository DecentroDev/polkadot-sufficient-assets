import { describe, expect, it } from 'vitest';
import { isTruthy } from '../../utils/is-truthy';

describe('isTruthy', () => {
  it('should return false for undefined', () => {
    expect(isTruthy(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isTruthy(null)).toBe(false);
  });

  it('should return true for truthy values', () => {
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy('hello')).toBe(true);
    expect(isTruthy({})).toBe(true);
    expect(isTruthy([])).toBe(true);
  });

  it('should return true for falsy but defined values', () => {
    expect(isTruthy(0)).toBe(true);
    expect(isTruthy('')).toBe(true);
    expect(isTruthy(false)).toBe(true);
  });
});
