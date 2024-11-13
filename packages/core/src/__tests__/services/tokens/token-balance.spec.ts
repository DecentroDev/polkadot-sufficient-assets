import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Api, type ChainId, getTokenBalance, subscribeTokenBalance, type Token, tokens } from '../../../services';
import { getAssetPalletByChain } from '../../../utils';

vi.mock(import('../../../utils'), () => ({
  getAssetPalletByChain: vi.fn(),
}));

// Mocking API structure
const createMockApi = (chainId: ChainId) => ({
  chainId,
  query: {
    Assets: {
      Account: {
        watchValue: vi.fn().mockReturnValue({
          subscribe: vi.fn((cb: Function) => {
            const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
            cb(assetAccount); // Call the callback with mock data
            return { unsubscribe: vi.fn() }; // Return unsubscribe mock
          }),
        }),
        getValue: vi.fn(),
      },
    },
    System: {
      Account: {
        watchValue: vi.fn(),
        getValue: vi.fn(),
      },
    },
    Balances: {
      Account: {
        watchValue: vi.fn(),
        getValue: vi.fn(),
      },
    },
    Tokens: {
      Accounts: {
        watchValue: vi.fn(),
        getValue: vi.fn(),
      },
    },
    OrmlTokens: {
      Accounts: {
        watchValue: vi.fn(),
        getValue: vi.fn(),
      },
    },
  },
});

describe('subscribeTokenBalance', () => {
  let api: Api<ChainId>;
  let token: Token;
  let mockCallback: () => void;

  beforeEach(() => {
    api = createMockApi('hdx') as unknown as Api<ChainId>;
    token = { assetIds: { hdx: 1 }, type: 'token' } as unknown as Token;
    mockCallback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when address, api, or token is missing', () => {
    expect(subscribeTokenBalance(undefined, token, 'address', mockCallback)).toBeUndefined();
    expect(subscribeTokenBalance(api, undefined, 'address', mockCallback)).toBeUndefined();
    expect(subscribeTokenBalance(api, token, undefined, mockCallback)).toBeUndefined();
  });

  it('should subscribe to Assets and call the callback', () => {
    const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(assetAccount);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query as any).Assets.Account.watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('assets');

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to System and call the callback', () => {
    const systemAccount = { data: { free: 7000n, frozen: 2000n } };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(systemAccount);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query.System.Account as any).watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('system');

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to Balances and call the callback', () => {
    const balanceData = { free: 3000n, frozen: 1000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(balanceData);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query.Balances.Account as any).watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('balances');

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(2000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to Tokens and call the callback', () => {
    const tokenAccount = { free: 8000n, frozen: 3000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(tokenAccount);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query as any).Tokens.Accounts.watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('tokens');

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to OrmlTokens and call the callback', () => {
    const ormlTokenAccount = { free: 6000n, frozen: 1000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(ormlTokenAccount);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query as any).OrmlTokens.Accounts.watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('ormlTokens');

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to assets when token type is not native and token assetId is defined', () => {
    token = tokens.USDT;
    const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(assetAccount);
        return { unsubscribe: vi.fn() };
      }),
    };
    ((api.query as any).Assets.Account.watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue(null); // Ensures it falls to else

    const subscription = subscribeTokenBalance(api, token, 'address', mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });

  it('should subscribe to system when token type is native or assetId is undefined', () => {
    const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
    const subscriptionMock = {
      subscribe: vi.fn((cb: Function) => {
        cb(assetAccount);
        return { unsubscribe: vi.fn() };
      }),
    };

    // Override `watchValue` for this test
    ((api.query as any).System.Account.watchValue as any).mockReturnValue(subscriptionMock);
    (getAssetPalletByChain as any).mockReturnValue('assets');

    const subscription = subscribeTokenBalance(api, tokens.DOT, 'address', mockCallback);

    // expect(mockCallback).toHaveBeenCalledWith(5000n);
    expect(subscription).toBeDefined();
  });
});

describe('getTokenBalance', () => {
  let api: Api<ChainId>;
  let token: Token;

  beforeEach(() => {
    api = createMockApi('hdx') as unknown as Api<ChainId>;
    token = { assetIds: { hdx: 1 }, type: 'token' } as unknown as Token;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when address, api, or token is missing', async () => {
    await expect(getTokenBalance(undefined, token, 'address')).resolves.toBeUndefined();
    await expect(getTokenBalance(api, undefined, 'address')).resolves.toBeUndefined();
    await expect(getTokenBalance(api, token, undefined)).resolves.toBeUndefined();
  });

  it('should fetch Assets and return the correct balance', async () => {
    const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
    ((api.query as any).Assets.Account.getValue as any).mockResolvedValue(assetAccount);
    (getAssetPalletByChain as any).mockReturnValue('assets');

    const balance = await getTokenBalance(api, token, 'address');

    expect(balance).toBe(5000n);
  });

  it('should fetch System and return the correct balance', async () => {
    const systemAccount = { data: { free: 7000n, frozen: 2000n } };
    ((api.query.System as any).Account.getValue as any).mockResolvedValue(systemAccount);
    (getAssetPalletByChain as any).mockReturnValue('system');

    const balance = await getTokenBalance(api, token, 'address');

    expect(balance).toBe(5000n);
  });

  it('should fetch Balances and return the correct balance', async () => {
    const balanceData = { free: 3000n, frozen: 1000n };
    ((api.query.Balances as any).Account.getValue as any).mockResolvedValue(balanceData);
    (getAssetPalletByChain as any).mockReturnValue('balances');

    const balance = await getTokenBalance(api, token, 'address');

    expect(balance).toBe(2000n);
  });

  it('should fetch Tokens and return the correct balance', async () => {
    const tokenAccount = { free: 8000n, frozen: 3000n };
    ((api.query as any).Tokens.Accounts.getValue as any).mockResolvedValue(tokenAccount);
    (getAssetPalletByChain as any).mockReturnValue('tokens');

    const balance = await getTokenBalance(api, token, 'address');

    expect(balance).toBe(5000n);
  });

  it('should fetch OrmlTokens and return the correct balance', async () => {
    const ormlTokenAccount = { free: 6000n, frozen: 1000n };
    ((api.query as any).OrmlTokens.Accounts.getValue as any).mockResolvedValue(ormlTokenAccount);
    (getAssetPalletByChain as any).mockReturnValue('ormlTokens');

    const balance = await getTokenBalance(api, token, 'address');

    expect(balance).toBe(5000n);
  });

  it('should fallback to assets when token is not native and has an assetId', async () => {
    const token = { type: 'non-native', assetId: 1 } as unknown as Token;
    (getAssetPalletByChain as any).mockReturnValue(undefined);

    const assetAccount = { status: { type: 'Liquid' }, balance: 5000n };
    ((api.query as any).Assets.Account.getValue as any).mockResolvedValue(assetAccount);

    const balance = await getTokenBalance(api, token, 'address');

    expect((api.query as any).Assets.Account.getValue).toHaveBeenCalledWith(1, 'address', { at: 'best' });
    expect(balance).toBe(5000n);
  });

  it('should fallback to system when token is native or does not have an assetId', async () => {
    const token = { type: 'native' } as Token;
    (getAssetPalletByChain as any).mockReturnValue(undefined);

    const systemAccount = { data: { free: 7000n, frozen: 2000n } };
    ((api.query as any).System.Account.getValue as any).mockResolvedValue(systemAccount);

    const balance = await getTokenBalance(api, token, 'address');

    expect((api.query as any).System.Account.getValue).toHaveBeenCalledWith('address', { at: 'best' });
    expect(balance).toBe(5000n);
  });
});
