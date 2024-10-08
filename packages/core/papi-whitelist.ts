import type { KahWhitelistEntry, PolkadotWhitelistEntry } from '@polkadot-api/descriptors';

type WhiteListEntry = KahWhitelistEntry | PolkadotWhitelistEntry;

export const whitelist: WhiteListEntry[] = [
  'tx.Assets.transfer',
  'tx.Assets.transfer_keep_alive',
  'tx.Balances.transfer_keep_alive',
  'tx.ForeignAssets.transfer',
  'tx.Utility.batch_all',
  'tx.PolkadotXcm.limited_teleport_assets',
  'tx.XcmPallet.limited_teleport_assets',
  'query.System.Account',
  'query.System.Number',
  'query.AssetConversion.Pools',
  'query.PoolAssets.Asset',
  'query.PoolAssets.Account',
  'query.Assets.Asset',
  'query.Assets.Account',
  'query.Assets.Metadata',
  'query.ForeignAssets.Asset',
  'query.ForeignAssets.Account',
  'query.ForeignAssets.Metadata',
  'query.Balances.TotalIssuance',
  'const.AssetConversion.LPFee',
  'const.Balances.ExistentialDeposit',
  'api.AssetConversionApi.*',
];
