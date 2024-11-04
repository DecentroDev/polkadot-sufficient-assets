import {
  chains,
  createToken,
  tokens,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetAssetId,
  XcmV3MultiassetFungibility,
  XcmVersionedAssets,
} from 'polkadot-sufficient-assets';

export const USDT = createToken({
  type: 'asset',
  assetId: 10,
  decimals: 6,
  symbol: 'USDT',
  name: 'Tether USD',
  logo: './img/tokens/USDT.svg',
  isSufficient: true,
  assetPallet: {
    [chains.hydration.id]: 'tokens',
    [chains.polkadotAssetHubChain.id]: 'assets',
  },
  assetIds: {
    [chains.hydration.id]: 10,
    [chains.polkadotAssetHubChain.id]: 1984,
  },
  xcmExtrinsic: (originChain) => {
    if (originChain.id === chains.polkadotAssetHubChain.id) return 'limited_reserve_transfer_assets';
    if (originChain.id === chains.hydration.id) return 'XTokens.transfer_multiasset';
    return 'limited_reserve_transfer_assets';
  },
  location: (plancks, originChain, destChain) => {
    if (originChain.id === chains.hydration.id) {
      return {
        type: 'V3',
        value: {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.X3([
              XcmV3Junction.Parachain(destChain.paraId!),
              XcmV3Junction.PalletInstance(50),
              XcmV3Junction.GeneralIndex(1984n),
            ]),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(plancks),
        },
      };
    }

    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: 0,
          interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(1984n)]),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});

export const USDC = createToken({
  ...tokens.WND_USDC,
  assetPallet: {
    [chains.westendAssetHubChain.id]: 'assets',
    [chains.rococoAssetHubChain.id]: 'assets',
  },
  assetIds: {
    [chains.westendAssetHubChain.id]: 31337,
    [chains.rococoAssetHubChain.id]: 31337,
  },
  xcmExtrinsic: (originChain) => {
    if (originChain.id === chains.westendAssetHubChain.id) return 'limited_reserve_transfer_assets';
    return 'limited_reserve_transfer_assets';
  },
  location: (plancks) => {
    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: 0,
          interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(31337n)]),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});

export const WND = createToken({
  ...tokens.WND,
  location: (plancks, originChain) => {
    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: originChain.type === 'relay' ? 0 : 1,
          interior: XcmV3Junctions.Here(),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});

export const HDX = createToken({
  ...tokens.HDX,
  location: (plancks, originChain) => {
    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: originChain.type === 'relay' ? 0 : 1,
          interior: XcmV3Junctions.Here(),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});
