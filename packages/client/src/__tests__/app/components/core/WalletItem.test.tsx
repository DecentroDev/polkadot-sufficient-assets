import { type InjectedPolkadotAccount, tokens } from '@polkadot-sufficient-assets/core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WalletItem from '../../../../app/components/core/WalletItem';
import * as hooks from '../../../../hooks';

// Mock the hooks
vi.mock('../../../../hooks', () => ({
  useTokenBalance: vi.fn(),
}));

vi.mock('../../../../app/components/core/WalletIcon', () => ({
  default: () => <div data-testid='mock-wallet-icon' />,
}));

vi.mock('../../../../app/components/core/Spinner', () => ({ default: () => <div data-testid='spinner' /> }));

describe('WalletItem', () => {
  const mockToken = tokens.DOT;

  const mockAccount: InjectedPolkadotAccount = {
    address: '5Grwva...',
    name: 'Test Wallet',
    wallet: 'subwallet-js',
    polkadotSigner: {
      publicKey: new Uint8Array([1, 2, 3]),
      signBytes: vi.fn(),
      signTx: vi.fn(),
    },
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders wallet information correctly', () => {
    vi.mocked(hooks.useTokenBalance).mockReturnValue({
      valueFormatted: '100.00',
      isLoading: false,
      value: 100n,
    });

    const { getByText } = render(<WalletItem token={mockToken} account={mockAccount} onClick={mockOnClick} />);

    expect(getByText('Test Wallet')).toBeInTheDocument();
    expect(getByText('5Grwva...')).toBeInTheDocument();
    expect(getByText('100.00 DOT')).toBeInTheDocument();
  });

  it('shows spinner when balance is loading', () => {
    vi.mocked(hooks.useTokenBalance).mockReturnValue({
      valueFormatted: '',
      isLoading: true,
      value: 0n,
    });

    const { getByTestId } = render(<WalletItem token={mockToken} account={mockAccount} onClick={mockOnClick} />);

    expect(getByTestId('spinner')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    vi.mocked(hooks.useTokenBalance).mockReturnValue({
      valueFormatted: '100.00',
      isLoading: false,
      value: 100n,
    });

    const { getByRole } = render(<WalletItem token={mockToken} account={mockAccount} onClick={mockOnClick} />);

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
