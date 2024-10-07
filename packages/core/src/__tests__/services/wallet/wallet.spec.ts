import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Wallet } from '../../../services/wallet';

describe('Wallet', () => {
  beforeEach(async () => {
    localStorage.clear();
    Wallet._instance = null;
  });

  it('should get injected wallet ids', async () => {
    expect(Wallet.instance.getInjectedWalletIds()).toEqual([]);
  });

  it('should connect to wallet', async () => {
    await expect(Wallet.instance.connect('talisman')).rejects.toThrowError('Unavailable extension: "talisman"');
  });

  it('should disconnect from wallet', async () => {
    await expect(Wallet.instance.disconnect('talisman')).resolves.toEqual(undefined);
  });

  it('should get all connected accounts', async () => {
    await expect(Wallet.instance.getAllConnectedAccounts()).resolves.toEqual({});
  });

  it('should subscribe to account changes', async () => {
    const cb = vi.fn();
    await Wallet.instance.subscribeAccounts(cb);
    expect(cb).not.toHaveBeenCalled();
  });
});
