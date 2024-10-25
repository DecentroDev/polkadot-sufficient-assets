import { getAssetPalletByChain } from '../../utils';
import type { Api } from '../api';
import type { ChainId } from '../chains';
import type { AssetPallet, Token } from './create-token';

type _Subscription = {
  unsubscribe: () => void;
};

type Subscription = _Subscription | null;

export const subscribeTokenBalance = (
  api?: Api<ChainId>,
  token?: Token,
  address?: string,
  cb?: (balance: bigint) => void
) => {
  if (!address || !api || !token) return;
  let subscription: Subscription | null;
  const chainId = api.chainId;

  const subscribers: Record<AssetPallet, () => Subscription> = {
    assets: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'pah'>).query.Assets.Account.watchValue(Number(assetId), address, 'best').subscribe(
        (assetAccount) => {
          const balance = assetAccount?.status.type === 'Liquid' ? assetAccount.balance : 0n;
          cb?.(balance);
        }
      );
    },
    system: () => {
      return (api as Api<'pah'>).query.System.Account.watchValue(address, 'best').subscribe((res) => {
        const balance = res.data.free - res.data.frozen;
        cb?.(balance);
      });
    },
    balances: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'hdx'>).query.Balances.Account.watchValue(address, 'best').subscribe((accountBalance) => {
        const balance = accountBalance.free - accountBalance.frozen;
        cb?.(balance);
      });
    },
    tokens: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'hdx'>).query.Tokens.Accounts.watchValue(address, Number(assetId), 'best').subscribe(
        (accountBalance) => {
          const balance = accountBalance.free - accountBalance.frozen;
          cb?.(balance);
        }
      );
    },
    ormlTokens: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as any).query.OrmlTokens.Accounts.watchValue(address, Number(assetId), 'best').subscribe(
        (res: { frozen: bigint; free: bigint; reserved: bigint; flags: bigint }) => {
          const balance = res.free - res.frozen;
          cb?.(balance);
        }
      );
    },
  };

  const assetPallet = getAssetPalletByChain(token, chainId);

  if (assetPallet) {
    subscription = subscribers[assetPallet]();
  } else {
    if (token.type !== 'native' && !!token.assetId) {
      subscription = subscribers.assets();
    } else {
      subscription = subscribers.system();
    }
  }
  return subscription;
};

export const getTokenBalance = async (api?: Api<ChainId>, token?: Token, address?: string) => {
  if (!address || !api || !token) return;
  const chainId = api.chainId;

  const subscribers: Record<AssetPallet, () => Promise<bigint | null> | null> = {
    assets: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'pah'>).query.Assets.Account.getValue(Number(assetId), address, {
        at: 'best',
      }).then((assetAccount) => {
        return assetAccount?.status.type === 'Liquid' ? assetAccount.balance : 0n;
      });
    },
    system: () => {
      return (api as Api<'pah'>).query.System.Account.getValue(address, {
        at: 'best',
      }).then((res) => {
        return res.data.free - res.data.frozen;
      });
    },
    balances: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'hdx'>).query.Balances.Account.getValue(address, {
        at: 'best',
      }).then((accountBalance) => {
        return accountBalance.free - accountBalance.frozen;
      });
    },
    tokens: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as Api<'hdx'>).query.Tokens.Accounts.getValue(address, Number(assetId), {
        at: 'best',
      }).then((accountBalance) => {
        return accountBalance.free - accountBalance.frozen;
      });
    },
    ormlTokens: () => {
      const assetId = token.assetIds?.[chainId] ?? token.assetId;
      if (!assetId) return null;
      return (api as any).query.OrmlTokens.Accounts.getValue(address, Number(assetId), { at: 'best' }).then(
        (res: { frozen: bigint; free: bigint; reserved: bigint; flags: bigint }) => {
          return res.free - res.frozen;
        }
      );
    },
  };

  const assetPallet = getAssetPalletByChain(token, chainId);

  if (assetPallet) {
    return subscribers[assetPallet]();
  } else {
    if (token.type !== 'native' && !!token.assetId) {
      return subscribers.assets();
    } else {
      return subscribers.system();
    }
  }
};
