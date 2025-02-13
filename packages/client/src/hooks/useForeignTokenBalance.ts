import { type Chain, formatBalance, subscribeTokenBalance, type Token } from '@polkadot-sufficient-assets/core';
import { useEffect, useState } from 'react';
import type { TokenBalance } from '../types';
import useApi from './useApi';

export const useForeignTokenBalance = (chain?: Chain, token?: Token, address?: string) => {
  const [balance, setBalance] = useState<TokenBalance>({
    isLoading: true,
    value: 0n,
    valueFormatted: '0',
    error: true,
  });
  const [api, isLoaded] = useApi(chain?.id);

  useEffect(() => {
    if (!address || !isLoaded || !token) return;
    const subscription = subscribeTokenBalance(api, token, address, (balance) => {
      setBalance({
        value: balance ?? 0n,
        isLoading: false,
        valueFormatted: formatBalance(balance?.toString(), token?.decimals ?? 12),
        error: false,
      });
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [address, token, isLoaded]);

  return balance;
};
