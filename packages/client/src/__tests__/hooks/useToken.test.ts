import { type ChainId, chains, type TokenConfig, tokens } from '@polkadot-sufficient-assets/core';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfig } from '../../hooks/useConfig';
import { useToken } from '../../hooks/useToken';

vi.mock('../../hooks/useConfig', () => ({
  useConfig: vi.fn(),
}));

describe('useToken', () => {
  let mockTokens: Partial<Record<ChainId, TokenConfig>>;

  beforeEach(() => {
    mockTokens = {
      [chains.polkadotChain.id]: {
        token: tokens.DOT,
        feeTokens: [tokens.USDC, tokens.USDT],
      },
      [chains.kusamaChain.id]: {
        token: tokens.USDC,
        feeTokens: [tokens.DOT, tokens.USDT],
      },
    };

    vi.mocked(useConfig).mockReturnValue({
      chains: [chains.polkadotChain],
      tokens: mockTokens,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return token and feeTokens for the specified chainId', () => {
    const { result } = renderHook(() => useToken(chains.polkadotChain.id));

    expect(result.current).toEqual({
      token: tokens.DOT,
      feeTokens: [tokens.USDC, tokens.USDT],
    });
  });

  it('should return undefined token and empty feeTokens when tokens is undefined', () => {
    vi.mocked(useConfig).mockReturnValue({ chains: [chains.polkadotChain], tokens: undefined });

    const { result } = renderHook(() => useToken(chains.polkadotChain.id));

    expect(result.current).toEqual({
      token: undefined,
      feeTokens: [],
    });
  });

  it('should return undefined token and empty feeTokens when chainId does not exist', () => {
    const { result } = renderHook(() => useToken('non-existent-chain-id'));

    expect(result.current).toEqual({
      token: undefined,
      feeTokens: undefined,
    });
  });

  it('should recompute values when tokens or chainId changes', () => {
    const { result, rerender } = renderHook(({ chainId }) => useToken(chainId), {
      initialProps: { chainId: chains.polkadotChain.id as string },
    });

    expect(result.current).toEqual({
      token: tokens.DOT,
      feeTokens: [tokens.USDC, tokens.USDT],
    });

    rerender({ chainId: chains.kusamaChain.id as string });

    expect(result.current).toEqual({
      token: tokens.USDC,
      feeTokens: [tokens.DOT, tokens.USDT],
    });

    vi.mocked(useConfig).mockReturnValue({ chains: [chains.polkadotChain], tokens: undefined });
    rerender({ chainId: chains.polkadotChain.id });

    expect(result.current).toEqual({
      token: undefined,
      feeTokens: [],
    });
  });
});
