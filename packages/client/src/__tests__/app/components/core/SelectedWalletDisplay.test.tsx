import { cleanup, fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SelectedWalletDisplay from '../../../../app/components/core/SelectedWalletDisplay';
import type { IWalletContext } from '../../../../context/wallet.context';
import * as hooks from '../../../../hooks';

vi.mock('../../../../app/components/core/WalletIcon', () => ({
  default: () => <div data-testid='mock-wallet-icon' />,
}));

vi.mock('../../../../hooks', () => ({
  useWallet: vi.fn(),
}));

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

describe('SelectedWalletDisplay', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders "Connect Wallet" when not connected', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({ ...mockWallet, connected: false });

    const { getByText } = render(<SelectedWalletDisplay />);
    expect(getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders "Select Account" when there is no account', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({ ...mockWallet, connected: true });

    const { getByText } = render(<SelectedWalletDisplay account={null} />);
    expect(getByText('Select Account')).toBeInTheDocument();
  });

  it('displays the shortened address and wallet icon when account is provided', () => {
    const account = {
      address: '0x1234567890abcdef',
      wallet: 'test-wallet',
    };

    vi.mocked(hooks.useWallet).mockReturnValue({ ...mockWallet, connected: true });

    const { getByText, getByTestId } = render(<SelectedWalletDisplay account={account} />);
    expect(getByText('0x12345...0abcdef')).toBeInTheDocument();
    expect(getByTestId('mock-wallet-icon')).toBeInTheDocument();
  });

  it('calls onClear when the clear icon is clicked', () => {
    const onClear = vi.fn();
    const account = {
      address: '0x1234567890abcdef',
    };
    vi.mocked(hooks.useWallet).mockReturnValue({ ...mockWallet, connected: true });

    const { getByTestId } = render(<SelectedWalletDisplay account={account} onClear={onClear} />);

    const clearIcon = getByTestId('ClearIcon');
    fireEvent.click(clearIcon);
    expect(onClear).toHaveBeenCalled();
  });

  it('displays KeyboardArrowDownIcon when no account is selected', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({ ...mockWallet, connected: true });

    const { getByTestId } = render(<SelectedWalletDisplay account={null} />);
    expect(getByTestId('KeyboardArrowDownIcon')).toBeInTheDocument();
  });
});
