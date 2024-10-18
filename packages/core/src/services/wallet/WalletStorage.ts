import type { StorageAdapter } from './StorageAdapter';

export class WalletStorage<T extends string[]> implements StorageAdapter<T> {
  private storeKey = 'connectedWalletIds';

  constructor(storeKey = 'connectedWalletIds') {
    this.storeKey = storeKey;
  }

  get(): T {
    const itemRaw = localStorage.getItem(this.storeKey);

    return (itemRaw ? JSON.parse(itemRaw) : []) as T;
  }
  set(value: T): void {
    return localStorage.setItem(this.storeKey, JSON.stringify(value));
  }
  remove(): void {
    return localStorage.removeItem(this.storeKey);
  }
}
