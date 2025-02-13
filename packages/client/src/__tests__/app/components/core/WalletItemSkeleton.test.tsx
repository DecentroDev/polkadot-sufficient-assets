import { cleanup, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WalletItemSkeleton from '../../../../app/components/core/WalletItemSkeleton';

vi.mock('@mui/material/Skeleton', () => ({ default: () => <div data-testid='skeleton' /> }));

describe('WalletItemSkeleton', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the correct number of Skeleton elements', () => {
    const length = 15;
    const { queryAllByTestId } = render(<WalletItemSkeleton length={length} />);

    const skeletons = queryAllByTestId('skeleton');
    expect(skeletons.length).toBe(length);
  });

  it('renders no Skeleton elements when length is set to 0', () => {
    const { queryAllByTestId } = render(<WalletItemSkeleton length={0} />);

    const skeletons = queryAllByTestId('skeleton');
    expect(skeletons.length).toBe(0);
  });

  it('renders the default number of Skeleton elements when no length prop is provided', () => {
    const { queryAllByTestId } = render(<WalletItemSkeleton />);

    const skeletons = queryAllByTestId('skeleton');
    expect(skeletons.length).toBe(4);
  });

  it('renders the default number of Skeleton elements when length is set to a negative value', () => {
    const { queryAllByTestId } = render(<WalletItemSkeleton length={-1} />);

    const skeletons = queryAllByTestId('skeleton');
    expect(skeletons.length).toBe(0);
  });
});
