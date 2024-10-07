import { formatBalance, type Token } from '@polkadot-sufficient-assets/core';
import { useEffect, useState } from 'react';
import type { TokenBalance } from '../types';
import { useTransfer } from './useTransfer';

export const useTokenBalance = (token?: Token, address?: string) => {
  const [balance, setBalance] = useState<TokenBalance>({
    isLoading: true,
    value: 0n,
    valueFormatted: '0',
  });
  const { api, isLoaded } = useTransfer();

  useEffect(() => {
    if (!address || !isLoaded || !token) return;
    let subscription;
    if (token.type !== 'native' && !!token.assetId) {
      subscription = api.query.Assets.Account.watchValue(token?.assetId, address).subscribe((assetAccount) => {
        setBalance({
          value: assetAccount?.balance ?? 0n,
          isLoading: false,
          valueFormatted: formatBalance(assetAccount?.balance.toString(), token?.decimals ?? 12),
        });
      });
    } else {
      subscription = api.query.System.Account.watchValue(address).subscribe((res) => {
        setBalance({
          isLoading: false,
          value: res?.data.free ?? 0n,
          valueFormatted: formatBalance(res?.data.free.toString(), token?.decimals ?? 12),
        });
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [address, token, isLoaded]);

  return balance;
};
