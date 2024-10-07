import type { Assign } from '../../types';
import type { Chain } from './chains';

export const createChain = <const chain extends Chain>(chain: chain) => {
  return chain as Assign<Chain, chain>;
};
