import { connectInjectedExtension, getInjectedExtensions, type InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';
import { AccountStorage } from './AccountStorage';
import { WalletStorage } from './WalletStorage';

export type AllWalletAccount = Record<string, InjectedPolkadotAccount[]>;
export type { InjectedPolkadotAccount };
export class Wallet {
  public static _instance: Wallet | null = null;
  private store = new WalletStorage();
  private accountStore = new AccountStorage();

  constructor() {}

  get isConnected() {
    return this.connectedWalletIds.length > 0;
  }

  // Singleton pattern to ensure only one instance
  public static get instance() {
    if (this._instance === null) {
      this._instance = new Wallet();
    }
    return this._instance;
  }

  setStoreKey(walletStoreKey: string, accountStoreKey: string) {
    this.store = new WalletStorage(walletStoreKey);
    this.accountStore = new AccountStorage(accountStoreKey);
  }

  public get currentAccountId() {
    const accountWithWallet = this.accountStore.get();
    if (!accountWithWallet) return null;

    const [wallet, address] = accountWithWallet.split(':');

    return { wallet, address };
  }

  public get connectedWalletIds() {
    return this.store.get() ?? [];
  }

  setCurrentAccountId(wallet: string, address: string) {
    const accountWithWallet = wallet + ':' + address;
    this.accountStore.set(accountWithWallet);
  }

  getInjectedWalletIds() {
    return (
      getInjectedExtensions()
        ?.concat()
        .sort((a: string, b: string) => {
          if (a === 'talisman' || b === 'subwallet-js') return -1;
          if (b === 'talisman' || a === 'subwallet-js') return 1;
          return a.localeCompare(b);
        }) ?? []
    );
  }

  async connect(walletId: string) {
    try {
      await connectInjectedExtension(walletId);
      const walletIds = new Set([...this.connectedWalletIds, walletId]);
      this.store.set(Array.from(walletIds));
    } catch (err) {
      this.store.set(this.connectedWalletIds.filter((id) => id !== walletId));
      throw err;
    }
  }

  async disconnect(walletId: string) {
    const walletIds = this.connectedWalletIds.filter((id) => id !== walletId);
    this.store.set(walletIds);
  }

  async getAllConnectedAccounts(): Promise<AllWalletAccount> {
    const accounts: Record<string, InjectedPolkadotAccount[]> = {};
    for (const walletId of this.connectedWalletIds) {
      const wallet = await connectInjectedExtension(walletId);
      const accountFromWallet = wallet.getAccounts();
      accounts[walletId] = accountFromWallet;
    }
    return accounts;
  }
}

export const wallet = Wallet.instance;
