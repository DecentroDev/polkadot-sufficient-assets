import { XcmV3Junction, XcmV3Junctions, XcmV3WeightLimit, XcmVersionedAssets } from '@polkadot-api/descriptors';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chains, isParachain, isSystemChain, tokens, type Chain, type Token } from '../../../services';
import { Direction } from '../../../services/transfer/establishDirection';
import {
  _getGlobalConsensus,
  _getMultiLocationInterior,
  _getMultiLocationParent,
  getBeneficiary,
  getXcmTransferArgs,
  getXTokenAssetTransferArgs,
  getXTokenMultiAssetTransferArgs,
} from '../../../services/transfer/xcm-argument';

const mockAddress = '7MkyBH5ohx9NkMis6fsWxkexBRiVX4X6ibZN3CFYesWoXYxR';
const mockChain: Chain = chains.hydration;
const mockToken: Token = {
  location: vi.fn().mockReturnValue(XcmVersionedAssets.V3({} as any)),
  ...tokens.USDT_HDX,
};

vi.mock(import('polkadot-api'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AccountId: vi.fn().mockImplementation(() => ({
      enc: vi.fn(() => 'mocked_account_id'),
    })),
  };
});
// @ts-ignore
vi.mock(import('../../../services/chains/chain-validate'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isParachain: vi.fn(),
    isSystemChain: vi.fn(),
  };
});

describe('XCM Transfer Functions', () => {
  describe('getBeneficiary', () => {
    it('should return the correct beneficiary structure', () => {
      const result = getBeneficiary(mockAddress);
      expect(result.value.interior.type).toEqual('X1');
    });
  });

  describe('getXcmTransferArgs', () => {
    it('should return correct XcmTransferArgs', () => {
      const plancks = BigInt(1000000);
      const args = getXcmTransferArgs(Direction.ParaToRelay, mockChain, mockChain, mockToken, mockAddress, plancks);

      expect(args).toHaveProperty('dest');
      expect(args.assets).toBeDefined();
      expect(args.fee_asset_item).toBe(0);
      expect(args.weight_limit).toStrictEqual(XcmV3WeightLimit.Unlimited());
    });

    it('should throw error if token has no location', () => {
      const invalidToken: Token = {
        decimals: 0,
        symbol: '',
        name: '',
        isSufficient: false,
      }; // Simulate token without location
      const plancks = BigInt(1000000);

      expect(() =>
        getXcmTransferArgs(Direction.ParaToRelay, mockChain, mockChain, invalidToken, mockAddress, plancks)
      ).toThrow('Token has no location!');
    });
  });

  describe('getXTokenMultiAssetTransferArgs', () => {
    it('should return correct XTokenMultiAssetTransferArgs', () => {
      const plancks = BigInt(1000000);
      const args = getXTokenMultiAssetTransferArgs(
        Direction.ParaToRelay,
        mockChain,
        mockChain,
        mockToken,
        mockAddress,
        plancks
      );

      expect(args).toHaveProperty('dest');
      expect(args.asset).toBeDefined();
      expect(args.dest_weight_limit).toStrictEqual(XcmV3WeightLimit.Unlimited());
    });
  });

  describe('getXTokenAssetTransferArgs', () => {
    it('should return correct XTokenAssetTransferArgs', () => {
      const plancks = BigInt(1000000);
      const args = getXTokenAssetTransferArgs(
        Direction.SystemToSystem,
        mockChain,
        mockChain,
        mockToken,
        mockAddress,
        plancks
      );

      expect(args).toHaveProperty('currency_id');
      expect(args.currency_id).toBeGreaterThan(0);
      expect(args.amount).toBe(plancks);
      expect(args.dest_weight_limit).toStrictEqual(XcmV3WeightLimit.Unlimited());
    });
  });

  describe('_getGlobalConsensus', () => {
    it('should return correct XcmV3JunctionNetworkId with kusama chain', () => {
      const destChain = chains.kusamaChain;
      const result = _getGlobalConsensus(destChain);
      expect(result).toEqual({
        type: 'GlobalConsensus',
        value: {
          type: destChain.name,
          value: undefined,
        },
      });
    });

    it('should return correct XcmV3JunctionNetworkId with polkadot chain', () => {
      const destChain = chains.polkadotChain;
      const result = _getGlobalConsensus(destChain);
      expect(result).toEqual({
        type: 'GlobalConsensus',
        value: {
          type: destChain.name,
          value: undefined,
        },
      });
    });

    it('should return correct XcmV3JunctionNetworkId with paseo chain', () => {
      const destChain = chains.paseoChain;
      const result = _getGlobalConsensus(destChain);
      expect(result).toEqual({
        type: 'GlobalConsensus',
        value: {
          type: destChain.name,
          value: undefined,
        },
      });
    });

    it('should return correct XcmV3JunctionNetworkId with rococo chain', () => {
      const destChain = chains.rococoChain;
      const result = _getGlobalConsensus(destChain);
      expect(result).toEqual({
        type: 'GlobalConsensus',
        value: {
          type: destChain.name,
          value: undefined,
        },
      });
    });

    it('should return correct XcmV3JunctionNetworkId with westend chain', () => {
      const destChain = chains.westendChain;
      const result = _getGlobalConsensus(destChain);
      expect(result).toEqual({
        type: 'GlobalConsensus',
        value: {
          type: destChain.name,
          value: undefined,
        },
      });
    });

    it('should throw error with unsupported chain', () => {
      const destChain: any = { relay: 'unsupported', name: 'unsupported' };
      expect(() => _getGlobalConsensus(destChain)).toThrowError('Unsupported relay');
    });
  });

  describe('_getMultiLocationParent', () => {
    it('should return 1 if origin chain is a parachain and same relay chain', () => {
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(false);
      const result = _getMultiLocationParent(mockChain, true);
      expect(result).toBe(1);
    });

    it('should return 1 if origin chain is a system chain and same relay chain', () => {
      (isParachain as any).mockReturnValue(false);
      (isSystemChain as any).mockReturnValue(true);
      const result = _getMultiLocationParent(mockChain, true);
      expect(result).toBe(1);
    });

    it('should return 2 if origin chain is a parachain and not the same relay chain', () => {
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(false);
      const result = _getMultiLocationParent(mockChain, false);
      expect(result).toBe(2);
    });

    it('should return 2 if origin chain is a system chain and not the same relay chain', () => {
      (isParachain as any).mockReturnValue(false);
      (isSystemChain as any).mockReturnValue(true);
      const result = _getMultiLocationParent(mockChain, false);
      expect(result).toBe(2);
    });

    it('should return 0 if origin chain is neither a parachain nor a system chain and is the same relay chain', () => {
      (isParachain as any).mockReturnValue(false);
      (isSystemChain as any).mockReturnValue(false);
      const result = _getMultiLocationParent(mockChain, true);
      expect(result).toBe(0);
    });

    it('should return 1 if origin chain is neither a parachain nor a system chain and not the same relay chain', () => {
      (isParachain as any).mockReturnValue(false);
      (isSystemChain as any).mockReturnValue(false);
      const result = _getMultiLocationParent(mockChain, false);
      expect(result).toBe(1);
    });
  });

  describe('_getMultiLocationInterior', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    const mockDestChain: Chain = {
      chainId: 1,
      relay: 'kusama',
      type: 'para',
      id: 'kusama',
      name: '',
      specName: '',
      wsUrls: [],
      logo: '',
      blockExplorerUrl: null,
    };

    const mockDestSystemChain: Chain = chains.paseoAssetHubChain;

    it('should return XcmV3Junctions.Here when no junctions', () => {
      (isParachain as any).mockReturnValue(false);
      (isSystemChain as any).mockReturnValue(false);

      const result = _getMultiLocationInterior(mockDestChain, true);

      expect(result).toEqual({
        type: 'Here',
        value: undefined,
      });
    });

    it('should return XcmV3Junctions.X1 when one junction', () => {
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(false);

      const result = _getMultiLocationInterior(mockDestChain, false);

      expect(result).toEqual({
        type: 'X2',
        value: [
          { type: 'GlobalConsensus', value: { type: 'Kusama', value: undefined } },
          {
            type: 'Parachain',
            value: 1,
          },
        ],
      });
    });

    it('should return XcmV3Junctions.X2 when two junctions', () => {
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(true);
      const result = _getMultiLocationInterior(mockDestChain, false);
      expect(result).toEqual({
        type: 'X2',
        value: [
          {
            type: 'GlobalConsensus',
            value: {
              type: 'Kusama',
              value: undefined,
            },
          },
          {
            type: 'Parachain',
            value: 1,
          },
        ],
      });
    });

    it('should return XcmV3Junctions.X2 when two junctions and not same relay', () => {
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(true);
      const result = _getMultiLocationInterior(mockDestSystemChain, false);
      expect(result).toEqual({
        type: 'X2',
        value: [
          {
            type: 'GlobalConsensus',
            value: {
              type: 'Paseo',
              value: undefined,
            },
          },
          {
            type: 'Parachain',
            value: 1000,
          },
        ],
      });
    });

    it('should return XcmV3Junctions.X3 when three junctions with recipient', () => {
      const recipient = 'recipient-id';
      (isParachain as any).mockReturnValue(true);
      (isSystemChain as any).mockReturnValue(true);

      const result = _getMultiLocationInterior(mockDestChain, false, recipient);

      const expected = {
        type: 'X3',
        value: [
          {
            type: 'GlobalConsensus',
            value: {
              type: 'Kusama',
              value: undefined,
            },
          },
          {
            type: 'Parachain',
            value: 1,
          },
          {
            type: 'AccountId32',
            value: {
              network: undefined,
              id: expect.any(Object),
            },
          },
        ],
      };
      expect(result).toEqual(expected);
    });
  });

  it('should add Parachain junction when isSameRelayChain is true and destChain is a parachain', () => {
    // Arrange
    const destChain = chains.hydration;
    const isSameRelayChain = true;
    const recipient = undefined;

    // Mock `isParachain` and `isSystemChain`
    (isParachain as any).mockReturnValue(true);
    (isSystemChain as any).mockReturnValue(false);

    // Act
    const result = _getMultiLocationInterior(destChain, isSameRelayChain, recipient);

    // Assert
    expect(result).toEqual(XcmV3Junctions.X1(XcmV3Junction.Parachain(destChain.chainId!)));
  });
});
