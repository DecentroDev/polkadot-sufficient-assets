import { isNumber } from '../../utils';
import type { Chain } from './chains';

/**
 * Determines if a chain is a system chain based on the value of its chainId being strictly greater than 0 and less than 2000
 * @param chainId
 * @returns boolean
 */
export const isSystemChain = (chain: Chain): boolean => {
  if (chain.type === 'system') return true;

  if (isNumber(chain.chainId)) {
    const chainIdAsNumber = Number(chain.chainId);
    return chainIdAsNumber > 0 && chainIdAsNumber < 2000;
  }

  return false;
};

/**
 * Determines if a chain is a parachain based on the value of its chainId being strictly greater than or equal to 2000
 * @param Chain
 * @returns boolean
 */
export const isParachain = (chain: Chain): boolean => {
  if (chain.type === 'para' && chain.paraId) return true;
  if (isNumber(chain.chainId)) {
    const chainIdAsNumber = Number(chain.chainId);
    return chainIdAsNumber > 2000;
  }

  return false;
};

export const parseLocationStrToLocation = (locationStr: string) => {
  try {
    return JSON.parse(locationStr);
  } catch {
    throw new Error(`Unable to parse ${locationStr} as a valid location`);
  }
};

/**
 * Determines if the dest chain is a Global Consensus origin based on the value of its dest location
 * @param destLocation
 * @returns boolean
 */
export const chainDestIsBridge = (destLocation: string): boolean => {
  const location = parseLocationStrToLocation(destLocation);
  let destIsBridge = false;

  if (location.interior) {
    destIsBridge = location.interior.X1
      ? JSON.stringify(location.interior.X1).toLowerCase().includes('globalconsensus')
      : location.interior.X2
        ? JSON.stringify(location.interior.X2).toLowerCase().includes('globalconsensus')
        : false;
  }

  return destIsBridge;
};
