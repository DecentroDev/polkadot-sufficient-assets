import type { Config, ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { useContext } from 'react';
import { ConfigContext } from '../context/config.context';

type UseConfigReturnType<config extends Config = Config> = config;

export function useConfig<config extends Config = ResolvedRegister['config']>(): UseConfigReturnType<config> {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('Config not found');
  return config as UseConfigReturnType<config>;
}
