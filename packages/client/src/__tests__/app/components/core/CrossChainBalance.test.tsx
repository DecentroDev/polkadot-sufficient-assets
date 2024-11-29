import { chains, tokens, type InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CrossChainBalance from '../../../../app/components/core/CrossChainBalance';
import * as hooks from '../../../../hooks';

interface IBalanceProps {
  isLoading: boolean;
  isError: boolean;
  balance?: string;
  symbol: string;
}

vi.mock('../../../../hooks', () => ({
  useTokenBalance: vi.fn(),
  useForeignTokenBalance: vi.fn(),
}));

vi.mock('../../../../app/components/core/Balance', () => ({
  default: ({ balance, symbol, isError, isLoading }: IBalanceProps) => (
    <div data-testid='balance'>{isLoading ? 'Loading...' : isError ? '-' : `${balance} ${symbol}`}</div>
  ),
}));

describe('CrossChainBalance', () => {
  const mockToken = tokens.DOT;
  const mockOriginChain = chains.polkadotChain;
  const mockDestChain = chains.kusamaChain;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the origin chain balance correctly', () => {
    vi.mocked(hooks.useTokenBalance).mockReturnValue({
      isLoading: false,
      value: 0n,
      valueFormatted: '100.00',
      error: false,
    });
    vi.mocked(hooks.useForeignTokenBalance).mockReturnValue({
      isLoading: false,
      value: 0n,
      valueFormatted: '100.00',
      error: false,
    });

    render(
      <CrossChainBalance
        from={{ address: 'origin-address' } as InjectedPolkadotAccount}
        originChain={mockOriginChain}
        token={mockToken}
      />
    );

    expect(screen.getByText('Polkadot')).toBeInTheDocument();
    expect(screen.getByTestId('balance')).toHaveTextContent('100.00 DOT');
  });

  it('renders the destination chain balance when destChain is provided', () => {
    vi.mocked(hooks.useTokenBalance).mockReturnValue({
      isLoading: false,
      value: 0n,
      valueFormatted: '100.00',
      error: false,
    });
    vi.mocked(hooks.useForeignTokenBalance).mockReturnValue({
      isLoading: false,
      value: 0n,
      valueFormatted: '50.00',
      error: false,
    });

    render(
      <CrossChainBalance
        from={{ address: 'origin-address' } as InjectedPolkadotAccount}
        to={{ address: 'destination-address' } as InjectedPolkadotAccount}
        originChain={mockOriginChain}
        destChain={mockDestChain}
        token={mockToken}
      />
    );

    expect(screen.getByText('Kusama')).toBeInTheDocument();
    expect(screen.getAllByTestId('balance')[1]).toHaveTextContent('50.00 DOT');
  });
});
