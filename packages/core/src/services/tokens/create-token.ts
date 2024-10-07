import type { Assign } from '../../types';

export type Token = {
  readonly assetId?: number;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;
  readonly logo?: string;
  readonly isSufficient: boolean;
  readonly type?: 'asset' | 'native' | 'custom';
  // TODO: add type for extrinsic when we have requirement
  readonly extrinsic?: any;
};

export const createToken = <const token extends Token>(token: token) => {
  return token as Assign<Token, token>;
};
