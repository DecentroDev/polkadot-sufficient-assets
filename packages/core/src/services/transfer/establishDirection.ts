import type { Api } from '../api';
import { chainDestIsBridge, isParachain, isRelayChain, isSystemChain, type Chain, type ChainId } from '../chains';

export enum Direction {
  /**
   * System parachain to Parachain.
   */
  SystemToPara = 'SystemToPara',
  /**
   * System parachain to Relay chain.
   */
  SystemToRelay = 'SystemToRelay',
  /**
   * System parachain to System parachain chain.
   */
  SystemToSystem = 'SystemToSystem',
  /**
   * System parachain to an external `GlobalConsensus` chain.
   */
  SystemToBridge = 'SystemToBridge',
  /**
   * Parachain to Parachain.
   */
  ParaToPara = 'ParaToPara',
  /**
   * Parachain to Relay chain.
   */
  ParaToRelay = 'ParaToRelay',
  /**
   * Parachain to System parachain.
   */
  ParaToSystem = 'ParaToSystem',
  /**
   * Relay to System Parachain.
   */
  RelayToSystem = 'RelayToSystem',
  /**
   * Relay chain to Parachain.
   */
  RelayToPara = 'RelayToPara',
  /**
   * Relay chain to an external `GlobalConsensus` chain.
   */
  RelayToBridge = 'RelayToBridge',
}

export function establishDirection(api: Api<ChainId>, destChain: Chain): Direction {
  const destChainId = destChain.chainId;
  const isOriginRelayChain = isRelayChain(api.chain);
  const isOriginSystemChain = isSystemChain(api.chain);
  const isDestRelayChain = isRelayChain(destChain);
  const isDestSystemChain = isSystemChain(destChain);
  const isOriginParachain = isParachain(api.chain);
  const isDestParachain = isParachain(destChain);
  const isDestBridge = chainDestIsBridge(destChainId);

  /**
   * Check if the origin is a System Parachain
   */
  if (isOriginSystemChain && isDestRelayChain) {
    return Direction.SystemToRelay;
  }

  if (isOriginSystemChain && isDestSystemChain) {
    return Direction.SystemToSystem;
  }

  if (isOriginSystemChain && isDestParachain) {
    return Direction.SystemToPara;
  }

  if (isOriginSystemChain && isDestBridge) {
    return Direction.SystemToBridge;
  }

  /**
   * Check if the origin is a Relay Chain
   */
  if (isOriginRelayChain && isDestSystemChain) {
    return Direction.RelayToSystem;
  }

  if (isOriginRelayChain && isDestParachain) {
    return Direction.RelayToPara;
  }

  if (isOriginRelayChain && isDestBridge) {
    return Direction.RelayToBridge;
  }

  /**
   * Check if the origin is a Parachain or Parathread
   */
  if (isOriginParachain && isDestRelayChain) {
    return Direction.ParaToRelay;
  }

  /**
   * Check if the origin is a parachain, and the destination is a system parachain.
   */
  if (isOriginParachain && isDestSystemChain) {
    return Direction.ParaToSystem;
  }

  if (isOriginParachain && isDestParachain) {
    return Direction.ParaToPara;
  }

  throw Error('Could not establish a xcm transaction direction');
}
