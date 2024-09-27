import type { Config } from '../create-config';

export interface Register {}
export type ResolvedRegister = {
  config: Register extends { config: infer config extends Config } ? config : Config;
};
