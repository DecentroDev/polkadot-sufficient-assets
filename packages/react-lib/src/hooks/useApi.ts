import { type Api, type Chain, type Config, getApi, type ResolvedRegister } from '@polkadot-sufficient-assets/core';
import React, { useEffect, useState } from 'react';
import { useConfig } from './useConfig';

type UseApiParameter<config extends Config = ResolvedRegister['config']> = config['chains'][number]['id'];

const useApi = <ChainId extends UseApiParameter>(chainId: ChainId) => {
  const [api, setApi] = useState<Api<ChainId>>();
  const [loaded, setLoaded] = useState(false);
  const { chains, lightClients } = useConfig();

  useEffect(() => {
    const execute = async () => {
      try {
        setLoaded(false);
        await getApi(chainId, chains as [Chain], true, lightClients).then((api) => setApi(api));
        setLoaded(true);
      } catch (err) {
        setLoaded(false);
        console.error(err);
      }
    };

    execute();
  }, [chainId, chains]);

  return [api, loaded] as [Api<ChainId>, boolean];
};

export default useApi;
