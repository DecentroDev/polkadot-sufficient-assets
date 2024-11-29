import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { type IWalletContext, WalletContext } from '../../context/wallet.context';
import { useWallet } from '../../hooks/useWallet';

describe('useWallet', () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <WalletContext.Provider value={mockWallet}>{children}</WalletContext.Provider>;
  };

  it('should return transfer context value when provider exists', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current).toBe(mockWallet);
  });

  it('should throw an error when context is not provided', () => {
    expect(() => {
      renderHook(() => useWallet(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <WalletContext.Provider value={null}>{children}</WalletContext.Provider>
        ),
      });
    }).toThrowError('WalletProvider not found');
  });
});
