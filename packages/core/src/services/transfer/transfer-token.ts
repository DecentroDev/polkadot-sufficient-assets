import { MultiAddress } from '@polkadot-api/descriptors';
import type { SS58String } from 'polkadot-api';
import { getAssetIdByChain, getAssetPalletByChain, parseUnits } from '../../utils';
import type { Api } from '../api';
import type { ChainId, ChainIdAssetHub, ChainIdPara } from '../chains';
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
      const assetId = getAssetIdByChain(token, chain.id);
      if (!assetId) throw new Error(`Token ${token.symbol} does not have an assetId`);
      const assetPallet = getAssetPalletByChain(token, chain.id);
      if (assetPallet === 'tokens') {
        return (api as Api<ChainIdPara>).tx.Tokens.transfer({
          dest: dest,
          amount: plancks,
          currency_id: Number(assetId),
        });
      }

      return (api as Api<ChainIdAssetHub>).tx.Assets.transfer({
        id: Number(assetId),
        target: MultiAddress.Id(dest),
        amount: plancks,
      });
    }

    default: {
      return null;
    }
  }
};
