import {
  type Chain,
  chains,
  formatBalance,
  getExistentialDeposit,
  type Token,
  tokens,
} from '@polkadot-sufficient-assets/core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useApi from '../../hooks/useApi';
import { useExistentialDeposit } from '../../hooks/useExistentialDeposit';

vi.mock('@polkadot-sufficient-assets/core', async () => {
  const actual = await vi.importActual('@polkadot-sufficient-assets/core');
  return {
    ...actual,
    getExistentialDeposit: vi.fn(),
    formatBalance: vi.fn(),
  };
});

vi.mock('../../hooks/useApi', () => ({
  default: vi.fn(),
}));

describe('useExistentialDeposit', () => {
  const mockChain: Chain = chains.polkadotChain;

  const mockToken: Token = tokens.DOT;

  const mockApi = { chain: mockChain };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(useApi).mockReturnValue([null, false]);

    const { result } = renderHook(() => useExistentialDeposit(mockChain, mockToken));

    expect(result.current).toEqual({
      isLoading: true,
      value: 0n,
      valueFormatted: '0',
    });
  });

  it('should return existential deposit when API is loaded and token is provided', async () => {
    const mockMinValue = 1000000000n;
    vi.mocked(useApi).mockReturnValue([mockApi, true]);
    vi.mocked(getExistentialDeposit).mockResolvedValue(mockMinValue);
    vi.mocked(formatBalance).mockReturnValue('0.1 DOT');

    const { result } = renderHook(() => useExistentialDeposit(mockChain, mockToken));

    await waitFor(() => {
      expect(getExistentialDeposit).toHaveBeenCalledWith(mockToken, mockApi);
      expect(formatBalance).toHaveBeenCalledWith(mockMinValue, mockToken.decimals);
      expect(result.current).toEqual({
        isLoading: false,
        value: mockMinValue,
        valueFormatted: '0.1 DOT',
      });
    });
  });

  it('should not fetch existential deposit if token is not provided', () => {
    vi.mocked(useApi).mockReturnValue([mockApi, true]);

    const { result } = renderHook(() => useExistentialDeposit(mockChain, undefined));

    expect(result.current).toEqual({
      isLoading: true,
      value: 0n,
      valueFormatted: '0',
    });
    expect(getExistentialDeposit).not.toHaveBeenCalled();
  });

  it('should not fetch existential deposit if API is not loaded', () => {
    vi.mocked(useApi).mockReturnValue([null, false]);

    const { result } = renderHook(() => useExistentialDeposit(mockChain, mockToken));

    expect(result.current).toEqual({
      isLoading: true,
      value: 0n,
      valueFormatted: '0',
    });
    expect(getExistentialDeposit).not.toHaveBeenCalled();
  });

  it('should set value to 0n when getExistentialDeposit returns null', async () => {
    vi.mocked(useApi).mockReturnValue([mockApi, true]);
    // @ts-ignore
    vi.mocked(getExistentialDeposit).mockResolvedValue(null);
    vi.mocked(formatBalance).mockReturnValue('0');

    const { result } = renderHook(() => useExistentialDeposit(mockChain, mockToken));

    await waitFor(() => {
      expect(getExistentialDeposit).toHaveBeenCalledWith(mockToken, mockApi);
      expect(result.current).toEqual({
        isLoading: false,
        value: 0n,
        valueFormatted: '0',
      });
    });
  });

  it('should use default decimals (12) when token.decimals is undefined', async () => {
    const mockTokenWithoutDecimals = { ...mockToken, decimals: undefined };
    const mockMinValue = 1000000000n;
    vi.mocked(useApi).mockReturnValue([mockApi, true]);
    vi.mocked(getExistentialDeposit).mockResolvedValue(mockMinValue);
    vi.mocked(formatBalance).mockReturnValue('0.1');

    // @ts-ignore
    const { result } = renderHook(() => useExistentialDeposit(mockChain, mockTokenWithoutDecimals));

    await waitFor(() => {
      expect(getExistentialDeposit).toHaveBeenCalledWith(mockTokenWithoutDecimals, mockApi);
      expect(formatBalance).toHaveBeenCalledWith(mockMinValue, 12);
      expect(result.current).toEqual({
        isLoading: false,
        value: mockMinValue,
        valueFormatted: '0.1',
      });
    });
  });
});
