export interface StorageAdapter<T = any> {
  get(): T | null;
  set(value: T): void;
  remove(): void;
}
