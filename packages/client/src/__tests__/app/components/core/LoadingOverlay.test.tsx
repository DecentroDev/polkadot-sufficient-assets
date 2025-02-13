import { cleanup, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoadingOverlay from '../../../../app/components/core/LoadingOverlay';

vi.mock('../../../../app/components/core/Spinner', () => ({ default: () => <div data-testid='spinner' /> }));

describe('LoadingOverlay', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render spinner when loading', () => {
    const { getByTestId } = render(<LoadingOverlay loading></LoadingOverlay>);

    expect(getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render children when not loading', () => {
    const { queryByTestId } = render(<LoadingOverlay></LoadingOverlay>);

    expect(queryByTestId('spinner')).not.toBeInTheDocument();
  });
});
