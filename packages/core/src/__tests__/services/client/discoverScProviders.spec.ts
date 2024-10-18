import { beforeEach, describe, expect, it, vi } from 'vitest';
import { discoverScProviders, type ProviderDetail } from '../../../services/client/discoverScProviders';

// Mock the CustomEvent to ensure it works in the testing environment
class MockEvent {
  detail: any;
  type: any;
  constructor(type: string, detail: any) {
    this.type = type;
    this.detail = detail;
  }
}

beforeEach(() => {
  // @ts-ignore
  window.dispatchEvent = vi.fn((event: MockEvent) => {
    if (event.type === 'substrateDiscovery:requestProvider') {
      const { onProvider } = event.detail;

      const mockProvider: ProviderDetail = {
        kind: 'mock-kind',
        info: {
          uuid: '1234',
          name: 'Mock Provider',
          icon: 'mock-icon.png',
          rdns: 'mock.rdns',
        },
        provider: {},
      };

      onProvider(mockProvider);
    }
  });
});

describe('discoverScProviders', () => {
  it('should return an array of provider details', () => {
    const providers = discoverScProviders();

    expect(providers).toHaveLength(1);
    expect(providers[0]).toMatchObject({
      kind: 'mock-kind',
      info: {
        uuid: '1234',
        name: 'Mock Provider',
        icon: 'mock-icon.png',
        rdns: 'mock.rdns',
      },
      provider: {},
    });
  });

  it('should return an empty array if no providers respond', () => {
    // @ts-ignore
    window.dispatchEvent = vi.fn((event: MockEvent) => {
      if (event.type === 'substrateDiscovery:requestProvider') {
        const { onProvider } = event.detail;
      }
    });

    const providers = discoverScProviders();
    expect(providers).toHaveLength(0);
  });
});
