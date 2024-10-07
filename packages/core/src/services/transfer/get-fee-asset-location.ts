import { XcmV3Junction, XcmV3Junctions } from '@polkadot-api/descriptors';
import type { Token } from '../tokens';

export const getFeeAssetLocation = (feeToken: Token) => {
  if (!feeToken.isSufficient) throw new Error(`Token ${feeToken.symbol} (${feeToken.assetId}) is not sufficient`);

  if (feeToken.assetId && feeToken.type !== 'native') {
    return {
      parents: 0,
      interior: XcmV3Junctions.X2([
        XcmV3Junction.PalletInstance(50),
        XcmV3Junction.GeneralIndex(BigInt(feeToken.assetId)),
      ]),
    };
  }
  return undefined;
};
