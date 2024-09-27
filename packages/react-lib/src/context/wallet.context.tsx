import {
  type AllWalletAccount,
  type InjectedPolkadotAccount,
  wallet as walletApi,
} from '@polkadot-sufficient-assets/core';
import { useEffect, useRef, useState } from 'react';
import { createSafeContext } from '../lib/create-safe-context';

type WalletContext = {
  connected: boolean;
  connectedWallets: string[];
  accounts: AllWalletAccount;
  account: InjectedPolkadotAccount | null;
  setAccount: (account: InjectedPolkadotAccount | null) => void;
  wallet: string | null;
  setWallet: (account: string | null) => void;
  connect: (walletId: string) => Promise<void>;
  disconnect: (walletId: string) => Promise<void>;
  getInjectedWalletIds: () => string[];
};

const [BaseWalletProvider, useWallet] = createSafeContext<WalletContext>(
  'Wallet context must be used within a WalletProvider'
);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useRef(walletApi).current;

  const [account, setAccount] = useState<InjectedPolkadotAccount | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);

  const [connected, setConnected] = useState(api.isConnected);
  const [accounts, setAccounts] = useState<AllWalletAccount>({});

  // Sync the connected state on mount
  useEffect(() => {
    if (connected) {
      walletApi.getAllConnectedAccounts().then((accounts) => {
        setAccounts(accounts);
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
    <BaseWalletProvider
      value={{
        connectedWallets: api.connectedWalletIds,
        account,
        setAccount,
        wallet,
        setWallet,
        connect,
        disconnect,
        connected,
        accounts,
        getInjectedWalletIds: () => api.getInjectedWalletIds(),
      }}
    >
      {children}
    </BaseWalletProvider>
  );
};

export { useWallet, WalletProvider };
