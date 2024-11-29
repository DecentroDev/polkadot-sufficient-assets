import { type Api, type ChainId, chains, tokens } from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TransferContext } from '../../context/transfer.context';
import { useTransfer } from '../../hooks/useTransfer';

const mockApi = {
  chain: {
    id: 'asset-hub',
    name: '',
    specName: '',
    wsUrls: [],
    relay: null,
    chainId: null,
    logo: '',
    type: 'relay',
    blockExplorerUrl: null,
  },
  tx: {
    Balances: { transfer_keep_alive: vi.fn() },
    Assets: { transfer: vi.fn() },
    Tokens: {
      transfer: vi.fn(),
    },
  },
};

describe('useTransfer', () => {
  const mockTransferValue = {
    api: mockApi as unknown as Api<ChainId>,
    token: tokens.DOT,
    feeToken: tokens.DOT,
    changeFeeToken: vi.fn(),
    feeTokens: [tokens.DOT, tokens.USDT],
    nativeToken: tokens.DOT,
    chain: chains.polkadotChain,
    destinationAddress: undefined,
    isLoaded: true,
    lightClientEnable: false,
    useXcmTransfer: false,
    destinationChains: [],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <TransferContext.Provider value={mockTransferValue}>{children}</TransferContext.Provider>;
  };

  it('should return transfer context value when provider exists', () => {
    const { result } = renderHook(() => useTransfer(), { wrapper });

    expect(result.current).toBe(mockTransferValue);
  });

  it('should throw an error when context is not provided', () => {
    expect(() => {
      renderHook(() => useTransfer(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <TransferContext.Provider value={null}>{children}</TransferContext.Provider>
        ),
      });
    }).toThrowError('TransferProvider not found');
  });
});
