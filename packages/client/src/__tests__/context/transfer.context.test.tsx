import { chains, type Config, tokens } from '@polkadot-sufficient-assets/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../../context/config.context';
import { TransferContext, TransferProvider } from '../../context/transfer.context';
import { WalletProvider } from '../../context/wallet.context';
import * as hooks from '../../hooks';

const mockConfig: Config = {
  sourceChains: [chains.polkadotChain],
  useXcmTransfer: true,
  destinationChains: [chains.kusamaChain],
  destinationAddress: '0x123',
  // @ts-ignore
  lightClients: { enable: true },
};

vi.mock('../../hooks', () => ({
  useConfig: vi.fn(() => mockConfig),
  useToken: vi.fn(() => ({
    feeTokens: [tokens.DOT, tokens.KSM],
    token: tokens.DOT,
  })),
  useApi: vi.fn(() => [vi.fn(), true]),
}));

describe('TransferProvider', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders with default values and provides context', () => {
    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <WalletProvider>
          <TransferProvider>
            <TransferContext.Consumer>
              {(context) => (
                <div>
                  <p>Fee Tokens: {context?.feeTokens.map((t) => t.symbol).join(', ')}</p>
                  <p>Native Token: {context?.nativeToken.symbol}</p>
                  <p>Token: {context?.token.symbol}</p>
                  <p>Chain: {context?.chain.id}</p>
                  <p>Use XCM Transfer: {String(context?.useXcmTransfer)}</p>
                  <p>Destination Chains: {context?.destinationChains.map((t) => t.id).join(', ')}</p>
                </div>
              )}
            </TransferContext.Consumer>
          </TransferProvider>
        </WalletProvider>
      </ConfigProvider>
    );

    expect(getByText('Fee Tokens: DOT, KSM')).toBeInTheDocument();
    expect(getByText('Native Token: DOT')).toBeInTheDocument();
    expect(getByText('Token: DOT')).toBeInTheDocument();
    expect(getByText('Chain: polkadot')).toBeInTheDocument();
    expect(getByText('Use XCM Transfer: true')).toBeInTheDocument();
    expect(getByText('Destination Chains: kusama')).toBeInTheDocument();
  });

  it('sets default nativeToken to DOT when feeTokens is not provided', () => {
    vi.mocked(hooks.useToken).mockReturnValue({ feeTokens: [], token: tokens.DOT });

    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <WalletProvider>
          <TransferProvider>
            <TransferContext.Consumer>
              {(context) => (
                <div>
                  <p>Native Token: {context?.nativeToken.symbol}</p>
                </div>
              )}
            </TransferContext.Consumer>
          </TransferProvider>
        </WalletProvider>
      </ConfigProvider>
    );

    expect(getByText('Native Token: DOT')).toBeInTheDocument();
  });

  it('changes feeToken when changeFeeToken is called', () => {
    render(
      <ConfigProvider config={mockConfig}>
        <WalletProvider>
          <TransferProvider>
            <TransferContext.Consumer>
              {(context) => (
                <div>
                  <button onClick={() => context?.changeFeeToken(tokens.KSM)}>Change Fee Token</button>
                  <p>Fee Token: {context?.feeToken.symbol}</p>
                </div>
              )}
            </TransferContext.Consumer>
          </TransferProvider>
        </WalletProvider>
      </ConfigProvider>
    );

    expect(screen.getByText('Fee Token: DOT')).toBeInTheDocument();

    const button = screen.getByText('Change Fee Token');
    fireEvent.click(button);
    expect(screen.getByText('Fee Token: KSM')).toBeInTheDocument();
  });

  it('handles null token value', () => {
    vi.mocked(hooks.useToken).mockReturnValue({
      feeTokens: [tokens.DOT],
      token: undefined,
    });

    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <TransferProvider>
          <TransferContext.Consumer>
            {(context) => (
              <div>
                <p>Token: {context?.token.symbol}</p>
              </div>
            )}
          </TransferContext.Consumer>
        </TransferProvider>
      </ConfigProvider>
    );

    expect(getByText('Token: DOT')).toBeInTheDocument();
  });

  it('handles null feeTokens value', () => {
    vi.mocked(hooks.useToken).mockReturnValue({
      feeTokens: undefined,
      token: tokens.DOT,
    });

    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <TransferProvider>
          <TransferContext.Consumer>
            {(context) => (
              <div>
                <p>Fee Tokens Length: {context?.feeTokens.length}</p>
              </div>
            )}
          </TransferContext.Consumer>
        </TransferProvider>
      </ConfigProvider>
    );

    expect(getByText('Fee Tokens Length: 0')).toBeInTheDocument();
  });

  it('handles null destinationChains and config values', () => {
    const mockConfigWithNulls: Config = {
      sourceChains: [chains.polkadotChain],
      useXcmTransfer: undefined,
      destinationChains: undefined,
      destinationAddress: undefined,
      lightClients: undefined,
    };

    vi.mocked(hooks.useConfig).mockReturnValue(mockConfigWithNulls);

    const { getByText } = render(
      <ConfigProvider config={mockConfigWithNulls}>
        <TransferProvider>
          <TransferContext.Consumer>
            {(context) => (
              <div>
                <p>Destination Chains Length: {context?.destinationChains.length}</p>
                <p>Use XCM Transfer: {String(context?.useXcmTransfer)}</p>
                <p>Has Destination: {String(!!context?.destinationAddress)}</p>
                <p>Light Client Enable: {String(!!context?.lightClientEnable)}</p>
              </div>
            )}
          </TransferContext.Consumer>
        </TransferProvider>
      </ConfigProvider>
    );

    expect(getByText('Destination Chains Length: 0')).toBeInTheDocument();
    expect(getByText('Use XCM Transfer: false')).toBeInTheDocument();
    expect(getByText('Has Destination: false')).toBeInTheDocument();
    expect(getByText('Light Client Enable: false')).toBeInTheDocument();
  });

  it('renders WalletProvider as a child', () => {
    render(
      <ConfigProvider config={mockConfig}>
        <WalletProvider>
          <TransferProvider>
            <div>WalletProvider Child</div>
          </TransferProvider>
        </WalletProvider>
      </ConfigProvider>
    );
    expect(screen.getByText('WalletProvider Child')).toBeInTheDocument();
  });
});
