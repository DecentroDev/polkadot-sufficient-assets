import type { XcmVersionedAssets } from '@polkadot-api/descriptors';
import type { Assign } from '../../types';
import type { Chain } from '../chains';

export type BalancePallet = 'assets' | 'system' | 'balances' | 'tokens' | 'ormlTokens';

export type Token = {
  readonly assetId?: number;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;
  readonly logo?: string;
  readonly isSufficient: boolean;
  readonly type?: 'asset' | 'native' | 'custom' | 'foreign-asset';
  readonly location?: (plancks: bigint, originChain: Chain, destChain: Chain) => XcmVersionedAssets;

  /**
   * * Specific the xcm extrinsic to use for execute xcm transaction
   */
  readonly xcmExtrinsic?: (
    originChain: Chain,
    destChain: Chain
  ) =>
    | 'limited_reserve_transfer_assets'
    | 'limited_teleport_assets'
    | 'reserve_transfer_assets'
    | 'teleport_assets'
    | 'transfer_asset';

  /**
   * * Specific the pallet to query native asset balance
   */
  balancePallet?: Record<string, BalancePallet>;
  /**
   * * Id to query balance of asset with key is chain id *[id] in Chain* and value is the asset id to query
   */
  assetIds?: Record<string, string | number>;
};

export const createToken = <const token extends Token>(token: token) => {
  return token as Assign<Token, token>;
};
