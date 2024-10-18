import {
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmVersionedAssets,
  XcmVersionedLocation,
} from '@polkadot-api/descriptors';
import { AccountId, Binary, type SS58String } from 'polkadot-api';
import { parseUnits } from '../../utils';
import type { Api } from '../api';
import type { Chain, ChainId, ChainIdAssetHub, ChainIdRelay } from '../chains';
import type { Token } from '../tokens';
import { Direction, establishDirection } from './establishDirection';

const encodeAccount = AccountId().enc;

export const getBeneficiary = (address: SS58String | Uint8Array): XcmVersionedLocation =>
  XcmVersionedLocation.V4({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        network: undefined,
        id: Binary.fromBytes(address instanceof Uint8Array ? address : encodeAccount(address)),
      })
    ),
  });

const getDest = (direction: Direction, destChain: Chain) => {
  switch (direction) {
    case Direction.SystemToPara:
    case Direction.ParaToPara:
    case Direction.RelayToPara:
    case Direction.ParaToSystem:
    case Direction.RelayToSystem:
    case Direction.SystemToSystem:
      return XcmVersionedLocation.V4({
        parents: 0, // Same relay chain
        interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(+destChain.chainId)),
      });

    case Direction.SystemToRelay:
    case Direction.ParaToRelay:
      return XcmVersionedLocation.V4({
        parents: 1, // Moving up to the relay chain
        interior: XcmV3Junctions.Here(),
      });

    default:
      throw new Error('Unsupported direction');
  }
};

const getGlobalConsensus = (destChain: Chain) => {
  switch (destChain.relay) {
    case 'kusama':
      return XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Kusama());
    case 'polkadot':
      return XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Polkadot());
    case 'paseo':
      return XcmV3Junction.GlobalConsensus({
        type: 'Paseo',
        value: undefined,
      } as any);
    case 'rococo':
      return XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Rococo());
    case 'westend':
      return XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Westend());
    default:
      throw new Error('Unsupported relay');
  }
};

const getAssets = (
  parents: number,
  isSameRelayChain: boolean,
  originChain: Chain,
  destChain: Chain,
  token: Token,
  plancks: bigint
) => {
  return XcmVersionedAssets.V4([
    {
      id: {
        parents: parents,
        interior:
          token.type === 'native'
            ? XcmV3Junctions.Here()
            : XcmV3Junctions.X2([
                getGlobalConsensus(destChain),
                XcmV3Junction.GeneralKey({
                  length: token.symbol.length,
                  data: Binary.fromBytes(new Uint8Array([...Buffer.from(token.symbol)])),
                }),
              ]),
      },
      fun: XcmV3MultiassetFungibility.Fungible(plancks),
    },
  ]);
};

interface XcmTransferArgs {
  assets: XcmVersionedAssets;
  dest: XcmVersionedLocation;
  beneficiary: XcmVersionedLocation;
  fee_asset_item: number;
  weight_limit: XcmV3WeightLimit;
}

const getTransferArgs = (
  direction: Direction,
  originChain: Chain,
  destChain: Chain,
  token: Token,
  address: string,
  plancks: bigint
): XcmTransferArgs => {
  const isSameRelayChain = originChain.relay === destChain.relay;

  switch (direction) {
    case Direction.SystemToRelay:
      return {
        dest: XcmVersionedLocation.V4({
          parents: isSameRelayChain ? 1 : 2,
          interior: isSameRelayChain ? XcmV3Junctions.Here() : XcmV3Junctions.X1(getGlobalConsensus(destChain)),
        }),
        beneficiary: getBeneficiary(address),
        assets: getAssets(1, isSameRelayChain, originChain, destChain, token, plancks),
        fee_asset_item: 0,
        weight_limit: XcmV3WeightLimit.Unlimited(),
      };
    case Direction.SystemToSystem:
      return {
        dest: XcmVersionedLocation.V4({
          parents: isSameRelayChain ? 1 : 2,
          interior: isSameRelayChain
            ? XcmV3Junctions.Here()
            : XcmV3Junctions.X2([getGlobalConsensus(destChain), XcmV3Junction.Parachain(destChain.paraId!)]),
        }),
        beneficiary: getBeneficiary(address),
        assets: getAssets(1, isSameRelayChain, originChain, destChain, token, plancks),
        fee_asset_item: 0,
        weight_limit: XcmV3WeightLimit.Unlimited(),
      };

    default:
      throw new Error('Unsupported direction');
  }
};

export const getXcmTransferExtrinsic = (
  api: Api<ChainId>,
  token: Token,
  amount: string,
  address: SS58String,
  destChain: Chain
) => {
  const plancks = parseUnits(amount, token.decimals);
  const direction = establishDirection(api, destChain);

  const originChain = api.chain;

  const args = getTransferArgs(direction, originChain, destChain, token, address, plancks);
  const isOriginRelayChain = api.chain.chainId === '0';
  const pallet = isOriginRelayChain ? 'XcmPallet' : 'PolkadotXcm';

  switch (pallet) {
    case 'PolkadotXcm':
      return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.transfer_assets({ ...args });

    case 'XcmPallet':
      return (api as Api<ChainIdRelay>).tx.XcmPallet.transfer_assets({ ...args });

    default:
      throw new Error('Xcm pallet not supported');
  }
};
