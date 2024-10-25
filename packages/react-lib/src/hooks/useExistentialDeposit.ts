import { formatBalance, getExistentialDeposit, type Chain, type Token } from '@polkadot-sufficient-assets/core';
import React, { useEffect, useState } from 'react';
import useApi from './useApi';

export const useExistentialDeposit = (chain?: Chain, token?: Token) => {
  const [existentialDeposit, setExistentialDeposit] = useState({
    isLoading: true,
    value: 0n,
    valueFormatted: '0',
  });

  const [api, isLoaded] = useApi(chain?.id);

  useEffect(() => {
    if (!token || !isLoaded) return;
    const run = async () => {
      const min = await getExistentialDeposit(token, api);
      setExistentialDeposit({
        isLoading: false,
        value: min ?? 0n,
        valueFormatted: formatBalance(min, token?.decimals ?? 12),
      });
    };
    run();
  }, [token, isLoaded]);

  return existentialDeposit;
};
