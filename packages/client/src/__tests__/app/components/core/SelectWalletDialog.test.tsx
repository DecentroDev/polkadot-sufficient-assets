import Button from '@mui/material/Button';
import { type InjectedPolkadotAccount, tokens } from '@polkadot-sufficient-assets/core';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SelectWalletDialog from '../../../../app/components/core/SelectWalletDialog';
import type { IWalletContext } from '../../../../context/wallet.context';
import * as hooks from '../../../../hooks';

const mockOnChange = vi.fn();
const mockAccount: InjectedPolkadotAccount = {
  address: '0x123',
  wallet: 'subwallet-js',
  polkadotSigner: {
    publicKey: new Uint8Array([1, 2, 3]),
    signBytes: vi.fn(),
    signTx: vi.fn(),
  },
};
const mockWallets = ['subwallet-js'];
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
const mockAddress = '5GWHr2UCwWYdXzQKJj6XHMf8LyFE3jp94SFDBXLXAL5WLVXo';

const token = tokens.DOT;

vi.mock('../../../../app/components/core/WalletIcon', () => ({
  default: () => <div data-testid='mock-wallet-icon' />,
}));

vi.mock('../../../../app/components/core/WalletItemSkeleton', () => ({
  default: () => <div data-testid='mock-wallet-item-skeleton' />,
}));

vi.mock('../../../../app/components/core/WalletItem', () => ({
  default: ({ account, onClick }: { account: any; onClick: () => void }) => (
    <div onClick={onClick} data-testid={`wallet-item-${account.address}`}>
      {account.address}_{account.wallet}
    </div>
  ),
}));

vi.mock('../../../../app/components/core/ExtensionButton', () => ({
  default: () => <div data-testid='mock-extension-button' />,
}));

vi.mock('../../../../hooks', () => ({
  useWallet: vi.fn(() => mockWallet),
}));

describe('SelectWalletDialog', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('opens the dialog when the child element is clicked', async () => {
    const { getByText } = render(
      <SelectWalletDialog token={token} onChange={mockOnChange}>
        <Button>Open Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Dialog'));
    await waitFor(() => getByText('Select account'));
    expect(getByText('Select account')).toBeInTheDocument();
  });

  it('calls onChange when a wallet account is selected', async () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connectedWallets: mockWallets,
      accounts: [mockAccount],
    });

    const { getByText } = render(
      <SelectWalletDialog token={token} onChange={mockOnChange}>
        <Button>Open Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Dialog'));
    fireEvent.click(getByText(mockAccount.address + '_' + mockAccount.wallet));
    expect(mockOnChange).toHaveBeenCalledWith(mockAccount);
  });

  it('adds a custom address when valid and close the dialog', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SelectWalletDialog token={tokens.DOT} exclude={mockAccount} onChange={mockOnChange} withInput>
        <Button>Open Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    const input = getByPlaceholderText('Enter address');
    fireEvent.change(input, { target: { value: mockAddress } });
    fireEvent.click(getByTestId('SendIcon'));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ address: mockAddress });
    });
  });

  it('displays an error message when an invalid address is entered', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SelectWalletDialog token={tokens.DOT} onChange={mockOnChange} withInput>
        <Button>Open Wallet Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Wallet Dialog'));

    const input = getByPlaceholderText('Enter address');
    fireEvent.change(input, { target: { value: 'invalid-address' } });
    fireEvent.click(getByTestId('SendIcon'));

    expect(getByText('Invalid address')).toBeInTheDocument();
  });

  it('does not call onChange when address input is empty', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <SelectWalletDialog token={tokens.DOT} onChange={mockOnChange} withInput>
        <Button>Open Wallet Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Wallet Dialog'));

    const input = getByPlaceholderText('Enter address');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(getByTestId('SendIcon'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('displays WalletItemSkeleton when accounts empty', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connectedWallets: mockWallets,
      accounts: [],
    });

    const { getByText, getByTestId } = render(
      <SelectWalletDialog token={tokens.DOT} onChange={mockOnChange}>
        <Button>Open Wallet Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Wallet Dialog'));

    expect(getByTestId('mock-wallet-item-skeleton')).toBeInTheDocument();
  });

  it('renders ExtensionButton elements based on connected wallets', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      getInjectedWalletIds: () => ['polkadot-js'],
    });
    const { getByText, getByTestId } = render(
      <SelectWalletDialog token={tokens.DOT} onChange={mockOnChange}>
        <Button>Open Wallet Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Wallet Dialog'));

    expect(getByTestId('mock-extension-button')).toBeInTheDocument();
  });

  it('closes the dialog when the close icon is clicked', async () => {
    const { getByText, queryByText, getByTestId } = render(
      <SelectWalletDialog token={tokens.DOT} onChange={mockOnChange}>
        <Button>Open Wallet Dialog</Button>
      </SelectWalletDialog>
    );

    fireEvent.click(getByText('Open Wallet Dialog'));
    expect(getByText('Select account')).toBeInTheDocument();

    fireEvent.click(getByTestId('CloseIcon'));
    await waitFor(() => {
      expect(queryByText('Select account')).not.toBeInTheDocument();
    });
  });
});
