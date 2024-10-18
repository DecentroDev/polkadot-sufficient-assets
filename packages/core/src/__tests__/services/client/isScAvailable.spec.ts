import { beforeEach, describe, expect, it, vi } from 'vitest';
import { discoverScProviders } from '../../../services/client/discoverScProviders';
import { isScAvailableScProvider } from '../../../services/client/isScAvailable';

vi.mock(import('../../../services/client/discoverScProviders'));

describe('isScAvailableScProvider', () => {
  let mockProvider: unknown;

  beforeEach(() => {
    (global as any).SUBSTRATE_CONNECT_PROVIDER_CACHE = null;
    vi.clearAllMocks();
  });

  it('should return null when no provider is available', async () => {
    (discoverScProviders as any).mockReturnValue([{ provider: null }]);
    const result = await isScAvailableScProvider();
    expect(result).toBeNull();
  });

  it('should return the provider when it is available', async () => {
    mockProvider = null;
    (discoverScProviders as any).mockReturnValue([{ provider: Promise.resolve(mockProvider) }]);
    const result = await isScAvailableScProvider();
    expect(result).toBe(mockProvider);
  });

  it('should cache the provider', async () => {
    mockProvider = null;
    (discoverScProviders as any).mockReturnValue([{ provider: Promise.resolve(mockProvider) }]);

    const result1 = await isScAvailableScProvider();
    const result2 = await isScAvailableScProvider();

    expect(result1).toBe(mockProvider);
    expect(result2).toBe(mockProvider);
    expect(discoverScProviders).toHaveBeenCalledTimes(0);
  });
});
