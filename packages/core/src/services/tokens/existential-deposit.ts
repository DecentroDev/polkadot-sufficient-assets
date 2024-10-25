import { getAssetIdByChain, getAssetPalletByChain } from '../../utils';
import type { Api } from '../api';
import type { ChainId, ChainIdAssetHub } from '../chains';
import type { Token } from './create-token';

export const getExistentialDeposit = async (token: Token, api: Api<ChainId>) => {
  switch (token.type) {
    case 'asset': {
      const assetId = getAssetIdByChain(token, api.chainId);
      if (!assetId) throw new Error(`Token ${token.symbol} does not have an assetId`);
      const assetPallet = getAssetPalletByChain(token, api.chainId);
      if (assetPallet === 'assets') {
        const asset = await (api as Api<ChainIdAssetHub>).query.Assets.Asset.getValue(Number(assetId), {
          at: 'best',
        });
        if (asset?.min_balance) {
          return asset.min_balance;
        }
      }
      return 0n;
    }

    case 'native': {
      const existentialDeposit = await api.constants.Balances.ExistentialDeposit();

      if (existentialDeposit) {
        return existentialDeposit as bigint;
      }
      return 0n;
    }

    default:
      throw new Error(`Unsupported token type: ${token.symbol}`);
  }
};
