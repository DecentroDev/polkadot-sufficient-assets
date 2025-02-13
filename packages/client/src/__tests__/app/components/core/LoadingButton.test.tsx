import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoadingButton from '../../../../app/components/core/LoadingButton';

vi.mock('../../../../app/components/core/Spinner', () => ({ default: () => <div data-testid='spinner' /> }));

const ComponentChildren = () => <div data-testid='component-children' />;

describe('LoadingButton', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render children when not loading', () => {
    render(
      <LoadingButton>
        <ComponentChildren />
      </LoadingButton>
    );

    expect(screen.getByTestId('component-children')).toBeInTheDocument();
  });

  it('should render spinner when loading', () => {
    render(
      <LoadingButton loading>
        <ComponentChildren />
      </LoadingButton>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
