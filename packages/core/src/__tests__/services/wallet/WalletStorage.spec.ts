import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletStorage } from '../../../services/wallet/WalletStorage';

describe('WalletStorage', () => {
  const mockKey = 'connectedWalletIds';
  let walletStorage: WalletStorage<string[]>;
  const mockWallets = ['talisman', 'subwallet'];
  beforeEach(() => {
    walletStorage = new WalletStorage<string[]>(mockKey);
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  it('should retrieve the wallet ids from localStorage', () => {
    walletStorage.set(mockWallets);
    const result = walletStorage.get();
    expect(result).toEqual(mockWallets);
  });

  it('should set the wallet ids in localStorage', () => {
    walletStorage.set(mockWallets);
    expect(localStorage.setItem).toHaveBeenCalledWith(mockKey, JSON.stringify(mockWallets));
  });

  it('should remove the wallet item from localStorage', () => {
    walletStorage.remove();
    const result = walletStorage.get();
    expect(result).toEqual([]);
  });
});
