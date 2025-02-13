import {
  type Api,
  type ChainId,
  chains,
  type getTransferExtrinsic,
  type InjectedPolkadotAccount,
  parseUnits,
  type Token,
  tokens,
} from '@polkadot-sufficient-assets/core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Transfer from '../../../app/components/Transfer';
import type { ITransferContext } from '../../../context/transfer.context';
import type { IWalletContext } from '../../../context/wallet.context';
import { useExistentialDeposit, useTokenBalance, useTransaction, useTransfer, useWallet } from '../../../hooks';
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
    useTransaction: vi.fn(),
    useTokenBalance: vi.fn(),
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
            {onClear && (
              <button data-testid='clear-wallet-btn' onClick={onClear}>
                Clear
              </button>
            )}
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

vi.mock('../../../app/components/core/Spinner', () => ({
  default: vi.fn(() => <div data-testid='spinner'>Loading...</div>),
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
    <button onClick={() => console.log(onClick)} data-testid='explorer-button'>
      {children}
    </button>
  )),
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
  destinationChains: [],
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

const mockTransaction: { tx: ReturnType<typeof getTransferExtrinsic>; fee: TokenBalance } = {
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

describe('Transfer Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.mocked(useTransfer).mockReturnValue(mockTransfer);
    vi.mocked(useWallet).mockReturnValue(mockWallet);
    vi.mocked(useTransaction).mockReturnValue(mockTransaction);
    vi.mocked(useTokenBalance).mockReturnValue(mockBalance);
    vi.mocked(useExistentialDeposit).mockReturnValue(mockBalance);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render the Transfer component', () => {
    render(<Transfer initialAmount='10' />);
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('should disable transfer button when input is invalid', () => {
    render(<Transfer initialAmount={undefined} />);

    const transferButton = screen.getByText('Transfer');
    expect(transferButton).toBeDisabled();
  });

  it('should display Synchronizing light clients', () => {
    vi.mocked(useTransfer).mockReturnValueOnce({
      ...mockTransfer,
      lightClientEnable: true,
      isLoaded: false,
    });

    render(<Transfer initialAmount='0.1' />);

    expect(screen.getByText(/Synchronizing light clients/)).toBeDefined();
    expect(screen.getByText('Synchronizing light clients')).toBeDisabled();
  });

  it('should show error message for insufficient balance', async () => {
    vi.mocked(useTransfer).mockReturnValueOnce({
      ...mockTransfer,
      feeToken: tokens.USDT,
    });

    vi.mocked(useTokenBalance).mockReturnValueOnce({
      ...mockBalance,
      value: 5n,
      valueFormatted: '5',
    });

    render(<Transfer initialAmount='1000' />);
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

    vi.mocked(useTransaction).mockReturnValueOnce({
      tx: null,
      fee: { value: feeValue, isLoading: false },
    });

    render(<Transfer initialAmount='0.1' />);

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

    vi.mocked(useTransaction).mockReturnValueOnce({
      tx: null,
      fee: { value: feeValue, isLoading: false },
    });

    vi.mocked(useExistentialDeposit).mockReturnValueOnce({
      value: edTokenValue,
      valueFormatted: '3',
      isLoading: false,
    });

    render(<Transfer initialAmount='0.1' />);

    expect(screen.getByText('Insufficient balance to keep account alive')).toBeInTheDocument();
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

    vi.mocked(useTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn().mockResolvedValue({ txHash: '0x123', ok: true }) },
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='1' />);

    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '10' } });

    const transferButton = screen.getByText('Transfer');
    fireEvent.click(transferButton);

    await act(async () => {});

    expect(screen.getByText('Transaction executed successful!')).toBeInTheDocument();

    const explorerButton = screen.getByTestId('explorer-button');
    fireEvent.click(explorerButton);

    const snackbar = screen.getByTestId('close-snackbar');
    fireEvent.click(snackbar);

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

    vi.mocked(useTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn().mockRejectedValue({ txHash: '', ok: false }) },
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='100' />);

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

    vi.mocked(useTransaction).mockReturnValue({
      tx: null,
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='100' />);

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

    vi.mocked(useTransaction).mockReturnValue({
      tx: null,
      fee: { isLoading: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='100' />);

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

    vi.mocked(useTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn() },
      fee: { isLoading: true, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='100' />);

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

    vi.mocked(useTransaction).mockReturnValue({
      // @ts-ignore
      tx: { signAndSubmit: vi.fn() },
      fee: { isLoading: false, error: true, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount='100' />);

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

    vi.mocked(useTransaction).mockReturnValue({
      ...mockTransaction,
      fee: { isLoading: false, error: false, value: parseUnits('0.1', tokens.DOT.decimals), valueFormatted: '0.1' },
    });

    const { queryByText, rerender } = render(<Transfer />);

    const button = screen.getByTestId('select-fee-token-btn');

    fireEvent.click(button);

    await act(async () => {
      vi.mocked(useTransfer).mockReturnValue({
        ...mockTransfer,
        feeToken: mockFeeToken ?? tokens.DOT,
      });
      rerender(<Transfer initialAmount='10' />);
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

    const { rerender } = render(<Transfer initialAmount='10' />);

    const selectFromWalletBtn = screen.getByTestId('select-from-wallet-btn');
    fireEvent.click(selectFromWalletBtn);

    rerender(<Transfer initialAmount='10' />);

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

    expect(mockSetSigner).toHaveBeenCalledWith(null);
  });

  it('should handle selecting "to" wallet', async () => {
    const mockSetSigner = vi.fn();

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      setSigner: mockSetSigner,
      signer: null,
    });
    render(<Transfer initialAmount='10' />);

    const selectToWalletBtn = screen.getByTestId('select-to-wallet-btn');
    fireEvent.click(selectToWalletBtn);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-address')).toHaveTextContent(
        '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
      );
    });

    const clearToWalletBtn = screen.getByTestId('clear-wallet-btn');
    fireEvent.click(clearToWalletBtn);

    expect(screen.queryByText('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty')).not.toBeInTheDocument();
  });

  it('should show error message when transfer amount is less than minimum required to keep destination account alive', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    const toTokenBalanceValue = parseUnits('1', tokens.DOT.decimals);
    const existentialDeposit = parseUnits('2', tokens.DOT.decimals);

    const transferAmount = '0.5';

    vi.mocked(useTokenBalance).mockImplementation((token, address) => {
      if (address === mockDestination.address) {
        return {
          value: toTokenBalanceValue,
          valueFormatted: '1',
          isLoading: false,
          error: false,
        };
      }
      return {
        value: parseUnits('1000', tokens.DOT.decimals),
        valueFormatted: '1000',
        isLoading: false,
        error: false,
      };
    });

    vi.mocked(useExistentialDeposit).mockReturnValue({
      value: existentialDeposit,
      valueFormatted: '2',
      isLoading: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount={transferAmount} />);

    expect(
      screen.getByText(/You must transfer at least 1 DOT to keep the destination account alive/)
    ).toBeInTheDocument();
  });

  it('should not show destination account error when transfer amount is sufficient', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    const toTokenBalanceValue = parseUnits('1', tokens.DOT.decimals);
    const existentialDeposit = parseUnits('2', tokens.DOT.decimals);

    const transferAmount = '2';

    vi.mocked(useTokenBalance).mockImplementation((token, address) => {
      if (address === mockDestination.address) {
        return {
          value: toTokenBalanceValue,
          valueFormatted: '1',
          isLoading: false,
          error: false,
        };
      }
      return {
        value: parseUnits('1000', tokens.DOT.decimals),
        valueFormatted: '1000',
        isLoading: false,
        error: false,
      };
    });

    vi.mocked(useExistentialDeposit).mockReturnValue({
      value: existentialDeposit,
      valueFormatted: '2',
      isLoading: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount={transferAmount} />);

    expect(screen.queryByText(/You must transfer at least/)).not.toBeInTheDocument();
  });

  it('should not show destination account error when destination balance is above existential deposit', async () => {
    const mockDestination = { address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' };

    const toTokenBalanceValue = parseUnits('3', tokens.DOT.decimals);
    const existentialDeposit = parseUnits('2', tokens.DOT.decimals);

    const transferAmount = '0.5';

    vi.mocked(useTokenBalance).mockImplementation((token, address) => {
      if (address === mockDestination.address) {
        return {
          value: toTokenBalanceValue,
          valueFormatted: '3',
          isLoading: false,
          error: false,
        };
      }
      return {
        value: parseUnits('1000', tokens.DOT.decimals),
        valueFormatted: '1000',
        isLoading: false,
        error: false,
      };
    });

    vi.mocked(useExistentialDeposit).mockReturnValue({
      value: existentialDeposit,
      valueFormatted: '2',
      isLoading: false,
    });

    vi.mocked(useWallet).mockReturnValue({
      ...mockWallet,
      signer: mockSigner,
      setSigner: vi.fn(),
    });

    vi.mocked(useTransfer).mockReturnValue({
      ...mockTransfer,
      destinationAddress: mockDestination.address,
    });

    render(<Transfer initialAmount={transferAmount} />);

    expect(screen.queryByText(/You must transfer at least/)).not.toBeInTheDocument();
  });
});
