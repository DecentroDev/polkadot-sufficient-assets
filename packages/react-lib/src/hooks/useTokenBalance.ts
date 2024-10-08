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
      subscription = api.query.Assets.Account.watchValue(token?.assetId, address, 'best').subscribe((assetAccount) => {
        const accountBalance = assetAccount?.status.type === 'Liquid' ? assetAccount.balance : 0n;

        setBalance({
          value: accountBalance ?? 0n,
          isLoading: false,
          valueFormatted: formatBalance(accountBalance.toString(), token?.decimals ?? 12),
        });
      });
    } else {
      subscription = api.query.System.Account.watchValue(address, 'best').subscribe((res) => {
        const balance = res.data.free - res.data.frozen;

        setBalance({
          isLoading: false,
          value: balance ?? 0n,
          valueFormatted: formatBalance(balance.toString(), token?.decimals ?? 12),
        });
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [address, token, isLoaded]);

  return balance;
};
