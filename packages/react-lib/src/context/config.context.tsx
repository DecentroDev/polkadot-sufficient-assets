import type { Config, ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { createContext, useContext } from 'react';

const ConfigContext = createContext<ResolvedRegister['config'] | null>(null);

type UseConfigReturnType<config extends Config = Config> = config;

export function useConfig<config extends Config = ResolvedRegister['config']>(): UseConfigReturnType<config> {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('Config not found');
  return config as UseConfigReturnType<config>;
}

export interface ConfigProvider {
  config: ResolvedRegister['config'];
  children: React.ReactNode;
}

export const ConfigProvider = ({ children, config }: ConfigProvider) => (
  <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
);
