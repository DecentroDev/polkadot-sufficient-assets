// Assign.test.ts
import { describe, expect, it } from 'vitest';
import type { Assign } from '../../types';

describe('Assign Type', () => {
  type BaseType = {
    a: number;
    b: string;
    c: boolean;
  };

  type UpdateType = {
    b: number;
    c: void;
    d: string;
  };

  it('should assign properties correctly', () => {
    type ResultType = Assign<BaseType, UpdateType>;

    const testObject: Omit<ResultType, 'c'> = {
      a: 42,
      b: 100,
      d: 'hello',
    };

    expect(testObject.a).toBe(42);
    expect(testObject.b).toBe(100);
    expect(testObject.d).toBe('hello');
  });

  it('should exclude properties from T that are void in U', () => {
    type ExcludeVoidType = {
      a: number;
      b: string;
    };

    type VoidUpdateType = {
      a: void;
      b: void;
      c: number;
    };

    type ResultType = Assign<ExcludeVoidType, VoidUpdateType>;

    const testObject: Pick<ResultType, 'c'> = {
      c: 123,
    };

    expect(testObject.c).toBe(123);
    expect('a' in testObject).toBe(false);
    expect('b' in testObject).toBe(false);
  });

  it('should keep properties from U that are not void and merge with T', () => {
    type AnotherBaseType = {
      x: string;
      y: number;
    };

    type AnotherUpdateType = {
      x: void;
      z: boolean;
    };

    type ResultType = Assign<AnotherBaseType, AnotherUpdateType>;

    const testObject: Pick<ResultType, 'y' | 'z'> = {
      y: 42,
      z: true,
    };

    expect(testObject.y).toBe(42);
    expect(testObject.z).toBe(true);
    expect('x' in testObject).toBe(false);
  });
});
