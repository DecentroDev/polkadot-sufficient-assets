import { describe, expect, it, vi } from 'vitest';
import { getExtension } from '../../lib/getExtension';

import { Extensions } from '@polkadot-ui/assets/extensions';

vi.mock('@polkadot-ui/assets/extensions', () => ({
  Extensions: {
    wallet1: { title: 'Wallet 1', website: 'wallet1.app' },
    wallet2: { title: 'Wallet 2', website: 'wallet2.app' },
  },
  getExtensionIcon: vi.fn((walletId: string) => (walletId in Extensions ? `icon-${walletId}.png` : null)),
}));

describe('getExtension', () => {
  it('should return the correct extension and icon for valid walletId', () => {
    const walletId = 'wallet1';
    const result = getExtension(walletId);

    expect(result.extension).toEqual({ title: 'Wallet 1', website: 'wallet1.app' });
    expect(result.Icon).toBe('icon-wallet1.png');
  });

  it('should return undefined extension for invalid walletId', () => {
    const walletId = 'invalid-wallet';
    const result = getExtension(walletId);

    expect(result.extension).toBeUndefined();
    expect(result.Icon).toBeNull();
  });

  it('should return the correct icon for another valid walletId', () => {
    const result = getExtension('wallet2');
    expect(result.extension).toEqual({ title: 'Wallet 2', website: 'wallet2.app' });
    expect(result.Icon).toBe('icon-wallet2.png');
  });
});
