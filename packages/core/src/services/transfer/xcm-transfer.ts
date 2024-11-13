import type { SS58String } from 'polkadot-api';
import { parseUnits } from '../../utils';
import type { Api } from '../api';
import {
  isRelayChain,
  type Chain,
  type ChainId,
  type ChainIdAssetHub,
  type ChainIdPara,
  type ChainIdRelay,
} from '../chains';
import type { Token } from '../tokens';
import { establishDirection } from './establishDirection';
import { getXcmTransferArgs, getXTokenAssetTransferArgs, getXTokenMultiAssetTransferArgs } from './xcm-argument';

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

  const isOriginRelayChain = isRelayChain(originChain);
  const pallet = isOriginRelayChain ? 'XcmPallet' : 'PolkadotXcm';
  const xcmExtrinsic = token.xcmExtrinsic?.(originChain, destChain) ?? 'limited_reserve_transfer_assets';
  switch (xcmExtrinsic) {
    case 'XTokens.transfer': {
      const args = getXTokenAssetTransferArgs(direction, originChain, destChain, token, address, plancks);
      return (api as Api<ChainIdPara>).tx.XTokens.transfer({ ...args });
    }

    case 'XTokens.transfer_multiasset': {
      const args = getXTokenMultiAssetTransferArgs(direction, originChain, destChain, token, address, plancks);
      return (api as Api<ChainIdPara>).tx.XTokens.transfer_multiasset({ ...args });
    }

    case 'limited_reserve_transfer_assets': {
      const args = getXcmTransferArgs(direction, originChain, destChain, token, address, plancks);
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm?.limited_reserve_transfer_assets({ ...args });
      }
      return (api as Api<ChainIdRelay>).tx.XcmPallet?.limited_reserve_transfer_assets({ ...args });
    }

    case 'transfer_asset': {
      const args = getXcmTransferArgs(direction, originChain, destChain, token, address, plancks);
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.transfer_assets({ ...args });
      }
      return (api as Api<ChainIdRelay>).tx.XcmPallet.transfer_assets({ ...args });
    }
    case 'limited_teleport_assets': {
      const args = getXcmTransferArgs(direction, originChain, destChain, token, address, plancks);
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.limited_teleport_assets({ ...args });
      }
      return (api as Api<ChainIdRelay>).tx.XcmPallet.limited_teleport_assets({ ...args });
    }
    case 'teleport_assets': {
      const args = getXcmTransferArgs(direction, originChain, destChain, token, address, plancks);
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.teleport_assets({ ...args });
      }
      return (api as Api<ChainIdRelay>).tx.XcmPallet.teleport_assets({ ...args });
    }

    case 'reserve_transfer_assets': {
      const args = getXcmTransferArgs(direction, originChain, destChain, token, address, plancks);
      if (pallet === 'PolkadotXcm') {
        return (api as Api<ChainIdAssetHub>).tx.PolkadotXcm.reserve_transfer_assets({ ...args });
      }
      return (api as Api<ChainIdRelay>).tx.XcmPallet.reserve_transfer_assets({ ...args });
    }

    default:
      throw new Error('Method not supported');
  }
};
