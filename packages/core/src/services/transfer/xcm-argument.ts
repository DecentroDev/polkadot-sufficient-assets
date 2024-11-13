import {
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmVersionedLocation,
  type XcmVersionedAssets,
} from '@polkadot-api/descriptors';
import { AccountId, Binary, type SS58String } from 'polkadot-api';
import { getAssetIdByChain } from '../../utils';
import { isParachain, isSystemChain, type Chain } from '../chains';
import type { Token, XTokenVersionedAsset } from '../tokens';
import type { Direction } from './establishDirection';

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

export const _getGlobalConsensus = (destChain: Chain) => {
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

export function _getMultiLocationParent(originChainInfo: Chain, isSameRelayChain: boolean): number {
  let parent = 0;

  if (isParachain(originChainInfo) || isSystemChain(originChainInfo)) {
    parent += 1;
  }

  if (!isSameRelayChain) {
    parent += 1;
  }

  return parent;
}

export function _getMultiLocationInterior(
  destChain: Chain,
  isSameRelayChain: boolean,
  recipient?: SS58String | Uint8Array
) {
  const junctions: XcmV3Junction[] = [];

  if (isSameRelayChain) {
    if (isParachain(destChain) || isSystemChain(destChain)) {
      junctions.push(XcmV3Junction.Parachain(destChain.chainId!));
    }
  } else {
    junctions.push(_getGlobalConsensus(destChain));

    if (isParachain(destChain) || isSystemChain(destChain)) {
      junctions.push(XcmV3Junction.Parachain(destChain.chainId!));
    }
  }

  if (recipient) {
    junctions.push(
      XcmV3Junction.AccountId32({
        network: undefined,
        id: Binary.fromBytes(recipient instanceof Uint8Array ? recipient : AccountId().enc(recipient)),
      })
    );
  }

  switch (junctions.length) {
    case 0:
      return XcmV3Junctions.Here();
    case 1:
      return XcmV3Junctions.X1(junctions[0]);
    case 2:
      return XcmV3Junctions.X2([junctions[0], junctions[1]]);
    case 3:
      return XcmV3Junctions.X3([junctions[0], junctions[1], junctions[2]]);
    default:
      throw new Error('Unsupported junctions');
  }
}

export const getDest = (
  isSameRelayChain: boolean,
  originChain: Chain,
  destChain: Chain,
  recipient?: SS58String | Uint8Array
) => {
  const parents = _getMultiLocationParent(originChain, isSameRelayChain);
  const interior = _getMultiLocationInterior(destChain, isSameRelayChain, recipient);

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

export const getXcmTransferArgs = (
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

  const assets = token.location(plancks, originChain, destChain) as XcmVersionedAssets;

  return {
    dest,
    assets,
    beneficiary: getBeneficiary(address),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  };
};

interface XTokenMultiAssetTransferArgs {
  asset: XTokenVersionedAsset;
  dest: XcmVersionedLocation;
  dest_weight_limit: XcmV3WeightLimit;
}

export const getXTokenMultiAssetTransferArgs = (
  direction: Direction,
  originChain: Chain,
  destChain: Chain,
  token: Token,
  address: string,
  plancks: bigint
): XTokenMultiAssetTransferArgs => {
  if (!token.location) throw new Error('Token has no location!');

  const isSameRelayChain = originChain.relay === destChain.relay;

  const dest = getDest(isSameRelayChain, originChain, destChain, address);

  const asset = token.location(plancks, originChain, destChain) as XTokenVersionedAsset;
  return {
    asset,
    dest,
    dest_weight_limit: XcmV3WeightLimit.Unlimited(),
  };
};

interface XTokenAssetTransferArgs {
  currency_id: number;
  amount: bigint;
  dest: XcmVersionedLocation;
  dest_weight_limit: XcmV3WeightLimit;
}

export const getXTokenAssetTransferArgs = (
  direction: Direction,
  originChain: Chain,
  destChain: Chain,
  token: Token,
  address: string,
  plancks: bigint
): XTokenAssetTransferArgs => {
  if (!token.location) throw new Error('Token has no location!');

  const isSameRelayChain = originChain.relay === destChain.relay;

  const dest = getDest(isSameRelayChain, originChain, destChain, address);

  const assetId = getAssetIdByChain(token, originChain.id);

  return {
    currency_id: Number(assetId),
    amount: plancks,
    dest: dest,
    dest_weight_limit: XcmV3WeightLimit.Unlimited(),
  };
};
