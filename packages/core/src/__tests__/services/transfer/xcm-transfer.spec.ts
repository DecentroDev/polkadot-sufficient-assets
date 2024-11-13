import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type Api,
  type Chain,
  type ChainIdAssetHub,
  type ChainIdPara,
  type ChainIdRelay,
  chains,
  getXcmTransferExtrinsic,
  type Token,
} from '../../../services';
import { establishDirection } from '../../../services/transfer/establishDirection';
import {
  getXcmTransferArgs,
  getXTokenAssetTransferArgs,
  getXTokenMultiAssetTransferArgs,
} from '../../../services/transfer/xcm-argument';
import { parseUnits } from '../../../utils';

vi.mock(import('../../../utils'), () => ({
  parseUnits: vi.fn(),
}));

vi.mock(import('../../../services/transfer/establishDirection'), () => ({
  establishDirection: vi.fn(),
}));

vi.mock(import('../../../services/transfer/xcm-argument'), () => ({
  getXcmTransferArgs: vi.fn(),
  getXTokenAssetTransferArgs: vi.fn(),
  getXTokenMultiAssetTransferArgs: vi.fn(),
}));

describe('getXcmTransferExtrinsic', () => {
  const apiMock: any = {
    chain: { chainId: '0' },
    tx: {
      XcmPallet: {
        limited_reserve_transfer_assets: vi.fn(),
        transfer_assets: vi.fn(),
        limited_teleport_assets: vi.fn(),
        teleport_assets: vi.fn(),
        reserve_transfer_assets: vi.fn(),
      },
      PolkadotXcm: {
        limited_reserve_transfer_assets: vi.fn(),
        transfer_assets: vi.fn(),
        limited_teleport_assets: vi.fn(),
        teleport_assets: vi.fn(),
        reserve_transfer_assets: vi.fn(),
      },
      XTokens: {
        transfer: vi.fn(),
        transfer_multiasset: vi.fn(),
      },
    },
  } as unknown as Api<any>;
  const tokenMock = { decimals: 12, xcmExtrinsic: vi.fn() } as unknown as Token;
  const address = 'sampleAddress';
  const amount = '100';
  const destChain = {} as Chain;

  beforeEach(() => {
    vi.clearAllMocks();
    (parseUnits as any).mockReturnValue('100000000000');
    (establishDirection as any).mockReturnValue('mockDirection');
  });

  it('should handle XTokens.transfer extrinsic', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('XTokens.transfer');
    (getXTokenAssetTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdPara>, tokenMock, amount, address, destChain);

    expect(parseUnits).toHaveBeenCalledWith(amount, tokenMock.decimals);
    expect(establishDirection).toHaveBeenCalledWith(apiMock, destChain);
    expect(getXTokenAssetTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XTokens as any).transfer({ mockArg: 'value' }));
  });

  it('should handle limited_reserve_transfer_assets extrinsic in PolkadotXcm', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('limited_reserve_transfer_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = 'notZero'; // Sets it to a non-relay chain to use PolkadotXcm
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.PolkadotXcm as any).limited_reserve_transfer_assets({ mockArg: 'value' }));
  });

  it('should handle limited_reserve_transfer_assets extrinsic in XcmPallet', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('limited_reserve_transfer_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = '0'; // Sets it to relay chain to use XcmPallet
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdRelay>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XcmPallet as any).limited_reserve_transfer_assets({ mockArg: 'value' }));
  });

  it('should handle XTokens.transfer_multiasset extrinsic in PolkadotXcm', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('XTokens.transfer_multiasset');
    (getXTokenMultiAssetTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = 'notZero';
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXTokenMultiAssetTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XTokens as any).transfer_multiasset({ mockArg: 'value' }));
  });

  it('should handle transfer_asset extrinsic in PolkadotXcm', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('transfer_asset');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = 'notZero'; // Ensures it’s using PolkadotXcm for non-relay chains
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.PolkadotXcm as any).transfer_assets({ mockArg: 'value' }));
  });

  it('should handle transfer_asset extrinsic in XcmPallet', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('transfer_asset');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });
    apiMock.chain = chains.polkadotChain;

    apiMock.chain.chainId = '0'; // Sets it to relay chain, so XcmPallet is used
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdRelay>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XcmPallet as any).transfer_assets({ mockArg: 'value' }));
  });

  it('should handle limited_teleport_assets extrinsic in PolkadotXcm', () => {
    apiMock.chain = chains.paseoAssetHubChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('limited_teleport_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.PolkadotXcm as any).limited_teleport_assets({ mockArg: 'value' }));
  });

  it('should handle limited_teleport_assets extrinsic in XcmPallet', () => {
    apiMock.chain = chains.polkadotChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('limited_teleport_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdRelay>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XcmPallet as any).limited_teleport_assets({ mockArg: 'value' }));
  });

  it('should handle teleport_assets extrinsic in PolkadotXcm', () => {
    apiMock.chain = chains.polkadotAssetHubChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('teleport_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = 'notZero'; // Ensures it’s using PolkadotXcm for non-relay chains
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.PolkadotXcm as any).teleport_assets({ mockArg: 'value' }));
  });

  it('should handle teleport_assets extrinsic in XcmPallet', () => {
    apiMock.chain = chains.polkadotChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('teleport_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    apiMock.chain.chainId = '0';
    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdRelay>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XcmPallet as any).teleport_assets({ mockArg: 'value' }));
  });

  it('should handle reserve_transfer_assets extrinsic in PolkadotXcm', () => {
    apiMock.chain = chains.polkadotAssetHubChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('reserve_transfer_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdAssetHub>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.PolkadotXcm as any).reserve_transfer_assets({ mockArg: 'value' }));
  });

  it('should handle reserve_transfer_assets extrinsic in XcmPallet', () => {
    apiMock.chain = chains.polkadotChain;
    (tokenMock.xcmExtrinsic as any).mockReturnValue('reserve_transfer_assets');
    (getXcmTransferArgs as any).mockReturnValue({ mockArg: 'value' });

    const result = getXcmTransferExtrinsic(apiMock as Api<ChainIdRelay>, tokenMock, amount, address, destChain);

    expect(getXcmTransferArgs).toHaveBeenCalledWith(
      'mockDirection',
      apiMock.chain,
      destChain,
      tokenMock,
      address,
      '100000000000'
    );
    expect(result).toEqual((apiMock.tx.XcmPallet as any).reserve_transfer_assets({ mockArg: 'value' }));
  });

  it('should throw error for unsupported extrinsic method', () => {
    (tokenMock.xcmExtrinsic as any).mockReturnValue('unsupported_method');

    expect(() => getXcmTransferExtrinsic(apiMock, tokenMock, amount, address, destChain)).toThrowError(
      'Method not supported'
    );
  });
});
