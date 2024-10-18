import { describe, expect, it } from 'vitest';
import type { StorageAdapter } from '../../../services/wallet/StorageAdapter';

const MockStorage: StorageAdapter = {
  get: () => null,
  remove: () => null,
  set: (_value) => null,
};

describe('StorageAdapter', () => {
  it('should return null when call get method', () => {
    expect(MockStorage.get()).toBeNull();
  });

  it('should return null when call remove method', () => {
    expect(MockStorage.remove()).toBeNull();
  });

  it('should return null when call set method', () => {
    expect(MockStorage.set('abc')).toBeNull();
  });
});
