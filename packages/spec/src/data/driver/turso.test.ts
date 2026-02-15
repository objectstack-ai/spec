import { describe, it, expect } from 'vitest';
import { TursoConfigSchema, TursoSyncConfigSchema, TursoDriverSpec } from './turso.zod';

describe('TursoConfigSchema', () => {
  it('should accept minimal remote config', () => {
    const config = TursoConfigSchema.parse({
      url: 'libsql://my-db-orgname.turso.io',
      authToken: 'eyJhbGciOi...',
    });

    expect(config.url).toBe('libsql://my-db-orgname.turso.io');
    expect(config.authToken).toBe('eyJhbGciOi...');
    expect(config.concurrency).toBe(20);
  });

  it('should accept local file config', () => {
    const config = TursoConfigSchema.parse({
      url: 'file:./local.db',
    });

    expect(config.url).toBe('file:./local.db');
    expect(config.authToken).toBeUndefined();
  });

  it('should accept in-memory config', () => {
    const config = TursoConfigSchema.parse({
      url: ':memory:',
    });

    expect(config.url).toBe(':memory:');
  });

  it('should accept embedded replica config', () => {
    const config = TursoConfigSchema.parse({
      url: 'file:./local-replica.db',
      syncUrl: 'libsql://my-db-orgname.turso.io',
      authToken: 'eyJhbGciOi...',
      localPath: './local-replica.db',
      sync: {
        intervalSeconds: 30,
        onConnect: true,
      },
    });

    expect(config.syncUrl).toBe('libsql://my-db-orgname.turso.io');
    expect(config.localPath).toBe('./local-replica.db');
    expect(config.sync).toBeDefined();
    expect(config.sync!.intervalSeconds).toBe(30);
    expect(config.sync!.onConnect).toBe(true);
  });

  it('should accept config with all fields', () => {
    const config = TursoConfigSchema.parse({
      url: 'libsql://my-db-orgname.turso.io',
      authToken: 'eyJhbGciOi...',
      encryptionKey: 'my-secret-key-256',
      concurrency: 50,
      syncUrl: 'libsql://my-db-orgname.turso.io',
      localPath: '/data/replica.db',
      sync: {
        intervalSeconds: 120,
        onConnect: false,
      },
      timeout: 30000,
      wasm: true,
    });

    expect(config.encryptionKey).toBe('my-secret-key-256');
    expect(config.concurrency).toBe(50);
    expect(config.timeout).toBe(30000);
    expect(config.wasm).toBe(true);
  });

  it('should apply correct defaults', () => {
    const config = TursoConfigSchema.parse({
      url: 'libsql://my-db.turso.io',
    });

    expect(config.concurrency).toBe(20);
    expect(config.authToken).toBeUndefined();
    expect(config.encryptionKey).toBeUndefined();
    expect(config.syncUrl).toBeUndefined();
    expect(config.localPath).toBeUndefined();
    expect(config.sync).toBeUndefined();
    expect(config.timeout).toBeUndefined();
    expect(config.wasm).toBeUndefined();
  });

  it('should accept https URL', () => {
    const config = TursoConfigSchema.parse({
      url: 'https://my-db-orgname.turso.io',
      authToken: 'token',
    });

    expect(config.url).toBe('https://my-db-orgname.turso.io');
  });

  it('should accept ws/wss URL', () => {
    const config = TursoConfigSchema.parse({
      url: 'wss://my-db-orgname.turso.io',
      authToken: 'token',
    });

    expect(config.url).toBe('wss://my-db-orgname.turso.io');
  });

  it('should reject config without url', () => {
    expect(() => TursoConfigSchema.parse({})).toThrow();
    expect(() => TursoConfigSchema.parse({ authToken: 'token' })).toThrow();
  });

  it('should reject config with invalid concurrency', () => {
    expect(() => TursoConfigSchema.parse({
      url: ':memory:',
      concurrency: 0,
    })).toThrow();
  });

  it('should reject config with invalid concurrency type', () => {
    expect(() => TursoConfigSchema.parse({
      url: ':memory:',
      concurrency: 'ten',
    })).toThrow();
  });

  it('should reject config with negative timeout', () => {
    expect(() => TursoConfigSchema.parse({
      url: ':memory:',
      timeout: -1,
    })).toThrow();
  });

  it('should accept config with environment variable patterns', () => {
    const config = TursoConfigSchema.parse({
      url: '${TURSO_DATABASE_URL}',
      authToken: '${TURSO_AUTH_TOKEN}',
    });

    expect(config.url).toBe('${TURSO_DATABASE_URL}');
    expect(config.authToken).toBe('${TURSO_AUTH_TOKEN}');
  });

  it('should accept config with custom concurrency', () => {
    const config = TursoConfigSchema.parse({
      url: ':memory:',
      concurrency: 100,
    });

    expect(config.concurrency).toBe(100);
  });

  it('should accept zero timeout (no timeout)', () => {
    const config = TursoConfigSchema.parse({
      url: ':memory:',
      timeout: 0,
    });

    expect(config.timeout).toBe(0);
  });
});

describe('TursoSyncConfigSchema', () => {
  it('should accept valid sync config', () => {
    const config = TursoSyncConfigSchema.parse({
      intervalSeconds: 30,
      onConnect: true,
    });

    expect(config.intervalSeconds).toBe(30);
    expect(config.onConnect).toBe(true);
  });

  it('should apply defaults', () => {
    const config = TursoSyncConfigSchema.parse({});

    expect(config.intervalSeconds).toBe(60);
    expect(config.onConnect).toBe(true);
  });

  it('should accept zero intervalSeconds (manual sync)', () => {
    const config = TursoSyncConfigSchema.parse({
      intervalSeconds: 0,
    });

    expect(config.intervalSeconds).toBe(0);
  });

  it('should reject negative intervalSeconds', () => {
    expect(() => TursoSyncConfigSchema.parse({
      intervalSeconds: -1,
    })).toThrow();
  });

  it('should accept onConnect false', () => {
    const config = TursoSyncConfigSchema.parse({
      onConnect: false,
    });

    expect(config.onConnect).toBe(false);
  });
});

describe('TursoDriverSpec', () => {
  it('should have correct id', () => {
    expect(TursoDriverSpec.id).toBe('turso');
  });

  it('should have correct label', () => {
    expect(TursoDriverSpec.label).toBe('Turso (libSQL)');
  });

  it('should have a description', () => {
    expect(TursoDriverSpec.description).toBeDefined();
    expect(typeof TursoDriverSpec.description).toBe('string');
    expect(TursoDriverSpec.description).toContain('SQLite');
    expect(TursoDriverSpec.description).toContain('edge');
  });

  it('should have an icon', () => {
    expect(TursoDriverSpec.icon).toBe('database');
  });

  it('should have capabilities defined', () => {
    expect(TursoDriverSpec.capabilities).toBeDefined();
  });

  it('should support transactions', () => {
    expect(TursoDriverSpec.capabilities!.transactions).toBe(true);
  });

  it('should support core query features', () => {
    expect(TursoDriverSpec.capabilities!.queryFilters).toBe(true);
    expect(TursoDriverSpec.capabilities!.queryAggregations).toBe(true);
    expect(TursoDriverSpec.capabilities!.querySorting).toBe(true);
    expect(TursoDriverSpec.capabilities!.queryPagination).toBe(true);
  });

  it('should support full-text search', () => {
    expect(TursoDriverSpec.capabilities!.fullTextSearch).toBe(true);
  });

  it('should not use dynamic schema', () => {
    expect(TursoDriverSpec.capabilities!.dynamicSchema).toBe(false);
  });
});
