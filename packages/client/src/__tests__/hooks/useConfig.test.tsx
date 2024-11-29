import { chains, type Config } from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ConfigContext, ConfigProvider } from '../../context/config.context';
import { useConfig } from '../../hooks/useConfig';

describe('useConfig hook', () => {
  const mockConfig: Config = {
    sourceChains: [chains.polkadotChain],
    useXcmTransfer: true,
    destinationChains: [chains.kusamaChain],
    destinationAddress: '0x123',
  };

  it('should return the config when context is provided', () => {
    const { result } = renderHook(() => useConfig(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ConfigProvider config={mockConfig}>{children}</ConfigProvider>
      ),
    });

    expect(result.current).toEqual(mockConfig);
  });

  it('should throw an error when context is not provided', () => {
    expect(() => {
      renderHook(() => useConfig(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <ConfigContext.Provider value={null}>{children}</ConfigContext.Provider>
        ),
      });
    }).toThrowError('Config not found');
  });
});
