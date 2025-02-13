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
  ...tokens.USDT_HDX,
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
              XcmV3Junction.Parachain(destChain.chainId!),
              XcmV3Junction.PalletInstance(50),
              XcmV3Junction.GeneralIndex(1984n),
            ] as any),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(plancks),
        },
      };
    }

    return XcmVersionedAssets.V3([
      {
        id: XcmV3MultiassetAssetId.Concrete({
          parents: 0,
          interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(1984n)] as any),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});

export const WND = createToken({
  ...tokens.WND,
  xcmExtrinsic: (originChain, destChain) => {
    // Teleport assets to between assethub and relay chain
    if (['wah', 'westend'].includes(originChain.id) || ['wah', 'westend'].includes(destChain.id)) {
      return 'limited_teleport_assets';
    }
    return 'limited_reserve_transfer_assets';
  },
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

export const DOT = createToken({
  ...tokens.DOT,
  xcmExtrinsic: (originChain, destChain) => {
    // Teleport assets to between assethub and relay chain
    if (['pah', 'polkadot'].includes(originChain.id) || ['pah', 'polkadot'].includes(destChain.id)) {
      return 'limited_teleport_assets';
    }
    return 'limited_reserve_transfer_assets';
  },
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

export const PAS = createToken({
  ...tokens.PAS,
  xcmExtrinsic: (originChain, destChain) => {
    // Teleport assets to between assethub and relay chain
    if (['paseoah', 'paseo'].includes(originChain.id) || ['paseoah', 'paseo'].includes(destChain.id)) {
      return 'limited_teleport_assets';
    }
    return 'limited_reserve_transfer_assets';
  },
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
