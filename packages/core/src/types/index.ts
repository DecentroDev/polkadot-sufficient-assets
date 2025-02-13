export * from './register';
import type { Client } from 'polkadot-api/smoldot';

export type SmoldotClient = Client;

type Assign_<T, U> = {
  [K in keyof T as K extends keyof U ? (U[K] extends void ? never : K) : K]: K extends keyof U ? U[K] : T[K];
};

export type Assign<T, U> = Assign_<T, U> & U;

export type StringWithDefault = 'DEFAULT' & (string | {});
