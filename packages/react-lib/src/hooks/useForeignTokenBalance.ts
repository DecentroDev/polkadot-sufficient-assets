import { type Api, type BalancePallet, type Chain, formatBalance, type Token } from '@polkadot-sufficient-assets/core';
import { useEffect, useState } from 'react';
import type { TokenBalance } from '../types';
import useApi from './useApi';

type _Subscription = {
  unsubscribe: () => void;
};

type Subscription = _Subscription | null;

export const useForeignTokenBalance = (chain?: Chain, token?: Token, address?: string) => {
  const [balance, setBalance] = useState<TokenBalance>({
    isLoading: true,
    value: 0n,
    valueFormatted: '0',
  });
  const [api, isLoaded] = useApi(chain?.id);

  useEffect(() => {
    if (!address || !isLoaded || !token) return;
    console.log({ isLoaded, chain });
    let subscription: Subscription | null;
    const chainId = api.chain.id;

    const subscribers: Record<BalancePallet, () => Subscription> = {
      assets: () => {
        const assetId = token.assetIds?.[chainId] ?? token.assetId;
        if (!assetId) return null;
        return (api as Api<'pah'>).query.Assets.Account.watchValue(Number(assetId), address, 'best').subscribe(
          (assetAccount) => {
            const accountBalance = assetAccount?.status.type === 'Liquid' ? assetAccount.balance : 0n;
            setBalance({
              value: accountBalance ?? 0n,
              isLoading: false,
              valueFormatted: formatBalance(accountBalance.toString(), token?.decimals ?? 12),
            });
          }
        );
      },
      system: () => {
        return (api as Api<'pah'>).query.System.Account.watchValue(address, 'best').subscribe((res) => {
          const balance = res.data.free - res.data.frozen;

          setBalance({
            isLoading: false,
            value: balance ?? 0n,
            valueFormatted: formatBalance(balance.toString(), token?.decimals ?? 12),
          });
        });
      },
      balances: () => {
        const assetId = token.assetIds?.[chainId] ?? token.assetId;
        if (!assetId) return null;
        return (api as Api<'hdx'>).query.Balances.Account.watchValue(address, 'best').subscribe((accountBalance) => {
          console.log({ accountBalance });
          const balance = accountBalance.free - accountBalance.frozen;

          setBalance({
            isLoading: false,
            value: balance ?? 0n,
            valueFormatted: formatBalance(balance.toString(), token?.decimals ?? 12),
          });
        });
      },
      tokens: () => {
        const assetId = token.assetIds?.[chainId] ?? token.assetId;
        if (!assetId) return null;
        return (api as Api<'hdx'>).query.Tokens.Accounts.watchValue(address, Number(assetId), 'best').subscribe(
          (accountBalance) => {
            console.log({ accountBalance });
            const balance = accountBalance.free - accountBalance.frozen;

            setBalance({
              isLoading: false,
              value: balance ?? 0n,
              valueFormatted: formatBalance(balance.toString(), token?.decimals ?? 12),
            });
          }
        );
      },
      ormlTokens: () => {
        const assetId = token.assetIds?.[chainId] ?? token.assetId;
        if (!assetId) return null;
        return (api as any).query.OrmlTokens.Accounts.watchValue(address, Number(assetId), 'best').subscribe(
          (res: { frozen: bigint; free: bigint; reserved: bigint; flags: bigint }) => {
            const balance = res.free - res.frozen;

            setBalance({
              isLoading: false,
              value: balance ?? 0n,
              valueFormatted: formatBalance(balance.toString(), token?.decimals ?? 12),
            });
          }
        );
      },
    };

    const balancePallet = token.balancePallet?.[chainId];
    console.log({ balancePallet, chainId });
    if (balancePallet) {
      subscription = subscribers[balancePallet]();
    } else {
      if (token.type !== 'native' && !!token.assetId) {
        subscription = subscribers.assets();
      } else {
        subscription = subscribers.system();
      }
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [address, token, isLoaded]);

  return balance;
};
