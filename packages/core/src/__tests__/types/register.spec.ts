import { describe, expect, it } from 'vitest';
import type { Config } from '../../create-config';
import type { ResolvedRegister } from '../../types';

type MockConfig = {
  settingA: string;
  settingB: number;
};

type ResolvedConfig = ResolvedRegister['config'];

describe('ResolvedRegister Type', () => {
  it('should resolve to MockConfig when Register has config of type MockConfig', () => {
    type Test = ResolvedConfig extends MockConfig ? true : false;

    const isCorrectType: Test = true as any;
    expect(isCorrectType).toEqual(true);
  });

  it('should resolve to Config when Register does not have config', () => {
    type Test = ResolvedRegister['config'] extends Config ? true : false;

    const isCorrectType: Test = true as any;
    expect(isCorrectType).toEqual(true);
  });
});
