/**
 * * Currently we only support 1 chain only, We will update it later
 */

import type { Chain } from './services';
import type { Token } from './services/tokens/create-token';

export type TokenConfig = {
  token: Token;
  feeTokens: Token[];
};

export type Config<Chains extends readonly [Chain] = readonly [Chain]> = {
  readonly chains: Chains;
  readonly lightClients?: boolean;
  readonly tokens?: Partial<Record<Chains[number]['id'], TokenConfig>>;
  readonly useXcmTransfer?: boolean;
  readonly xcmChains?: Chain[];
};

/**
 * Creates a configuration object.
 * @param config - The configuration object.
 * @returns The configuration object.
 */
export const createConfig = <Chains extends readonly [Chain]>(config: Config<Chains>) => {
  return config;
};
