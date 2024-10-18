import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountStorage } from '../../../services/wallet/AccountStorage';

describe('AccountStorage', () => {
  let accountStorage: AccountStorage<string>;
  const mockKey = 'currentAccountId';

  beforeEach(() => {
    accountStorage = new AccountStorage<string>(mockKey);
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });
  it('should retrieve the account id from localStorage', () => {
    accountStorage.set(mockKey);
    const result = accountStorage.get();
    expect(result).toBe(mockKey);
  });

  it('should set the account id in localStorage', () => {
    const mockAccountId = 'newAccountId';
    accountStorage.set(mockAccountId);
    expect(localStorage.setItem).toHaveBeenCalledWith(mockKey, mockAccountId);
  });

  it('should remove the item from localStorage', () => {
    accountStorage.set(mockKey);
    accountStorage.remove();
    const result = localStorage.getItem(mockKey);
    expect(result).toBeNull();
  });
});
