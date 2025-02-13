import type { ExtensionConfig } from '@polkadot-ui/assets/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExtensionInfo } from '../../hooks/useExtensionInfo';
import { getExtension } from '../../lib/getExtension';

vi.mock('../../lib/getExtension');

describe('useExtensionInfo hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockName = 'subwallet-js';
  const mockIcon = () => <svg data-testid='mock-icon' />;
  const mockExtension: ExtensionConfig = { title: 'Test Wallet', website: 'test-wallet.app', features: '*' };
  const mockExtensionInfo = { Icon: mockIcon, extension: mockExtension };

  it('should call getExtension with the correct name', () => {
    vi.mocked(getExtension).mockReturnValue(mockExtensionInfo);

    const { result } = renderHook(() => useExtensionInfo(mockName));

    expect(getExtension).toHaveBeenCalledWith(mockName);
    expect(result.current).toEqual(mockExtensionInfo);
  });

  it('should return undefined if getExtension does not find the extension', () => {
    const mockName = 'nonExistentExtension';

    // @ts-ignore
    vi.mocked(getExtension).mockReturnValue(undefined);

    const { result } = renderHook(() => useExtensionInfo(mockName));

    expect(getExtension).toHaveBeenCalledWith(mockName);
    expect(result.current).toBeUndefined();
  });

  it('should memoize the result for the same input', () => {
    vi.mocked(getExtension).mockReturnValue(mockExtensionInfo);

    const { result, rerender } = renderHook(({ name }) => useExtensionInfo(name), {
      initialProps: { name: mockName },
    });

    const firstResult = result.current;

    rerender({ name: mockName });

    expect(getExtension).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstResult);
  });

  it('should compute a new result when the name changes', () => {
    const mockName1 = 'polkadot-js';
    const mockName2 = 'subwallet-js';
    const mockExtension1: ExtensionConfig = { title: 'Test Wallet 1', website: 'test-wallet-1.app', features: '*' };
    const mockExtension2: ExtensionConfig = { title: 'Test Wallet 2', website: 'test-wallet-2.app', features: '*' };
    const mockExtensionInfo1 = { Icon: mockIcon, extension: mockExtension1 };
    const mockExtensionInfo2 = { Icon: mockIcon, extension: mockExtension2 };

    vi.mocked(getExtension).mockReturnValueOnce(mockExtensionInfo1).mockReturnValueOnce(mockExtensionInfo2);

    const { result, rerender } = renderHook(({ name }) => useExtensionInfo(name), {
      initialProps: { name: mockName1 },
    });

    expect(result.current).toEqual(mockExtensionInfo1);

    rerender({ name: mockName2 });

    expect(getExtension).toHaveBeenCalledWith(mockName2);
    expect(result.current).toEqual(mockExtensionInfo2);
  });
});
