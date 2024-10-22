import {
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmVersionedLocation,
  type XcmVersionedAssets,
} from '@polkadot-api/descriptors';
import { AccountId, Binary, type SS58String } from 'polkadot-api';
import { parseUnits } from '../../utils';
import type { Api } from '../api';
import {
  isParachain,
  isSystemChain,
  type Chain,
  type ChainId,
  type ChainIdAssetHub,
  type ChainIdRelay,
} from '../chains';
import type { Token } from '../tokens';
import { establishDirection, type Direction } from './establishDirection';

export const getBeneficiary = (address: SS58String | Uint8Array): XcmVersionedLocation =>
  XcmVersionedLocation.V3({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        network: undefined,
        id: Binary.fromBytes(address instanceof Uint8Array ? address : AccountId().enc(address)),
      })
    ),
  });

const _getGlobalConsensus = (destChain: Chain) => {
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

function _getMultiLocationParent(originChainInfo: Chain, isSameRelayChain: boolean): number {
  let parent = 0;

  if (isParachain(originChainInfo) || isSystemChain(originChainInfo)) {
    parent += 1;
  }

  if (!isSameRelayChain) {
    parent += 1;
  }

  return parent;
}

function _getMultiLocationInterior(destChain: Chain, isSameRelayChain: boolean) {
  const junctions: XcmV3Junction[] = [];

  if (isSameRelayChain) {
    if (isParachain(destChain) || isSystemChain(destChain)) {
      junctions.push(XcmV3Junction.Parachain(destChain.paraId!));
    }
  } else {
    junctions.push(_getGlobalConsensus(destChain));

    if (isParachain(destChain) || isSystemChain(destChain)) {
      junctions.push(XcmV3Junction.Parachain(destChain.paraId!));
    }
  }

  switch (junctions.length) {
    case 0:
      return XcmV3Junctions.Here();
    case 1:
      return XcmV3Junctions.X1(junctions[0]);
    case 2:
      return XcmV3Junctions.X2([junctions[0], junctions[1]]);
    default:
      throw new Error('Unsupported junctions');
  }
}

const getDest = (isSameRelayChain: boolean, originChain: Chain, destChain: Chain) => {
  const parents = _getMultiLocationParent(originChain, isSameRelayChain);
  const interior = _getMultiLocationInterior(destChain, isSameRelayChain);

  return XcmVersionedLocation.V3({
    parents,
    interior,
  });
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
  if (!token.location) throw new Error('Token has no location!');

  const isSameRelayChain = originChain.relay === destChain.relay;

  const dest = getDest(isSameRelayChain, originChain, destChain);

  const assets = token.location(plancks, originChain, destChain);

  return {
    dest,
    assets,
    beneficiary: getBeneficiary(address),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  };
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
  const xcmExtrinsic = token.xcmExtrinsic?.(originChain, destChain) ?? 'limited_reserve_transfer_assets';

  switch (xcmExtrinsic) {
    case 'limited_reserve_transfer_assets': {
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.limited_reserve_transfer_assets({ ...args });
      }
      if (pallet === 'XcmPallet') {
        return (api as Api<ChainIdRelay>).tx.XcmPallet.limited_reserve_transfer_assets({ ...args });
      }
      throw new Error('Xcm pallet not supported');
    }

    case 'transfer_asset': {
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.transfer_assets({ ...args });
      }
      if (pallet === 'XcmPallet') {
        return (api as Api<ChainIdRelay>).tx.XcmPallet.transfer_assets({ ...args });
      }
      throw new Error('Xcm pallet not supported');
    }
    case 'limited_teleport_assets': {
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.limited_teleport_assets({ ...args });
      }
      if (pallet === 'XcmPallet') {
        return (api as Api<ChainIdRelay>).tx.XcmPallet.limited_teleport_assets({ ...args });
      }
      throw new Error('Xcm pallet not supported');
    }
    case 'teleport_assets': {
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.teleport_assets({ ...args });
      }
      if (pallet === 'XcmPallet') {
        return (api as Api<ChainIdRelay>).tx.XcmPallet.teleport_assets({ ...args });
      }
      throw new Error('Xcm pallet not supported');
    }

    case 'reserve_transfer_assets': {
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.reserve_transfer_assets({ ...args });
      }
      if (pallet === 'XcmPallet') {
        return (api as Api<ChainIdRelay>).tx.XcmPallet.reserve_transfer_assets({ ...args });
      }
      throw new Error('Xcm pallet not supported');
    }

    default:
      throw new Error('Method not supported');
  }
};
