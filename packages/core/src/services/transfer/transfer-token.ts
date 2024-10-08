import { MultiAddress } from '@polkadot-api/descriptors';
import type { SS58String } from 'polkadot-api';
import { parseUnits } from '../../utils';
import { isApiAssetHub, type Api } from '../api';
import type { ChainId, ChainIdAssetHub } from '../chains';
import type { Token } from '../tokens';

export const getTransferExtrinsic = (api: Api<ChainId>, token: Token, amount: string, dest: SS58String) => {
  const plancks = parseUnits(amount, token.decimals);
  const chain = api.chain;

  switch (token.type) {
    case 'native':
      return (api as Api<ChainIdAssetHub>).tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id(dest),
        value: plancks,
      });

    case 'asset': {
      if (!isApiAssetHub(api)) throw new Error(`Chain ${chain.name} does not have the Assets pallet`);
      if (!token.assetId) throw new Error(`Token ${token.symbol} does not have an assetId`);

      return api.tx.Assets.transfer({
        id: token.assetId,
        target: MultiAddress.Id(dest),
        amount: plancks,
      });
    }

    default: {
      return null;
    }
  }
};
