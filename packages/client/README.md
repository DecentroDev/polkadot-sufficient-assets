# Polkadot-Sufficient-Assets UI Library Documentation

## Overview

**Polkadot-Sufficient-Assets UI Library** is a developer-friendly tool that simplifies the process of building asset transfer functionalities within the Polkadot ecosystem. The library supports two types of transfers: same-chain transfers and multi-chain transfers via XCM (Cross-Consensus Messaging). Developers only need to configure the assets and chains to quickly integrate asset transfer features into their applications.

## Key Features

- **Same Chain Transfers**: Quickly configure and transfer assets within the same chain.
- **Multi-Chain Transfers**: Leverage XCM to transfer assets across different chains.
- **Configurable Tokens and Chains**: Support for native and non-native tokens, with easy configuration for custom chains and assets.

## Prerequisites

Before you begin using the library, ensure that you have the following:

- A Polkadot wallet.
- A basic understanding of Polkadot, parachains, and how XCM (Cross-Consensus Messaging) works. For more information, check the [Polkadot documentation](https://wiki.polkadot.network/).

## Installation

Install the library using npm or yarn:

```bash
npm install polkadot-sufficient-assets
```

or

```bash
yarn add polkadot-sufficient-assets
```

or

```bash
pnpm add polkadot-sufficient-assets
```

## Usage

### 1. Transfer on the Same Chain

To set up same-chain transfers, follow the steps below:

**Step 1: Define the Asset and Chain**
The library comes with some predefined tokens, but you can also define your own if necessary. Here's how to use predefined tokens:

```typescript
import { createToken } from "./create-token";

export const tokens = {
  WND: createToken({
    type: "native",
    decimals: 12,
    symbol: "WND",
    name: "Westend",
    logo: "./img/tokens/WND.svg",
    isSufficient: true,
  }),
  ROC: createToken({
    type: "native",
    decimals: 12,
    symbol: "ROC",
    name: "Rococo",
    logo: "./img/tokens/ROC.svg",
    isSufficient: true,
  }),
  // More predefined tokens...
};
```

If your desired token is not predefined, you can create your own using the createToken function:

```typescript
import { createToken } from "polkadot-sufficient-assets";

const myToken = createToken({
  type: "asset",
  assetId: 12345,
  decimals: 18,
  symbol: "MYT",
  name: "MyToken",
  logo: "./img/tokens/MYT.svg",
  isSufficient: true,
});
```

**Step 2: Define the Configuration**
Next, you need to define the configuration for the app, including the chain and token(s) to be used:

```typescript
import {
  chains,
  createConfig,
  createTheme,
  tokens,
} from "polkadot-sufficient-assets";

export const config = createConfig({
  chains: [chains.polkadotAssetHubChain], // Specify the chain
  tokens: {
    pah: {
      token: tokens.USDT, // Token you want to transfer
      feeTokens: [tokens.DOT, tokens.USDT], // Tokens used to pay transaction fees
    },
  },
});
```

**Here’s a breakdown of the configuration options:**

**chains**: The network you want to transfer assets on. The library exports predefined chains, but you can also define your own (see below).
**tokens**: The assets you want to transfer, including tokens used for transaction fees. You can use native or asset-based tokens as fee tokens if supported by the chain.

**Defining a Custom Chain**
If you want to use a custom chain, you can create one using the createChain function:

```typescript
import { createChain } from "polkadot-sufficient-assets";

const yourChain = createChain({
  id: "pah",
  name: "Polkadot Asset Hub",
  specName: "asset-hub-polkadot",
  wsUrls: ["wss://statemint-rpc.dwellir.com"], // WebSocket URL for RPC connection
  relay: "polkadot", // The relay chain ('polkadot', 'kusama', etc.)
  paraId: 1000, // Parachain ID
  type: "system", // Type of chain ('system' or 'relay' or 'para')
  chainId: "1000",
  logo: "./chains/pah.svg", // Chain logo
  blockExplorerUrl: "https://assethub-polkadot.subscan.io", // Block explorer URL
  stableTokenId: "asset::pah::1337", // Stable token ID for the chain
});
```

**Rendering the UI**

For React:

```jsx
import {
  ConfigProvider,
  createTheme,
  PSADialog,
} from "polkadot-sufficient-assets";
import "./App.css";
import { libConfig } from "./lib/lib-config";

function App() {
  const theme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return (
    <ConfigProvider config={libConfig}>
      <PSADialog theme={theme}>
        <button
          style={{
            outline: "none",
            color: "#fff",
          }}
        >
          Open Dialog
        </button>
      </PSADialog>
    </ConfigProvider>
  );
}

export default App;
```

**For other frameworks: We use web component so you can check out our example folder.**

### 2. Multi-Chain Transfers via XCM

To configure multi-chain transfers, you will need to define additional parameters like assetPallet, assetIds, xcmExtrinsic, and location. Below is an example of how to configure a USDT transfer between the Hydration and Polkadot Asset Hub chains.

Example: USDT Transfer Between Hydration and Polkadot Asset Hub

You can set up USDT transfer using the following configuration:

```typescript
import {
  chains,
  createToken,
  tokens,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetAssetId,
  XcmV3MultiassetFungibility,
  XcmVersionedAssets,
} from "polkadot-sufficient-assets";

export const USDT = createToken({
  type: "asset",
  assetId: 10,
  decimals: 6,
  symbol: "USDT",
  name: "Tether USD",
  logo: "./img/tokens/USDT.svg",
  isSufficient: true,

  // Define the pallet where the asset is handled on each chain
  assetPallet: {
    [chains.hydration.id]: "tokens",
    [chains.polkadotAssetHubChain.id]: "assets",
  },

  // Define the asset ID for each chain
  assetIds: {
    [chains.hydration.id]: 10,
    [chains.polkadotAssetHubChain.id]: 1984,
  },

  // Define the extrinsic used for the XCM transfer on each chain
  xcmExtrinsic: (originChain) => {
    if (originChain.id === chains.polkadotAssetHubChain.id)
      return "limited_reserve_transfer_assets";
    if (originChain.id === chains.hydration.id)
      return "XTokens.transfer_multiasset";
    return "limited_reserve_transfer_assets";
  },

  // Define the location of the asset for XCM transfer
  location: (plancks, originChain, destChain) => {
    if (originChain.id === chains.hydration.id) {
      return {
        type: "V3",
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
          interior: XcmV3Junctions.X2([
            XcmV3Junction.PalletInstance(50),
            XcmV3Junction.GeneralIndex(1984n),
          ]),
        }),
        fun: XcmV3MultiassetFungibility.Fungible(plancks),
      },
    ]);
  },
});
```

## Explanation of XCM Parameters

### `assetPallet`

Defines the pallet used to query balance information on each chain. Examples include `'assets'`, `'system'`, `'balances'`, `'tokens'`, and `'ormlTokens'`.

In the example:

- On **Hydration**, the asset is managed by the `tokens` pallet.
- On **Polkadot Asset Hub**, the asset is managed by the `assets` pallet.

### `assetIds`

Specifies the asset ID on each chain, if native token then set to `0`.

For example:

- On **Hydration**, USDT has an asset ID of `10`.
- On **Polkadot Asset Hub**, USDT has an asset ID of `1984`.

### `xcmExtrinsic`

Defines the extrinsic to be used for the XCM transfer. It accepts a callback function that takes the `originChain` and `destChain` as arguments and returns the appropriate extrinsic.

Possible values are:

- `limited_reserve_transfer_assets`
- `limited_teleport_assets`
- `reserve_transfer_assets`
- `teleport_assets`
- `XTokens.transfer_multiasset`
- `XTokens.transfer`
- `transfer_asset`

In the example:

- On **Polkadot Asset Hub**, the extrinsic is `limited_reserve_transfer_assets`.
- On **Hydration**, the extrinsic is `XTokens.transfer_multiasset`.

### `location`

Defines the location of the asset on the `originChain` for the XCM transfer. This function takes `plancks`, `originChain`, and `destChain` as parameters and returns an `XcmVersionedAssets` or `XTokenVersionedAsset`.

In the example:

- On **Hydration**, the location is defined using `XcmV3Junctions.X3` with the parachain ID, pallet instance, and general index.
- On **Polkadot Asset Hub**, the location is defined using `XcmV3Junctions.X2`.

## Updated Configuration

To set up the configuration for XCM transfers, including the use of USDT and other tokens, follow the example below:

```typescript
import {
  chains,
  createConfig,
  createTheme,
  tokens,
} from "polkadot-sufficient-assets";
import { USDT } from "./assets";

export const libConfig = createConfig({
  chains: [chains.hydration],
  tokens: {
    hdx: {
      token: USDT,
      feeTokens: [tokens.HDX],
    },
  },
  useXcmTransfer: true,
  xcmChains: [chains.hydration],
});
```
