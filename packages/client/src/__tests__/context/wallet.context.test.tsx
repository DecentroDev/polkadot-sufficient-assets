import type { InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import { wallet as walletApi } from '@polkadot-sufficient-assets/core';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletContext, WalletProvider } from '../../context/wallet.context';

vi.mock('@polkadot-sufficient-assets/core', () => ({
  wallet: {
    isConnected: false,
    connectedWalletIds: [],
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAllConnectedAccounts: vi.fn(),
    getInjectedWalletIds: vi.fn(),
    subscribeAccounts: vi.fn(),
  },
}));

describe('WalletProvider', () => {
  const mockAccounts: InjectedPolkadotAccount[] = [
    {
      address: '0x123',
      wallet: 'wallet-1',
      polkadotSigner: {
        publicKey: new Uint8Array([1, 2, 3]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    },
    {
      address: '0x456',
      wallet: 'wallet-2',
      polkadotSigner: {
        publicKey: new Uint8Array([4, 5, 6]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    },
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();

    vi.mocked(walletApi.getAllConnectedAccounts).mockResolvedValue([]);
    vi.mocked(walletApi.getInjectedWalletIds).mockReturnValue(['wallet-1', 'wallet-2']);
    vi.mocked(walletApi.subscribeAccounts).mockImplementation((callback: any) => {
      callback?.([]);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const TestConsumer = () => {
    const context = useContext(WalletContext);
    return (
      <div>
        <div data-testid='connected'>{context?.connected.toString()}</div>
        <div data-testid='accounts'>{context?.accounts.length}</div>
        <button onClick={() => context?.connect('wallet-1')}>Connect</button>
        <button onClick={() => context?.disconnect('wallet-1')}>Disconnect</button>
        <button data-testid='set-signer' onClick={() => context?.setSigner(mockAccounts[1])}>
          Set signer
        </button>
        <p data-testid='signer'>{context?.signer?.address}</p>
      </div>
    );
  };

  it('should render children', () => {
    const { getByText } = render(
      <WalletProvider>
        <div>Test Child</div>
      </WalletProvider>
    );
    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should provide initial context values', () => {
    const TestComponent = () => {
      const context = useContext(WalletContext);
      expect(context).toEqual({
        connected: false,
        connectedWallets: [],
        accounts: [],
        signer: null,
        setSigner: expect.any(Function),
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        getInjectedWalletIds: expect.any(Function),
      });
      return null;
    };

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
  });

  it('should handle successful wallet connection', async () => {
    vi.spyOn(walletApi, 'connect').mockResolvedValue(undefined);
    vi.spyOn(walletApi, 'getAllConnectedAccounts').mockResolvedValue(mockAccounts);

    const TestComponent = () => {
      const context = useContext(WalletContext);
      return <button onClick={() => context?.connect('wallet-1')}>Connect</button>;
    };

    const { getByText } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    const button = getByText('Connect');
    fireEvent.click(button);

    await waitFor(async () => {
      expect(walletApi.connect).toHaveBeenCalledWith('wallet-1');
      expect(walletApi.getAllConnectedAccounts).toHaveBeenCalled();
    });
  });

  it('should handle failed wallet connection', async () => {
    vi.mocked(walletApi.connect).mockRejectedValue(new Error('Connection failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponent = () => {
      const context = useContext(WalletContext);
      return <button onClick={() => context?.connect('wallet1')}>Connect</button>;
    };

    const { getByText } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    const button = getByText('Connect');
    fireEvent.click(button);

    await waitFor(async () => {
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  it('should handle wallet disconnection', async () => {
    vi.mocked(walletApi.disconnect).mockResolvedValue(undefined);
    vi.mocked(walletApi.getAllConnectedAccounts).mockResolvedValue([]);

    const TestComponent = () => {
      const context = useContext(WalletContext);
      return <button onClick={() => context?.disconnect('wallet-1')}>Disconnect</button>;
    };

    const { getByText } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    const button = getByText('Disconnect');
    fireEvent.click(button);

    await waitFor(async () => {
      expect(walletApi.disconnect).toHaveBeenCalledWith('wallet-1');
      expect(walletApi.getAllConnectedAccounts).toHaveBeenCalled();
    });
  });

  it('should update accounts when connected', async () => {
    (walletApi.isConnected as boolean) = true;
    vi.mocked(walletApi.getAllConnectedAccounts).mockResolvedValue(mockAccounts);
    vi.mocked(walletApi.subscribeAccounts).mockImplementation((callback) => {
      callback(mockAccounts);
      return Promise.resolve();
    });

    const { getByTestId } = render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(getByTestId('accounts')).toHaveTextContent('2');
    });
  });

  it('should handle signer updates', () => {
    const { getByTestId } = render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    act(() => {
      getByTestId('set-signer').click();
    });

    expect(getByTestId('signer')).toHaveTextContent(mockAccounts[1].address);
  });

  it('should filter duplicated accounts', async () => {
    const existingAccount: InjectedPolkadotAccount = {
      address: '0x123',
      wallet: 'wallet-1',
      polkadotSigner: {
        publicKey: new Uint8Array([1, 2, 3]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    };

    const duplicateAccount: InjectedPolkadotAccount = {
      address: '0x123',
      wallet: 'wallet-1',
      polkadotSigner: {
        publicKey: new Uint8Array([1, 2, 3]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    };

    const differentWalletAccount: InjectedPolkadotAccount = {
      address: '0x123',
      wallet: 'wallet-2',
      polkadotSigner: {
        publicKey: new Uint8Array([1, 2, 3]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    };

    const newAccount: InjectedPolkadotAccount = {
      address: '0x456',
      wallet: 'wallet-1',
      polkadotSigner: {
        publicKey: new Uint8Array([4, 5, 6]),
        signBytes: vi.fn(),
        signTx: vi.fn(),
      },
    };

    (walletApi.isConnected as boolean) = true;
    const newAccounts = [
      existingAccount,
      duplicateAccount,
      differentWalletAccount,
      newAccount,
    ] as InjectedPolkadotAccount[];

    vi.mocked(walletApi.getAllConnectedAccounts).mockResolvedValue(mockAccounts);

    let mockCallback: (accounts: InjectedPolkadotAccount[]) => void;
    vi.mocked(walletApi.subscribeAccounts).mockImplementation((callback) => {
      mockCallback = callback;
      return Promise.resolve();
    });

    const { getByTestId } = render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    await act(async () => {
      mockCallback!(newAccounts);
    });

    await waitFor(() => {
      expect(getByTestId('accounts')).toHaveTextContent('2');
    });
  });

  it('should return injected wallet IDs', () => {
    const mockWalletIds = ['wallet1', 'wallet2'];
    vi.mocked(walletApi.getInjectedWalletIds).mockReturnValue(mockWalletIds);

    const TestComponent = () => {
      const context = useContext(WalletContext);
      expect(context?.getInjectedWalletIds()).toEqual(mockWalletIds);
      return null;
    };

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
  });

  it('logs error when connection fails', async () => {
    vi.mocked(walletApi.connect).mockRejectedValue(new Error('Connection Failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    const button = getByText('Connect');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect wallet', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('logs error when disconnect fails', async () => {
    vi.mocked(walletApi.disconnect).mockRejectedValue(new Error('Disconnect Failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    const button = getByText('Disconnect');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to disconnect wallet', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
