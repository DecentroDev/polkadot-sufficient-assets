import { cleanup, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Spinner from '../../../../app/components/core/Spinner';

vi.mock('@mui/icons-material/DataUsageOutlined', () => ({
  default: (props: any) => <svg {...props} data-testid='spinner-icon' />,
}));

describe('Spinner', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<Spinner />);

    const spinnerIcon = getByTestId('spinner-icon');
    expect(spinnerIcon).toBeInTheDocument();
  });

  it('renders with other props correctly', () => {
    const { getByTestId } = render(<Spinner fontSize='large' />);

    const spinnerIcon = getByTestId('spinner-icon');
    expect(spinnerIcon).toHaveAttribute('font-size', 'large');
  });
});
