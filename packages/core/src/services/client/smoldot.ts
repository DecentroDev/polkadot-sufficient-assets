import type { Client } from 'polkadot-api/smoldot';
import { startFromWorker } from 'polkadot-api/smoldot/from-worker';

// @ts-ignore
import SmWorker from 'polkadot-api/smoldot/worker?worker';

export const smoldot = startFromWorker(new SmWorker(), {
  forbidWs: true,
}) as Client;
