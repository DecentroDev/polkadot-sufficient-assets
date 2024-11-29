import type { ExtensionConfig } from '@polkadot-ui/assets/types';
import { cleanup, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WalletIcon from '../../../../app/components/core/WalletIcon';
import * as hooks from '../../../../hooks';

vi.mock('../../../../hooks', () => ({
  useExtensionInfo: vi.fn(),
}));

describe('WalletIcon', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockIcon = () => <svg data-testid='mock-icon' />;
  const mockExtension: ExtensionConfig = { title: 'Test Wallet', website: 'test-wallet.app', features: '*' };

  it('renders the icon when Icon is available', () => {
    vi.mocked(hooks.useExtensionInfo).mockReturnValue({ Icon: mockIcon, extension: undefined });

    const { getByTestId } = render(<WalletIcon walletId='test-wallet' size={32} />);

    const icon = getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders the first letter of extension title when Icon is not available', () => {
    vi.mocked(hooks.useExtensionInfo).mockReturnValue({ Icon: null, extension: mockExtension });

    const { getByText } = render(<WalletIcon walletId='test-wallet' size={32} />);

    expect(getByText('T')).toBeInTheDocument();
  });

  it('renders nothing if Icon is not available and extension is undefined', () => {
    vi.mocked(hooks.useExtensionInfo).mockReturnValue({ Icon: null, extension: undefined });

    const { queryByText, queryByTestId } = render(<WalletIcon walletId='test-wallet' size={32} />);

    expect(queryByText('T')).not.toBeInTheDocument();
    expect(queryByTestId('mock-icon')).not.toBeInTheDocument();
  });
});
