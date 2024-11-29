import {
  type Api,
  type ChainId,
  chains,
  type Config,
  formatUnits,
  type getXcmTransferExtrinsic,
  type InjectedPolkadotAccount,
  parseUnits,
  type Token,
  tokens,
} from '@polkadot-sufficient-assets/core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import XcmTransfer from '../../../app/components/XcmTransfer';
import { ConfigProvider } from '../../../context/config.context';
import type { ITransferContext } from '../../../context/transfer.context';
import { type IWalletContext, WalletProvider } from '../../../context/wallet.context';
import {
  useExistentialDeposit,
  useForeignTokenBalance,
  useTokenBalance,
  useTransfer,
  useWallet,
  useXcmTransaction,
} from '../../../hooks';
import type { TokenBalance } from '../../../types';

vi.mock('@polkadot-sufficient-assets/core', async () => ({
  ...(await vi.importActual('@polkadot-sufficient-assets/core')),
  getFeeAssetLocation: vi.fn(),
}));

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual('../../../hooks');
  return {
    ...actual,
    useTransfer: vi.fn(),
    useWallet: vi.fn(),
    useXcmTransaction: vi.fn(),
    useTokenBalance: vi.fn(),
    useForeignTokenBalance: vi.fn(),
    useExistentialDeposit: vi.fn(),
  };
});

vi.mock('../../../app/components/core/SelectFeeTokenDialog', () => ({
  default: vi.fn(({ children, selectToken }) => (
    <div data-testid='selected-fee-token'>
      {children}
      <button data-testid='select-fee-token-btn' onClick={() => selectToken(tokens.USDT)}>
        Select Token Fee
      </button>
    </div>
  )),
}));

vi.mock('../../../app/components/core/SelectedWalletDisplay', () => ({
  default: vi.fn(({ account, onClear }) => {
    return (
      <div data-testid='selected-wallet-display'>
        {account?.address && (
          <>
            <span data-testid='wallet-address'>{account.address}</span>
            <button data-testid='clear-wallet-btn' onClick={onClear}>
              Clear
            </button>
          </>
        )}
      </div>
    );
  }),
}));

vi.mock('../../../app/components/core/SelectWalletDialog', () => ({
  default: vi.fn(({ onChange, children, withInput }) => {
    const mockAccount = {
      address: withInput
        ? '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
        : '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      wallet: 'polkadot-js',
      polkadotSigner: { publicKey: new Uint8Array([1, 2, 3]), signBytes: vi.fn(), signTx: vi.fn() },
    };

    const handleClick = () => {
      onChange(mockAccount);
    };

    return (
      <div data-testid='select-wallet-dialog'>
        {children}
        <button data-testid={withInput ? 'select-to-wallet-btn' : 'select-from-wallet-btn'} onClick={handleClick}>
          {withInput ? 'Select Destination' : 'Select Wallet'}
        </button>
      </div>
    );
  }),
}));

vi.mock('../../../app/components/core/Balance', () => ({
  default: vi.fn(({ balance, symbol, isError, isLoading }) => (
    <div data-testid='balance'>{isLoading ? 'Loading...' : isError ? '-' : `${balance} ${symbol}`}</div>
  )),
}));

vi.mock('../../../app/components/core/LoadingButton', () => ({
  default: vi.fn(({ onClick, disabled, children }) => (
    <button data-testid='loading-button' onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )),
}));

vi.mock('@mui/material/Snackbar', () => ({
  default: vi.fn(({ open, children, onClose }) => (
    <div data-testid='snackbar' style={{ display: open ? 'block' : 'none' }}>
      <div>{children}</div>
      <button onClick={onClose} data-testid='close-snackbar'>
        Close
      </button>
    </div>
  )),
}));

vi.mock('@mui/material/Button', () => ({
  default: vi.fn(({ onClick, children }) => (
    <button
      onClick={() => {
        children === 'View on Explorer' ? console.log(onClick?.()) : onClick?.();
      }}
      data-testid='explorer-button'
    >
      {children}
    </button>
  )),
}));

vi.mock('../../../app/components/core/Spinner', () => ({
  default: vi.fn(() => <div data-testid='spinner'>Loading...</div>),
}));

const mockApi = {
  query: {
    System: {
      Account: {
        getValue: vi.fn().mockResolvedValue({ nonce: 0 }),
      },
    },
  },
} as unknown as Api<ChainId>;

const mockTransfer: ITransferContext = {
  api: mockApi,
  token: tokens.DOT,
  feeToken: tokens.DOT,
  changeFeeToken: vi.fn(),
  feeTokens: [tokens.DOT, tokens.USDT],
  nativeToken: tokens.DOT,
  chain: chains.polkadotChain,
  destinationAddress: undefined,
  isLoaded: true,
  lightClientEnable: false,
  useXcmTransfer: false,
  destinationChains: [chains.polkadotChain, chains.kusamaChain],
};

const mockWallet: IWalletContext = {
  accounts: [],
  connect: vi.fn(),
  connected: false,
  disconnect: vi.fn(),
  getInjectedWalletIds: vi.fn(),
  signer: null,
  setSigner: vi.fn(),
  connectedWallets: [],
};

const mockConfig: Config = {
  sourceChains: [chains.polkadotChain],
  useXcmTransfer: true,
  destinationChains: [chains.kusamaChain],
  destinationAddress: '0x123',
  // @ts-ignore
  lightClients: { enable: true },
};

const mockXcmTransaction: { tx: ReturnType<typeof getXcmTransferExtrinsic> | null; fee: TokenBalance } = {
  tx: null,
  fee: {
    value: 0n,
    valueFormatted: '0',
    isLoading: false,
  },
};

const mockBalance = {
  isLoading: false,
  value: 0n,
  valueFormatted: '0',
};

const mockSigner = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  wallet: 'polkadot-js',
  polkadotSigner: { publicKey: new Uint8Array([1, 2, 3]), signBytes: vi.fn(), signTx: vi.fn() },
} as InjectedPolkadotAccount;

describe('Xcm Transfer Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.mocked(useTransfer).mockReturnValue(mockTransfer);
    vi.mocked(useWallet).mockReturnValue(mockWallet);
    vi.mocked(useXcmTransaction).mockReturnValue(mockXcmTransaction);
    vi.mocked(useTokenBalance).mockReturnValue(mockBalance);
    vi.mocked(useForeignTokenBalance).mockReturnValue(mockBalance);
    vi.mocked(useExistentialDeposit).mockReturnValue(mockBalance);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider config={mockConfig}>
      <WalletProvider>{children}</WalletProvider>
    </ConfigProvider>
  );

  it('should render the Xcm Transfer component', () => {
    render(<XcmTransfer initialAmount='10' />, { wrapper });
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('should disable transfer button when input is invalid', () => {
    render(<XcmTransfer initialAmount={undefined} />, { wrapper });

    const transferButton = screen.getByText('Transfer');
    expect(transferButton).toBeDisabled();
  });

  it('should display Synchronizing light clients', () => {
    vi.mocked(useTransfer).mockReturnValueOnce({
      ...mockTransfer,
      lightClientEnable: true,
      isLoaded: false,
    });

    render(<XcmTransfer initialAmount='0.1' />, { wrapper });

    expect(screen.getByText('Synchronizing light clients')).toBeInTheDocument();
    expect(screen.getByText('Synchronizing light clients')).toBeDisabled();
  });

  it('should handle a successful transfer', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn().mockResolvedValue({ txHash: '0x123', ok: true }) },
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='1' />, { wrapper });

    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '10' } });

    const transferButton = screen.getByText('Transfer');
    fireEvent.click(transferButton);

    await act(async () => {});

    expect(screen.getByText('Transaction executed successful!')).toBeInTheDocument();

    const snackbar = screen.getByTestId('close-snackbar');
    fireEvent.click(snackbar);

    const explorerButton = screen.getByTestId('explorer-button');
    fireEvent.click(explorerButton);

    await act(async () => {
      vi.advanceTimersByTime(5200);
    });

    expect(screen.queryByText('Transaction executed successful!')).not.toBeInTheDocument();

    vi.runAllTimers();
  });

  it('should handle a failed transfer', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn().mockRejectedValue({ txHash: '', ok: false }) },
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='100' />, { wrapper });

    const transferButton = screen.getByText('Transfer');
    fireEvent.click(transferButton);

    await act(async () => {});

    expect(screen.getByText('Transaction executed failed!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5200);
    });

    vi.runAllTimers();
  });

  it('should click handle transfer when to is null', async () => {
    const mockDestination = { address: undefined };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      tx: null,
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='100' />, { wrapper });

    const transferButton = screen.getByText('Transfer');
    fireEvent.click(transferButton);
  });

  it('should click handle transfer when tx is undefined', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      tx: null,
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='100' />, { wrapper });

    const transferButton = screen.getByText('Transfer');
    fireEvent.click(transferButton);
  });

  it('should display loading transfer fee when fee is loading', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn() },
      fee: { isLoading: true, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='100' />, { wrapper });

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveTextContent('Loading...');
  });

  it('should display error message if fee calculation fails', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn() },
      fee: { isLoading: false, error: true, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='100' />, { wrapper });

    expect(screen.getByText("Can't estimate fee")).toBeInTheDocument();
  });

  it('should selecting a token to change the fee token', async () => {
    const mockChangeFeeToken = vi.fn();

    let mockFeeToken: Token | null = null;

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      changeFeeToken: (feeToken) => {
        mockFeeToken = feeToken;
        mockChangeFeeToken(feeToken);
      },
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      ...mockXcmTransaction,
      fee: { isLoading: false, error: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    const { queryByText, rerender } = render(<XcmTransfer />, { wrapper });

    const button = screen.getByTestId('select-fee-token-btn');

    fireEvent.click(button);

    await act(async () => {
      vi.mocked(useTransfer).mockReturnValue({
        ...mockTransfer,
        feeToken: mockFeeToken ?? tokens.DOT,
      });
      rerender(<XcmTransfer initialAmount='10' />);
    });

    expect(queryByText('0.1 USDT')).toBeInTheDocument();
    expect(mockChangeFeeToken).toHaveBeenCalledWith(tokens.USDT);
  });

  it('should handle selecting "from" wallet', async () => {
    const mockSetSigner = vi.fn();

    let mockSignerState: InjectedPolkadotAccount | null = null;

    vi.mocked(useWallet).mockImplementation(() => ({
      ...mockWallet,
      setSigner: (account) => {
        mockSignerState = account;
        mockSetSigner(account);
      },
      signer: mockSignerState,
    }));

    const { rerender } = render(<XcmTransfer initialAmount='10' />, { wrapper });

    const selectFromWalletBtn = screen.getByTestId('select-from-wallet-btn');
    fireEvent.click(selectFromWalletBtn);

    rerender(<XcmTransfer initialAmount='10' />);

    await waitFor(() => {
      expect(mockSetSigner).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        })
      );
      expect(screen.getByTestId('wallet-address')).toHaveTextContent(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      );
    });

    const clearFromWalletBtn = screen.getByTestId('clear-wallet-btn');

    fireEvent.click(clearFromWalletBtn);

    rerender(<XcmTransfer initialAmount='10' />);

    expect(screen.queryByTestId('wallet-address')).not.toBeInTheDocument();
    expect(mockSetSigner).toHaveBeenCalledWith(null);
  });

  it('should handle selecting "to" wallet', async () => {
    const mockSetSigner = vi.fn();

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      setSigner: mockSetSigner,
      signer: null,
    });
    render(<XcmTransfer initialAmount='10' />, { wrapper });

    const selectToWalletBtn = screen.getByTestId('select-to-wallet-btn');
    fireEvent.click(selectToWalletBtn);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-address')).toHaveTextContent(
        '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
      );
    });

    const clearToWalletBtn = screen.getByTestId('clear-wallet-btn');

    fireEvent.click(clearToWalletBtn);

    expect(screen.queryByTestId('wallet-address')).not.toBeInTheDocument();
  });

  it('should show error message for insufficient balance', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };
    const mockToken = { ...mockTransfer.token, minEd: { [mockTransfer.destinationChains[0]?.id]: 0.3 } };

    vi.mocked(useTransfer).mockReturnValueOnce({
      ...mockTransfer,
      token: mockToken,
      feeToken: tokens.USDT,
      destinationAddress: mockDestination.address,
    });

    vi.mocked(useTokenBalance).mockReturnValueOnce({
      ...mockBalance,
      value: 5n,
      valueFormatted: '5',
    });

    render(<XcmTransfer initialAmount='1000' />, { wrapper });
    expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
  });

  it('should show error message for insufficient balance to pay for fee', async () => {
    const balanceValue = parseUnits('1', mockTransfer.token.decimals);
    const feeValue = parseUnits('2', mockTransfer.token.decimals);

    vi.mocked(useTokenBalance).mockReturnValueOnce({
      ...mockBalance,
      value: balanceValue,
      valueFormatted: '100',
    });

    vi.mocked(useXcmTransaction).mockReturnValueOnce({
      tx: null,
      fee: { value: feeValue, isLoading: false },
    });

    render(<XcmTransfer initialAmount='0.1' />, { wrapper });

    const plancks = parseUnits('0.1', mockTransfer.token.decimals);

    expect(mockTransfer.feeToken.assetId === mockTransfer.token.assetId).toBe(true);
    expect(mockTransfer.feeToken.assetId === mockTransfer.token.assetId ? feeValue : 0n).toBe(feeValue);
    expect(balanceValue < plancks).toBe(false);
    expect(balanceValue < plancks + feeValue).toBe(true);
    expect(screen.getByText('Insufficient balance to pay for fee')).toBeInTheDocument();
  });

  it('should show error message for insufficient balance to keep account alive', async () => {
    const balanceValue = parseUnits('3', mockTransfer.token.decimals);
    const feeValue = parseUnits('2', mockTransfer.token.decimals);
    const edTokenValue = parseUnits('4', mockTransfer.token.decimals);

    vi.mocked(useTokenBalance).mockReturnValueOnce({
      ...mockBalance,
      value: balanceValue,
      valueFormatted: '100',
    });

    vi.mocked(useXcmTransaction).mockReturnValueOnce({
      tx: null,
      fee: { value: feeValue, isLoading: false },
    });

    vi.mocked(useExistentialDeposit).mockReturnValueOnce({
      value: edTokenValue,
      valueFormatted: '3',
      isLoading: false,
    });

    render(<XcmTransfer initialAmount='0.1' />, { wrapper });

    expect(screen.getByText('Insufficient balance to keep account alive')).toBeInTheDocument();
  });

  it('should return null when amount is 0', () => {
    render(<XcmTransfer initialAmount='0' />, { wrapper });

    expect(screen.queryByText(/must transfer at least/)).not.toBeInTheDocument();
  });

  it('should set the maximum amount when the Max button is clicked', async () => {
    const mockTokenBalance = parseUnits('5', tokens.DOT.decimals);
    const mockFeeValue = parseUnits('2', tokens.DOT.decimals);
    const mockEdToken = parseUnits('1', tokens.DOT.decimals);

    vi.mocked(useTokenBalance).mockReturnValue({
      value: mockTokenBalance,
      valueFormatted: '0.5',
      isLoading: false,
    });

    vi.mocked(useExistentialDeposit).mockReturnValue({
      value: mockEdToken,
      valueFormatted: '0.1',
      isLoading: false,
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      ...mockXcmTransaction,
      fee: { isLoading: false, value: mockFeeValue, valueFormatted: '0.1' },
    });

    render(<XcmTransfer initialAmount='0' />, { wrapper });

    const maxButton = screen.getByText(/Max/i);
    expect(maxButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(maxButton);
    });

    const input = screen.getByPlaceholderText('0') as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe('1.8'));
  });

  it('should return null when loading states are true', () => {
    vi.mocked(useExistentialDeposit).mockReturnValueOnce({
      value: 100n,
      valueFormatted: '10',
      isLoading: true,
    });

    const { container } = render(<XcmTransfer initialAmount='1' />, { wrapper });

    expect(screen.queryByText(/must transfer at least/)).not.toBeInTheDocument();
  });

  it('should return null when toTokenBalance > edTokenDest', () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      api: {
        ...mockTransfer.api,
        query: { System: { Account: { getValue: vi.fn().mockResolvedValue({ nonce: 0 }) } } },
      },
      destinationAddress: mockDestination.address,
    });

    vi.mocked(useForeignTokenBalance).mockReturnValueOnce({
      value: 200n,
      valueFormatted: '200',
      isLoading: false,
    });

    vi.mocked(useExistentialDeposit).mockReturnValue({
      value: 100n,
      valueFormatted: '10',
      isLoading: false,
    });

    render(<XcmTransfer initialAmount='1' />, { wrapper });

    expect(screen.queryByText(/must transfer at least/)).not.toBeInTheDocument();
  });

  it('should show minimum transfer amount message', () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };
    const mockToTokenBalance = parseUnits('1', tokens.DOT.decimals);
    const mockEdTokenDest = parseUnits('2', tokens.DOT.decimals);
    const mockAmount = '0.1';
    const mockTokenWithoutMinEd = {
      ...tokens.DOT,
      minEd: {},
    };

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      token: mockTokenWithoutMinEd,
      destinationAddress: mockDestination.address,
    });

    vi.mocked(useForeignTokenBalance).mockReturnValueOnce({
      value: mockToTokenBalance,
      valueFormatted: '10',
      isLoading: false,
    });

    vi.mocked(useExistentialDeposit)
      .mockReturnValueOnce({
        value: 0n,
        valueFormatted: '0',
        isLoading: false,
      })
      .mockReturnValueOnce({
        value: mockEdTokenDest,
        valueFormatted: '20',
        isLoading: false,
      });

    render(<XcmTransfer initialAmount={mockAmount} />, { wrapper });

    const minAmountToKeepAccountAlive = mockEdTokenDest - mockToTokenBalance;
    const plancks = parseUnits(mockAmount, mockTransfer.token.decimals);
    const minEd = mockTransfer.token.minEd?.[mockTransfer.destinationChains[0]?.id] ?? '0.2';
    const minTransfer = formatUnits(
      minAmountToKeepAccountAlive + parseUnits(String(minEd), mockTransfer.token.decimals),
      mockTransfer.token.decimals
    );

    expect(plancks < minAmountToKeepAccountAlive).toBe(true);
    expect(
      screen.queryByText(
        `You must transfer at least ${minTransfer} ${mockTransfer.token.symbol} to keep the destination account alive`
      )
    ).toBeInTheDocument();
  });

  it('should warn if to address difference signer address', () => {
    const mockDestination = { address: '5CHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTokenBalance).mockReturnValue({
      value: parseUnits('1000', tokens.DOT.decimals),
      valueFormatted: '1000',
      isLoading: false,
      error: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useTokenBalance).mockReturnValueOnce({
      ...mockBalance,
      value: 5n,
      valueFormatted: '5',
    });

    vi.mocked(useXcmTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn() },
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='1000' />, { wrapper });

    expect(
      screen.getByText(
        'Transferring assets to CEX through XCM directly will result in loss of funds. Please send them to your address on the relevant network first.'
      )
    ).toBeInTheDocument();
  });

  it('should update to chain when selecting a new chain', () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<XcmTransfer initialAmount='0.1' />, { wrapper });

    const toChainDropdown = screen.getByLabelText(/To chain/i);
    expect(toChainDropdown).toHaveTextContent('Polkadot');

    fireEvent.mouseDown(toChainDropdown);
    fireEvent.click(screen.getByText('Kusama'));

    expect(toChainDropdown).toHaveTextContent('Kusama');
  });
});
