import type { Config, ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { useMemo } from 'react';
import { useConfig } from './useConfig';

type UseTokenParameter<config extends Config = ResolvedRegister['config']> = config['chains'][number]['id'];

export const useToken = <config extends Config = ResolvedRegister['config']>(chainId: UseTokenParameter<config>) => {
  const { tokens } = useConfig();

  return useMemo(() => {
    if (!tokens)
      return {
        token: undefined,
        feeTokens: [],
      };

    return {
      token: tokens[chainId]?.token,
      feeTokens: tokens[chainId]?.feeTokens,
    };
  }, [tokens, chainId]);
};
