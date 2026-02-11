import { describe, it, expect } from 'vitest';
import { MemoryConfigSchema, MemoryPersistenceConfigSchema, MemoryDriverSpec } from './memory.zod';

describe('MemoryConfigSchema', () => {
  it('should accept empty config (all optional)', () => {
    const config = MemoryConfigSchema.parse({});

    expect(config.strictMode).toBe(false);
    expect(config.initialData).toBeUndefined();
    expect(config.persistence).toBeUndefined();
    expect(config.indexes).toBeUndefined();
    expect(config.maxRecordsPerObject).toBeUndefined();
  });

  it('should accept config with initial data', () => {
    const config = MemoryConfigSchema.parse({
      initialData: {
        users: [
          { id: '1', name: 'Alice', email: 'alice@example.com' },
          { id: '2', name: 'Bob', email: 'bob@example.com' },
        ],
        posts: [
          { id: '1', title: 'Hello World', author_id: '1' },
        ],
      },
    });

    expect(config.initialData).toBeDefined();
    expect(config.initialData!.users).toHaveLength(2);
    expect(config.initialData!.posts).toHaveLength(1);
  });

  it('should accept config with strict mode', () => {
    const config = MemoryConfigSchema.parse({
      strictMode: true,
    });

    expect(config.strictMode).toBe(true);
  });

  it('should accept config with persistence', () => {
    const config = MemoryConfigSchema.parse({
      persistence: {
        filePath: '/tmp/data.json',
        autoSaveInterval: 10000,
      },
    });

    expect(config.persistence).toBeDefined();
    expect(config.persistence!.filePath).toBe('/tmp/data.json');
    expect(config.persistence!.autoSaveInterval).toBe(10000);
  });

  it('should apply persistence autoSaveInterval default', () => {
    const config = MemoryConfigSchema.parse({
      persistence: {
        filePath: '/tmp/data.json',
      },
    });

    expect(config.persistence!.autoSaveInterval).toBe(5000);
  });

  it('should accept config with indexes', () => {
    const config = MemoryConfigSchema.parse({
      indexes: {
        users: ['email', 'role'],
        posts: ['author_id', 'status'],
      },
    });

    expect(config.indexes).toBeDefined();
    expect(config.indexes!.users).toEqual(['email', 'role']);
    expect(config.indexes!.posts).toEqual(['author_id', 'status']);
  });

  it('should accept config with maxRecordsPerObject', () => {
    const config = MemoryConfigSchema.parse({
      maxRecordsPerObject: 10000,
    });

    expect(config.maxRecordsPerObject).toBe(10000);
  });

  it('should accept full config with all options', () => {
    const config = MemoryConfigSchema.parse({
      initialData: {
        users: [{ id: '1', name: 'Alice' }],
      },
      strictMode: true,
      persistence: {
        filePath: '/var/data/memory.json',
        autoSaveInterval: 3000,
      },
      indexes: {
        users: ['email'],
      },
      maxRecordsPerObject: 50000,
    });

    expect(config.strictMode).toBe(true);
    expect(config.initialData!.users).toHaveLength(1);
    expect(config.persistence!.filePath).toBe('/var/data/memory.json');
    expect(config.indexes!.users).toEqual(['email']);
    expect(config.maxRecordsPerObject).toBe(50000);
  });

  it('should reject persistence with invalid autoSaveInterval', () => {
    expect(() => MemoryConfigSchema.parse({
      persistence: {
        filePath: '/tmp/data.json',
        autoSaveInterval: 50, // Below minimum of 100
      },
    })).toThrow();
  });

  it('should reject persistence without filePath', () => {
    expect(() => MemoryConfigSchema.parse({
      persistence: {
        autoSaveInterval: 5000,
      },
    })).toThrow();
  });

  it('should reject maxRecordsPerObject less than 1', () => {
    expect(() => MemoryConfigSchema.parse({
      maxRecordsPerObject: 0,
    })).toThrow();
  });

  it('should reject strictMode with invalid type', () => {
    expect(() => MemoryConfigSchema.parse({
      strictMode: 'yes',
    })).toThrow();
  });
});

describe('MemoryPersistenceConfigSchema', () => {
  it('should accept valid persistence config', () => {
    const config = MemoryPersistenceConfigSchema.parse({
      filePath: '/data/store.json',
      autoSaveInterval: 10000,
    });

    expect(config.filePath).toBe('/data/store.json');
    expect(config.autoSaveInterval).toBe(10000);
  });

  it('should apply default autoSaveInterval', () => {
    const config = MemoryPersistenceConfigSchema.parse({
      filePath: '/data/store.json',
    });

    expect(config.autoSaveInterval).toBe(5000);
  });

  it('should reject without filePath', () => {
    expect(() => MemoryPersistenceConfigSchema.parse({})).toThrow();
  });
});

describe('MemoryDriverSpec', () => {
  it('should have correct id', () => {
    expect(MemoryDriverSpec.id).toBe('memory');
  });

  it('should have correct label', () => {
    expect(MemoryDriverSpec.label).toBe('In-Memory');
  });

  it('should have a description', () => {
    expect(MemoryDriverSpec.description).toBeDefined();
    expect(typeof MemoryDriverSpec.description).toBe('string');
  });

  it('should have an icon', () => {
    expect(MemoryDriverSpec.icon).toBe('memory');
  });

  it('should have capabilities defined', () => {
    expect(MemoryDriverSpec.capabilities).toBeDefined();
  });

  it('should support transactions', () => {
    expect(MemoryDriverSpec.capabilities!.transactions).toBe(true);
  });

  it('should support core query features', () => {
    expect(MemoryDriverSpec.capabilities!.queryFilters).toBe(true);
    expect(MemoryDriverSpec.capabilities!.queryAggregations).toBe(true);
    expect(MemoryDriverSpec.capabilities!.querySorting).toBe(true);
    expect(MemoryDriverSpec.capabilities!.queryPagination).toBe(true);
  });

  it('should not support advanced query features', () => {
    expect(MemoryDriverSpec.capabilities!.joins).toBe(false);
    expect(MemoryDriverSpec.capabilities!.queryWindowFunctions).toBe(false);
    expect(MemoryDriverSpec.capabilities!.querySubqueries).toBe(false);
    expect(MemoryDriverSpec.capabilities!.fullTextSearch).toBe(false);
  });

  it('should support dynamic schema', () => {
    expect(MemoryDriverSpec.capabilities!.dynamicSchema).toBe(true);
  });
});
