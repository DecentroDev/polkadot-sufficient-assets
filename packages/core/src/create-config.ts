import type { Chain } from './services';

export type Config<Chains extends readonly Chain[] = readonly Chain[]> = {
  readonly chains: Chains;
  readonly lightClients?: boolean;
};

/**
 * Creates a configuration object.
 * @param config - The configuration object.
 * @returns The configuration object.
 */
export const createConfig = <Chains extends readonly Chain[]>(config: Config<Chains>) => {
  return config;
};
