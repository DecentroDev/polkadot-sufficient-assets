# Polkadot-Sufficient-Assets UI Library Demo Apps

This repository contains demo applications written in [React](https://reactjs.org/). These apps allow users to interact with the **Polkadot-Sufficient-Assets UI Library** in two primary ways:

- **Same-chain transfers** (transfers within a single chain)
- **Cross-chain transfers** (transfers between multiple chains)

## Configuration Overview

You can modify the configuration to test different scenarios by updating the following files:

- **[lib.config.ts](./src/lib/lib-config.ts)**: Customize different configurations for the app.
- **[assets.ts](./src/lib/assets.ts)**: Add or modify assets. By default, the app includes assets such as **DOT**, **WND**, **PAS**, **HDC**, and **USDT**.

### Default Setup

By default, the demo app supports **XCM transfers** between **Polkadot Asset Hub** and **Hydration**, using **DOT** or **USDT** as fee payment tokens.

You can also set a hardcoded destination address for transfers by configuring the `destinationAddress` in the app.

### Example Configuration

The default configuration is shown below:

```ts
import { chains, createConfig } from "polkadot-sufficient-assets";
import { startFromWorker } from "polkadot-sufficient-assets/smoldot/from-worker";
import SmWorker from "polkadot-sufficient-assets/smoldot/worker?worker";

import { chainSpec as polkadotChainSpec } from "polkadot-sufficient-assets/chain-specs/polkadot";
import { chainSpec as polkadotAssetHubChainSpec } from "polkadot-sufficient-assets/chain-specs/polkadot_asset_hub";
import { DOT, USDT } from "./assets";

const smoldot = startFromWorker(new SmWorker());

export const libConfig = createConfig({
  chains: [chains.polkadotAssetHubChain],
  lightClients: {
    enable: true, // Light client is enabled by default
    smoldot,
    chainSpecs: {
      [chains.polkadotAssetHubChain.id]: polkadotAssetHubChainSpec,
      [chains.polkadotChain.id]: polkadotChainSpec,
    },
  },
  tokens: {
    pah: {
      token: USDT,
      feeTokens: [DOT, USDT],
    },
  },
  useXcmTransfer: true, // XCM transfer is enabled by default
  xcmChains: [chains.hydration],
  destinationAddress: undefined, // Set this to a hardcoded address if needed
});
```

### Light Clients

By default, **light clients** are enabled. If you want to disable the light client, you can update the `libConfig` as follows:

```ts
lightClients: {
  enable: false,
  // other configuration remains the same
}
```

### XCM Transfers

To disable XCM transfers, simply set useXcmTransfer to false:

```ts
useXcmTransfer: false;
```

### XCM chains

Don't forget to add xcmChains if you set useXcmTransfer to true

```ts
  xcmChains: [chains.polkadotChain],
```

## More Configuration Options

Here are some configuration options for different transfer scenarios:

### 1. Transfer **USDT** within **Polkadot Asset Hub**

This configuration allows you to transfer **USDT** within the **Polkadot Asset Hub**, using either **DOT** or **USDT** as the fee:

```ts
import { chains, createConfig } from "polkadot-sufficient-assets";
import { USDT, DOT } from "./assets";

export const libConfig = createConfig({
  chains: [chains.polkadotAssetHubChain],
  tokens: {
    pah: {
      token: USDT,
      feeTokens: [DOT, USDT],
    },
  },
  destinationAddress: undefined,
});
```

### 2. Transfer **DOT** within **Polkadot**

This configuration allows you to transfer DOT within the Polkadot chain:

```ts
import { chains, createConfig } from "polkadot-sufficient-assets";
import { DOT, USDT } from "./assets";

export const libConfig = createConfig({
  chains: [chains.polkadotChain],
  tokens: {
    polkadot: {
      token: DOT,
      feeTokens: [DOT, USDT],
    },
  },
  destinationAddress: undefined,
});
```

### 3. XCM Transfer: **DOT** from **Polkadot Asset Hub** to **Polkadot**

This configuration enables an XCM transfer from Polkadot Asset Hub to Polkadot using DOT or USDT as fee payment tokens:

```ts
import { chains, createConfig } from "polkadot-sufficient-assets";
import { DOT, USDT } from "./assets";

export const libConfig = createConfig({
  chains: [chains.polkadotAssetHubChain],
  tokens: {
    pah: {
      token: DOT,
      feeTokens: [DOT, USDT],
    },
  },
  useXcmTransfer: true,
  xcmChains: [chains.polkadotChain],
  destinationAddress: undefined,
});
```

### 4. XCM Transfer: **DOT** from **Polkadot** to **Polkadot Asset Hub**

This configuration enables an XCM transfer from Polkadot to Polkadot Asset Hub, using DOT as the fee payment token:

```ts
import { chains, createConfig } from "polkadot-sufficient-assets";
import { DOT } from "./assets";

export const libConfig = createConfig({
  chains: [chains.polkadotChain],
  tokens: {
    polkadot: {
      token: DOT,
      feeTokens: [DOT],
    },
  },
  useXcmTransfer: true,
  xcmChains: [chains.polkadotAssetHubChain],
  destinationAddress: undefined,
});
```

## Key Features

- **Light Client Support**: Ensures that users can interact with the blockchain directly from the browser without requiring a full node.
- **XCM Transfers**: Cross-chain messaging (XCM) allows for asset transfers between different chains, such as from **Polkadot** to **Polkadot Asset Hub**.
- **Configurable Tokens & Chains**: Easily configure which tokens and chains to support, and customize the fee tokens.
- **Destination Address**: Allows you to hardcode the recipient address if needed.

## Conclusion

These demo apps are designed to show the versatility of the **Polkadot-Sufficient-Assets UI Library**. You can customize the configuration to suit your needs, whether you're testing same-chain transfers, cross-chain transfers, or experimenting with different assets.

For more detailed information and further updates, refer to the library documentation or reach out to the community.
