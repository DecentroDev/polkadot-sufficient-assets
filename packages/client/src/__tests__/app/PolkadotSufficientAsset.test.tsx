import { chains, type Chain, type Config } from '@polkadot-sufficient-assets/core';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PolkadotSufficientAsset from '../../app/PolkadotSufficientAsset';
import { ConfigProvider } from '../../context';

vi.mock('../../app/components/Transfer', () => ({
  default: ({ initialAmount }: { initialAmount?: string }) => (
    <div data-testid='transfer-dialog' data-initial-amount={initialAmount}>
      Transfer Dialog
    </div>
  ),
}));

vi.mock('../../app/components/XcmTransfer', () => ({
  default: ({ initialAmount }: { initialAmount?: string }) => (
    <div data-testid='xcm-transfer-dialog' data-initial-amount={initialAmount}>
      XCM Transfer Dialog
    </div>
  ),
}));

const mockChain: Chain = {
  ...chains.westendAssetHubChain,
};

describe('PolkadotSufficientAsset', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockConfig: Config = {
    useXcmTransfer: false,
    sourceChains: [mockChain],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider config={mockConfig}>{children}</ConfigProvider>
  );

  it('should render TransferDialog when useXcmTransfer is false', () => {
    render(<PolkadotSufficientAsset initialAmount='100' />, { wrapper });
    expect(screen.getByTestId('transfer-dialog')).toBeInTheDocument();
  });

  it('should render XcmTransferDialog when useXcmTransfer is true', () => {
    const xcmConfig: Config = {
      useXcmTransfer: true,
      sourceChains: [mockChain],
    };
    const xcmWrapper = ({ children }: { children: React.ReactNode }) => (
      <ConfigProvider config={xcmConfig}>{children}</ConfigProvider>
    );

    render(<PolkadotSufficientAsset initialAmount='100' />, { wrapper: xcmWrapper });
    expect(screen.getByTestId('xcm-transfer-dialog')).toBeInTheDocument();
  });

  it('should pass initialAmount prop correctly', () => {
    const initialAmount = '500';
    render(<PolkadotSufficientAsset initialAmount={initialAmount} />, { wrapper });

    const transferDialog = screen.getByTestId('transfer-dialog');
    expect(transferDialog).toHaveAttribute('data-initial-amount', initialAmount);
  });
});
