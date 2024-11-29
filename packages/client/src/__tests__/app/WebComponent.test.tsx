import { createTheme } from '@mui/material/styles';
import type { Chain, Config } from '@polkadot-sufficient-assets/core';
import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebPSADialog, WebPSAForm } from '../../app/WebComponent';

vi.mock('@mui/material/Dialog', () => ({
  default: ({ children, open, onClose }: any) => (
    <div data-testid='dialog' data-open={open} onClick={onClose}>
      {children}
    </div>
  ),
}));

vi.mock('@mui/material/DialogContent', () => ({
  default: ({ children }: any) => <div data-testid='dialog-content'>{children}</div>,
}));

vi.mock('../../app/PolkadotSufficientAsset', () => ({
  default: () => <div data-testid='polkadot-sufficient-asset'>PolkadotSufficientAsset</div>,
}));

const mockChain: Chain = {
  id: 'pah',
  name: 'Polkadot Asset Hub',
  specName: 'asset-hub-polkadot',
  wsUrls: ['wss://statemint-rpc.dwellir.com'],
  relay: 'polkadot',
  type: 'system',
  chainId: 1000,
  logo: './chains/pah.svg',
  blockExplorerUrl: 'https://assethub-polkadot.subscan.io',
};

const mockConfig: Config = {
  useXcmTransfer: false,
  sourceChains: [mockChain],
};

const mockTheme = createTheme({});

describe('WebComponent', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('WebPSADialog', () => {
    const mockHandleClose = vi.fn();

    it('renders dialog with correct props', () => {
      render(<WebPSADialog config={mockConfig} theme={mockTheme} open={true} handleClose={mockHandleClose} />);

      const dialog = screen.getByTestId('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog.getAttribute('data-open')).toBe('true');

      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toBeInTheDocument();

      const polkadotComponent = screen.getByTestId('polkadot-sufficient-asset');
      expect(polkadotComponent).toBeInTheDocument();
    });

    it('calls handleClose when dialog is closed', () => {
      render(<WebPSADialog config={mockConfig} theme={mockTheme} open={true} handleClose={mockHandleClose} />);

      const dialog = screen.getByTestId('dialog');
      dialog.click();
      expect(mockHandleClose).toHaveBeenCalled();
    });

    it('renders with default theme when theme prop is not provided', () => {
      render(<WebPSADialog config={mockConfig} open={true} handleClose={mockHandleClose} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  describe('WebPSAForm', () => {
    it('renders form correctly', () => {
      render(<WebPSAForm config={mockConfig} theme={mockTheme} />);

      const polkadotComponent = screen.getByTestId('polkadot-sufficient-asset');
      expect(polkadotComponent).toBeInTheDocument();
    });

    it('renders with default theme when theme prop is not provided', () => {
      render(<WebPSAForm config={mockConfig} />);

      expect(screen.getByTestId('polkadot-sufficient-asset')).toBeInTheDocument();
    });
  });
});
