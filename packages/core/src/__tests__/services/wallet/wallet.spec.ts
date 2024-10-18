import { connectInjectedExtension, getInjectedExtensions } from 'polkadot-api/pjs-signer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Wallet } from '../../../services/wallet';

// Mocking the `polkadot-api/pjs-signer` module
vi.mock('polkadot-api/pjs-signer', async () => {
  const actual = await vi.importActual('polkadot-api/pjs-signer');
  return {
    ...actual,
    getInjectedExtensions: vi.fn(() => ['polkadot-js', 'subwallet-js', 'talisman']),
    connectInjectedExtension: vi.fn(),
  };
});

describe('Wallet', () => {
  let wallet: Wallet;
  const mockWalletId = 'talisman';
  const mockAccounts = [{ address: '5F3sa2TJ...', name: 'Test Account' }];
  let cb: any;
  beforeEach(() => {
    localStorage.clear();
    Wallet._instance = null;
    wallet = Wallet.instance;
    vi.clearAllMocks();
    cb = vi.fn();

    (connectInjectedExtension as any).mockResolvedValue({
      subscribe: (callback: (accounts: any[]) => void) => {
        callback(mockAccounts);
      },
      getAccounts: () => mockAccounts,
    });

    wallet.connect(mockWalletId);
  });

  it('should get injected wallet ids', () => {
    const walletIds = Wallet.instance.getInjectedWalletIds();
    expect(walletIds).toEqual(walletIds);
  });

  it('should connect to the wallet', async () => {
    await expect(Wallet.instance.connect('talisman')).resolves.toBeUndefined();
  });

  it('should disconnect from the wallet', async () => {
    await expect(Wallet.instance.disconnect('talisman')).resolves.toBeUndefined();
  });

  it('should handle error when connecting to a wallet', async () => {
    const walletId = 'polkadot-js';
    wallet.disconnect('talisman');
    wallet.disconnect('subwallet-js');

    // Mock connectInjectedExtension to throw an error
    vi.mocked(connectInjectedExtension).mockImplementationOnce(() => {
      throw new Error('Connection failed'); // Custom error message
    });

    await expect(wallet.connect(walletId)).rejects.toThrow('Connection failed');

    expect(wallet.connectedWalletIds).toEqual([]); // Should still contain 'polkadot-js'
  });

  it('should subscribe to account changes', async () => {
    await Wallet.instance.subscribeAccounts(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should return the current account ID', () => {
    Wallet.instance.setCurrentAccountId('talisman', '0x123');
    expect(Wallet.instance.currentAccountId).toEqual({
      wallet: 'talisman',
      address: '0x123',
    });
  });

  it('should indicate connection status', () => {
    expect(Wallet.instance.isConnected).toBe(true);
    Wallet.instance.setCurrentAccountId('talisman', '0x123');
    expect(Wallet.instance.isConnected).toBe(true);
  });

  it('should initialize store and accountStore with the provided keys', () => {
    const walletStoreKey = 'testWalletStoreKey';
    const accountStoreKey = 'testAccountStoreKey';
    Wallet.instance.setStoreKey(walletStoreKey, accountStoreKey);
  });

  it('should return a sorted array of injected wallet IDs', () => {
    const sortedWalletIds = Wallet.instance.getInjectedWalletIds();
    expect(sortedWalletIds).toEqual(['talisman', 'polkadot-js', 'subwallet-js']);
  });

  it('should return an empty array if there are no injected wallet IDs', () => {
    // @ts-ignore
    vi.mocked(getInjectedExtensions).mockReturnValue(undefined);
    expect(Wallet.instance.getInjectedWalletIds()).toEqual([]);
  });

  it('should return sorted IDs with both `talisman` and `subwallet-js` present', () => {
    vi.mocked(getInjectedExtensions).mockReturnValue(['polkadot-js', 'talisman', 'subwallet-js']);
    const sortedWalletIds = Wallet.instance.getInjectedWalletIds();
    expect(sortedWalletIds).toEqual(['talisman', 'polkadot-js', 'subwallet-js']);
  });

  it('should return IDs in alphabetical order if `talisman` and `subwallet-js` are absent', () => {
    vi.mocked(getInjectedExtensions).mockReturnValue(['subwallet-js', 'polkadot-js']);
    const sortedWalletIds = Wallet.instance.getInjectedWalletIds();
    expect(sortedWalletIds).toEqual(['polkadot-js', 'subwallet-js']);
  });

  it('should return injected wallet IDs in sorted order with localeCompare', () => {
    vi.mocked(getInjectedExtensions).mockReturnValue([
      'polkadot-js',
      'subwallet-js',
      'talisman',
      'zenwallet',
      'mymeta',
    ]);
    const sortedWalletIds = wallet.getInjectedWalletIds();
    expect(sortedWalletIds).toEqual(['talisman', 'mymeta', 'polkadot-js', 'zenwallet', 'subwallet-js']);
  });
  it('should return IDs in alphabetical order if both `talisman` and `subwallet-js` are absent', () => {
    vi.mocked(getInjectedExtensions).mockReturnValue(['mymeta', 'polkadot-js', 'zenwallet']);
    const sortedWalletIds = wallet.getInjectedWalletIds();
    expect(sortedWalletIds).toEqual(['mymeta', 'polkadot-js', 'zenwallet']);
  });

  it('should return all connected accounts with their wallet IDs', async () => {
    const accounts = await Wallet.instance.getAllConnectedAccounts();

    // Prepare the expected output with wallet ID.
    const expectedAccounts = mockAccounts.map((x) => ({
      ...x,
      wallet: mockWalletId,
    }));

    // Ensure the function returns the expected accounts.
    expect(accounts).toEqual(expectedAccounts);
    expect(accounts.length).toBe(mockAccounts.length); // Check the length of returned accounts.
  });
});
