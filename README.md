# Polkadot-Sufficient-Assets Monorepo

**Polkadot-Sufficient-Assets UI Library** is a developer-friendly tool that simplifies the process of building asset transfer functionalities within the Polkadot ecosystem. The library supports two types of transfers: same-chain transfers and multi-chain transfers via XCM (Cross-Consensus Messaging). Developers only need to configure the assets and chains to quickly integrate asset transfer features into their applications.

## Prerequisites

Before using the library, ensure you have the following installed:

- **Node.js**: v20.6.0 or higher
- **pnpm**: v9.1.1 or higher

If you don't have `pnpm` installed, you can install it globally using `npm`:

```bash
npm install -g pnpm
```

### Installation

Once the prerequisites are installed, navigate to the root directory of the project and run the following command to install the necessary dependencies:

```bash
pnpm install
```

### Generate papi descriptors

To generate the PAPI descriptors required by the library, run the following command:

```bash
pnpm papi:generate
```

### Running the Example Website (Development Mode)

To start the development server and test the website, use the command below:

```bash
 pnpm dev
```

This will start all packages and expose the application at http://localhost:5173/ in your browser.

---

### With Docker Compose

To run the mini apps with docker compose, run the following command:

```bash
docker-compose -f docker-compose.yml up -d
```

---

### Running the Documentation Website

```bash
pnpm dev:web
```
