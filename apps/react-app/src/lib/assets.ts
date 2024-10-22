import {
  chains,
  createToken,
  tokens,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetAssetId,
  XcmV3MultiassetFungibility,
  XcmVersionedAssets,
} from '@polkadot-sufficient-assets/react';

export const USDT = createToken({
  ...tokens.USDT_HDX,
  balancePallet: {
    [chains.hydration.id]: 'tokens',
    [chains.polkadotAssetHubChain.id]: 'assets',
  },
  assetIds: {
    [chains.hydration.id]: 10,
    [chains.polkadotAssetHubChain.id]: 1984,
  },
  location: (plancks, originChain) => {
    const assetIds = originChain.id === 'hdx' ? 10n : 1984n;
    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: 0,
          interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(assetIds)]),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});
