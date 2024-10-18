import type { StorageAdapter } from './StorageAdapter';

export class AccountStorage<T extends string> implements StorageAdapter<T> {
  private storeKey = 'currentAccountId';

  constructor(storeKey = 'currentAccountId') {
    this.storeKey = storeKey;
  }

  get(): T {
    return localStorage.getItem(this.storeKey) as T;
  }
  set(value: T): void {
    return localStorage.setItem(this.storeKey, value);
  }
  remove(): void {
    return localStorage.removeItem(this.storeKey);
  }
}
