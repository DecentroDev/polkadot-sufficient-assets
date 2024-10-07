import { type InjectedPolkadotAccount, wallet as walletApi } from '@polkadot-sufficient-assets/core';
import { createContext, memo, useEffect, useRef, useState } from 'react';

export type IWalletContext = {
  connected: boolean;
  connectedWallets: string[];
  accounts: InjectedPolkadotAccount[];
  signer: InjectedPolkadotAccount | null;
  setSigner: (account: InjectedPolkadotAccount | null) => void;
  connect: (walletId: string) => Promise<void>;
  disconnect: (walletId: string) => Promise<void>;
  getInjectedWalletIds: () => string[];
};

export const WalletContext = createContext<IWalletContext | null>(null);

const WalletProviderBase = ({ children }: { children: React.ReactNode }) => {
  const api = useRef(walletApi).current;

  const [signer, setSigner] = useState<InjectedPolkadotAccount | null>(null);

  const [connected, setConnected] = useState(api.isConnected);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);

  // Sync the connected state on mount
  useEffect(() => {
    if (connected) {
      walletApi.getAllConnectedAccounts().then((accounts) => {
        setAccounts(accounts);
      });

      walletApi.subscribeAccounts((changeAccounts) => {
        const filterDuplicated = changeAccounts.reduce((acc, cur) => {
          if (!accounts.find((x) => x.address === cur.address && x.wallet === cur.wallet)) {
            acc.push(cur);
          }
          return acc;
        }, accounts);

        setAccounts(filterDuplicated);
      });
    }
  }, [connected]);

  // Function to connect a wallet
  const connect = async (walletId: string) => {
    try {
      await api.connect(walletId);
      const accounts = await api.getAllConnectedAccounts();
      setConnected(true);
      setAccounts(accounts);
    } catch (err) {
      console.error('Failed to connect wallet', err);
    }
  };

  // Function to disconnect a wallet
  const disconnect = async (walletId: string) => {
    try {
      await api.disconnect(walletId);
      const connectedAccounts = await api.getAllConnectedAccounts();
      setConnected(api.isConnected);
      setAccounts(connectedAccounts);
    } catch (err) {
      console.error('Failed to disconnect wallet', err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connectedWallets: api.connectedWalletIds,
        signer,
        setSigner,
        connect,
        disconnect,
        connected,
        accounts,
        getInjectedWalletIds: () => api.getInjectedWalletIds(),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProvider = memo(WalletProviderBase);
