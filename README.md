# Polkadot-sufficient-assets Monorepo

This is the monorepo for the Polkadot-sufficient-assets library.

## Usage

### Pre-requisites

Node.js v20.6.0 or higher
pnpm v9.1.1 or higher

If you don't have pnpm, please install it first.

```bash
npm install -g pnpm
```

### Installation

To run the library, run the following command in the root directory:

```bash
pnpm install
```

### Generate papi descriptors

```bash
pnpm papi:generate
```

### Running the test website in development mode

```bash
 pnpm dev
```

This command will start all packages and expose <http://localhost:5173/> in the browser.
