import { type Chain, chains } from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useChainId from '../../hooks/useChainId'; // Adjust the path as needed
import { useConfig } from '../../hooks/useConfig';

// Mock the useConfig hook
vi.mock('../../hooks/useConfig', () => ({
  useConfig: vi.fn(),
}));

describe('useChainId hook', () => {
  const mockSourceChains: [Chain] = [chains.polkadotChain];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfig).mockReturnValue({
      sourceChains: mockSourceChains,
      useXcmTransfer: true,
      destinationChains: [chains.kusamaChain],
      destinationAddress: '0x123',
    });
  });

  it('should return the correct chain for a valid chainId', () => {
    const { result } = renderHook(() => useChainId(chains.polkadotChain.id));
    expect(result.current).toEqual(mockSourceChains[0]);
  });

  it('should return undefined for an invalid chainId', () => {
    const { result } = renderHook(() => useChainId('invalid-chain'));
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when no chainId is passed', () => {
    const { result } = renderHook(() => useChainId(undefined as any));
    expect(result.current).toBeUndefined();
  });

  it('should call useConfig to fetch chains', () => {
    renderHook(() => useChainId(chains.polkadotChain.id));
    expect(useConfig).toHaveBeenCalledTimes(1);
  });
});
