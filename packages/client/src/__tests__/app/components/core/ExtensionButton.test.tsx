import type { ExtensionConfig } from '@polkadot-ui/assets/types';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { IWalletContext } from 'src/context/wallet.context';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExtensionButton from '../../../../app/components/core/ExtensionButton';
import * as hooks from '../../../../hooks';

vi.mock('../../../../hooks', () => ({
  useWallet: vi.fn(),
  useExtensionInfo: vi.fn(),
}));

vi.mock('../../../../app/components/core/Spinner', () => ({ default: () => <div data-testid='mock-spinner' /> }));

const mockIcon = () => <svg data-testid='mock-icon' />;
const mockExtension: ExtensionConfig = { title: 'Test Wallet', website: 'test-wallet.app', features: '*' };
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

describe('ExtensionButton', () => {
  let mockConnect: any;
  let mockDisconnect: any;

  beforeEach(() => {
    mockConnect = vi.fn();
    mockDisconnect = vi.fn();

    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connect: mockConnect,
      disconnect: mockDisconnect,
      connectedWallets: [],
    });

    // Default mock for useExtensionInfo with Icon
    vi.mocked(hooks.useExtensionInfo).mockReturnValue({
      Icon: mockIcon,
      extension: mockExtension,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render wallet name and status indicator with icon', () => {
    const { getByText, getByTestId } = render(<ExtensionButton name='test-wallet' />);

    expect(getByText('Test Wallet')).toBeInTheDocument();
    expect(getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render wallet name and status indicator without icon', () => {
    vi.mocked(hooks.useExtensionInfo).mockReturnValue({
      // @ts-ignore
      Icon: undefined,
      extension: mockExtension,
    });

    const { getByText } = render(<ExtensionButton name='test-wallet' />);

    expect(getByText('Test Wallet')).toBeInTheDocument();
    expect(getByText('T')).toBeInTheDocument(); // First letter of wallet title
  });

  it('should show loading spinner when clicked', async () => {
    const { getByRole, getByTestId } = render(<ExtensionButton name='test-wallet' />);

    fireEvent.click(getByRole('button'));

    expect(getByTestId('mock-spinner')).toBeInTheDocument();

    await waitFor(() => expect(mockConnect).toHaveBeenCalled());
  });

  it('should call connect when the wallet is not connected', async () => {
    const { getByRole } = render(<ExtensionButton name='test-wallet' />);

    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(mockConnect).toHaveBeenCalled());
  });

  it('should call disconnect when the wallet is already connected', async () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connect: mockConnect,
      disconnect: mockDisconnect,
      connectedWallets: ['test-wallet'],
    });

    const { getByRole } = render(<ExtensionButton name='test-wallet' />);

    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(mockDisconnect).toHaveBeenCalled());
  });

  it('should handle error when disconnect fails', async () => {
    const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockDisconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));

    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connect: mockConnect,
      disconnect: mockDisconnect,
      connectedWallets: ['test-wallet'],
    });

    const { getByRole } = render(<ExtensionButton name='test-wallet' />);

    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(mockDisconnect).toHaveBeenCalled());

    spyConsoleError.mockRestore();
  });

  it('should render correct status indicator color when connected', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      ...mockWallet,
      connectedWallets: ['test-wallet'],
    });

    const { container } = render(<ExtensionButton name='test-wallet' />);
    const statusIndicator = container.querySelector('[class*="Box-root"]') as HTMLElement;

    expect(statusIndicator).toHaveStyle({ backgroundColor: expect.stringContaining('success') });
  });

  it('should render correct status indicator color when disconnected', () => {
    const { container } = render(<ExtensionButton name='test-wallet' />);
    const statusIndicator = container.querySelector('[class*="Box-root"]') as HTMLElement;

    expect(statusIndicator).toHaveStyle({ backgroundColor: expect.stringContaining('error') });
  });
});
