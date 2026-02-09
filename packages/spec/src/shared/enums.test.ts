import { describe, it, expect } from 'vitest';
import {
  AggregationFunctionEnum,
  SortDirectionEnum,
  MutationEventEnum,
  IsolationLevelEnum,
  CacheStrategyEnum,
} from './enums.zod';

describe('AggregationFunctionEnum', () => {
  it('should accept all valid aggregation functions', () => {
    const valid = [
      'count', 'sum', 'avg', 'min', 'max',
      'count_distinct', 'percentile', 'median', 'stddev', 'variance',
    ];
    valid.forEach((v) => {
      expect(() => AggregationFunctionEnum.parse(v)).not.toThrow();
    });
  });

  it('should reject invalid values', () => {
    const invalid = ['COUNT', 'SUM', 'average', 'total', '', 'unknown'];
    invalid.forEach((v) => {
      expect(() => AggregationFunctionEnum.parse(v)).toThrow();
    });
  });

  it('should reject non-string types', () => {
    expect(() => AggregationFunctionEnum.parse(123)).toThrow();
    expect(() => AggregationFunctionEnum.parse(null)).toThrow();
    expect(() => AggregationFunctionEnum.parse(undefined)).toThrow();
  });
});

describe('SortDirectionEnum', () => {
  it('should accept asc and desc', () => {
    expect(SortDirectionEnum.parse('asc')).toBe('asc');
    expect(SortDirectionEnum.parse('desc')).toBe('desc');
  });

  it('should reject invalid values', () => {
    expect(() => SortDirectionEnum.parse('ASC')).toThrow();
    expect(() => SortDirectionEnum.parse('DESC')).toThrow();
    expect(() => SortDirectionEnum.parse('ascending')).toThrow();
    expect(() => SortDirectionEnum.parse('')).toThrow();
  });
});

describe('MutationEventEnum', () => {
  it('should accept all mutation events', () => {
    const valid = ['insert', 'update', 'delete', 'upsert'];
    valid.forEach((v) => {
      expect(MutationEventEnum.parse(v)).toBe(v);
    });
  });

  it('should reject invalid values', () => {
    expect(() => MutationEventEnum.parse('INSERT')).toThrow();
    expect(() => MutationEventEnum.parse('create')).toThrow();
    expect(() => MutationEventEnum.parse('remove')).toThrow();
  });
});

describe('IsolationLevelEnum', () => {
  it('should accept all isolation levels', () => {
    const valid = [
      'read_uncommitted', 'read_committed', 'repeatable_read', 'serializable', 'snapshot',
    ];
    valid.forEach((v) => {
      expect(IsolationLevelEnum.parse(v)).toBe(v);
    });
  });

  it('should reject invalid values', () => {
    expect(() => IsolationLevelEnum.parse('READ_COMMITTED')).toThrow();
    expect(() => IsolationLevelEnum.parse('read-committed')).toThrow();
    expect(() => IsolationLevelEnum.parse('none')).toThrow();
  });
});

describe('CacheStrategyEnum', () => {
  it('should accept all cache strategies', () => {
    const valid = ['lru', 'lfu', 'ttl', 'fifo'];
    valid.forEach((v) => {
      expect(CacheStrategyEnum.parse(v)).toBe(v);
    });
  });

  it('should reject invalid values', () => {
    expect(() => CacheStrategyEnum.parse('LRU')).toThrow();
    expect(() => CacheStrategyEnum.parse('random')).toThrow();
    expect(() => CacheStrategyEnum.parse('')).toThrow();
  });
});
