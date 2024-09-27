import type { Chain } from './chains';

export type Assign<T, U> = Assign_<T, U> & U;
type Assign_<T, U> = {
  [K in keyof T as K extends keyof U ? (U[K] extends void ? never : K) : K]: K extends keyof U ? U[K] : T[K];
};

export const createChain = <const chain extends Chain>(chain: chain) => {
  return chain as Assign<Chain, chain>;
};
