import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Balance from '../../../../app/components/core/Balance';

vi.mock('../../../../app/components/core/Spinner', () => ({ default: () => <div data-testid='spinner' /> }));

describe('Balance', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders spinner when loading', () => {
    render(<Balance isLoading={true} isError={false} balance='100' symbol='USD' />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('displays "-" when there is an error', () => {
    render(<Balance isLoading={false} isError={true} balance='100' symbol='USD' />);

    expect(screen.getByText('- USD')).toBeInTheDocument();
  });

  it('displays balance and symbol correctly', () => {
    render(<Balance isLoading={false} isError={false} balance='100' symbol='EUR' />);

    expect(screen.getByText('100 EUR')).toBeInTheDocument();
  });

  it('displays default symbol when symbol prop is missing', () => {
    render(<Balance isLoading={false} isError={false} balance='100' symbol='' />);

    expect(screen.getByText('100 USD')).toBeInTheDocument();
  });
});
