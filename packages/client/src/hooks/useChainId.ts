import type { Config, ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { useMemo } from 'react';
import { useConfig } from './useConfig';

type UseChainIdParameter<config extends Config = ResolvedRegister['config']> = config['sourceChains'][number]['id'];

const useChainId = <config extends Config = ResolvedRegister['config']>(chainId: UseChainIdParameter<config>) => {
  const { sourceChains } = useConfig();
  return useMemo(() => sourceChains.find((chain) => chain.id === chainId), [sourceChains, chainId]);
};

export default useChainId;
