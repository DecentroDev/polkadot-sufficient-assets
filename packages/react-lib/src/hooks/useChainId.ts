import type { Config, ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { useMemo } from 'react';
import { useConfig } from './useConfig';

type UseChainIdParameter<config extends Config = ResolvedRegister['config']> = config['chains'][number]['id'];

const useChainId = <config extends Config = ResolvedRegister['config']>(chainId: UseChainIdParameter<config>) => {
  const { chains } = useConfig();
  return useMemo(() => chains.find((chain) => chain.id === chainId), [chains, chainId]);
};

export default useChainId;
